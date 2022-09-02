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
let selectedTheme; //name of the theme we are applying

//collect the number of nodes affected
const count = {};

//collect the styles applied so we don't import them twice
const styles = {};

//notifications
let notify;

export async function applyTheme(themeData, theme) {

    //tell the user the theme is being applied
    notify = figma.notify('Applying ' + theme + ' theme...', {timeout: Infinity})

    selectedTheme = theme;

    //all of the theme data which includes the keys, provided from the JSONbin
    allThemes = themeData;

    //get for selection
    let selection = figma.currentPage.selection;

    //check for selection
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

        //Msg to user
        if (actualCount > 0) {
            figma.notify(selectedTheme + ' theme applied to ' + actualCount + ' layers');
        } else {
            figma.notify('No styles from your themes were found.');
        }

    } else {
        figma.notify('Please make a selection');
    }
}

async function applyStyleToNode(node: SceneNode) {

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
                let styleId = styles[matchedStyle.key] || (await figma.importStyleByKeyAsync(matchedStyle.key)).id;
                styles[matchedStyle.key] = styleId;
                node.fillStyleId = styleId;
                count[node.id] = 1;
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
                    let styleId = styles[matchedStyle.key] || (await figma.importStyleByKeyAsync(matchedStyle.key)).id;
                    styles[matchedStyle.key] = styleId;
                    node.setRangeFillStyleId(fillStyle.start, fillStyle.end, styleId);
                    count[node.id] = 1;
                    
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
            let styleId = styles[matchedStyle.key] || (await figma.importStyleByKeyAsync(matchedStyle.key)).id;
            styles[matchedStyle.key] = styleId;
            node.strokeStyleId = styleId;
            count[node.id] = 1;
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
                let styleId = styles[matchedStyle.key] || (await figma.importStyleByKeyAsync(matchedStyle.key)).id;
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

            //do this for text nodes that have multiple text styles
        } else if (typeof (node.textStyleId) === 'symbol') {

            //do this if there are multiple text styles in the same text box
            let uniqueTextStyles = node.getStyledTextSegments(['textStyleId']);

            for await (const textStyle of uniqueTextStyles) {

                let originalStyle = figma.getStyleById(textStyle.textStyleId);
                let matchedStyle = returnMatchingStyle(originalStyle.name, 'TEXT') as TextStyle;
                if (matchedStyle !== null) {

                    let styleId = styles[matchedStyle.key] || (await figma.importStyleByKeyAsync(matchedStyle.key)).id;
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

    //EFFECT STYLES
    if (effectStyles && hasEffects(node) && node.effectStyleId != '' && typeof (node.effectStyleId) != 'symbol') {

        //get currently applied effect style
        let originalStyle = figma.getStyleById(node.effectStyleId) as EffectStyle;

        //see if there is a matching style in the selected theme
        let matchedStyle = returnMatchingStyle(originalStyle.name, 'EFFECT') as EffectStyle;

        if (matchedStyle !== null) {
            let styleId = styles[matchedStyle.key] || (await figma.importStyleByKeyAsync(matchedStyle.key)).id;
            styles[matchedStyle.key] = styleId;
            node.effectStyleId = styleId;
            count[node.id] = 1;
        }

    }

    //repeat the process for all children
    return hasChildren(node) ? Promise.all(node.children.map(applyStyleToNode)) : true;
}

//HELPERS

//find a matching style in the selected theme
function returnMatchingStyle(name, type) {

    //make an array of all of the unique theme names
    let uniqueThemes = [...new Set(allThemes.map(item => item.theme))];

    //normalize style name for matching
    let normalizedCurrentStyleName = processStyleNameWithThemeNameIncluded(name, uniqueThemes);

    let match = null;

    //iterate through all styles
    allThemes.forEach(style => {

        let normalizedNewStyleName = processStyleNameWithThemeNameIncluded(style.name, uniqueThemes);
        if (normalizedNewStyleName === normalizedCurrentStyleName && style.type === type && style.theme === selectedTheme) {
            match = style;
        }
    });

    return match;

}

//this will check to see if the name of theme is present in the style name
//but it also checks to make sure that theme name is in the prefix of the style name
//if those conditions are met, strip the theme from the style name
//if not, return the full name
function processStyleNameWithThemeNameIncluded(name, uniqueThemes) {
    let newName;
    let splitName = name.toLowerCase().split('/');

    if (splitName.length >= 2) {
        uniqueThemes.forEach(theme => {
            if (splitName[0].includes(theme.toLowerCase())) {
                splitName.shift();
                newName = splitName.join('/').toString();
            }
        });
    }

    return newName ? newName : name;
}