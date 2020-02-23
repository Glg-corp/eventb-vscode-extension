# Langage support for Event-B

[![GitHub](https://img.shields.io/github/stars/glg-corp/eventb-vscode-extension.svg)](https://github.com/glg-corp/eventb-vscode-extension) [![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/installs-short/glgcorp.eventb.svg)](https://marketplace.visualstudio.com/items?itemName=glgcorp.eventb)

Hello UNamur students!

If you enjoy this extension, please consider starring it on [GitHub](https://github.com/glg-corp/eventb-vscode-extension) ! :p

## Installation

1. In Rodin, install the "Camille text editor" plug-in. You'll only need it for context files.
2. Install this extension.

## Usage

With the command palette (`CTRL+SHIFT+P` or `View > Command Palette`), execute the command : `[Event-B] New Project`. 

The command will ask you a **project name** and the **path to a directory**. The specified directory doesn't need to be empty : the command will create a subdirectory for the project, in which the basic project files will be generated.

The `getting_started.md` file will contain all the info you need to develop your incredibly useful Event-B project.

## Symbols

As you know, Event-B uses a lot of unicode symbols. You can create them in VSCode with IntelliSense, using the corresponding keyword of the symbol you want.

The keyword of a symbol is often its English name (ex: *for all*), its most common associated keyword (ex: *in*) or its name in Rodin (ex: *Partial injection*?!).

## Upcoming features

- Commands to create files.
- Compiler for context files.