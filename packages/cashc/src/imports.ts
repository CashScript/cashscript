import { CharStream, CommonTokenStream, Token } from 'antlr4';
import fs from 'fs';
import path from 'path';
import semver from 'semver';
import { fileURLToPath } from 'url';
import { Class, FunctionVisibility, GLOBAL_SYMBOL_TABLE } from './ast/Globals.js';
import {
  ImportResolutionError,
  InvalidImportDirectiveError,
  InvalidLibraryImportError,
  VersionError,
} from './Errors.js';
import CashScriptLexer from './grammar/CashScriptLexer.js';
import { version } from './index.js';

export interface ImportResolverResult {
  source: string;
  path?: string;
}

export type ImportResolver = (specifier: string, from?: string) => ImportResolverResult | string;

export interface ImportPreprocessOptions {
  sourcePath?: string;
  resolveImport?: ImportResolver;
}

export interface ImportedFunctionProvenance {
  mangledName: string;
  generatedStartLine: number;
  originalStartLine: number;
  generatedStartColumn: number;
  originalStartColumn: number;
  source: string;
  sourceFile?: string;
}

export interface ImportPreprocessResult {
  code: string;
  sources: Array<{ source: string; sourceFile?: string }>;
  functionProvenance: ImportedFunctionProvenance[];
}

interface ImportDirective {
  specifier: string;
  alias: string;
  start: number;
  stop: number;
}

interface LibraryDefinition {
  name: string;
  body: string;
  bodyStartLine: number;
  source: string;
  sourceFile?: string;
}

interface ParsedLibraryFile {
  imports: ImportDirective[];
  library: LibraryDefinition;
  pragmaConstraints: string[];
}

interface ResolvedImport extends ImportResolverResult {
  specifier: string;
}

interface Replacement {
  start: number;
  stop: number;
  text: string;
}

interface CanonicalLibraryRecord {
  sourceId: string;
  mangledPrefix: string;
  body: string;
  functions: Set<string>;
  provenance: ImportedFunctionProvenance[];
  sources: Array<{ source: string; sourceFile?: string }>;
}

interface ImportContext {
  orderedLibraries: CanonicalLibraryRecord[];
  canonicalLibraries: Map<string, CanonicalLibraryRecord>;
  usedMangledNames: Set<string>;
  nextLibraryId: number;
}

const IDENTIFIER_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/;
const BUILT_IN_STATEMENTS = new Set(['require']);
const GLOBAL_FUNCTIONS = new Set(
  Array.from(GLOBAL_SYMBOL_TABLE.symbols.values())
    .filter((symbol) => symbol.symbolType === 'function')
    .map((symbol) => symbol.name),
);
const GLOBAL_CLASSES = new Set(Object.values(Class));

