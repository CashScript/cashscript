---
title: Syntax Highlighting
---

When developing smart contracts for CashScript it is useful to have the proper syntax highlighting in your code editor / IDE. If you use Visual Studio Code, there is a dedicated CashScript extension. For other editors it is recommended to install a Solidity highlighting plugin and associate it with `.cash` files in your editor, since the syntaxes of the two languages are very similar.

## Visual Studio Code (Recommended)
For Visual Studio Code a dedicated [CashScript extension](https://marketplace.visualstudio.com/items?itemName=nathanielcherian.cashscript) was developed by community contributor [Nathaniel Cherian](https://twitter.com/nathanielCheria). This plugin works with `.cash` files and supports syntax highlighting, autocompletion, snippets, linting and even integrated compilation.

Because of the first-class CashScript support, Visual Studio Code together with this CashScript extension is the recommended way to develop CashScript contracts.

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

## GitHub & GitLab
GitHub and GitLab have syntax highlighting for Solidity built in. To associate `.cash` files with Solidity highlighting, add a `.gitattributes` file to your repository with the following contents:

```python title=".gitattributes"
*.cash linguist-language=Solidity # GitHub
*.cash gitlab-language=solidity # GitLab
```

## Others
If your editor is not mentioned above, the steps are likely very similar. Try to find a Solidity syntax highlighting plugin for your editor of choice and find a method to associate `.cash` files with this Solidity highlighting.
