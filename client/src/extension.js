"use strict";


// Language Client

// forked from sample by Microsoft Corporation.

Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const vscode_languageclient = require("vscode-languageclient");
const fs = require('fs');

const compiler = require("../../compiler/compiler");
const newProject = require("./new-project");
const openInRodin = require("./open-in-rodin");

const EVENTB_PROJECT_LOADED = "eventb:project_loaded";

let client;
function activate(context) {

    startLanguageServer(context);

    registerCommands(context);

    setCommandVisibility();
    // recheck command visibility if the workspace changes
    vscode.workspace.onDidChangeWorkspaceFolders((event) => { setCommandVisibility(); });

    // register watcher
    const watcher = vscode.workspace.createFileSystemWatcher("**/*.bm");
    watcher.onDidChange(handleFileSystemChange, this);
}


exports.activate = activate;

function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}

exports.deactivate = deactivate;

function handleFileSystemChange(uri) {
    compiler.compile(uri.fsPath);
}

function startLanguageServer(context) {
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
    client = new vscode_languageclient.LanguageClient('eventbLanguageServer', 'Event-B', serverOptions, clientOptions);

    // Start the client. This will also launch the server
    client.start();
}

function registerCommands(context) {

    // init new project
    context.subscriptions.push(vscode.commands.registerCommand('eventb.initProject', () => {
        newProject.initProject();
    }));

    // compile current file
    context.subscriptions.push(vscode.commands.registerCommand('eventb.compileCurrentFile', () => {
        compiler.compile(vscode.window.activeTextEditor.document.uri.fsPath);
    }));

    // open in rodin
    context.subscriptions.push(vscode.commands.registerCommand('eventb.openInRodin', () => {
        openInRodin.openInRodin();
    }));

}

function setCommandVisibility() {

    // load workspace data
    let separator = '/'
    let directory = vscode.workspace.rootPath;

    // is a workspace opened ?
    const workspaceOpened = !!directory;

    // windows ?
    if (workspaceOpened && directory.lastIndexOf('\\') >= 0) {
        separator = '\\';
    }

    console.log(workspaceOpened && fs.existsSync(directory + separator + ".metadata") && fs.existsSync(directory + separator + "rodin-project"));

    // only show commands in a rodin project (workspace opened, and there is a .metadata folder and a rodin-project folder)
    const shouldShowCommands = workspaceOpened && fs.existsSync(directory + separator + ".metadata") && fs.existsSync(directory + separator + "rodin-project");

    vscode.commands.executeCommand("setContext", EVENTB_PROJECT_LOADED, shouldShowCommands);

}