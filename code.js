var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
// API credentials
var apiSecret;
var apiURL;
// VARS
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
            case 'createTheme':
                updatedDataFromAPI(msg.apiData);
                // prefixes
                if (msg.usePrefixes === true) {
                    usePrefixes = true;
                }
                else {
                    usePrefixes = false;
                }
                console.log(msg);
                //theme name
                if (msg.themeName) {
                    newThemeName = msg.themeName;
                }
                switch (msg.source) {
                    case 'local':
                        if (msg.colorStyles) {
                            getLocalStyles('color');
                        }
                        if (msg.textStyles) {
                            getLocalStyles('text');
                        }
                        if (msg.effectStyles) {
                            getLocalStyles('effect');
                        }
                        break;
                    case 'selection':
                        break;
                    case 'page':
                        break;
                }
        }
        return [2 /*return*/];
    });
}); };
// CREATE THEMES
//collect styles from local styles
function getLocalStyles(type) {
    if (type === 'color') {
        var colorStyles = figma.getLocalPaintStyles();
        if (colorStyles) {
            colorStyles.forEach(function (color) {
                if (publishedStyleCheck(color)) {
                    var name_1 = color.name;
                    var key = color.key;
                    var theme = themeName(name_1);
                    var type_1 = 'PAINT';
                    console.log(name_1);
                }
                else {
                    figma.notify('Styles must be published as a team library');
                    return;
                }
            });
        }
        else {
            figma.notify('There are no color styles in the document');
            return;
        }
    }
    else if (type === 'text') {
    }
    else if (type === 'effect') {
    }
}
// get theme name
function publishedStyleCheck(style) {
    if (style.key) {
        return true;
    }
    else {
        return false;
    }
}
function themeName(name) {
    if (usePrefixes) {
        if (name.includes('/')) {
            name = name.split('/');
            return name[0];
        }
        else {
            figma.notify('Styles names must be prefixed. Ex: themeName/colorName');
        }
    }
    else {
        return newThemeName;
    }
}
// HELPER FUNCTIONS
// populate latest data from API
function updatedDataFromAPI(data) {
    jsonBinData = JSON.parse(data);
}
// update credentials
function updateCredentials(secret, url) {
    var _this = this;
    (function () { return __awaiter(_this, void 0, void 0, function () {
        var err_2;
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
                    err_2 = _a.sent();
                    figma.notify('There was an issue saving your credentials. Please try again.');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); })();
}
