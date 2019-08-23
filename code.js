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
var _this = this;
//show the plugin UI
figma.showUI(__html__, { width: 480, height: 540 });
//VARIABLES ////////
// API credentials
var apiSecret = '';
var apiURL = '';
//initial API Data
var apiThemeData;
//theme data from canvas
var canvasThemeData;
//all theme data (used for creating)
var themeName = '';
//array to combine all data
var combinedThemeData = [];
//array for final combed data
var finalData;
//track if clear existing data is true
var clearData;
//INITIALIZE PLUGIN
//Check to see if client data exists first
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
                    //send a message to the UI to say api credntials exist
                    figma.ui.postMessage({
                        'type': 'apiCredentials',
                        'status': true,
                        'url': apiURL,
                        'secret': apiSecret
                    });
                    figma.ui.resize(480, 330);
                }
                else {
                    //send a message to the UI to say no credentials
                    figma.ui.postMessage({
                        'type': 'apiCredentials',
                        'status': false
                    });
                }
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                console.log('there was an error');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); })();
//Messages from Plugin UI
figma.ui.onmessage = function (msg) { return __awaiter(_this, void 0, void 0, function () {
    var _this = this;
    return __generator(this, function (_a) {
        //initialize plugin
        if (msg.type == 'initData') {
            //set client storage
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var err_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, figma.clientStorage.setAsync('apiSecret', msg.secret)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, figma.clientStorage.setAsync('apiURL', msg.url)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            err_2 = _a.sent();
                            console.log('could not find in clientStorage');
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); })();
            //set the initial data
            apiThemeData = Array.from(JSON.parse(msg.apidata));
            console.log('api theme data:', apiThemeData);
            figma.ui.resize(480, 360);
        }
        //create themes
        if (msg.type == 'createTheme') {
            createTheme(msg);
        }
        //apply themes
        if (msg.type == 'applyTheme') {
            applyTheme(msg);
        }
        return [2 /*return*/];
    });
}); };
//FUNCTIONS //////////
//APPLY THEMES
function applyTheme(msg) {
    var scope;
    var themeName = msg.themeName;
    var colorStyles = msg.colorStyles;
    var textStyles = msg.textStyles;
    var effectStyles = msg.effectStyles;
    //scope of data
    if (msg.applyScope == 'doc') {
        scope = figma.root;
    }
    else {
        scope = figma.currentPage;
    }
    //color styles
    if (colorStyles) {
        var nodes_1 = scope.findAll(function (f) { return f.fillStyleId != '' && f.type != 'FRAME' && f.type != 'COMPONENT' && f.type != 'GROUP' && f.type != 'PAGE' && f.type != 'INSTANCE'; });
        var bgNodes_1 = scope.findAll(function (f) { return f.backgroundStyleId != '' && f.type === 'FRAME' || f.type === 'COMPONENT' || f.type != 'GROUP' && f.type != 'PAGE' && f.type != 'INSTANCE'; });
        var strokeNodes_1 = scope.findAll(function (f) { return f.strokeStyleId != '' && f.type === 'FRAME' || f.type === 'COMPONENT' || f.type != 'GROUP' && f.type != 'PAGE' && f.type != 'INSTANCE'; });
        (function () {
            return __awaiter(this, void 0, void 0, function () {
                var nodesLength, _loop_1, i, bgNodesLength, _loop_2, i, strokeNodesLength, _loop_3, i;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            nodesLength = nodes_1.length;
                            _loop_1 = function (i) {
                                var styleID, styleName, matchedKey, libraryStyle;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            styleID = nodes_1[i].fillStyleId;
                                            if (figma.getStyleById(styleID) === null) {
                                                return [2 /*return*/, "continue"];
                                            }
                                            else {
                                                styleName = figma.getStyleById(styleID).name;
                                            }
                                            matchedKey = apiThemeData.filter(function (x) { return x.name === styleName && x.theme === themeName; }).map(function (x) { return x; });
                                            if (!(matchedKey.length !== 0)) return [3 /*break*/, 2];
                                            return [4 /*yield*/, figma.importStyleByKeyAsync(matchedKey[0].key)];
                                        case 1:
                                            libraryStyle = _a.sent();
                                            nodes_1[i].fillStyleId = libraryStyle.id;
                                            _a.label = 2;
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            };
                            i = 0;
                            _a.label = 1;
                        case 1:
                            if (!(i < nodesLength)) return [3 /*break*/, 4];
                            return [5 /*yield**/, _loop_1(i)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            i++;
                            return [3 /*break*/, 1];
                        case 4:
                            bgNodesLength = bgNodes_1.length;
                            _loop_2 = function (i) {
                                var styleID, styleName, matchedKey, libraryStyle;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            styleID = bgNodes_1[i].backgroundStyleId;
                                            if (figma.getStyleById(styleID) === null) {
                                                return [2 /*return*/, "continue"];
                                            }
                                            else {
                                                styleName = figma.getStyleById(styleID).name;
                                            }
                                            matchedKey = apiThemeData.filter(function (x) { return x.name === styleName && x.theme === themeName; }).map(function (x) { return x; });
                                            if (!(matchedKey.length !== 0)) return [3 /*break*/, 2];
                                            return [4 /*yield*/, figma.importStyleByKeyAsync(matchedKey[0].key)];
                                        case 1:
                                            libraryStyle = _a.sent();
                                            bgNodes_1[i].backgroundStyleId = libraryStyle.id;
                                            _a.label = 2;
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            };
                            i = 0;
                            _a.label = 5;
                        case 5:
                            if (!(i < bgNodesLength)) return [3 /*break*/, 8];
                            return [5 /*yield**/, _loop_2(i)];
                        case 6:
                            _a.sent();
                            _a.label = 7;
                        case 7:
                            i++;
                            return [3 /*break*/, 5];
                        case 8:
                            strokeNodesLength = strokeNodes_1.length;
                            _loop_3 = function (i) {
                                var styleID, styleName, matchedKey, libraryStyle;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            styleID = strokeNodes_1[i].strokeStyleId;
                                            if (figma.getStyleById(styleID) === null) {
                                                return [2 /*return*/, "continue"];
                                            }
                                            else {
                                                styleName = figma.getStyleById(styleID).name;
                                            }
                                            matchedKey = apiThemeData.filter(function (x) { return x.name === styleName && x.theme === themeName; }).map(function (x) { return x; });
                                            if (!(matchedKey.length !== 0)) return [3 /*break*/, 2];
                                            return [4 /*yield*/, figma.importStyleByKeyAsync(matchedKey[0].key)];
                                        case 1:
                                            libraryStyle = _a.sent();
                                            strokeNodes_1[i].strokeStyleId = libraryStyle.id;
                                            _a.label = 2;
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            };
                            i = 0;
                            _a.label = 9;
                        case 9:
                            if (!(i < strokeNodesLength)) return [3 /*break*/, 12];
                            return [5 /*yield**/, _loop_3(i)];
                        case 10:
                            _a.sent();
                            _a.label = 11;
                        case 11:
                            i++;
                            return [3 /*break*/, 9];
                        case 12: return [2 /*return*/];
                    }
                });
            });
        })();
    }
    if (textStyles) {
        var textNodes_1 = scope.findAll(function (f) { return f.textStyleId != '' && f.type === 'TEXT'; });
        (function () {
            return __awaiter(this, void 0, void 0, function () {
                var textNodesLength, _loop_4, i;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            textNodesLength = textNodes_1.length;
                            _loop_4 = function (i) {
                                var styleID, styleName, style, fontFamily, fontStyle, matchedKey, libraryStyle, fontFamily, fontStyle;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (typeof textNodes_1[i].textStyleId === 'symbol') {
                                                return [2 /*return*/, "continue"];
                                            }
                                            styleID = textNodes_1[i].textStyleId;
                                            if (!(figma.getStyleById(styleID) === null)) return [3 /*break*/, 1];
                                            return [2 /*return*/, "continue"];
                                        case 1:
                                            style = figma.getStyleById(styleID);
                                            fontFamily = style.fontName.family;
                                            fontStyle = style.fontName.style;
                                            // import font if unloaded
                                            return [4 /*yield*/, figma.loadFontAsync({
                                                    'family': fontFamily,
                                                    'style': fontStyle
                                                })];
                                        case 2:
                                            // import font if unloaded
                                            _a.sent();
                                            styleName = style.name;
                                            _a.label = 3;
                                        case 3:
                                            matchedKey = apiThemeData.filter(function (x) { return x.name === styleName && x.theme === themeName; }).map(function (x) { return x; });
                                            if (!(matchedKey.length !== 0)) return [3 /*break*/, 6];
                                            return [4 /*yield*/, figma.importStyleByKeyAsync(matchedKey[0].key)];
                                        case 4:
                                            libraryStyle = _a.sent();
                                            fontFamily = libraryStyle.fontName.family;
                                            fontStyle = libraryStyle.fontName.style;
                                            return [4 /*yield*/, figma.loadFontAsync({
                                                    'family': fontFamily,
                                                    'style': fontStyle
                                                })];
                                        case 5:
                                            _a.sent();
                                            textNodes_1[i].textStyleId = libraryStyle.id;
                                            _a.label = 6;
                                        case 6: return [2 /*return*/];
                                    }
                                });
                            };
                            i = 0;
                            _a.label = 1;
                        case 1:
                            if (!(i < textNodesLength)) return [3 /*break*/, 4];
                            return [5 /*yield**/, _loop_4(i)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        })();
    }
    if (effectStyles) {
        var effectNodes_1 = scope.findAll(function (f) { return f.effectStyleId != '' && f.type != 'PAGE'; });
        (function () {
            return __awaiter(this, void 0, void 0, function () {
                var effectStylesLength, _loop_5, i;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            effectStylesLength = effectNodes_1.length;
                            _loop_5 = function (i) {
                                var styleID, styleName, matchedKey, libraryStyle;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            styleID = effectNodes_1[i].effectStyleId;
                                            if (figma.getStyleById(styleID) === null) {
                                                return [2 /*return*/, "continue"];
                                            }
                                            else {
                                                styleName = figma.getStyleById(styleID).name;
                                            }
                                            matchedKey = apiThemeData.filter(function (x) { return x.name === styleName && x.theme === themeName; }).map(function (x) { return x; });
                                            if (!(matchedKey.length !== 0)) return [3 /*break*/, 2];
                                            return [4 /*yield*/, figma.importStyleByKeyAsync(matchedKey[0].key)];
                                        case 1:
                                            libraryStyle = _a.sent();
                                            effectNodes_1[i].effectStyleId = libraryStyle.id;
                                            _a.label = 2;
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            };
                            i = 0;
                            _a.label = 1;
                        case 1:
                            if (!(i < effectStylesLength)) return [3 /*break*/, 4];
                            return [5 /*yield**/, _loop_5(i)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        })();
    }
    //send all the cleaned data back to the UI to be posted to the API
    figma.ui.postMessage({
        'type': 'applyingThemeComplete'
    });
}
//function to create new theme
function createTheme(msg) {
    canvasThemeData = [];
    //Vaiables
    themeName = msg.themeName;
    clearData = msg.clearData;
    var scope;
    var effects = msg.effects;
    var colorStyles = msg.colorStyles;
    var textStyles = msg.textStyles;
    //scope of data
    if (msg.scope == 'doc') {
        scope = figma.root;
    }
    else {
        scope = figma.currentPage;
    }
    //get all the data from the canvas
    getDataFromCanvas(scope, effects, colorStyles, textStyles);
}
//get data from canvas
function getDataFromCanvas(scope, effects, colorStyles, textStyles) {
    //Color Styles
    if (colorStyles) {
        //find all unique fill styles
        var fillStyleData = scope.findAll(function (f) { return f.fillStyleId != '' && f.type != 'FRAME' && f.type != 'COMPONENT' && f.type != 'GROUP' && f.type != 'PAGE' && f.type != 'INSTANCE'; });
        var fillStyleDataLength = fillStyleData.length;
        for (var i = 0; i < fillStyleDataLength; i++) {
            if (typeof fillStyleData[i].fillStyleId != 'symbol') {
                var styleId = fillStyleData[i].fillStyleId;
                var styleName = figma.getStyleById(styleId).name;
                var styleKey = figma.getStyleById(styleId).key;
                //assemble into array
                var style = {
                    theme: themeName,
                    name: styleName,
                    key: styleKey,
                    type: 'PAINT'
                };
                //push item item into array
                canvasThemeData.push(style);
                //console.log(style);
            }
            else {
                continue;
            }
        }
        //find all unique stroke styles
        var strokeStyleData = scope.findAll(function (s) { return s.strokeStyleId != '' && s.type != 'FRAME' && s.type != 'COMPONENT' && s.type != 'GROUP' && s.type != 'PAGE' && s.type != 'INSTANCE'; });
        var strokeStyleDataLength = strokeStyleData.length;
        for (var i = 0; i < strokeStyleDataLength; i++) {
            if (typeof fillStyleData[i].fillStyleId != 'symbol') {
                var styleId = fillStyleData[i].fillStyleId;
                var styleName = figma.getStyleById(styleId).name;
                var styleKey = figma.getStyleById(styleId).key;
                //assemble into array
                var style = {
                    theme: themeName,
                    name: styleName,
                    key: styleKey,
                    type: 'PAINT'
                };
                //push item item into array
                canvasThemeData.push(style);
            }
            else {
                continue;
            }
        }
    }
    //find unique text styles
    if (textStyles) {
        //find all unique stroke styles
        var textStyleData = scope.findAll(function (s) { return s.textStyleId != '' && s.type === 'TEXT'; });
        var textStyleDataLength = textStyleData.length;
        for (var i = 0; i < textStyleDataLength; i++) {
            //console.log(textStyleData[i]);
            if (typeof textStyleData[i].textStyleId != 'symbol') {
                var styleId = textStyleData[i].textStyleId;
                var styleName = figma.getStyleById(styleId).name;
                var styleKey = figma.getStyleById(styleId).key;
                //assemble into array
                var style = {
                    theme: themeName,
                    name: styleName,
                    key: styleKey,
                    type: 'TEXT'
                };
                //push item item into array
                canvasThemeData.push(style);
            }
            else {
                continue;
            }
        }
    }
    //find unique text styles
    if (effects) {
        //find all unique stroke styles
        var effectStyleData = scope.findAll(function (s) { return s.effectStyleId != '' && s.type != 'PAGE'; });
        var effectStyleDataLength = effectStyleData.length;
        for (var i = 0; i < effectStyleDataLength; i++) {
            if (typeof effectStyleData[i].effectStyleId != 'symbol') {
                var styleId = effectStyleData[i].effectStyleId;
                //console.log(effectStyleData[i]);
                var styleName = figma.getStyleById(styleId).name;
                var styleKey = figma.getStyleById(styleId).key;
                //assemble into array
                var style = {
                    theme: themeName,
                    name: styleName,
                    key: styleKey,
                    type: 'EFFECT'
                };
                //push item item into array
                canvasThemeData.push(style);
            }
            else {
                continue;
            }
        }
    }
    dataPrep();
}
//prepare data for posting to API
function dataPrep() {
    if (clearData == true) {
        //add data fom canvas only
        var canvasThemeDataLength = canvasThemeData.length;
        for (var i = 0; i < canvasThemeDataLength; i++) {
            combinedThemeData.push(canvasThemeData[i]);
        }
    }
    else {
        //add data fom API
        var apiThemeDataLength = apiThemeData.length;
        for (var i = 0; i < apiThemeDataLength; i++) {
            combinedThemeData.push(apiThemeData[i]);
        }
        //add data fom canvas
        var canvasThemeDataLength = apiThemeData.length;
        for (var j = 0; j < canvasThemeDataLength; j++) {
            combinedThemeData.push(canvasThemeData[j]);
        }
    }
    cleanData();
}
//cleans the data by removing an entries which have a duplicate key
function cleanData() {
    var filteredCombined = combinedThemeData.filter(function (el) {
        return el != null;
    });
    removeDuplicates(filteredCombined);
    //send all the cleaned data back to the UI to be posted to the API
    figma.ui.postMessage({
        'type': 'themeDataReadyToPost',
        'data': filteredCombined
    });
}
// HELPER FUNCTIONS //////////
//remove duplicates
function removeDuplicates(data) {
    finalData = data.reduce(function (unique, o) {
        if (!unique.some(function (obj) { return obj.key === o.key && obj.theme === o.theme && obj.name === o.name; })) {
            unique.push(o);
        }
        return unique;
    }, []);
}
