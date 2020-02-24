Object.defineProperty(exports, '__esModule', { value: true });

const vsls = require('vscode-languageserver');
const machineParser = require("../../compiler/machine_grammar");
const contextParser = require("../../compiler/context_grammar");

// Create a connection for the server. The connection uses Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = vsls.createConnection(vsls.ProposedFeatures.all);

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents = new vsls.TextDocuments();

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
        connection.client.register(vsls.DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(_event => {
            connection.console.log('Workspace folder change event received.');
        });
    }
})



// Cache the settings of all open documents
let documentSettings = new Map();

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
    const extension = getExtension(change.document.uri);
    if (extension === 'bm') {
        validateMachineTextDocument(change.document);
    }
    else if (extension === 'bc') {
        validateContextTextDocument(change.document);
    }
});

async function validateContextTextDocument(textDocument) {
    let text = textDocument.getText();

    let diagnostics = [];

    // Syntax analysis
    try {
        contextParser.parse(text);
    }
    catch (err) {
        const wordStart = err.location.start.offset;
        const wordEnd = getLastCharIndexOfWordAt(text, wordStart);
        const word = text.slice(wordStart, wordEnd);

        let diagnostic = {
            severity: vsls.DiagnosticSeverity.Error,
            range: {
                start: textDocument.positionAt(wordStart),
                end: textDocument.positionAt(wordEnd)
            },
            message: err.name + ": " + err.message.replace(/(?<=but ").(?=" found.)/, word)
        };
        diagnostics.push(diagnostic);
    }

    // Send the computed diagnostics to VS Code.
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

async function validateMachineTextDocument(textDocument) {

    let text = textDocument.getText();

    let diagnostics = [];

    // Syntax analysis
    try {
        machineParser.parse(text);
    }
    catch (err) {

        const wordStart = err.location.start.offset;
        const wordEnd = getLastCharIndexOfWordAt(text, wordStart);
        const word = text.slice(wordStart, wordEnd);

        let diagnostic = {
            severity: vsls.DiagnosticSeverity.Error,
            range: {
                start: textDocument.positionAt(wordStart),
                end: textDocument.positionAt(wordEnd)
            },
            message: err.name + ": " + err.message.replace(/(?<=but ").(?=" found.)/, word)
        };
        if (hasDiagnosticRelatedInformationCapability) {
            diagnostic.relatedInformation = [];
            let message;

            // try to detect most frequent bugs and hint the programmer to the solution

            if (err.message.includes(`Expected "anticipated", "convergent", "end", or "event" but end of input found`)) {
                message = "Did you forget an \"end\" at the end of the file ?";
            }
            else if (err.message.includes(`Expected predicate but`) && word == "then") {
                message = "Provide predicates in the \"where\" section or remove the \"where\" keyword.";
            }
            else if (err.message.includes("label") && word == "end") {
                message = "You must provide at least one action.";
            }
            else if (err.message.includes(`Expected "end" or label`) && word == "with") {
                message = `The "with" block goes above the "then" block.`;
            }
            else if (err.message.includes(`Expected label but`) && word == "then") {
                message = `Please provide at least one predicate, or remove the block.`;
            }
            else if ((err.message.includes(`label`) || err.message.includes(`predicate`)) && word[0] == "@") {
                message = `Please provide an expression after the label.`;
            }
            else if (err.message.includes(`Expected identifier but`) && word == "invariants") {
                message = `Please insert a line break between "variables" and "invariants".`;
            }
            else if (err.message.includes(`Expected identifier but`) && (word == "where" || word == "then" || word == "with" || word == "end")) {
                message = `Please provide at least one parameter or remove the "any" block.`;
            }
            else if (err.message.includes(`Expected "machine"`)) {
                message = `What are you even trying to do? A file should start with "machine" (see machine snippet)`;
            }
            else if (err.message.includes("label") && word != "events" && word != "end" && word != "with") {
                message = "Did you forget to put a @tag before your line ?";
            }
            else if (err.message.includes(`Expected predicate but`) && word != "events" && word != "end" && word != "with") {
                message = "Did you forget to put a @tag before your predicate ?";
            }

            // save related information
            if (message) {
                diagnostic.relatedInformation.push({
                    location: {
                        uri: textDocument.uri,
                        range: Object.assign({}, diagnostic.range)
                    },
                    message: message
                });
            }


        }
        diagnostics.push(diagnostic);
    }

    // check if there is a INITIALISATION event
    if (/\bevent\b +\bINITIALISATION\b[ \t\r\n]*\bthen\b(?:[ \t\r\n]*.*(?=end))*\bend\b/s.exec(text) == null) {
        let diagnostic = {
            severity: vsls.DiagnosticSeverity.Warning,
            range: {
                start: textDocument.positionAt(0),
                end: textDocument.positionAt(0)
            },
            message: "The machine does not have an INITIALISATION event."
        };

        if (hasDiagnosticRelatedInformationCapability) {
            diagnostic.relatedInformation = [{
                location: {
                    uri: textDocument.uri,
                    range: Object.assign({}, diagnostic.range)
                },
                message: "You can create one easily with the \"init\" snippet."
            }]
        }
        diagnostics.push(diagnostic);

    }

    // Send the computed diagnostics to VS Code.
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}


function getLastCharIndexOfWordAt(str, pos) {

    // Perform type conversions.
    str = String(str);
    pos = Number(pos) >>> 0;

    // Search for the word's end.
    var right = str.slice(pos).search(/\s/);

    // The last word in the string is a special case.
    if (right < 0) {
        return str.length;
    }



    // Return the word, using the located bounds to extract it from the string.
    return right + pos;
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
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'assign',
            insertText: '≔'
        },
        {
            label: 'Division ÷',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'divide',
            insertText: '÷'
        },
        {
            label: 'Multiplication ∗',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'multiply',
            insertText: '∗'
        },
        {
            label: 'Subtraction −',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'minus',
            insertText: '−'
        },
        {
            label: 'Addition +',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'plus',
            insertText: '+'
        },
        {
            label: 'Not ¬',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'not',
            insertText: '¬'
        },
        {
            label: 'Such that ∣',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'such that',
            insertText: '∣'
        },
        {
            label: 'Becomes such that :∣',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'becomes such that',
            insertText: ':∣'
        },
        {
            label: 'And ∧',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'and',
            insertText: '∧'
        },
        {
            label: 'Or ∨',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'or',
            insertText: '∨'
        },
        {
            label: 'Not equal ≠',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'not equal',
            insertText: '≠'
        },
        {
            label: 'Less or equal ≤',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'less or equal',
            insertText: '≤'
        },
        {
            label: 'Greater or equal ≥',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'greater or equal',
            insertText: '≥'
        },
        // set related operators
        {
            label: 'Element of ∈',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'in',
            insertText: '∈'
        },
        {
            label: 'Becomes element of :∈',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'becomes in',
            insertText: ':∈'
        },
        {
            label: 'Not element of ∉',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'not in',
            insertText: '∉'
        },
        {
            label: 'Strict subset ⊂',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'strict subset',
            insertText: '⊂'
        },
        {
            label: 'Subset ⊆',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'subset',
            insertText: '⊆'
        },
        {
            label: 'Not strict subset ⊄',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'not strict subset',
            insertText: '⊄'
        },
        {
            label: 'Not subset ⊈',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'not subset',
            insertText: '⊈'
        },
        {
            label: 'Union ∪',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'union',
            insertText: '∪'
        },
        {
            label: 'Intersection ∩',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'intersection',
            insertText: '∩'
        },
        {
            label: 'General union ⋃',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'general union',
            insertText: '⋃'
        },
        {
            label: 'General intersection ⋂',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'general intersection',
            insertText: '⋂'
        },
        {
            label: 'There exists ∃',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'there exists',
            insertText: '∃'
        },
        {
            label: 'For all ∀',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'for all',
            insertText: '∀'
        },
        {
            label: 'Set minus ∖',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'set minus',
            insertText: '∖'
        },
        {
            label: 'Cartesian product ×',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'cartesian product',
            insertText: '×'
        },
        // Sets
        {
            label: 'Natural numbers ℕ',
            kind: vsls.CompletionItemKind.Class,
            filterText: 'naturals',
            insertText: 'ℕ'
        },
        {
            label: 'Positive numbers ℕ1',
            kind: vsls.CompletionItemKind.Class,
            filterText: 'positive numbers',
            insertText: 'ℕ1'
        },
        {
            label: 'Powerset ℙ',
            kind: vsls.CompletionItemKind.Class,
            filterText: 'powerset',
            insertText: 'ℙ'
        },
        {
            label: 'Non-empty powerset ℙ1',
            kind: vsls.CompletionItemKind.Class,
            filterText: 'non empty powerset',
            insertText: 'ℙ1'
        },
        {
            label: 'Integers ℤ',
            kind: vsls.CompletionItemKind.Class,
            filterText: 'integers',
            insertText: 'ℤ'
        },
        {
            label: 'Empty set ∅',
            kind: vsls.CompletionItemKind.Class,
            filterText: 'empty set',
            insertText: '∅'
        },
        // Arrows
        {
            label: 'Implication ⇒',
            kind: vsls.CompletionItemKind.Operator,
            insertText: '⇒',
            filterText: 'implies'
        },
        {
            label: 'Equivalence ⇔',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'equiv',
            insertText: '⇔'
        },
        {
            label: 'Relation ↔',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'relation',
            insertText: '↔'
        },
        {
            label: 'Total relation ',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'total relation',
            insertText: ''
        },
        {
            label: 'Surjective relation ',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'surjective relation',
            insertText: ''
        },
        {
            label: 'Total surjective relation ',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'total surjective relation',
            insertText: ''
        },
        {
            label: 'Partial function ⇸',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'partial function',
            insertText: '⇸'
        },
        {
            label: 'Total function →',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'total function',
            insertText: '→'
        },
        {
            label: 'Partial injection ⤔',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'partial injection',
            insertText: '⤔'
        },
        {
            label: 'Total injection ↣',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'total injection',
            insertText: '↣'
        },
        {
            label: 'Partial surjection ⤀',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'partial surjection',
            insertText: '⤀'
        },
        {
            label: 'Total surjection ↠',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'total surjection',
            insertText: '↠'
        },
        {
            label: 'Bijection ⤖',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'bijection',
            insertText: '⤖'
        },
        {
            label: 'Maplet ↦',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'maplet',
            insertText: '↦'
        },
        // weird stuff
        {
            label: 'Relation overriding ',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'relation overriding',
            insertText: ''
        },
        {
            label: 'Backward composition ∘',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'backward composition',
            insertText: '∘'
        },
        {
            label: 'Direct product ⊗',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'direct product',
            insertText: '⊗'
        },
        {
            label: 'Parallel product ∥',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'parallel product',
            insertText: '∥'
        },
        {
            label: 'Tilde operator ∼',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'tilde',
            insertText: '∼'
        },
        {
            label: 'Domain restriction ◁',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'domain restriction',
            insertText: '◁'
        },
        {
            label: 'Domain subtraction ⩤',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'domain subtraction',
            insertText: '⩤'
        },
        {
            label: 'Range restriction ▷',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'range restriction',
            insertText: '▷'
        },
        {
            label: 'Range subtraction ⩥',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'range subtraction',
            insertText: '⩥'
        },
        {
            label: 'Lambda λ',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'lambda',
            insertText: 'λ'
        },
        {
            label: 'Up to ‥',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'up to',
            insertText: '‥'
        },
        {
            label: 'Middle dot ·',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'middle dot',
            insertText: '·'
        },
        {
            label: 'True predicate ⊤',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'true predicate',
            insertText: '⊤'
        },
        {
            label: 'False predicate ⊥',
            kind: vsls.CompletionItemKind.Operator,
            filterText: 'false predicate',
            insertText: '⊥'
        },

        // == Event-B constants ==
        {
            label: 'FALSE',
            kind: vsls.CompletionItemKind.Constant
        },
        {
            label: 'TRUE',
            kind: vsls.CompletionItemKind.Constant
        },

        // == Event-B keywords ==
        {
            label: 'extends',
            kind: vsls.CompletionItemKind.Keyword
        },
        {
            label: 'theorem',
            kind: vsls.CompletionItemKind.Keyword,
            insertText: 'theorem '
        },
        {
            label: 'refines',
            kind: vsls.CompletionItemKind.Keyword
        },
        {
            label: 'sees',
            kind: vsls.CompletionItemKind.Keyword
        },
        {
            label: 'with',
            kind: vsls.CompletionItemKind.Keyword
        },
        {
            label: 'where',
            kind: vsls.CompletionItemKind.Keyword
        },
        {
            label: 'any',
            kind: vsls.CompletionItemKind.Keyword
        },
        {
            label: 'then',
            kind: vsls.CompletionItemKind.Keyword
        },
        {
            label: 'end',
            kind: vsls.CompletionItemKind.Keyword
        },
        {
            label: 'variables',
            kind: vsls.CompletionItemKind.Keyword
        },
        {
            label: 'events',
            kind: vsls.CompletionItemKind.Keyword
        },
        {
            label: 'convergent',
            kind: vsls.CompletionItemKind.Keyword
        },
        {
            label: 'anticipated',
            kind: vsls.CompletionItemKind.Keyword
        },

        // == misc ==
        {
            label: 'BOOL',
            kind: vsls.CompletionItemKind.Class,
        },

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

// from https://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript
function getExtension(path) {
    var basename = path.split(/[\\/]/).pop(),  // extract file name from full path ...
        // (supports `\\` and `/` separators)
        pos = basename.lastIndexOf(".");       // get last position of `.`

    if (basename === "" || pos < 1)            // if file name is empty or ...
        return "";                             //  `.` not found (-1) or comes first (0)

    return basename.slice(pos + 1);            // extract extension ignoring `.`
}