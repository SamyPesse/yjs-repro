const fs = require('fs');
const Y = require('yjs');

const update = fs.readFileSync('./update.bin');

const doc = new Y.Doc();

// If I disable this, it works
doc.on('update', (update, origin) => {
    console.log('update', update.byteLength, origin);
    const json = yToDocument(doc.get('data', Y.XmlElement));
    console.log(json);
});


Y.applyUpdate(doc, update);

function yToDocument(yElement) {
    return {
        key: yElement.getAttribute('key'),
        nodes: yChildrenToNodes(yElement),
    };
}

function yChildrenToNodes(element) {
    return element.toArray().map((node) => {
        if (node instanceof Y.XmlElement) {
            return yElementToNode(node);
        } else if (node instanceof Y.XmlText) {
            return yTextToText(node);
        } else {
            throw new Error(`Unknown node type: ${node}`);
        }
    });
}

function yTextToText(yText) {
    // Commenting this makes it work
    const deltas = yText.toDelta();

    const leaves = deltas.map((delta) => {
        return {
            text: delta.insert,
        };
    });

    return {
        key: yText.getAttribute('key'),
        leaves,
    }
}

function yElementToNode(yElement) {
    const key = yElement.getAttribute('key');
    const object = yElement.getAttribute('object');

    switch (object) {
        case 'block': {
            return {
                key,
                type: yElement.getAttribute('type'),
                isVoid: yElement.getAttribute('isVoid'),
                nodes: yChildrenToNodes(yElement),
            };
        }
        default: {
            throw new Error(`Unknown object type: ${object}`);
        }
    }
}
