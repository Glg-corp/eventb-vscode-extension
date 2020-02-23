const vscode = require('vscode');
const process = require('child_process');

function openInRodin() {
    try {
        const directory = vscode.workspace.rootPath;
        const rodinExecutable = vscode.workspace.getConfiguration('eventb').get('pathToRodinExecutable');

        const rodin = process.exec(`${rodinExecutable} -data ${directory}`);

        rodin.stderr.on('data', (data) => {
            if (!data.contains("Rodin")) {
                vscode.window.showErrorMessage("[Event-B] " + data);
                vscode.window.showInformationMessage("[Event-B] Make sure that Rodin is installed and added to the PATH. You can also specify the full path in the settings.");
            }
        });
    }
    catch (err) {
        console.log(err);
    }

}

exports.openInRodin = openInRodin;