Object.defineProperty(exports, '__esModule', { value: true });

const vscode_languageserver = require('vscode-languageserver');
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
        // == Event-B symbols ==
        // Operators
        {
            label: 'Assignation ≔',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'assign',
            insertText : '≔'
        },
        {
            label: 'Division ÷',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'divide',
            insertText : '÷'
        },
        {
            label: 'Multiplication ∗',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'multiply',
            insertText : '∗'
        },
        {
            label: 'Subtraction −',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'minus',
            insertText : '−'
        },
        {
            label: 'Addition +',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'plus',
            insertText : '+'
        },
        {
            label: 'Not ¬',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'not',
            insertText : '¬'
        },
        {
            label: 'Such that ∣',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'such that',
            insertText : '∣'
        },
        {
            label: 'Becomes such that :∣',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'becomes such that',
            insertText : ':∣'
        },
        {
            label: 'And ∧',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'and',
            insertText : '∧'
        },
        {
            label: 'Or ∨',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'or',
            insertText : '∨'
        },
        {
            label: 'Not equal ≠',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'not equal',
            insertText : '≠'
        },
        {
            label: 'Less or equal ≤',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'less or equal',
            insertText : '≤'
        },
        {
            label: 'Greater or equal ≥',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'greater or equal',
            insertText : '≥'
        },
        // set related operators
        {
            label: 'Element of ∈',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'in',
            insertText : '∈'
        },
        {
            label: 'Becomes element of :∈',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'becomes in',
            insertText : ':∈'
        },
        {
            label: 'Not element of ∉',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'not in',
            insertText : '∉'
        },
        {
            label: 'Strict subset ⊂',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'strict subset',
            insertText : '⊂'
        },
        {
            label: 'Subset ⊆',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'subset',
            insertText : '⊆'
        },
        {
            label: 'Not strict subset ⊄',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'not strict subset',
            insertText : '⊄'
        },
        {
            label: 'Not subset ⊈',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'not subset',
            insertText : '⊈'
        },
        {
            label: 'Union ∪',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'union',
            insertText : '∪'
        },
        {
            label: 'Intersection ∩',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'intersection',
            insertText : '∩'
        },
        {
            label: 'General union ⋃',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'general union',
            insertText : '⋃'
        },
        {
            label: 'General intersection ⋂',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'general intersection',
            insertText : '⋂'
        },
        {
            label: 'There exists ∃',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'there exists',
            insertText : '∃'
        },
        {
            label: 'For all ∀',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'for all',
            insertText : '∀'
        },
        {
            label: 'Set minus ∖',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'set minus',
            insertText : '∖'
        },
        {
            label: 'Cartesian product ×',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'cartesian product',
            insertText : '×'
        },
        // Sets
        {
            label: 'Natural numbers ℕ',
            kind: vscode_languageserver.CompletionItemKind.Class,
            filterText: 'naturals',
            insertText : 'ℕ'
        },
        {
            label: 'Positive numbers ℕ1',
            kind: vscode_languageserver.CompletionItemKind.Class,
            filterText: 'positive numbers',
            insertText : 'ℕ1'
        },
        {
            label: 'Powerset ℙ',
            kind: vscode_languageserver.CompletionItemKind.Class,
            filterText: 'powerset',
            insertText : 'ℙ'
        },
        {
            label: 'Non-empty powerset ℙ1',
            kind: vscode_languageserver.CompletionItemKind.Class,
            filterText: 'non empty powerset',
            insertText : 'ℙ1'
        },
        {
            label: 'Integers ℤ',
            kind: vscode_languageserver.CompletionItemKind.Class,
            filterText: 'integers',
            insertText : 'ℤ'
        },
        {
            label: 'Empty set ∅',
            kind: vscode_languageserver.CompletionItemKind.Class,
            filterText: 'empty set',
            insertText : '∅'
        },
        // Arrows
        {
            label: 'Implication ⇒',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            insertText: '⇒',
            filterText: 'implies'
        },
        {
            label: 'Equivalence ⇔',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'equiv',
            insertText : '⇔'
        },
        {
            label: 'Relation ↔',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'relation',
            insertText : '↔'
        },
        {
            label: 'Total relation ',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'total relation',
            insertText : ''
        },
        {
            label: 'Surjective relation ',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'surjective relation',
            insertText : ''
        },
        {
            label: 'Total surjective relation ',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'total surjective relation',
            insertText : ''
        },
        {
            label: 'Partial function ⇸',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'partial function',
            insertText : '⇸'
        },
        {
            label: 'Total function →',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'total function',
            insertText : '→'
        },
        {
            label: 'Partial injection ⤔',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'partial injection',
            insertText : '⤔'
        },
        {
            label: 'Total injection ↣',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'total injection',
            insertText : '↣'
        },
        {
            label: 'Partial surjection ⤀',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'partial surjection',
            insertText : '⤀'
        },
        {
            label: 'Total surjection ↠',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'total surjection',
            insertText : '↠'
        },
        {
            label: 'Bijection ⤖',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'bijection',
            insertText : '⤖'
        },
        {
            label: 'Maplet ↦',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'maplet',
            insertText : '↦'
        },
        // weird stuff
        {
            label: 'Relation overriding ',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'relation overriding',
            insertText : ''
        },
        {
            label: 'Backward composition ∘',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'backward composition',
            insertText : '∘'
        },
        {
            label: 'Direct product ⊗',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'direct product',
            insertText : '⊗'
        },
        {
            label: 'Parallel product ∥',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'parallel product',
            insertText : '∥'
        },
        {
            label: 'Tilde operator ∼',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'tilde',
            insertText : '∼'
        },
        {
            label: 'Domain restriction ◁',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'domain restriction',
            insertText : '◁'
        },
        {
            label: 'Domain subtraction ⩤',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'domain subtraction',
            insertText : '⩤'
        },
        {
            label: 'Range restriction ▷',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'range restriction',
            insertText : '▷'
        },
        {
            label: 'Range subtraction ⩥',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'range subtraction',
            insertText : '⩥'
        },
        {
            label: 'Lambda λ',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'lambda',
            insertText : 'λ'
        },
        {
            label: 'Up to ‥',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'up to',
            insertText : '‥'
        },
        {
            label: 'Middle dot ·',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'middle dot',
            insertText : '·'
        },
        {
            label: 'True predicate ⊤',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'true predicate',
            insertText : '⊤'
        },
        {
            label: 'False predicate ⊥',
            kind: vscode_languageserver.CompletionItemKind.Operator,
            filterText: 'false predicate',
            insertText : '⊥'
        },

        // == Event-B keywords ==


        ];
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