export function preprocessImports(code: string, options: ImportPreprocessOptions = {}): ImportPreprocessResult {
  const importDirectives = parseTopLevelImports(code);
  const rootSourceFile = options.sourcePath ? normaliseFilesystemPath(options.sourcePath) : undefined;

  if (importDirectives.length === 0) {
    return {
      code,
      sources: [{ source: code, ...(rootSourceFile ? { sourceFile: rootSourceFile } : {}) }],
      functionProvenance: [],
    };
  }

  const mutableCode = code.split('');
  const rootFunctionNames = collectFunctionNames(code);
  const usedAliases = new Set<string>();
  const context: ImportContext = {
    orderedLibraries: [],
    canonicalLibraries: new Map(),
    usedMangledNames: new Set(rootFunctionNames),
    nextLibraryId: 0,
  };

  const transformedLibrariesByAlias = new Map<string, CanonicalLibraryRecord>();
  for (const directive of importDirectives) {
    if (usedAliases.has(directive.alias)) {
      throw new InvalidImportDirectiveError(`Duplicate import alias '${directive.alias}' is not allowed.`);
    }
    usedAliases.add(directive.alias);

    blankRangePreservingNewlines(mutableCode, directive.start, directive.stop);

    const transformedLibrary = preprocessImportedLibrary(
      directive,
      options,
      context,
      options.sourcePath,
      [],
    );
    transformedLibrariesByAlias.set(directive.alias, transformedLibrary);
  }

  let flattenedCode = mutableCode.join('');
  transformedLibrariesByAlias.forEach((library, alias) => {
    flattenedCode = rewriteNamespacedCalls(flattenedCode, alias, library.functions, library.mangledPrefix);
  });

  const contractCloseIndex = findRootCloseIndex(flattenedCode);
  const injectedSections = context.orderedLibraries.map((library) => `\n${indentLibraryBody(library.body)}\n`);
  const insertionBaseLine = countLines(flattenedCode.slice(0, contractCloseIndex));

  let injectedLineOffset = 0;
  const functionProvenance = context.orderedLibraries.flatMap((library, index) => {
    const section = injectedSections[index]!;
    const resolved = library.provenance.map((entry) => ({
      ...entry,
      generatedStartLine: insertionBaseLine + injectedLineOffset + getFunctionGeneratedLine(entry.mangledName, section),
    }));
    injectedLineOffset += countLineBreaks(section) + 1;
    return resolved;
  });

  const sources = dedupeSources([
    { source: code, ...(rootSourceFile ? { sourceFile: rootSourceFile } : {}) },
    ...context.orderedLibraries.flatMap((library) => library.sources),
  ]);

  return {
    code: `${flattenedCode.slice(0, contractCloseIndex)}${injectedSections.join('\n')}${flattenedCode.slice(contractCloseIndex)}`,
    sources,
    functionProvenance,
  };
}

function preprocessImportedLibrary(
  directive: ImportDirective,
  options: ImportPreprocessOptions,
  context: ImportContext,
  fromPath?: string,
  ancestry: string[] = [],
): CanonicalLibraryRecord {
  const resolvedImport = resolveImportSource(directive.specifier, options, fromPath);
  const sourceId = getImportIdentity(resolvedImport, directive.specifier, fromPath);
  if (ancestry.includes(sourceId)) {
    throw new InvalidLibraryImportError(
      `Circular library import detected: ${[...ancestry, sourceId].join(' -> ')}`,
    );
  }

  const cached = context.canonicalLibraries.get(sourceId);
  if (cached) {
    return cached;
  }

  const parsedLibrary = parseLibraryFileWithPragmas(resolvedImport.source, resolvedImport.path ?? directive.specifier);
  validateLibraryPragmas(parsedLibrary.pragmaConstraints);

  const nestedLibrariesByAlias = new Map<string, CanonicalLibraryRecord>();
  const usedNestedAliases = new Set<string>();
  for (const nestedImport of parsedLibrary.imports) {
    if (usedNestedAliases.has(nestedImport.alias)) {
      throw new InvalidImportDirectiveError(`Duplicate import alias '${nestedImport.alias}' is not allowed.`);
    }
    usedNestedAliases.add(nestedImport.alias);
    nestedLibrariesByAlias.set(
      nestedImport.alias,
      preprocessImportedLibrary(
        nestedImport,
        options,
        context,
        resolvedImport.path ?? fromPath,
        [...ancestry, sourceId],
      ),
    );
  }

  const mangledPrefix = `lib${context.nextLibraryId}`;
  context.nextLibraryId += 1;
  const transformed = transformLibrary(
    parsedLibrary.library,
    mangledPrefix,
    context.usedMangledNames,
    nestedLibrariesByAlias,
  );

  const record: CanonicalLibraryRecord = {
    sourceId,
    mangledPrefix,
    body: transformed.body,
    functions: transformed.functions,
    provenance: transformed.provenance,
    sources: transformed.sources,
  };

  context.canonicalLibraries.set(sourceId, record);
  context.orderedLibraries.push(record);
  return record;
}

