// VARS
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var _this = this;
// API credentials
var apiSecret;
var apiURL;
// THEME DATA VARS
// this is the latest data from JSON Bin,
// we will append this to the cleaned data
var jsonBinData = [];
// this is all of the raw styles data we collect when creating a new theme
// it may contain duplicates, and themes using prefixed names have not been split up
var collectedStyleData = [];
// clean data, this is an array of all of the processed new data
var cleanedStyleData = [];
// this is the assembled clean data that is ready 
// to be sent back to the UI to push to JSON bin
var newJsonBinData = [];
// settings
var usePrefixes;
var newThemeName;
var newThemeCount = 0;
var existingThemeCount;
//vars for applying
var selectedTheme;
// show the UI
figma.showUI(__html__, { width: 240, height: 312 });
//INITIALIZE PLUGIN
//Check to see if credentials exist in client storage
//run on plugin initilization
(function () { return __awaiter(_this, void 0, void 0, function () {
    var err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, figma.clientStorage.getAsync('apiURL')];
            case 1:
                apiURL = _a.sent();
                return [4 /*yield*/, figma.clientStorage.getAsync('apiSecret')];
            case 2:
                apiSecret = _a.sent();
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
                    //send a message to the UI that says there are no credentials storred in the client
                    figma.ui.postMessage({
                        'type': 'apiCredentials',
                        'status': false
                    });
                }
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                figma.closePlugin('There was an error.');
                return [2 /*return*/];
            case 4: return [2 /*return*/];
        }
    });
}); })();
//MESSAGING TO PLUGIN UI
figma.ui.onmessage = function (msg) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (msg.type) {
            case 'notify':
                figma.notify(msg.msg, { timeout: 1500 });
                break;
            case 'initialThemerData':
                updateCredentials(msg.secret, msg.url);
                figma.notify(msg.msg, { timeout: 1000 });
                break;
            case 'applyTheme':
                selectedTheme = msg.themeName;
                applyTheme(msg.applyTo);
                break;
            case 'createTheme':
                updatedDataFromAPI(msg.apiData);
                createTheme(msg);
                break;
            case 'deleteTheme':
                updatedDataFromAPI(msg.themeData);
                figma.notify(msg.msg, { timeout: 1000 });
                break;
            case 'updateThemes':
                updatedDataFromAPI(msg.themeData);
                break;
            case 'reset':
                resetThemer();
                break;
        }
        return [2 /*return*/];
    });
}); };
//RESET THEMER
function resetThemer() {
    var _this = this;
    (function () { return __awaiter(_this, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, figma.clientStorage.setAsync('apiSecret', '')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, figma.clientStorage.setAsync('apiURL', '')];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    figma.notify('There was an issue saving your credentials. Please try again.');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); })();
    figma.notify('Themer reset successfully');
}
// CREATE THEMES
function createTheme(data) {
    // set prefixes setting
    if (data.usePrefixes === true) {
        usePrefixes = true;
    }
    else {
        usePrefixes = false;
    }
    //determine name
    if (data.themeName) {
        newThemeName = data.themeName;
    }
    clearStyleData();
    // use the correct method to collect styles
    // based on user selection
    switch (data.source) {
        case 'local':
            //get styles
            if (data.colorStyles) {
                getLocalStyles('color');
            }
            if (data.textStyles) {
                getLocalStyles('text');
            }
            if (data.effectStyles) {
                getLocalStyles('effect');
            }
            break;
        case 'selection':
            // get styles from selection
            var selection = Array.from(figma.currentPage.selection);
            if (selection) {
                //get styles
                if (data.colorStyles) {
                    selection.forEach(function (node) {
                        collectColorStyles(node);
                    });
                }
                if (data.textStyles) {
                    selection.forEach(function (node) {
                        collectTextStyles(node);
                    });
                }
                if (data.effectStyles) {
                    selection.forEach(function (node) {
                        collectEffectStyles(node);
                    });
                }
            }
            else {
                figma.notify('Please make a selection');
            }
            break;
        case 'page':
            //get nodes from entire page
            var pageNodes = Array.from(figma.currentPage.children);
            if (pageNodes) {
                //get styles
                if (data.colorStyles) {
                    pageNodes.forEach(function (node) {
                        collectColorStyles(node);
                    });
                }
                if (data.textStyles) {
                    pageNodes.forEach(function (node) {
                        collectTextStyles(node);
                    });
                }
                if (data.effectStyles) {
                    pageNodes.forEach(function (node) {
                        collectEffectStyles(node);
                    });
                }
            }
            else {
                figma.notify('There is nothing on this page');
            }
            break;
    }
    // merge with existing data
    mergeNewThemesWithExisting();
    // count number of themes being added
    // in most cases it will be 1
    // unless the user is creating multiple themes at once
    // by splitting them at prefixes
    countNewThemes();
    // send data back to UI to post to JSON bin
    sendNewThemeDataToUI();
}
//collect styles from local styles
function getLocalStyles(type) {
    if (type === 'color') {
        var colorStyles = figma.getLocalPaintStyles();
        if (colorStyles) {
            colorStyles.forEach(function (color) {
                var style = {
                    'name': color.name,
                    'key': color.key,
                    'theme': themeName(color.name),
                    'type': 'PAINT'
                };
                if (style.name && style.key && style.theme && style.type) {
                    collectedStyleData.push(style);
                }
                else {
                    figma.notify('Error adding theme');
                    throw new Error("Error adding theme");
                }
            });
        }
        else {
            figma.notify('There are no color styles in the document');
        }
    }
    else if (type === 'text') {
        var textStyles = figma.getLocalTextStyles();
        if (textStyles) {
            textStyles.forEach(function (text) {
                var style = {
                    'name': text.name,
                    'key': text.key,
                    'theme': themeName(text.name),
                    'type': 'TEXT'
                };
                if (style.name && style.key && style.theme && style.type) {
                    collectedStyleData.push(style);
                }
                else {
                    figma.notify('Error adding theme');
                    throw new Error("Error adding theme");
                }
            });
        }
        else {
            figma.notify('There are no text styles in the document');
        }
    }
    else if (type === 'effect') {
        var effectStyles = figma.getLocalEffectStyles();
        if (effectStyles) {
            effectStyles.forEach(function (effect) {
                var style = {
                    'name': effect.name,
                    'key': effect.key,
                    'theme': themeName(effect.name),
                    'type': 'EFFECT'
                };
                if (style.name && style.key && style.theme && style.type) {
                    collectedStyleData.push(style);
                }
                else {
                    figma.notify('Error adding theme');
                    throw new Error("Error adding theme");
                }
            });
        }
        else {
            figma.notify('There are no effect styles in the document');
        }
    }
}
// grab color styles
function collectColorStyles(node) {
    // check for children on note, if they exist, run them through this function
    // this will help us walk the tree to the bottom most level
    if (node.children) {
        node.children.forEach(function (child) {
            collectColorStyles(child);
        });
    }
    //here is where we grab all of the styles if they exist on the node
    if (node.type === 'COMPONENT' || 'INSTANCE' || 'FRAME' || 'GROUP') {
        if (node.backgroundStyleId) {
            var objectStyle = figma.getStyleById(node.backgroundStyleId);
            // key will only be available for remote styles
            if (objectStyle.key) {
                var style = {
                    'name': objectStyle.name,
                    'key': objectStyle.key,
                    'theme': themeName(objectStyle.name),
                    'type': 'PAINT'
                };
                if (style.name && style.key && style.theme && style.type) {
                    collectedStyleData.push(style);
                }
                else {
                    figma.notify('Error adding theme');
                    throw new Error("Error adding theme");
                }
            }
        }
    }
    if (node.type === 'RECTANGLE' || 'POLYGON' || 'ELLIPSE' || 'STAR' || 'TEXT' || 'VECTOR' || 'BOOLEAN_OPERATION' || 'LINE') {
        if (node.fillStyleId) {
            var objectStyle = figma.getStyleById(node.fillStyleId);
            // key will only be available for remote styles
            if (objectStyle.key) {
                var style = {
                    'name': objectStyle.name,
                    'key': objectStyle.key,
                    'theme': themeName(objectStyle.name),
                    'type': 'PAINT'
                };
                if (style.name && style.key && style.theme && style.type) {
                    collectedStyleData.push(style);
                }
                else {
                    figma.notify('Error adding theme');
                    throw new Error("Error adding theme");
                }
            }
        }
        if (node.strokeStyleId) {
            var objectStyle = figma.getStyleById(node.strokeStyleId);
            // key will only be available for remote styles
            if (objectStyle.key) {
                var style = {
                    'name': objectStyle.name,
                    'key': objectStyle.key,
                    'theme': themeName(objectStyle.name),
                    'type': 'PAINT'
                };
                if (style.name && style.key && style.theme && style.type) {
                    collectedStyleData.push(style);
                }
                else {
                    figma.notify('Error adding theme');
                    return;
                }
            }
        }
    }
}
// grab text styles
function collectTextStyles(node) {
    // check for children on note, if they exist, run them through this function
    // this will help us walk the tree to the bottom most level
    if (node.children) {
        node.children.forEach(function (child) {
            collectTextStyles(child);
        });
    }
    if (node.type === 'TEXT' && node.textStyleId != 'MIXED' && node.textStyleId) {
        var objectStyle = figma.getStyleById(node.textStyleId);
        // key will only be available for remote styles
        if (objectStyle.key) {
            var style = {
                'name': objectStyle.name,
                'key': objectStyle.key,
                'theme': themeName(objectStyle.name),
                'type': 'TEXT'
            };
            if (style.name && style.key && style.theme && style.type) {
                collectedStyleData.push(style);
            }
            else {
                figma.notify('Error adding theme');
                throw new Error("Error adding theme");
            }
        }
    }
}
// grab effect styles
function collectEffectStyles(node) {
    if (node.children) {
        node.children.forEach(function (child) {
            collectEffectStyles(child);
        });
    }
    if (node.effectStyleId) {
        var objectStyle = figma.getStyleById(node.effectStyleId);
        // key will only be available for remote styles
        if (objectStyle.key) {
            var style = {
                'name': objectStyle.name,
                'key': objectStyle.key,
                'theme': themeName(objectStyle.name),
                'type': 'TEXT'
            };
            if (style.name && style.key && style.theme && style.type) {
                collectedStyleData.push(style);
            }
            else {
                figma.notify('Error adding theme');
                throw new Error("Error adding theme");
            }
        }
    }
}
// data passback to UI for posting to JSON Bin
function sendNewThemeDataToUI() {
    if (cleanedStyleData) {
        figma.ui.postMessage({
            'type': 'addNewTheme',
            'themeCount': newThemeCount,
            'themeData': JSON.stringify(newJsonBinData)
        });
    }
    else {
        figma.notify('There are no styles to create a theme from');
        return;
    }
}
// get theme name
function themeName(name) {
    if (usePrefixes) {
        if (name.includes('/')) {
            var prefix = name.split('/');
            return prefix[0];
        }
        else {
            figma.notify('Styles names must be prefixed. Ex: themeName/colorName');
        }
    }
    else {
        return newThemeName;
    }
}
// count number of themes being added
function countNewThemes() {
    var themes = __spread(new Set(cleanedStyleData.map(function (style) { return style.theme; })));
    newThemeCount = themes.length;
}
// clean existing data from style creation process to make sure arrays are empty
function clearStyleData() {
    collectedStyleData = [];
    cleanedStyleData = [];
    newJsonBinData = [];
}
// merge theme data
// this function will merge the collected data 
// with the existing theme data
function mergeNewThemesWithExisting() {
    cleanedStyleData = removeDuplicatesBy(function (style) { return style.key; }, collectedStyleData);
    if (cleanedStyleData) {
        if (existingThemeCount === 0) {
            cleanedStyleData.forEach(function (style) {
                newJsonBinData.push(style);
            });
        }
        else {
            jsonBinData.forEach(function (style) {
                newJsonBinData.push(style);
            });
            cleanedStyleData.forEach(function (style) {
                newJsonBinData.push(style);
            });
        }
    }
    else {
        figma.notify('Something went wrong while processing your theme data');
    }
}
// APPLY THEME
function applyTheme(applyTo) {
    var nodes;
    if (applyTo === 'selection') {
        if (figma.currentPage.selection) {
            nodes = figma.currentPage.selection;
        }
        else {
            figma.notify('Please make a selection');
        }
    }
    else {
        if (figma.currentPage.children) {
            nodes = figma.currentPage.children;
        }
        else {
            figma.notify('Please make a selection');
        }
    }
    if (nodes) {
        figma.notify('Applying theme...', { timeout: 1000 });
        var colorStyles = __spread(new Set(jsonBinData.map(function (style) { return style.theme === selectedTheme && style.type === 'PAINT'; })));
        var textStyles = __spread(new Set(jsonBinData.map(function (style) { return style.theme === selectedTheme && style.type === 'TEXT'; })));
        var effectStyles = __spread(new Set(jsonBinData.map(function (style) { return style.theme === selectedTheme && style.type === 'EFFECT'; })));
        //if the theme contains color styles
        //iterate through all nodes to find color styles that match
        if (colorStyles) {
            nodes.forEach(function (node) {
                applyColor(node);
            });
        }
        //if the theme contains text styles
        //iterate through all nodes to find text styles that match
        if (textStyles) {
            nodes.forEach(function (node) {
                applyText(node);
            });
        }
        //if the theme contains effect styles
        //iterate through all nodes to find effect styles that match
        if (effectStyles) {
            nodes.forEach(function (node) {
                applyEffect(node);
            });
        }
    }
    else {
        figma.notify('There is nothing to apply styles to');
    }
}
// this function will loop through every node and apply a matching color style if found
// it will ignore any layer without a fill, background, or stroke style applied
function applyColor(node) {
    //iterate through children if the node has them
    if (node.children) {
        node.children.forEach(function (child) {
            applyColor(child);
        });
    }
    //handle background fills
    if (node.type === 'COMPONENT' || 'INSTANCE' || 'FRAME' || 'GROUP') {
        if (node.backgroundStyleId) {
            (function () {
                return __awaiter(this, void 0, void 0, function () {
                    var style, newStyleKey, newStyle;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                style = figma.getStyleById(node.backgroundStyleId);
                                if (!style.key) return [3 /*break*/, 2];
                                newStyleKey = findMatchInSelectedTheme(style.key);
                                if (!newStyleKey) return [3 /*break*/, 2];
                                return [4 /*yield*/, figma.importStyleByKeyAsync(newStyleKey)];
                            case 1:
                                newStyle = _a.sent();
                                if (newStyle) {
                                    node.backgroundStyleId = newStyle.id;
                                }
                                _a.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                });
            })();
        }
    }
    //handle fills + strokes
    if (node.type === 'RECTANGLE' || 'POLYGON' || 'ELLIPSE' || 'STAR' || 'TEXT' || 'VECTOR' || 'BOOLEAN_OPERATION' || 'LINE') {
        //fills
        if (node.fillStyleId) {
            (function () {
                return __awaiter(this, void 0, void 0, function () {
                    var style, newStyleKey, newStyle;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                style = figma.getStyleById(node.fillStyleId);
                                if (!style.key) return [3 /*break*/, 2];
                                newStyleKey = findMatchInSelectedTheme(style.key);
                                if (!newStyleKey) return [3 /*break*/, 2];
                                return [4 /*yield*/, figma.importStyleByKeyAsync(newStyleKey)];
                            case 1:
                                newStyle = _a.sent();
                                if (newStyle) {
                                    node.fillStyleId = newStyle.id;
                                }
                                _a.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                });
            })();
        }
        //strokes
        if (node.strokeStyleId) {
            (function () {
                return __awaiter(this, void 0, void 0, function () {
                    var style, newStyleKey, newStyle;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                style = figma.getStyleById(node.strokeStyleId);
                                if (!style.key) return [3 /*break*/, 2];
                                newStyleKey = findMatchInSelectedTheme(style.key);
                                if (!newStyleKey) return [3 /*break*/, 2];
                                return [4 /*yield*/, figma.importStyleByKeyAsync(newStyleKey)];
                            case 1:
                                newStyle = _a.sent();
                                if (newStyle) {
                                    node.strokeStyleId = newStyle.id;
                                }
                                _a.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                });
            })();
        }
    }
}
//apply text styles
function applyText(node) {
    //iterate through children if the node has them
    if (node.children) {
        node.children.forEach(function (child) {
            applyText(child);
        });
    }
    // apply text styles
    if (node.type === 'TEXT') {
        if (node.textStyleId) {
            if (typeof node.textStyleId !== 'symbol') {
                (function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var style, newStyleKey, newStyle, fontFamily, fontStyle;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    style = figma.getStyleById(node.textStyleId);
                                    if (!style.key) return [3 /*break*/, 3];
                                    newStyleKey = findMatchInSelectedTheme(style.key);
                                    if (!newStyleKey) return [3 /*break*/, 3];
                                    return [4 /*yield*/, figma.importStyleByKeyAsync(newStyleKey)];
                                case 1:
                                    newStyle = _a.sent();
                                    fontFamily = newStyle.fontName.family;
                                    fontStyle = newStyle.fontName.style;
                                    return [4 /*yield*/, figma.loadFontAsync({
                                            'family': fontFamily,
                                            'style': fontStyle
                                        })];
                                case 2:
                                    _a.sent();
                                    if (newStyle) {
                                        node.textStyleId = newStyle.id;
                                    }
                                    _a.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                })();
            }
            else {
                figma.notify('Note: Themer currently skips text objects with multiple text styles applied.');
            }
        }
    }
}
//apply effect styles
function applyEffect(node) {
    //iterate through children if the node has them
    if (node.children) {
        node.children.forEach(function (child) {
            applyEffect(child);
        });
    }
    //apply effects
    if (node.type === 'COMPONENT' || 'INSTANCE' || 'FRAME' || 'GROUP' || 'RECTANGLE' || 'POLYGON' || 'ELLIPSE' || 'STAR' || 'TEXT' || 'VECTOR' || 'BOOLEAN_OPERATION' || 'LINE') {
        if (node.effectStyleId) {
            (function () {
                return __awaiter(this, void 0, void 0, function () {
                    var style, newStyleKey, newStyle;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                style = figma.getStyleById(node.effectStyleId);
                                if (!style.key) return [3 /*break*/, 2];
                                newStyleKey = findMatchInSelectedTheme(style.key);
                                if (!newStyleKey) return [3 /*break*/, 2];
                                return [4 /*yield*/, figma.importStyleByKeyAsync(newStyleKey)];
                            case 1:
                                newStyle = _a.sent();
                                if (newStyle) {
                                    node.effectStyleId = newStyle.id;
                                }
                                _a.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                });
            })();
        }
    }
}
// HELPER FUNCTIONS
//find matching styles based
function findMatchInSelectedTheme(styleKey) {
    // this gets item in the array which matches the current style applied
    var currentStyle = jsonBinData.find(function (style) { return style.key === styleKey; });
    // if we find a matching style execute this
    if (currentStyle) {
        //this gets the name of the current style
        //we need the name of the current style so we can search the jsonbin array
        //for matches with the selected theme
        var name_1 = currentStyle.name;
        console.log('selected theme', selectedTheme);
        var matchedStyle = jsonBinData.find(function (style) { return style.name === name_1 && style.theme === selectedTheme; });
        console.log(matchedStyle);
        if (matchedStyle) {
            //if we find a match in the selected theme, we will return the style key
            // so that we can import the style into the doc
            return matchedStyle.key;
        }
    }
}
// populate latest data from API
function updatedDataFromAPI(data) {
    clearStyleData();
    //this passes the data sent from API -> UI -> jsonBinData var
    jsonBinData = JSON.parse(data);
    // here we want to see if there is at least one existing theme
    // if there is, we will append subsequent themes to the data
    // if its the first theme, we want to overwrite the same content
    // that was required to to create an empty bin
    console.log(jsonBinData);
    if (jsonBinData[0].theme === undefined) {
        existingThemeCount = 0;
    }
}
// update credentials
function updateCredentials(secret, url) {
    var _this = this;
    (function () { return __awaiter(_this, void 0, void 0, function () {
        var err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, figma.clientStorage.setAsync('apiSecret', secret)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, figma.clientStorage.setAsync('apiURL', url)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    figma.notify('There was an issue saving your credentials. Please try again.');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); })();
}
//remove styles with duplicate keys from themes
function removeDuplicatesBy(keyFn, array) {
    var mySet = new Set();
    return array.filter(function (x) {
        var key = keyFn(x), isNew = !mySet.has(key);
        if (isNew)
            mySet.add(key);
        return isNew;
    });
}
