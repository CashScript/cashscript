---
title: Syntax Highlighting
---

When developing smart contracts for CashScript it is useful to have the proper syntax highlighting in your code editor / IDE. Because the CashScript syntax is very close to Solidity, it is recommended to install a Solidity highlighting plugin and associate it with `.cash` files in your editor.

## Visual Studio Code
The most popular Solidity plugin for Visual Studio Code is [JuanBlanco.Solidity](https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity). Install this plugin and add the following snippet to your Visual Studio Code user or workspace settings (Preferences -> Settings):

```json
"files.associations": {
    "*.cash": "solidity"
},
```

This associates `.cash` files with Solidity, and enables syntax highlighting for your CashScript files. Optionally, you can add the following snippet as well:

```json
"solidity.enabledAsYouTypeCompilationErrorCheck": false,
```

This makes sure that the Solidity plugin does not automatically try to compile your contracts, since this will fail. Of course, if you develop for CashScript **and** Solidity in different projects, you should add this to your workspace settings so it doesn't change your Solidity setup.

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

```
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
If your editor is not mentioned above, the steps arelikely very similar. Try to find a Solidity syntax highlighting plugin for your editor of choice and find a method to associate `.cash` files with this Solidity highlighting.