function resolveImportSource(specifier: string, options: ImportPreprocessOptions, fromPath?: string): ResolvedImport {
  if (options.resolveImport) {
    const result = options.resolveImport(specifier, fromPath ?? options.sourcePath);
    if (typeof result === 'string') {
      return { source: result, specifier };
    }

    return { ...result, specifier };
  }

  const resolutionBasePath = fromPath ?? options.sourcePath;
  if (!resolutionBasePath) {
    throw new ImportResolutionError(
      `Cannot resolve import '${specifier}' without a sourcePath or resolveImport callback.`,
    );
  }

  if (!specifier.startsWith('./') && !specifier.startsWith('../')) {
    throw new InvalidImportDirectiveError(
      `Only relative import specifiers are supported. Found '${specifier}'.`,
    );
  }

  const resolvedPath = path.resolve(path.dirname(normaliseFilesystemPath(resolutionBasePath)), specifier);
  if (!fs.existsSync(resolvedPath)) {
    throw new ImportResolutionError(`Unable to resolve import '${specifier}' from '${resolutionBasePath}'.`);
  }

  return {
    specifier,
    source: fs.readFileSync(resolvedPath, { encoding: 'utf-8' }),
    path: resolvedPath,
  };
}

function parseTopLevelImports(code: string): ImportDirective[] {
  const tokens = getVisibleTokens(code);
  const imports: ImportDirective[] = [];
  let cursor = 0;

  while (cursor < tokens.length) {
    const token = tokens[cursor];

    if (token.text === 'pragma') {
      cursor = advanceToSemicolon(tokens, cursor + 1);
      continue;
    }

    if (token.text === 'import') {
      const specifierToken = tokens[cursor + 1];
      const asToken = tokens[cursor + 2];
      const aliasToken = tokens[cursor + 3];
      const semicolonToken = tokens[cursor + 4];

      if (
        !specifierToken?.text
        || !isStringLiteral(specifierToken.text)
        || asToken?.text !== 'as'
        || !aliasToken?.text?.match(IDENTIFIER_PATTERN)
        || semicolonToken?.text !== ';'
      ) {
        throw new InvalidImportDirectiveError(
          'Import directives must use the form import "./helpers.cash" as Helpers;',
        );
      }

      imports.push({
        specifier: parseStringLiteral(specifierToken.text),
        alias: aliasToken.text,
        start: token.start,
        stop: semicolonToken.stop,
      });

      cursor += 5;
      continue;
    }

    if (token.text === 'contract' || token.text === 'library') {
      break;
    }

    break;
  }

  const misplacedImport = tokens.slice(cursor).find((token) => token.text === 'import');
  if (misplacedImport) {
    throw new InvalidImportDirectiveError('Import directives must appear before the root contract or library definition.');
  }

  return imports;
}

function parseLibraryFileWithPragmas(code: string, sourceLabel: string): ParsedLibraryFile {
  const tokens = getVisibleTokens(code);

  let cursor = 0;
  const pragmaConstraints: string[] = [];
  while (cursor < tokens.length && tokens[cursor].text === 'pragma') {
    pragmaConstraints.push(...readPragmaConstraints(tokens, cursor, sourceLabel));
    cursor = advanceToSemicolon(tokens, cursor + 1);
  }

  const nestedImports = parseTopLevelImports(code);
  while (cursor < tokens.length && tokens[cursor].text === 'import') {
    cursor = advanceToSemicolon(tokens, cursor + 1);
  }

  const libraryToken = tokens[cursor];
  const nameToken = tokens[cursor + 1];
  const openBraceToken = tokens[cursor + 2];

  if (libraryToken?.text !== 'library' || !nameToken?.text?.match(IDENTIFIER_PATTERN) || openBraceToken?.text !== '{') {
    throw new InvalidLibraryImportError(
      `Imported file '${sourceLabel}' must contain exactly one top-level library.`,
    );
  }

  const closeBraceIndex = findMatchingBrace(tokens, cursor + 2);
  const closeBraceToken = tokens[closeBraceIndex];
  const trailingTokens = tokens.slice(closeBraceIndex + 1);
  if (trailingTokens.length !== 0) {
    throw new InvalidLibraryImportError(
      `Imported file '${sourceLabel}' may only contain a single library definition.`,
    );
  }

  return {
    imports: nestedImports,
    library: {
      name: nameToken.text,
      body: code.slice(openBraceToken.stop + 1, closeBraceToken.start),
      bodyStartLine: openBraceToken.line,
      source: code,
      ...(sourceLabel ? { sourceFile: sourceLabel } : {}),
    },
    pragmaConstraints,
  };
}

