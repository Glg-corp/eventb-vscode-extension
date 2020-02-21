"use strict";


// Language Client

// forked from sample by Microsoft Corporation.

Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const vscode_languageclient = require("vscode-languageclient");
const compiler = require("../../compiler/compiler")

let client;
function activate(context) {

    // Register commands
    const command = 'eventb.compileCurrentFile';

    const commandHandler = (name = 'world') => {
        compiler.compile(vscode.window.activeTextEditor.document.uri.fsPath);
    };

    context.subscriptions.push(vscode.commands.registerCommand(command, commandHandler));

    // The server is implemented in node
    let serverModule = context.asAbsolutePath(path.join('server', 'src', 'server.js'));

    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
    let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    let serverOptions = {
        run: { module: serverModule, transport: vscode_languageclient.TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: vscode_languageclient.TransportKind.ipc,
            options: debugOptions
        }
    };

    // Options to control the language client
    let clientOptions = {
        // Register the server for plain text documents
        documentSelector: [{ scheme: 'file', language: 'eventb-machine' }, { scheme: 'file', language: 'eventb-context' }],
        synchronize: {
            // Notify the server about file changes to '.clientrc files contained in the workspace
            fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
        }
    };

    // Create the language client and start the client.
    client = new vscode_languageclient.LanguageClient('languageServerExample', 'Language Server Example', serverOptions, clientOptions);

    // Start the client. This will also launch the server
    client.start();
}


exports.activate = activate;

function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}

exports.deactivate = deactivate;
