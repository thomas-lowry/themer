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

function assembleStylesArray(styles) {
    let reformatedArray = [];
    console.log('num of input styles', styles.length);
    //Reformat array
    styles.forEach(style => {
        let item = {
            name: style.name,
            key: style.key,
            id: style.id,
            theme: '',
            type: style.type
        };
        let hidden = false;
        //check for hidden styles
        if (item.name.includes('_') || item.name.includes('.')) {
            let splitName = item.name.split('/');
            splitName.forEach(chunk => {
                if (chunk[0] === '_' || chunk[0] === '.') {
                    hidden = true;
                }
            });
        }
        if (hidden === false) {
            reformatedArray.push(item);
        }
    });
    //filter our duplicate entries
    let keys = reformatedArray.map(o => o.key);
    let filteredArray = reformatedArray.filter(({ key }, index) => !keys.includes(key, index + 1));
    console.log('num of output styles', reformatedArray.length);
    return filteredArray;
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

const hasChildren = (node) => Boolean(node['children']);

const hasFillStyles = (node) => Boolean(node['fillStyleId']);

const hasEffects = (node) => Boolean(node['effectStyleId']);

const hasStrokeStyle = (node) => Boolean(node['strokeStyleId']);

let styles = [];
function getStylesFromNodes(nodes, styleTypes) {
    return __awaiter(this, void 0, void 0, function* () {
        styles = [];
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
        if (hasFillStyles(node) || hasStrokeStyle(node)) {
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
                //if node supports fills check for fill styles
                if (hasFillStyles(node)) {
                    if (node.fillStyleId != '') {
                        //get the style
                        let id = node.fillStyleId;
                        let style = figma.getStyleById(id);
                        //add style to the array
                        styles.push(style);
                    }
                }
                //if node supports strokes check for fill styles
                if (hasStrokeStyle(node)) {
                    if (node.strokeStyleId != '') {
                        //get the style
                        let id = node.strokeStyleId;
                        let style = figma.getStyleById(id);
                        //add style to the array
                        styles.push(style);
                    }
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

function resetThemer() {
    (() => __awaiter(this, void 0, void 0, function* () {
        try {
            yield figma.clientStorage.setAsync('apiSecret', '');
            yield figma.clientStorage.setAsync('apiURL', '');
        }
        catch (err) {
            figma.notify('There was an issue resetting your settings. Please try again.');
        }
    }))();
    figma.notify('Themer was successfully reset');
    //reinitialize themer
    figma.ui.postMessage({
        'type': 'reset'
    });
}

function saveCredentials(apiKey, apiURL) {
    (() => __awaiter(this, void 0, void 0, function* () {
        try {
            yield figma.clientStorage.setAsync('apiSecret', apiKey);
            yield figma.clientStorage.setAsync('apiURL', apiURL);
            console.log('binURL: ', apiURL);
        }
        catch (err) {
            figma.notify('There was an issue saving your settings. Please try again.');
        }
    }))();
    figma.notify('JSONBin setup successful. You can start creating themes now.');
}

//variables we will use to apply the right type of styles
let colorStyles = false;
let textStyles = false;
let effectStyles = false;
//imported styles
let allThemes = [];
let selectedThemeStyles = [];
let selectedTheme; //name of the theme we are applying
//collect the number of nodes affected
let count = {};
//collect the styles applied so we don't import them twice
const styles$1 = {};
//notifications
let notify;
function applyTheme(themeData, theme) {
    return __awaiter(this, void 0, void 0, function* () {
        //tell the user the theme is being applied
        notify = figma.notify('Applying ' + theme + ' theme...', { timeout: Infinity });
        //this is the theme the user selected to apply
        //normalizing in lowercase for comparison reasons
        selectedTheme = theme.toLowerCase();
        //all of the theme data which includes the keys, provided from the JSONbin
        allThemes = themeData;
        //filter all of the theme data down to just the styles associated with the selected theme
        selectedThemeStyles = themeData.filter(style => style.theme.toLowerCase() === selectedTheme);
        //get for selection
        let selection = figma.currentPage.selection;
        //check for selection
        //TODO: turn into guard 
        if (selection.length >= 1) {
            //identify which type of styles are present
            themeData.forEach(style => {
                if (style.type === 'PAINT') {
                    colorStyles = true;
                }
                if (style.type === 'TEXT') {
                    textStyles = true;
                }
                if (style.type === 'EFFECT') {
                    effectStyles = true;
                }
            });
            //now we iterate through every node in the selection
            const promises = selection.map(applyStyleToNode);
            yield Promise.all(promises);
            //filter out unique nodes so we don't count the same node twice
            //this is possible because the same node could have multiple styles applied to it
            let actualCount = Object.keys(count).length;
            //cancel the current notification
            notify.cancel();
            //Msg to user
            if (actualCount > 0) {
                figma.notify(selectedTheme + ' theme applied to ' + actualCount + ' layers');
            }
            else {
                figma.notify('No styles from your themes were found.');
            }
            count = {};
        }
        else {
            figma.notify('Please make a selection');
        }
    });
}
function applyStyleToNode(node) {
    var e_1, _a, e_2, _b;
    return __awaiter(this, void 0, void 0, function* () {
        //console.log('apply to node')
        //skip hidden nodes to improve performance
        if (!node.visible)
            return true;
        //FILL & STROKE STYLES
        if (colorStyles && hasFillStyles(node) && node.fillStyleId != '') {
            //if the node does not have a mixed property, match and apply paint style
            if (typeof (node.fillStyleId) != 'symbol') {
                //get the style currently applied to the node
                let originalStyle = figma.getStyleById(node.fillStyleId);
                //see if there is a matching style in the selected theme, apply it if there is
                let matchedStyle = returnMatchingStyle(originalStyle.name, 'PAINT');
                if (matchedStyle !== null) {
                    let styleId = styles$1[matchedStyle.key] || (yield figma.importStyleByKeyAsync(matchedStyle.key)).id;
                    styles$1[matchedStyle.key] = styleId;
                    node.fillStyleId = styleId;
                    count[node.id] = 1;
                }
                //for text nodes that have mixed color styles, match and apply paint style
            }
            else if (node.type === 'TEXT' && typeof (node.fillStyleId) === 'symbol') {
                //do this if there are multiple color styles in the same text box
                let uniqueTextColorStyles = node.getStyledTextSegments(['fillStyleId']);
                try {
                    for (var uniqueTextColorStyles_1 = __asyncValues(uniqueTextColorStyles), uniqueTextColorStyles_1_1; uniqueTextColorStyles_1_1 = yield uniqueTextColorStyles_1.next(), !uniqueTextColorStyles_1_1.done;) {
                        const fillStyle = uniqueTextColorStyles_1_1.value;
                        //get the style currently applied to the node
                        let originalStyle = figma.getStyleById(fillStyle.fillStyleId);
                        //apply style if there is a match in selected theme
                        let matchedStyle = returnMatchingStyle(originalStyle.name, 'PAINT');
                        if (matchedStyle !== null) {
                            let styleId = styles$1[matchedStyle.key] || (yield figma.importStyleByKeyAsync(matchedStyle.key)).id;
                            styles$1[matchedStyle.key] = styleId;
                            node.setRangeFillStyleId(fillStyle.start, fillStyle.end, styleId);
                            count[node.id] = 1;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (uniqueTextColorStyles_1_1 && !uniqueTextColorStyles_1_1.done && (_a = uniqueTextColorStyles_1.return)) yield _a.call(uniqueTextColorStyles_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        }
        //for nodes with strokes
        if (colorStyles && hasStrokeStyle(node) && node.strokeStyleId != '') {
            //get the style currently applied to the node
            let originalStyle = figma.getStyleById(node.strokeStyleId);
            //see if there is a matching style in the selected theme, apply it if there is
            let matchedStyle = returnMatchingStyle(originalStyle.name, 'PAINT');
            if (matchedStyle !== null) {
                let styleId = styles$1[matchedStyle.key] || (yield figma.importStyleByKeyAsync(matchedStyle.key)).id;
                styles$1[matchedStyle.key] = styleId;
                node.strokeStyleId = styleId;
                count[node.id] = 1;
            }
        }
        //TEXT STYLES
        if (textStyles && node.type === "TEXT") {
            //do this for text nodes with a single style applied
            if (node.textStyleId != '' && typeof (node.textStyleId) != 'symbol') {
                //get the currently applied text style
                let originalStyle = figma.getStyleById(node.textStyleId);
                //see if there is a matching style in the selected theme
                let matchedStyle = returnMatchingStyle(originalStyle.name, 'TEXT');
                if (matchedStyle !== null) {
                    let styleId = styles$1[matchedStyle.key] || (yield figma.importStyleByKeyAsync(matchedStyle.key)).id;
                    styles$1[matchedStyle.key] = styleId;
                    let style = figma.getStyleById(styleId);
                    //load the fonts for the new style
                    yield figma.loadFontAsync({
                        'family': style.fontName.family,
                        'style': style.fontName.style
                    });
                    node.textStyleId = styleId;
                    count[node.id] = 1;
                }
                //do this for text nodes that have multiple text styles
            }
            else if (typeof (node.textStyleId) === 'symbol') {
                //do this if there are multiple text styles in the same text box
                let uniqueTextStyles = node.getStyledTextSegments(['textStyleId']);
                try {
                    for (var uniqueTextStyles_1 = __asyncValues(uniqueTextStyles), uniqueTextStyles_1_1; uniqueTextStyles_1_1 = yield uniqueTextStyles_1.next(), !uniqueTextStyles_1_1.done;) {
                        const textStyle = uniqueTextStyles_1_1.value;
                        let originalStyle = figma.getStyleById(textStyle.textStyleId);
                        let matchedStyle = returnMatchingStyle(originalStyle.name, 'TEXT');
                        if (matchedStyle !== null) {
                            let styleId = styles$1[matchedStyle.key] || (yield figma.importStyleByKeyAsync(matchedStyle.key)).id;
                            styles$1[matchedStyle.key] = styleId;
                            let style = figma.getStyleById(styleId);
                            //load the fonts for the new style
                            yield figma.loadFontAsync({
                                'family': style.fontName.family,
                                'style': style.fontName.style
                            });
                            //apply the style to the correct range
                            node.setRangeTextStyleId(textStyle.start, textStyle.end, styleId);
                            count[node.id] = 1;
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (uniqueTextStyles_1_1 && !uniqueTextStyles_1_1.done && (_b = uniqueTextStyles_1.return)) yield _b.call(uniqueTextStyles_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
        //EFFECT STYLES
        if (effectStyles && hasEffects(node) && node.effectStyleId != '' && typeof (node.effectStyleId) != 'symbol') {
            //get currently applied effect style
            let originalStyle = figma.getStyleById(node.effectStyleId);
            //see if there is a matching style in the selected theme
            let matchedStyle = returnMatchingStyle(originalStyle.name, 'EFFECT');
            if (matchedStyle !== null) {
                let styleId = styles$1[matchedStyle.key] || (yield figma.importStyleByKeyAsync(matchedStyle.key)).id;
                styles$1[matchedStyle.key] = styleId;
                node.effectStyleId = styleId;
                count[node.id] = 1;
            }
        }
        //repeat the process for all children
        return hasChildren(node) ? Promise.all(node.children.map(applyStyleToNode)) : true;
    });
}
//HELPERS
//find a matching style in the selected theme
function returnMatchingStyle(name, type) {
    //console.log('looking for matching style');
    //make an array of all of the unique theme names, make sure they are all lower case
    let uniqueThemes = [...new Set(allThemes.map(item => item.theme.toLowerCase()))];
    //normalize style name for matching
    let normalizedCurrentStyleName = processStyleNameWithThemeNameIncluded(name.toLowerCase(), uniqueThemes);
    //match will default to null unless we find one
    let match = null;
    //console.log('selected theme styles: ', selectedThemeStyles)
    //iterate through all styles in all themes to find a match
    selectedThemeStyles.forEach(style => {
        let normalizedNewStyleName = processStyleNameWithThemeNameIncluded(style.name.toLowerCase(), uniqueThemes);
        //console.log('current style name:', normalizedCurrentStyleName)
        //console.log('new style name:', normalizedNewStyleName)
        if (normalizedNewStyleName === normalizedCurrentStyleName && style.type === type) {
            console.log('found a match!');
            match = style;
            return match;
        }
    });
    return match;
}
//this will check to see if the name of theme is present in the style name
//but it also checks to make sure that theme name is in the prefix of the style name
//if those conditions are met, strip the theme from the style name
//if not, return the full name
function processStyleNameWithThemeNameIncluded(name, uniqueThemes) {
    //console.log('processing! name')
    let newName;
    let splitName = name.toLowerCase().split('/');
    //console.log('split name:', splitName);
    // console.log('splitName[0]', splitName[0])
    //console.log(uniqueThemes.length);
    if (splitName.length >= 2) {
        for (const theme of uniqueThemes) {
            if (splitName[0].includes(theme.toLowerCase())) {
                //console.log('contains a theme name!');
                splitName.shift();
                //console.log('base name:', name)
                //console.log('shifted name:', splitName)
                newName = splitName.join('/').toString();
                break;
            }
        }
    }
    console.log('new name final:', newName ? newName : name);
    return newName ? newName : name;
}

//api credentials
var apiSecret;
var apiURL;
//recieves msgs from the UI
figma.ui.onmessage = msg => {
    switch (msg.type) {
        //apply theme to selection
        case 'applyTheme':
            applyTheme(msg.themeData, msg.theme);
            break;
        //when the UI needs Figma to gather data to create a new theme, this function is executed
        case 'createTheme':
            getStyleData(msg.styleTypes, msg.styleSource);
            break;
        //take msgs from the UI and show them to the user
        case 'notify':
            figma.notify(msg.message);
            break;
        //when the UI needs Figma to gather data to create a new theme, this function is executed
        case 'saveCredentials':
            console.log('save cred: ', msg.apiKey, msg.binURL);
            saveCredentials(msg.apiKey, msg.binURL);
            break;
        //resets api key data storred in client storage
        case 'reset':
            resetThemer();
            break;
    }
};
// show the UI
figma.showUI(__html__, { themeColors: true, width: 240, height: 312 });
//INITIALIZE PLUGIN
//Check to see if credentials exist in client storage
//we check to see if there is an API key for jsonbin and also a url to the bin
//run on plugin initilization
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        apiURL = yield figma.clientStorage.getAsync('apiURL');
        apiSecret = yield figma.clientStorage.getAsync('apiSecret');
        if (apiURL && apiSecret) {
            //migration to new urls with jsonbin v3
            if (!apiURL.includes('https://api.jsonbin.io/v3/b')) {
                console.log('before:', apiURL);
                apiURL = apiURL.replace("https://api.jsonbin.io/b", "https://api.jsonbin.io/v3/b");
                console.log('old json bin url, migrating to v3');
                console.log('after:', apiURL);
                //save the data back to client storage
                try {
                    yield figma.clientStorage.setAsync('apiURL', apiURL);
                }
                catch (err) {
                    figma.notify('There was an error migrating JSONbin to v3');
                }
            }
            //send a message to the UI with the credentials storred in the client
            figma.ui.postMessage({
                'type': 'apiCredentials',
                'status': true,
                'binURL': apiURL,
                'apiKey': apiSecret
            });
        }
        else {
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