function transformLibrary(
  library: LibraryDefinition,
  mangledPrefix: string,
  usedMangledNames: Set<string>,
  nestedLibrariesByAlias: Map<string, CanonicalLibraryRecord>,
): {
    body: string;
    functions: Set<string>;
    provenance: ImportedFunctionProvenance[];
    sources: Array<{ source: string; sourceFile?: string }>;
  } {
  let rewrittenBody = library.body;
  const nestedAccessibleFunctions = new Set<string>();

  nestedLibrariesByAlias.forEach((nestedLibrary, nestedAlias) => {
    rewrittenBody = rewriteNamespacedCalls(
      rewrittenBody,
      nestedAlias,
      nestedLibrary.functions,
      nestedLibrary.mangledPrefix,
    );

    nestedLibrary.functions.forEach((functionName) => {
      nestedAccessibleFunctions.add(`${nestedLibrary.mangledPrefix}_${functionName}`);
    });
  });

  const tokens = getVisibleTokens(rewrittenBody);
  const functionDefinitions = collectFunctionDefinitions(tokens);

  if (functionDefinitions.length === 0) {
    throw new InvalidLibraryImportError(`Library '${library.name}' does not define any functions.`);
  }

  const localFunctions = new Set(functionDefinitions.map((definition) => definition.name));
  const mangledNames = new Map<string, string>();
  const replacements: Replacement[] = [];

  functionDefinitions.forEach(({ name, nameToken }) => {
    const mangledName = `${mangledPrefix}_${name}`;
    if (usedMangledNames.has(mangledName)) {
      throw new InvalidLibraryImportError(
        `Imported function '${library.name}.${name}' conflicts with an existing function named '${mangledName}'.`,
      );
    }

    usedMangledNames.add(mangledName);
    mangledNames.set(name, mangledName);
    replacements.push({ start: nameToken.start, stop: nameToken.stop, text: mangledName });
  });

  validateLibraryCalls(tokens, new Set([...localFunctions, ...nestedAccessibleFunctions]), library.name);
  replacements.push(...collectLocalFunctionCallReplacements(tokens, mangledNames));

  const body = applyReplacements(rewrittenBody, replacements).trim();
  return {
    body,
    functions: new Set(functionDefinitions.map((definition) => definition.name)),
    provenance: functionDefinitions.map((definition) => ({
      mangledName: mangledNames.get(definition.name)!,
      generatedStartLine: 0,
      originalStartLine: library.bodyStartLine + definition.line - 1,
      generatedStartColumn: definition.functionToken.column + 2,
      originalStartColumn: definition.functionToken.column,
      source: library.source,
      ...(library.sourceFile ? { sourceFile: library.sourceFile } : {}),
    })),
    sources: [{ source: library.source, ...(library.sourceFile ? { sourceFile: library.sourceFile } : {}) }],
  };
}

function collectFunctionDefinitions(tokens: Token[]): Array<{
  functionToken: Token;
  name: string;
  nameToken: Token;
  visibility: FunctionVisibility.INTERNAL;
  line: number;
}> {
  const definitions: Array<{
    functionToken: Token;
    name: string;
    nameToken: Token;
    visibility: FunctionVisibility.INTERNAL;
    line: number;
  }> = [];

  for (let index = 0; index < tokens.length; index += 1) {
    if (tokens[index].text !== 'function') continue;

    const nameToken = tokens[index + 1];
    const openParenToken = tokens[index + 2];
    if (!nameToken?.text?.match(IDENTIFIER_PATTERN) || openParenToken?.text !== '(') {
      throw new InvalidLibraryImportError('Invalid function definition in imported library.');
    }

    let cursor = index + 3;
    let depth = 1;
    while (cursor < tokens.length && depth > 0) {
      if (tokens[cursor].text === '(') depth += 1;
      if (tokens[cursor].text === ')') depth -= 1;
      cursor += 1;
    }

    const visibilityToken = tokens[cursor];
    if (visibilityToken?.text !== FunctionVisibility.INTERNAL) {
      throw new InvalidLibraryImportError(
        `Imported library functions must declare internal visibility. Offending function: '${nameToken.text}'.`,
      );
    }

    const openBraceToken = tokens[cursor + 1];
    if (openBraceToken?.text !== '{') {
      throw new InvalidLibraryImportError('Invalid function definition in imported library.');
    }

    definitions.push({
      functionToken: tokens[index],
      name: nameToken.text,
      nameToken,
      visibility: FunctionVisibility.INTERNAL,
      line: nameToken.line,
    });
  }

  return definitions;
}

