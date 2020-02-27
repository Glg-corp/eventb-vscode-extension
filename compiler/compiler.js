machineParser = require('./machine_grammar');
contextParser = require('./context_grammar');
fs = require('fs');
builder = require("xmlbuilder");
process = require("process");
vscode = require("vscode");

function compile(file) {

    const extension = getExtension(file);

    if (extension === 'bm' || extension === 'bc') {

        let separator = '/'
        let directory = vscode.workspace.rootPath;

        try {
            // windows ?
            if (directory.lastIndexOf('\\') >= 0) {
                separator = '\\';
            }

            directory += separator + "rodin-project";

            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory);
            }

            directory += separator;

            // read file
            data = fs.readFileSync(file, 'utf8');
            console.log(`[Event-B] Compiling ${file}.`);

            // Pre compile: replace annoying symbols
            data = data.replace(/\+/g, '+')
                       .replace(/-/g, '−')
                       .replace(/\*/g, '∗')
                       .replace(/|/g, '∣')
                       .replace(/:=/g, '≔')
                       .replace(/(?<!\.)\.\.(?!\.)/g, '‥')
                       .replace(/(?<!\/)\/(?!\/)/g, '÷');


            // Machine file
            if (extension === 'bm') {
                result = machineParser.parse(data);
                exportMachineToXML(result, directory);
            }
            // Context files
            else if (extension === 'bc') {
                result = contextParser.parse(data);
                exportContextToXML(result, directory);
            }
        }
        catch (exception) {
            console.log(`[Event-B] Exception during compilation :\n${exception}`);
        }
    }
}

// from https://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript
function getExtension(path) {
    var basename = path.split(/[\\/]/).pop(),  // extract file name from full path ...
        // (supports `\\` and `/` separators)
        pos = basename.lastIndexOf(".");       // get last position of `.`

    if (basename === "" || pos < 1)            // if file name is empty or ...
        return "";                             //  `.` not found (-1) or comes first (0)

    return basename.slice(pos + 1);            // extract extension ignoring `.`
}

function exportContextToXML(jsonData, directory) {
    let index = 1;

    // get file name
    let fileName = directory + jsonData.name + ".buc";

    // build core file
    xml = builder.create("org.eventb.core.contextFile");
    xml.att({ version: "3", "org.eventb.core.configuration": "org.eventb.core.fwd;de.prob.symbolic.ctxBase" });

    // extends ?
    if (jsonData.content.extends) {
        xml.ele("org.eventb.core.extendsContext", { name: index.toString(), "org.eventb.core.target": jsonData.content.extends.target });
        index++;
    }

    // sets ?
    if (jsonData.content.sets) {
        jsonData.content.sets.forEach((value) => {
            xml.ele("org.eventb.core.carrierSet", { name: index.toString(), "org.eventb.core.identifier": value });
            index++;
        });
    }

    // constants ?
    if (jsonData.content.constants) {
        jsonData.content.constants.forEach((value) => {
            xml.ele("org.eventb.core.constant", { name: index.toString(), "org.eventb.core.identifier": value, "de.prob.symbolic.symbolicAttribute": "false" });
            index++;
        });
    }

    // axioms ?
    if (jsonData.content.axioms) {
        jsonData.content.axioms.forEach((element) => {
            xml.ele("org.eventb.core.axiom", { name: index.toString(), "org.eventb.core.label": element.label, "org.eventb.core.predicate": element.predicate, "org.eventb.core.theorem": element.theorem.toString() });
            index++;
        });
    }

    let output = xml.end({ pretty: true });

    fs.writeFileSync(fileName, output, 'utf8');

}

function exportMachineToXML(jsonData, directory) {

    let index = 1;

    // get file name
    let fileName = directory + jsonData.name + ".bum";

    // build core file
    xml = builder.create("org.eventb.core.machineFile");
    xml.att({ "version": "5", "org.eventb.core.configuration": "org.eventb.core.fwd", "org.eventb.core.generated": "false" });

    // refines ?
    if (jsonData.content.refines) {
        xml.ele("org.eventb.core.refinesMachine", { name: index.toString(), "org.eventb.core.target": jsonData.content.refines.target });
        index++;
    }

    // sees ?
    if (jsonData.content.sees) {
        xml.ele("org.eventb.core.seesContext", { name: index.toString(), "org.eventb.core.target": jsonData.content.sees.target });
        index++;
    }

    // variables ?
    if (jsonData.content.variables) {
        jsonData.content.variables.forEach(element => {
            xml.ele("org.eventb.core.variable", { name: index.toString(), "org.eventb.core.generated": "false", "org.eventb.core.identifier": element });
            index++;
        });
    }

    // invariants ?
    if (jsonData.content.invariants) {
        jsonData.content.invariants.forEach(element => {
            xml.ele("org.eventb.core.invariant", { name: index.toString(), "org.eventb.core.generated": "false", "org.eventb.core.label": element.label, "org.eventb.core.predicate": element.predicate, "org.eventb.core.theorem": element.theorem.toString() });
            index++;
        });
    }

    // events ?
    if (jsonData.content.events) {
        jsonData.content.events.forEach(element => {
            // process convergence
            let convergence = "0";
            if (element.convergence == "convergent") {
                convergence = "1";
            }
            else if (element.convergence == "anticipated") {
                convergence = "2";
            }

            // create element
            elem = xml.ele("org.eventb.core.event", { name: index.toString(), "org.eventb.core.generated": "false", "org.eventb.core.convergence": convergence, "org.eventb.core.extended": element.extended.toString(), "org.eventb.core.label": element.name });
            index++;

            // refine/Extend
            if (element.target && element.name !== "INITIALISATION" && element.name !== "_") {
                elem.ele("org.eventb.core.refinesEvent", { name: index.toString(), "org.eventb.core.target": element.target });
                index++;
            }

            // param ?
            if (element.any) {
                element.any.forEach((item) => {
                    elem.ele("org.eventb.core.parameter", { name: index.toString(), "org.eventb.core.generated": "false", "org.eventb.core.identifier": item });
                    index++;
                })
            }

            // guard ?
            if (element.where) {
                element.where.forEach((item) => {
                    elem.ele("org.eventb.core.guard", { name: index.toString(), "org.eventb.core.generated": "false", "org.eventb.core.label": item.label, "org.eventb.core.predicate": item.predicate, "org.eventb.core.theorem": item.theorem.toString() });
                    index++;
                })
            }

            // witness ?
            if (element.with) {
                element.with.forEach((item) => {
                    elem.ele("org.eventb.core.witness", { name: index.toString(), "org.eventb.core.generated": "false", "org.eventb.core.label": item.label, "org.eventb.core.predicate": item.assignment });
                    index++;
                });
            }

            // action ?
            if (element.then) {
                element.then.forEach((item) => {
                    elem.ele("org.eventb.core.action", { name: index.toString(), "org.eventb.core.generated": "false", "org.eventb.core.label": item.label, "org.eventb.core.assignment": item.assignment });
                    index++;
                })
            }

        });
    }

    let output = xml.end({ pretty: true });

    fs.writeFileSync(fileName, output, 'utf8');
}

exports.compile = compile;