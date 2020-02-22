# Langage support for Event-B

[![GitHub](https://img.shields.io/github/stars/glg-corp/eventb-vscode-extension.svg)](https://github.com/glg-corp/eventb-vscode-extension) [![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/installs-short/glgcorp.eventb.svg)](https://marketplace.visualstudio.com/items?itemName=glgcorp.eventb)

Hello UNamur students!

If you enjoy this extension, please consider starring it on [GitHub](https://github.com/glg-corp/eventb-vscode-extension) ! :p

## Installation

1. In Rodin, install the "Camille text editor" plug-in. You'll only need it for context files.
2. Install this extension.

## Usage

1. You can create and edit `.bc` (context) and `.bm` (machine) files in Visual Studio with this extension.
2. Machine files will automatically compile to a Rodin-friendly XML. This XML is located in the ./bin folder.
3. Open the ./bin folder in Rodin (you may have to test different things in order to get your workspace correctly setup)
4. When ever you want to test your code, send `F5` to the Rodin Editor to reload the XML and refresh Pro-B.

## Symbols

As you know, Event-B uses a lot of unicode symbols. You can create them in VSCode with IntelliSense, using the corresponding keyword of the symbol you want.

The keyword of a symbol is often its English name (ex: *for all*), its most common associated keyword (ex: *in*) or its name in Rodin (ex: *Partial injection*?!).

## Upcoming features

- More accurate autocompletion.
- Commands to create files.
- Compiler for context files.
- Syntax error preview in editor.
- More simple and automated "new project" command and instructions