function validateLibraryCalls(tokens: Token[], accessibleFunctions: Set<string>, libraryName: string): void {
  for (let index = 0; index < tokens.length - 1; index += 1) {
    const token = tokens[index];
    const nextToken = tokens[index + 1];
    const previousToken = tokens[index - 1];

    if (
      token.text?.match(IDENTIFIER_PATTERN)
      && nextToken?.text === '.'
      && tokens[index + 2]?.text?.match(IDENTIFIER_PATTERN)
      && tokens[index + 3]?.text === '('
      && previousToken?.text !== '.'
    ) {
      throw new InvalidLibraryImportError(
        `Library '${libraryName}' references external helper '${token.text}.${tokens[index + 2]!.text}'. Imported libraries may only call imported or local helper functions.`,
      );
    }

    if (!token.text?.match(IDENTIFIER_PATTERN) || nextToken?.text !== '(') continue;
    if (previousToken?.text === 'function' || previousToken?.text === 'new' || previousToken?.text === '.') continue;

    if (
      accessibleFunctions.has(token.text)
      || GLOBAL_FUNCTIONS.has(token.text)
      || GLOBAL_CLASSES.has(token.text as Class)
      || BUILT_IN_STATEMENTS.has(token.text)
    ) {
      continue;
    }

    throw new InvalidLibraryImportError(
      `Library '${libraryName}' references non-library function '${token.text}'. Imported libraries may only call imported or local helper functions.`,
    );
  }
}

function collectLocalFunctionCallReplacements(tokens: Token[], mangledNames: Map<string, string>): Replacement[] {
  const replacements: Replacement[] = [];

  for (let index = 0; index < tokens.length - 1; index += 1) {
    const token = tokens[index];
    const nextToken = tokens[index + 1];
    const previousToken = tokens[index - 1];

    if (!token.text?.match(IDENTIFIER_PATTERN) || nextToken?.text !== '(') continue;
    if (previousToken?.text === 'function' || previousToken?.text === 'new' || previousToken?.text === '.') continue;

    const mangledName = mangledNames.get(token.text);
    if (!mangledName) continue;

    replacements.push({ start: token.start, stop: token.stop, text: mangledName });
  }

  return replacements;
}

function rewriteNamespacedCalls(
  code: string,
  alias: string,
  functions: Set<string>,
  replacementPrefix: string = alias,
): string {
  let output = '';

  for (let index = 0; index < code.length;) {
    if (startsWithLineComment(code, index)) {
      const commentEnd = findLineCommentEnd(code, index);
      output += code.slice(index, commentEnd);
      index = commentEnd;
      continue;
    }

    if (startsWithBlockComment(code, index)) {
      const commentEnd = findBlockCommentEnd(code, index);
      output += code.slice(index, commentEnd);
      index = commentEnd;
      continue;
    }

    if (code[index] === '"' || code[index] === '\'') {
      const stringEnd = findStringEnd(code, index);
      output += code.slice(index, stringEnd);
      index = stringEnd;
      continue;
    }

    const rewrite = tryRewriteNamespacedCall(code, index, alias, functions, replacementPrefix);
    if (rewrite) {
      output += rewrite.replacement;
      index = rewrite.nextIndex;
      continue;
    }

    output += code[index];
    index += 1;
  }

  return output;
}

function collectFunctionNames(code: string): Set<string> {
  const names = new Set<string>();
  const tokens = getVisibleTokens(code);

  for (let index = 0; index < tokens.length - 2; index += 1) {
    if (tokens[index].text !== 'function') continue;

    const nameToken = tokens[index + 1];
    const openParenToken = tokens[index + 2];
    if (nameToken?.text?.match(IDENTIFIER_PATTERN) && openParenToken?.text === '(') {
      names.add(nameToken.text);
    }
  }

  return names;
}

