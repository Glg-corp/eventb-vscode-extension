Object.defineProperty(exports, "__esModule", { value: true });

const vscode_languageserver = require("vscode-languageserver");
// Create a connection for the server. The connection uses Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = vscode_languageserver.createConnection(vscode_languageserver.ProposedFeatures.all);

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents = new vscode_languageserver.TextDocuments();

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;

connection.onInitialize((params) => {
    let capabilities = params.capabilities;

    hasConfigurationCapability = !!(
        capabilities.workspace && !!capabilities.workspace.configuration
    );
    hasWorkspaceFolderCapability = !!(
        capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );
    hasDiagnosticRelatedInformationCapability = !!(
        capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation
    );

    return {
        capabilities: {
            textDocumentSync: documents.syncKind,
            // Tell the client that the server supports code completion
            completionProvider: {
                resolveProvider: true
            }
        }
    };
})

connection.onInitialized(() => {
    if (hasConfigurationCapability) {
        // Register for all configuration changes.
        connection.client.register(vscode_languageserver.DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(_event => {
            connection.console.log('Workspace folder change event received.');
        });
    }
})


// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings = { maxNumberOfProblems: 1000 };
let globalSettings = defaultSettings;

// Cache the settings of all open documents
let documentSettings = new Map();

connection.onDidChangeConfiguration(change => {
    if (hasConfigurationCapability) {
        // Reset all cached document settings
        documentSettings.clear();
    } else {
        globalSettings = (
            (change.settings.languageServerExample || defaultSettings)
        );
    }

    // Revalidate all open text documents
    documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource) {
    if (!hasConfigurationCapability) {
        return Promise.resolve(globalSettings);
    }
    let result = documentSettings.get(resource);
    if (!result) {
        result = connection.workspace.getConfiguration({
            scopeUri: resource,
            section: 'languageServerExample'
        });
        documentSettings.set(resource, result);
    }
    return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
    documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
    validateTextDocument(change.document);
});

async function validateTextDocument(textDocument) {

}



// This handler provides the initial list of the completion items.
connection.onCompletion((_textDocumentPosition) => {
    // The pass parameter contains the position of the text document in
    // which code complete got requested. For the example we ignore this
    // info and always provide the same completion items.
    return [
        {
            label: 'machine',
            kind: vscode_languageserver.CompletionItemKind.Class,
            data: 1
        },
        {
            label: 'invariants',
            kind: vscode_languageserver.CompletionItemKind.Keyword,
            data: 2
        },
        {
            label: 'events',
            kind: vscode_languageserver.CompletionItemKind.Keyword,
            data: 3
        },
        {
            label: 'event',
            kind: vscode_languageserver.CompletionItemKind.Keyword,
            data: 3
        },
        {
            label: 'variables',
            kind: vscode_languageserver.CompletionItemKind.Keyword,
            data: 4
        },
        {
            label: 'where',
            kind: vscode_languageserver.CompletionItemKind.Keyword,
            data: 5
        },
        {
            label: 'then',
            kind: vscode_languageserver.CompletionItemKind.Keyword,
            data: 6
        },
        {
            label: 'end',
            kind: vscode_languageserver.CompletionItemKind.Keyword,
            data: 7
        },
        {
            label: 'any',
            kind: vscode_languageserver.CompletionItemKind.Keyword,
            data: 8
        },
        {
            label: 'sets',
            kind: vscode_languageserver.CompletionItemKind.Keyword,
            data: 9
        },
        {
            label: 'constants',
            kind: vscode_languageserver.CompletionItemKind.Keyword,
            data: 10
        },
        {
            label: 'axioms',
            kind: vscode_languageserver.CompletionItemKind.Keyword,
            data: 11
        },
        {
            label: 'refines',
            kind: vscode_languageserver.CompletionItemKind.Keyword,
            data: 12
        },
        {
            label: 'sees',
            kind: vscode_languageserver.CompletionItemKind.Keyword,
            data: 13
        },
        {
            label: 'with',
            kind: vscode_languageserver.CompletionItemKind.Keyword,
            data: 14
        },
        {
            label: 'TRUE',
            kind: vscode_languageserver.CompletionItemKind.Value,
            data: 15
        },
        {
            label: 'FALSE',
            kind: vscode_languageserver.CompletionItemKind.Keyword,
            data: 16
        },
        {
            label: 'extends',
            kind: vscode_languageserver.CompletionItemKind.Keyword,
            data: 17
        },
        {
            label: 'theorem',
            kind: vscode_languageserver.CompletionItemKind.Keyword,
            data: 18
        },
        {
            label: 'BOOL',
            kind: vscode_languageserver.CompletionItemKind.Keyword,
            data: 19
        },
        {
            label: 'context',
            kind: vscode_languageserver.CompletionItemKind.Class,
            data: 20
        }];
});

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
	(item) => {
        // TODO
		// if (item.data === 1) {
		// 	item.detail = 'Machine';
		// 	item.documentation = 'TypeScript documentation';
		// } else if (item.data === 2) {
		// 	item.detail = 'Invariants';
		// 	item.documentation = 'JavaScript documentation';
		// }
		return item;
	}
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();