---
title: Syntax Highlighting
---

When developing smart contracts for CashScript it is useful to have the proper syntax highlighting in your code editor / IDE. If you use Visual Studio Code, there is a dedicated CashScript extension. For other editors it is recommended to install a Solidity highlighting plugin and associate it with `.cash` files in your editor, since the syntaxes of the two languages are very similar.

## Visual Studio Code (Recommended)
For Visual Studio Code (and derived editors like Cursor) we have an official [CashScript extension](https://marketplace.visualstudio.com/items?itemName=CashScript.cashscript-vscode). This extension works with `.cash` files and supports syntax highlighting, autocompletion, snippets and linting. Because of the first-class CashScript support, Visual Studio Code with this CashScript extension is the recommended way to develop CashScript contracts.

To have the extension automatically suggested for any developer looking at your CashScript contract in VScode, add the following configuration in a `.vscode/extensions.json` file:

```json title="&#126;/.vscode/extensions.json"
{
  "recommendations": [
    "cashscript.cashscript-vscode",
  ]
}
```

## Cursor

Cursor and other VS Code forks can use the VS Code extension mentioned above. This extension should be findable in the extensions menu within the editor. If it is not, you can manually install it from the [Open VSX Registry](https://open-vsx.org/extension/CashScript/cashscript-vscode).

## Sublime Text
The most popular Solidity plugin for Sublime Text 2/3 is [Ethereum](https://packagecontrol.io/packages/Ethereum). Install this plugin with [Package Control](https://packagecontrol.io/), open a `.cash` file and set Solidity as the syntax language in the Sublime menu bar:

> View -> Syntax -> Open all with current extension as ... -> Solidity

This associates `.cash` files with Solidity, and enables syntax highlighting for your CashScript files.

## Atom
The most popular Solidity plugin for Atom is [language-solidity](https://atom.io/packages/language-solidity). Install this plugin and add the following snippet to your Config file:

```yaml title="&#126;/.atom/config.cson"
core:
  customFileTypes:
    "source.solidity": ["cash"]
```

This associates `.cash` files with Solidity, and enables syntax highlighting for your CashScript files.

## Vim
The most popular Solidity plugin for Vim is [vim-solidity](https://github.com/TovarishFin/vim-solidity). Install this plugin and add the following snippet to your `.vimrc`:

```bash title=".vimrc"
au BufRead,BufNewFile *.cash setfiletype solidity
```

This associates `.cash` files with Solidity, and enables syntax highlighting for your CashScript files.

## GitHub
GitHub has highlighting for Solidity built in. To associate `.cash` files with Solidity highlighting, add a `.gitattributes` file to your repository with the following contents:

```python title=".gitattributes"
*.cash linguist-language=Solidity # GitHub
```

Unfortunately Gitlab does not have properly working Solidity highlighting through the `gitattributes` for now...

## Others
If your editor is not mentioned above, the steps are likely very similar. Try to find a Solidity syntax highlighting plugin for your editor of choice and find a method to associate `.cash` files with this Solidity highlighting.
