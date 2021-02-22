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
                const style = styles_1_1.value;
                let published = yield style.getPublishStatusAsync();
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
        else if (numOfPublishedStyles > 1 && numOfPublishedStyles < numOfStyles) {
            publishedStatus = 'some';
        }
        else {
            publishedStatus = 'none';
        }
        //return the results
        return publishedStatus;
    });
}

function assembleStylesArray(styles) {
    let stylesArray = [];
    styles.forEach(style => {
        let item = {
            name: style.name,
            id: style.id,
            key: style.key,
            type: style.type
        };
        stylesArray.push(item);
    });
    return stylesArray;
}

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
        //determine if ALL, SOME, or NONE of the styles are published
        let publishedStatus = yield isPublished(styles);
        //send the data back to the UI
        figma.ui.postMessage({
            'type': 'createStyleData',
            'styles': assembleStylesArray(styles),
            'publishedStatus': publishedStatus
        });
    });
}

const hasChildren = (node) => Boolean(node['children']);

function removeDuplicatesBy(key, styleArray) {
    var mySet = new Set();
    return styleArray.filter(function (x) {
        var key = key(x), isNew = !mySet.has(key);
        if (isNew)
            mySet.add(key);
        return isNew;
    });
}

let styles = [];
function getStylesFromNodes(nodes, styleTypes) {
    return __awaiter(this, void 0, void 0, function* () {
        //collect all styles
        nodes.forEach(node => {
            getStylesFromNode(node, styleTypes);
        });
        //remove duplicate styles in the array
        let cleanedStyleData = removeDuplicatesBy(style => style.key, styles);
        //determine if ALL, SOME, or NONE of the styles are published
        let publishedStatus = yield isPublished(styles);
        //send the data back to the UI
        figma.ui.postMessage({
            'type': 'createStyleData',
            'styles': assembleStylesArray(styles),
            'publishedStatus': publishedStatus
        });
    });
}
//get all possible styles from the node
function getStylesFromNode(node, styleTypes) {
    //COLOR
    if (styleTypes.color) {
        let colorStyles = [];
        //ignore these types of notes because they cannot have a fill style
        //text nodes will be treated separately
        if (node.type != 'SLICE' && node.type != 'GROUP') {
            //check for unique style when adding to array
            let pushUniqueColor = (style) => {
                if (!colorStyles.some((item) => item.key === style.key)) {
                    colorStyles.push(style);
                }
            };
            if (node.type === 'TEXT' && typeof node.fillStyleId === 'symbol') {
                let length = node.characters.length;
                for (let i = 0; i < length; i++) {
                    let styleId = node.getRangeFillStyleId(i, i + 1);
                    let style;
                    if (styleId != '' && styleId.length > 0) {
                        style = figma.getStyleById(styleId);
                    }
                    pushUniqueColor(style);
                }
            }
            else if (node.fillStyleId != '' && typeof node.fillStyleId != 'symbol' && node.fillStyleId.length > 0) {
                let style = figma.getStyleById(node.fillStyleId);
                colorStyles.push(style);
            }
        }
    }
    //TEXT
    if (styleTypes.text) {
        let textStyles = [];
        //verify if text node, otherwise skip
        if (node.type === 'TEXT') {
            //check for unique style when adding to array
            let pushUniqueText = (style) => {
                if (!textStyles.some((item) => item.key === style.key)) {
                    textStyles.push(style);
                }
            };
            //check if symbol, if true
            //this means there are multiple text styles in the text box and we need to iterate per character
            if (typeof node.textStyleId === 'symbol') {
                let length = node.characters.length;
                for (let i = 0; i < length; i++) {
                    let styleId = node.getRangeTextStyleId(i, i + 1);
                    let style;
                    if (styleId != '' && styleId.length > 0) {
                        style = figma.getStyleById(styleId);
                    }
                    pushUniqueText(style);
                }
            }
            else if (node.textStyleId != '' && node.textStyleId.length > 0) {
                let style = figma.getStyleById(node.textStyleId);
                textStyles.push(style);
            }
        }
    }
    //EFFECT
    if (styleTypes.effect) {
        if (node.type != 'SLICE' && node.type != 'GROUP') {
            if (node.effectStyleId != '' && node.effectStyleId.length > 0) {
                let style = figma.getStyleById(node.effectStyleId);
            }
        }
    }
    //if the node has children, run the same function recursively
    if (hasChildren(node)) {
        node.children.forEach((child) => __awaiter(this, void 0, void 0, function* () {
            getStylesFromNode(child, styleTypes);
        }));
    }
}

//imports
function getStyleData(styleTypes, styleSource) {
    if (styleSource === 'local') {
        getLocalStyles(styleTypes);
    }
    else {
        let nodes;
        let errorMsg;
        //get all of the nodes to pull styles from
        if (styleSource === 'selection') {
            nodes = Array.from(figma.currentPage.selection);
            errorMsg = 'selected.';
        }
        else {
            nodes = Array.from(figma.currentPage.children);
            errorMsg = 'on the current page.';
        }
        if (nodes.length < 1) {
            nodes.forEach(node => {
                getStylesFromNodes(node, styleTypes);
            });
        }
        else {
            //throw an error if there are no nodes
            figma.notify('There are no items ' + errorMsg);
            //tell the UI to fail style validation
            figma.ui.postMessage({
                'createThemeError': true
            });
        }
    }
}

//imports
// show the UI
figma.showUI(__html__, { width: 240, height: 312 });
//recieves msgs from the UI
figma.ui.onmessage = msg => {
    switch (msg.type) {
        case 'createTheme':
            getStyleData(msg.styleTypes, msg.styleSource);
            break;
    }
};
