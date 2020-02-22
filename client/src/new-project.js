vscode = require('vscode');
fs = require('fs');
path = require('path');


async function initProject() {
    try {

        // forked from Dart-Code

        // ask the project name to the user
        let name = await vscode.window.showInputBox({ prompt: "Enter a name for your project", placeHolder: "hello_world", validateInput: validateProjectName });

        const folders = await vscode.window.showOpenDialog({ canSelectFolders: true, openLabel: "Select a folder to create the project in" });
        if (!folders || folders.length !== 1)
            return;
        const folderUri = folders[0];
        const projectFolderUri = vscode.Uri.file(path.join(fsPath(folderUri), name));
        if (fs.existsSync(fsPath(projectFolderUri))) {
            vs.window.showErrorMessage(`A folder named ${name} already exists in ${fsPath(folderUri)}`);
            return;
        }


        // Create the empty folder so we can open it.
        fs.mkdirSync(fsPath(projectFolderUri));

        let rodinProjectDir = path.join(fsPath(projectFolderUri), "rodin-project");
        // Create rodin-project folder
        fs.mkdirSync(rodinProjectDir);

        // Create project file
        // == create project file ==
        let content =
            `<?xml version="1.0" encoding="UTF-8" ?>
<projectDescription>
    <name>${name}</name>
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

        fs.writeFileSync(path.join(fsPath(rodinProjectDir), ".project"), content, 'utf-8');

        // == create .gitignore file ==
        content = `.metadata
*.bcm
*.bpo
*.bpr
*.bps
*.bum`;
        fs.writeFileSync(path.join(fsPath(projectFolderUri), ".gitignore"), content);


        // == create readme ==
        content = "# Getting started\r\n\r\nYou can create `.bm` (machine) and `.bc` (context) files at the root of this directory.\r\n\r\nEverytime you save, the files will be compiled into a Rodin-friendly XML, in the `.\/rodin-project` directory.\r\n\r\n## How to open in Rodin ?\r\n\r\n1. Set your **workspace** to this directory. \r\n\r\n    - In Rodin: `File` > `Switch workspace` > `Other`. Select this directory and press OK.\r\n\r\n2. Import the `rodin-project`.\r\n\r\n    - In Rodin: Right click on the Event-B Explorer > `Import`. A window opens.\r\n\r\n    - Select `General` > `Existing Projects into Workspace` and hit Next.\r\n\r\n    - In `Select root directory`, use the arrow to open the dropdown menu. Select `rodin-project`. (If nothing appears, you can point to the directory with Browse).\r\n\r\n    - Select `Finish`. You should see your project and your machines\/contexts.\r\n\r\n## How to use ?\r\n\r\n- Edit your `.bm` and `.bc` files in VSCode.\r\n- When you feel like testing, save the file and hit `F5` in the Rodin Editor to refresh the XML.\r\n- You can now use Rodin and ProB to test your files !\r\n\r\n## What are the benefits of this method ?\r\n\r\n- Avoid Rodin editor\r\n- Avoid Camille editor\r\n- Get some snippets\r\n- Write symbols in a more intuitive manner\r\n- You can use this git repository without worrying about conflicts due to the XML\r\n- Avoid Rodin editor\r\n- Dark mode\r\n- You can use VSCode shortcuts, multi-cursors, etc...\r\n- Less bugs (I hope)\r\n- AVOID RODIN EDITOR";
        fs.writeFileSync(path.join(fsPath(projectFolderUri), "getting_started.md"), content, "utf-8");

        // == create machine file ==
        fs.writeFileSync(path.join(fsPath(projectFolderUri), "machine1.bm"), "machine machine1\n\nend\n", "utf-8");

        // open workspace
        const hasFoldersOpen = !!(vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length);
        const openInNewWindow = hasFoldersOpen;
        vscode.commands.executeCommand("vscode.openFolder", projectFolderUri, openInNewWindow);
    }
    catch (err) {
        console.log(`[Event-B] Error while executing command:\n${err}`);
    };

}

exports.initProject = initProject;

function validateProjectName(input) {
    if (input.match(/^\w+$/) == null) {
        return "A project name must contain letters, digits or underscores."
    }
}


function fsPath(uri) {
    // tslint:disable-next-line:disallow-fspath
    return forceWindowsDriveLetterToUppercase(typeof uri === "string" ? uri : uri.fsPath);
}

function forceWindowsDriveLetterToUppercase(p) {
    const isWin = /^win/.test(process.platform);
    if (p && isWin && path.isAbsolute(p) && p.charAt(0) === p.charAt(0).toLowerCase())
        p = p.substr(0, 1).toUpperCase() + p.substr(1);
    return p;
}