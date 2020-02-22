vscode = require('vscode');
fs = require('fs');

function initProject() {
    // ask the project name to the user
    vscode.window.showInputBox({ prompt: "Enter a name for your project", placeHolder: "hello_world", validateInput: validateProjectName })
        .then((projectName) => {

            // ==create subdirectory ==
            let directory = vscode.workspace.rootPath;
            let separator = '/'
            // windows ?
            if (directory.lastIndexOf('\\') >= 0) {
                separator = '\\';
            }
            directory += separator + projectName;
            fs.mkdirSync(directory);

            // == create project file ==
            let content = 
`<?xml version="1.0" encoding="UTF-8" ?>
<projectDescription>
    <name>${projectName}</name>
    <comment></comment>
    <projects></projects>
    <buildSpec>
        <buildCommand>
            <name>org.rodinp.core.rodinbuilder</name>
            <arguments></arguments>
        </buildCommand>
    </buildSpec>
    <natures>
        <nature>org.rodinp.core.rodinnature</nature>
    </natures>
</projectDescription>            
`;

            fs.writeFileSync(`${directory}${separator}.project`, content, 'utf-8');
        })
        .catch((err) => {
            console.log(`[Event-B] Error while executing command:\n${err}`);
        });
}

exports.initProject = initProject;

function validateProjectName(input) {
    if (input.match(/^\w+$/) == null) {
        return "A project name must contain letters, digits or underscores."
    }
}
