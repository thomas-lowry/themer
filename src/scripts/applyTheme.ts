//imports
import { hasChildren } from "./hasChildren";
import { hasFillStyles } from "./hasFillStyles";
import { hasStrokeStyle } from "./hasStrokeStyle";
import { hasEffects } from "./hasEffects";

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
const styles = {};

//notifications
let notify;

//failed styles
let failedStyles = {};

export async function applyTheme(themeData, theme) {

    failedStyles = {};

    //tell the user the theme is being applied
    notify = figma.notify('Applying ' + theme + ' theme...', {timeout: Infinity})

    //this is the theme the user selected to apply
    //normalizing in lowercase for comparison reasons
    selectedTheme = theme.toLowerCase();

    //all of the theme data which includes the keys, provided from the JSONbin
    allThemes = themeData;

    console.log('all themes: ', allThemes)

    //filter all of the theme data down to just the styles associated with the selected theme
    selectedThemeStyles = themeData.filter(style => style.theme.toLowerCase() === selectedTheme);

    //get for selection
    let selection = figma.currentPage.selection;

    //check for selection
    //TODO: turn into guard 
    if (selection.length >= 1) {

        //identify which type of styles are present
        themeData.forEach(style => {
            if (style.type === 'PAINT') { colorStyles = true };
            if (style.type === 'TEXT') { textStyles = true };
            if (style.type === 'EFFECT') { effectStyles = true };
        })

        //now we iterate through every node in the selection
        const promises = selection.map(applyStyleToNode);
        await Promise.all(promises);

        //filter out unique nodes so we don't count the same node twice
        //this is possible because the same node could have multiple styles applied to it
        let actualCount = Object.keys(count).length;

        //cancel the current notification
        notify.cancel();

        //add a msg for failed styles
        let numOfFailedStyles = Object.keys(failedStyles).length;
        console.log('failed style stuff:', failedStyles, numOfFailedStyles);

        let failedMsg;
        if(numOfFailedStyles > 0) {
            let word = numOfFailedStyles > 1 ? ' styles':' style';
            failedMsg = numOfFailedStyles + word + ' failed to import, see console for details.'
        }

        //Msg to user
        if (actualCount > 0) {
            if (numOfFailedStyles === 0) {
                figma.notify(selectedTheme + ' theme applied to ' + actualCount + ' layers');
            } else {
                figma.notify(selectedTheme + ' theme applied to ' + actualCount + ' layers. ' + failedMsg, {timeout: 5000});
            }
        } else {
            figma.notify('No styles from your themes were found.');
        }

        count = {};

    } else {
        figma.notify('Please make a selection');
    }
}