function findRootCloseIndex(code: string): number {
  const tokens = getVisibleTokens(code);
  const rootIndex = tokens.findIndex((token) => token.text === 'contract' || token.text === 'library');
  if (rootIndex === -1) {
    throw new InvalidImportDirectiveError('Imports require a root contract or library definition.');
  }

  const openBraceIndex = tokens.findIndex((token, index) => index > rootIndex && token.text === '{');
  if (openBraceIndex === -1) {
    throw new InvalidImportDirectiveError('Unable to locate the root body.');
  }

  return tokens[findMatchingBrace(tokens, openBraceIndex)].start;
}

function indentLibraryBody(body: string): string {
  return body
    .split('\n')
    .map((line) => (line.length === 0 ? line : `  ${line}`))
    .join('\n');
}

function countLineBreaks(text: string): number {
  return (text.match(/\n/g) ?? []).length;
}

function countLines(text: string): number {
  return countLineBreaks(text) + 1;
}

function getFunctionGeneratedLine(mangledName: string, section: string): number {
  const index = section.indexOf(mangledName);
  if (index === -1) {
    throw new InvalidLibraryImportError(`Could not map imported helper '${mangledName}' back to generated source.`);
  }

  return countLineBreaks(section.slice(0, index)) + 1;
}

function dedupeSources(
  sources: Array<{ source: string; sourceFile?: string }>,
): Array<{ source: string; sourceFile?: string }> {
  const seen = new Set<string>();
  return sources.filter((entry) => {
    const key = `${entry.sourceFile ?? ''}\u0000${entry.source}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getImportIdentity(resolvedImport: ResolvedImport, specifier: string, fromPath?: string): string {
  if (resolvedImport.path) return normaliseFilesystemPath(resolvedImport.path);
  return `${fromPath ?? '<root>'}::${specifier}`;
}

function findMatchingBrace(tokens: Token[], openBraceIndex: number): number {
  let depth = 0;
  for (let index = openBraceIndex; index < tokens.length; index += 1) {
    if (tokens[index].text === '{') depth += 1;
    if (tokens[index].text === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  throw new InvalidImportDirectiveError('Could not match braces while preprocessing imports.');
}

function advanceToSemicolon(tokens: Token[], cursor: number): number {
  while (cursor < tokens.length && tokens[cursor].text !== ';') {
    cursor += 1;
  }

  if (tokens[cursor]?.text !== ';') {
    throw new InvalidImportDirectiveError('Expected semicolon while preprocessing imports.');
  }

  return cursor + 1;
}

function blankRangePreservingNewlines(chars: string[], start: number, stop: number): void {
  for (let index = start; index <= stop; index += 1) {
    if (chars[index] !== '\n' && chars[index] !== '\r') {
      chars[index] = ' ';
    }
  }
}

function applyReplacements(code: string, replacements: Replacement[]): string {
  const orderedReplacements = [...replacements].sort((left, right) => right.start - left.start);
  let output = code;

  orderedReplacements.forEach(({ start, stop, text }) => {
    output = `${output.slice(0, start)}${text}${output.slice(stop + 1)}`;
  });

  return output;
}

function getVisibleTokens(code: string): Token[] {
  const inputStream = new CharStream(code);
  const lexer = new CashScriptLexer(inputStream);
  lexer.removeErrorListeners();
  const tokenStream = new CommonTokenStream(lexer);
  tokenStream.fill();

  return tokenStream.tokens.filter((token) => token.channel === 0 && token.type !== -1);
}

function tryRewriteNamespacedCall(
  code: string,
  index: number,
  alias: string,
  functions: Set<string>,
  replacementPrefix: string,
): { replacement: string; nextIndex: number } | undefined {
  if (!code.startsWith(alias, index)) return undefined;
  if (!isIdentifierBoundary(code[index - 1])) return undefined;
  if (!isIdentifierBoundary(code[index + alias.length])) return undefined;

  let cursor = skipWhitespace(code, index + alias.length);
  if (code[cursor] !== '.') return undefined;

  cursor = skipWhitespace(code, cursor + 1);
  const functionNameMatch = /^[a-zA-Z][a-zA-Z0-9_]*/.exec(code.slice(cursor));
  if (!functionNameMatch) {
    throw new InvalidImportDirectiveError(`Invalid imported function call '${alias}.' in contract source.`);
  }

  const functionName = functionNameMatch[0];
  if (!functions.has(functionName)) {
    throw new InvalidImportDirectiveError(`Imported library '${alias}' has no function named '${functionName}'.`);
  }

  cursor = skipWhitespace(code, cursor + functionName.length);
  if (code[cursor] !== '(') {
    throw new InvalidImportDirectiveError(
      `Imported library function calls must use the form '${alias}.${functionName}(...)'.`,
    );
  }

  return {
    replacement: `${replacementPrefix}_${functionName}`,
    nextIndex: cursor,
  };
}

function skipWhitespace(code: string, index: number): number {
  let cursor = index;
  while (cursor < code.length && /\s/.test(code[cursor])) {
    cursor += 1;
  }
  return cursor;
}

function startsWithLineComment(code: string, index: number): boolean {
  return code[index] === '/' && code[index + 1] === '/';
}

function startsWithBlockComment(code: string, index: number): boolean {
  return code[index] === '/' && code[index + 1] === '*';
}

function findLineCommentEnd(code: string, index: number): number {
  let cursor = index;
  while (cursor < code.length && code[cursor] !== '\n') {
    cursor += 1;
  }
  return cursor;
}

function findBlockCommentEnd(code: string, index: number): number {
  let cursor = index + 2;
  while (cursor < code.length && !(code[cursor] === '*' && code[cursor + 1] === '/')) {
    cursor += 1;
  }
  return cursor < code.length ? cursor + 2 : code.length;
}

function findStringEnd(code: string, index: number): number {
  const quote = code[index];
  let cursor = index + 1;
  while (cursor < code.length) {
    if (code[cursor] === '\\') {
      cursor += 2;
      continue;
    }
    if (code[cursor] === quote) {
      return cursor + 1;
    }
    cursor += 1;
  }
  return code.length;
}

function isIdentifierBoundary(char: string | undefined): boolean {
  return char === undefined || !/[a-zA-Z0-9_]/.test(char);
}

function isStringLiteral(value: string): boolean {
  return (value.startsWith('"') && value.endsWith('"')) || (value.startsWith('\'') && value.endsWith('\''));
}

function parseStringLiteral(value: string): string {
  return JSON.parse(value.replace(/^'/, '"').replace(/'$/, '"'));
}

function readPragmaConstraints(tokens: Token[], pragmaIndex: number, sourceLabel: string): string[] {
  const nameToken = tokens[pragmaIndex + 1];
  if (nameToken?.text !== 'cashscript') {
    throw new VersionError(sourceLabel, 'pragma cashscript ...');
  }

  const constraints: string[] = [];
  let cursor = pragmaIndex + 2;
  while (tokens[cursor]?.text !== ';') {
    const operator = tokens[cursor]?.text?.match(/^[\^~><=]+$/) ? tokens[cursor]!.text : '';
    if (operator) cursor += 1;

    const versionToken = tokens[cursor];
    if (!versionToken?.text) {
      throw new VersionError(sourceLabel, 'valid pragma cashscript version constraint');
    }

    constraints.push(`${operator}${versionToken.text}`);
    cursor += 1;
  }

  return constraints;
}

function validateLibraryPragmas(constraints: string[]): void {
  constraints.forEach((constraint) => {
    if (!semver.satisfies(version, constraint, { includePrerelease: true })) {
      throw new VersionError(version, constraint);
    }
  });
}

function normaliseFilesystemPath(codeFile: string | URL): string {
  if (codeFile instanceof URL) {
    return fileURLToPath(codeFile);
  }

  if (codeFile.startsWith('file://')) {
    return fileURLToPath(codeFile);
  }

  return codeFile;
}
