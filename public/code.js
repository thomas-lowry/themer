'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function isPublished(styles) {
    var styles_1, styles_1_1;
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        let numOfStyles = styles.length;
        let numOfPublishedStyles = 0;
        let publishedStatus;
        try {
            //check to see if each style is published
            for (styles_1 = __asyncValues(styles); styles_1_1 = yield styles_1.next(), !styles_1_1.done;) {
                const item = styles_1_1.value;
                let style = figma.getStyleById(item.id);
                let published = yield style.getPublishStatusAsync();
                //increase the count of published styles
                if (published === 'CURRENT') {
                    numOfPublishedStyles++;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (styles_1_1 && !styles_1_1.done && (_a = styles_1.return)) yield _a.call(styles_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        //determine if all styles are published, some, or none
        if (numOfPublishedStyles === numOfStyles) {
            publishedStatus = 'all';
        }
        else if (numOfPublishedStyles >= 1 && numOfPublishedStyles < numOfStyles) {
            publishedStatus = 'some';
        }
        else {
            publishedStatus = 'none';
        }
        //return the results
        return publishedStatus;
    });
}
//# sourceMappingURL=isPublished.js.map

function assembleStylesArray(styles) {
    let reformatedArray = [];
    console.log('pre reform:', styles);
    //Reformat array
    styles.forEach(style => {
        let item = {
            name: style.name,
            key: style.key,
            id: style.id,
            theme: '',
            type: style.type
        };
        reformatedArray.push(item);
    });
    console.log('reform: ', reformatedArray);
    //filter our duplicate entries
    let keys = reformatedArray.map(o => o.key);
    let filteredArray = reformatedArray.filter(({ key }, index) => !keys.includes(key, index + 1));
    return filteredArray;
}
//# sourceMappingURL=assembleStylesArray.js.map

function getLocalStyles(styleTypes) {
    return __awaiter(this, void 0, void 0, function* () {
        //first get all local styles based on the style types they chose
        //add them all to a single array
        //next determine if all of the styles are published
        //possible outcomes:
        //all styles are published, tell the user nothing, advance to step 3
        //some styles are published, this doesn't seem good, tell the user, stay at step 2
        //none of the styles are published, continue to step 3, but tell the user
        let styles = [];
        //get color styles
        if (styleTypes.color === true) {
            let colorStyles = figma.getLocalPaintStyles();
            if (colorStyles.length > 0) {
                styles = styles.concat(colorStyles);
            }
        }
        //get text
        if (styleTypes.text === true) {
            let textStyles = figma.getLocalTextStyles();
            if (textStyles.length > 0) {
                styles = styles.concat(textStyles);
            }
        }
        //get effects
        if (styleTypes.effect === true) {
            let effectStyles = figma.getLocalEffectStyles();
            if (effectStyles.length > 0) {
                styles = styles.concat(effectStyles);
            }
        }
        let cleanedStyleData = assembleStylesArray(styles);
        console.log('cleaned: ', cleanedStyleData);
        //determine if ALL, SOME, or NONE of the styles are published
        let publishedStatus = yield isPublished(cleanedStyleData);
        //send the data back to the UI
        figma.ui.postMessage({
            'type': 'createStyleData',
            'styles': cleanedStyleData,
            'publishedStatus': publishedStatus
        });
    });
}
//# sourceMappingURL=getLocalStyles.js.map

const hasChildren = (node) => Boolean(node['children']);
//# sourceMappingURL=hasChildren.js.map

const hasFills = (node) => Boolean(node['fillStyleId']);
//# sourceMappingURL=hasFills.js.map

const hasEffects = (node) => Boolean(node['effectStyleId']);
//# sourceMappingURL=hasEffects.js.map

let styles = [];
function getStylesFromNodes(nodes, styleTypes) {
    return __awaiter(this, void 0, void 0, function* () {
        //styles = [];
        console.log('nodes', nodes);
        if (nodes.length != 0) {
            //this will loop over all nodes passed to the function
            //it will past each node to a function to extract any styles
            //if the node has children, it will pass the array of children back through the function
            nodes.forEach(node => {
                getStylesFromNode(node, styleTypes);
            });
            let cleanedStyleData = assembleStylesArray(styles);
            console.log('cleaned: ', cleanedStyleData);
            //determine if ALL, SOME, or NONE of the styles are published
            let publishedStatus = yield isPublished(cleanedStyleData);
            //send the data back to the UI
            figma.ui.postMessage({
                'type': 'createStyleData',
                'styles': cleanedStyleData,
                'publishedStatus': publishedStatus
            });
        }
        else {
            console.log('is this firing?');
            //send the data back to the UI with the empty array
            figma.ui.postMessage({
                'type': 'createStyleData',
                'styles': nodes,
                'publishedStatus': 'none'
            });
        }
    });
}
//get all possible styles from the node
function getStylesFromNode(node, styleTypes) {
    //COLOR
    if (styleTypes.color) {
        //check to see if node supports fills
        if (hasFills(node)) {
            //check to see if the node is text
            //text nodes can contain multiple styles
            if (node.type === 'TEXT') {
                let uniqueTextColorStyles = node.getStyledTextSegments(['fillStyleId']);
                if (uniqueTextColorStyles.length != 0) {
                    uniqueTextColorStyles.forEach(fillStyle => {
                        let id = fillStyle.fillStyleId;
                        let style = figma.getStyleById(id);
                        //add style to the array
                        styles.push(style);
                    });
                }
            }
            else {
                if (node.fillStyleId != '') {
                    //get the style
                    let id = node.fillStyleId;
                    let style = figma.getStyleById(id);
                    //add style to the array
                    styles.push(style);
                }
            }
        }
    }
    //TEXT
    if (styleTypes.text) {
        //check to see if the node is text
        //text nodes can contain multiple styles
        if (node.type === 'TEXT') {
            if (node.textStyleId != '') {
                if (typeof (node.textStyleId) === 'symbol') {
                    let uniqueTextStyles = node.getStyledTextSegments(['textStyleId']);
                    uniqueTextStyles.forEach(textStyle => {
                        let id = textStyle.textStyleId;
                        let style = figma.getStyleById(id);
                        console.log(style);
                        //add style to the array
                        styles.push(style);
                    });
                }
                else {
                    let id = node.textStyleId;
                    let style = figma.getStyleById(id);
                    //add style to the array
                    styles.push(style);
                }
            }
        }
    }
    //EFFECT
    if (styleTypes.effect) {
        //check to see if node supports fills
        if (hasEffects(node)) {
            if (node.effectStyleId != '') {
                //get the style
                let id = node.effectStyleId;
                let style = figma.getStyleById(id);
                //add style to the array
                styles.push(style);
            }
        }
    }
    //repeat the process of the node has children
    if (hasChildren(node)) {
        if (node.children.length >= 1) {
            node.children.forEach(child => {
                getStylesFromNode(child, styleTypes);
            });
        }
    }
}
//# sourceMappingURL=getStylesFromNodes.js.map

//imports
function getStyleData(styleTypes, styleSource) {
    if (styleSource === 'local') {
        getLocalStyles(styleTypes);
    }
    else {
        let nodes;
        //get all of the nodes to pull styles from
        if (styleSource === 'selection') {
            nodes = Array.from(figma.currentPage.selection);
        }
        else {
            nodes = Array.from(figma.currentPage.children);
        }
        //run the function which will iterate through all nodes
        getStylesFromNodes(nodes, styleTypes);
    }
}
//# sourceMappingURL=getStyleData.js.map

//Vars
//api credentials
var apiSecret;
var apiURL;
//recieves msgs from the UI
figma.ui.onmessage = msg => {
    switch (msg.type) {
        //when the UI needs Figma to gather data to create a new theme, this function is executed
        case 'createTheme':
            getStyleData(msg.styleTypes, msg.styleSource);
            break;
        //take msgs from the UI and show them to the user
        case 'error':
            figma.notify(msg.errorMsg);
            break;
    }
};
// show the UI
figma.showUI(__html__, { width: 240, height: 312 });
//INITIALIZE PLUGIN
//Check to see if credentials exist in client storage
//we check to see if there is an API key for jsonbin and also a url to the bin
//run on plugin initilization
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('figma: looking for existing themer data');
        apiURL = yield figma.clientStorage.getAsync('apiURL');
        apiSecret = yield figma.clientStorage.getAsync('apiSecret');
        if (apiURL && apiSecret) {
            //send a message to the UI with the credentials storred in the client
            figma.ui.postMessage({
                'type': 'apiCredentials',
                'status': true,
                'url': apiURL,
                'secret': apiSecret
            });
        }
        else {
            console.log('figma: sending api credentials to UI');
            //send a message to the UI that says there are no credentials storred in the client
            figma.ui.postMessage({
                'type': 'apiCredentials',
                'status': false
            });
        }
    }
    catch (err) {
        figma.ui.postMessage({
            'type': 'apiCredentials',
            'status': false
        });
    }
}))();
setTimeout(() => {
    console.log('trying again...just in case');
    figma.ui.postMessage({
        'type': 'apiCredentials',
        'status': false
    });
}, 1000);
