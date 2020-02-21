parser = require('./machine_grammar');
fs = require('fs');
builder = require("xmlbuilder");
builder = require("process");


function compile(file) {
    console.log(`[Event-B] Current directory : ${process.cwd()}`)
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.log(`[Event-B] ${err}`);
        }
        else {
            console.log(`[Event-B] ${file} opened successfully.`);
            result = parser.parse(data);
            exportToXML(result, file);
        }
    });
}


function exportToXML(jsonData) {

    let index = 1;

    // get file name
    let fileName = jsonData.name + ".bum";
    console.log(fileName);

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

            console.log(JSON.stringify(element))

            // create element
            elem = xml.ele("org.eventb.core.event", { name: index.toString(), "org.eventb.core.generated": "false", "org.eventb.core.convergence": convergence, "org.eventb.core.extended": element.extended.toString(), "org.eventb.core.label": element.name });
            index++;

            // refine/Extend
            if (element.target) {
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

    fs.writeFile(fileName, output, 'utf8', (err, data) => { });
}

module.exports = {
    compile: (file) => { compile(file); }
}