async function applyStyleToNode(node: SceneNode) {

    //console.log('apply to node')

    //skip hidden nodes to improve performance
    if (!node.visible) return true;

    //FILL & STROKE STYLES
    if (colorStyles && hasFillStyles(node) && node.fillStyleId != '') {

        //if the node does not have a mixed property, match and apply paint style
        if (typeof (node.fillStyleId) != 'symbol') {

            //get the style currently applied to the node
            let originalStyle = figma.getStyleById(node.fillStyleId) as PaintStyle;

            //see if there is a matching style in the selected theme, apply it if there is
            let matchedStyle = returnMatchingStyle(originalStyle.name, 'PAINT');

            if (matchedStyle !== null) {
                let styleId = await findMatchedKeyOrImportStyle(matchedStyle);
                if (styleId) {
                    styles[matchedStyle.key] = styleId;
                    node.fillStyleId = styleId;
                    count[node.id] = 1;
                }
            }

            //for text nodes that have mixed color styles, match and apply paint style
        } else if (node.type === 'TEXT' && typeof (node.fillStyleId) === 'symbol') {

            //do this if there are multiple color styles in the same text box
            let uniqueTextColorStyles = node.getStyledTextSegments(['fillStyleId']);

            for await (const fillStyle of uniqueTextColorStyles) {

                //get the style currently applied to the node
                let originalStyle = figma.getStyleById(fillStyle.fillStyleId);

                //apply style if there is a match in selected theme
                let matchedStyle = returnMatchingStyle(originalStyle.name, 'PAINT');
                if (matchedStyle !== null) {
                    let styleId = await findMatchedKeyOrImportStyle(matchedStyle);
                    if (styleId) {
                        styles[matchedStyle.key] = styleId;
                        node.setRangeFillStyleId(fillStyle.start, fillStyle.end, styleId);
                        count[node.id] = 1;
                    }
                }

            }

        }
    }
    //for nodes with strokes
    if (colorStyles && hasStrokeStyle(node) && node.strokeStyleId != '') {
        //get the style currently applied to the node
        let originalStyle = figma.getStyleById(node.strokeStyleId) as PaintStyle;

        //see if there is a matching style in the selected theme, apply it if there is
        let matchedStyle = returnMatchingStyle(originalStyle.name, 'PAINT');
        if (matchedStyle !== null) {
            let styleId = await findMatchedKeyOrImportStyle(matchedStyle);
            if (styleId) {
                styles[matchedStyle.key] = styleId;
                node.strokeStyleId = styleId;
                count[node.id] = 1;
            }
        }
    }


    //TEXT STYLES
    if (textStyles && node.type === "TEXT") {

        //do this for text nodes with a single style applied
        if (node.textStyleId != '' && typeof (node.textStyleId) != 'symbol') {

            //get the currently applied text style
            let originalStyle = figma.getStyleById(node.textStyleId) as TextStyle;

            //see if there is a matching style in the selected theme
            let matchedStyle = returnMatchingStyle(originalStyle.name, 'TEXT');
            if (matchedStyle !== null) {
                let styleId = await findMatchedKeyOrImportStyle(matchedStyle);
                if (styleId) {
                    styles[matchedStyle.key] = styleId;
                    let style = figma.getStyleById(styleId) as TextStyle;
                    
                    //load the fonts for the new style
                    await figma.loadFontAsync({
                        'family': style.fontName.family,
                        'style': style.fontName.style
                    });

                    node.textStyleId = styleId;
                    count[node.id] = 1;
                }

            }

            //do this for text nodes that have multiple text styles
        } else if (typeof (node.textStyleId) === 'symbol') {

            //do this if there are multiple text styles in the same text box
            let uniqueTextStyles = node.getStyledTextSegments(['textStyleId']);

            for await (const textStyle of uniqueTextStyles) {

                let originalStyle = figma.getStyleById(textStyle.textStyleId);
                let matchedStyle = returnMatchingStyle(originalStyle.name, 'TEXT') as TextStyle;
                if (matchedStyle !== null) {

                    let styleId = await findMatchedKeyOrImportStyle(matchedStyle);
                    if (styleId) {
                        styles[matchedStyle.key] = styleId;
                        let style = figma.getStyleById(styleId) as TextStyle;

                        //load the fonts for the new style
                        await figma.loadFontAsync({
                            'family': style.fontName.family,
                            'style': style.fontName.style
                        });

                        //apply the style to the correct range
                        node.setRangeTextStyleId(textStyle.start, textStyle.end, styleId);
                        count[node.id] = 1;
                    }
                }
            }
        }
    }

    //EFFECT STYLES
    if (effectStyles && hasEffects(node) && node.effectStyleId != '' && typeof (node.effectStyleId) != 'symbol') {

        //get currently applied effect style
        let originalStyle = figma.getStyleById(node.effectStyleId) as EffectStyle;

        //see if there is a matching style in the selected theme
        let matchedStyle = returnMatchingStyle(originalStyle.name, 'EFFECT') as EffectStyle;

        if (matchedStyle !== null) {
            let styleId = await findMatchedKeyOrImportStyle(matchedStyle);
                if (styleId) {
                styles[matchedStyle.key] = styleId;
                node.effectStyleId = styleId;
                count[node.id] = 1;
            }
        }

    }

    //repeat the process for all children
    return hasChildren(node) ? Promise.all(node.children.map(applyStyleToNode)) : true;
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

    console.log('new name final:' , newName ? newName : name)

    return newName ? newName : name;
}

async function findMatchedKeyOrImportStyle(matchedStyle) {

    let result = null;

    if (styles[matchedStyle.key]) {
        result = styles[matchedStyle.key];
    } else {
        try{
            result = (await figma.importStyleByKeyAsync(matchedStyle.key)).id;
        } catch(err) {
            let style = allThemes.find(style => style.key === matchedStyle.key);
            console.log('Error importing style: ', style.name);
            failedStyles[matchedStyle.key] = 1;
        }
    }

    return result;
}