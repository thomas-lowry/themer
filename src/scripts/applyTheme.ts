//imports
import { hasChildren } from "./hasChildren";
import { hasFillStyles } from "./hasFillStyles";
import { hasFills } from "./hasFills";
import { hasStrokeStyle } from "./hasStrokeStyle";
import { hasStrokes } from "./hasStrokes";
import { hasEffects } from "./hasEffects";

//variables we will use to apply the right type of styles
let colorStyles = false;
let textStyles = false;
let effectStyles = false;

//imported styles
let importedStyles = [] //just the styles we're importing
let allThemes = [];
let stylesInTheme = []; //just the styles in the theme we are applying
let selectedTheme; //name of the theme we are applying

//linting mode
let lint = false;
let lintFill:Paint = { "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 1,"g": 0,"b": 1 } } //fuchsia
let lintFillText:Paint = { "type": "SOLID", "visible": true, "opacity": 1, "blendMode": "NORMAL", "color": { "r": 0.6705882549285889,"g": 0,"b": 0.6705882549285889 } }
let lintCount = 0;

//count the number of nodes
//TO DO: do this more accurately an array of ids
let count = [];

export async function applyTheme(themeData, theme) {

    selectedTheme = theme;
    allThemes = themeData;

    //collect JUST the styles we will iterate through
    stylesInTheme = themeData.filter(item => item.theme === theme);

    //get for selection
    let selection = figma.currentPage.selection;

    //check for selection
    if (selection.length >= 1) {

        //lets import all of the styles in the theme
        for await (const style of stylesInTheme) {

            let remoteStyle:BaseStyle;
            try {
                remoteStyle = await figma.importStyleByKeyAsync(style.key);
                importedStyles.push(remoteStyle);
            } catch (error) {
                console.error(error);
            }
        
            if (remoteStyle.type === 'PAINT') { colorStyles=true };
            if (remoteStyle.type === 'TEXT') { textStyles=true };
            if (remoteStyle.type === 'EFFECT') { effectStyles=true };

        }

        //console log out all imported styles
        console.log('all imported styles: ', importedStyles);

        //now we iterate through every node in the selection
        selection.forEach(node => {
            applyStyleToNode(node);
        })

        //get unique
        let actualCount = [...new Set(count)];

        //Msg to user
        if (actualCount.length > 0) {
            figma.notify(selectedTheme + ' theme applied to ' + actualCount.length + ' layers');
        } else {
            figma.notify('No styles from your themes were found.');
        }

    } else {
        figma.notify('Please make a selection');
    }
}

async function applyStyleToNode(node:SceneNode) {

    //skip hidden nodes to improve performance
    if (node.visible === true) {

        //FILL & STROKE STYLES
        if (colorStyles && hasFillStyles(node) && node.fillStyleId != '') {
        
            //if the node does not have a mixed property, match and apply paint style
            if (typeof(node.fillStyleId) != 'symbol') {
                
                //get the style currently applied to the node
                let originalStyle = figma.getStyleById(node.fillStyleId) as PaintStyle;

                //see if there is a matching style in the selected theme, apply it if there is
                let matchedStyle = returnMatchingStyle(originalStyle.name, 'PAINT');

                if (matchedStyle !== null) {
                    node.fillStyleId = matchedStyle.id;
                    count.push(node.id);
                }

            //for text nodes that have mixed color styles, match and apply paint style
            } else if (node.type === 'TEXT' && typeof(node.fillStyleId) === 'symbol') {

                //do this if there are multiple color styles in the same text box
                let uniqueTextColorStyles = node.getStyledTextSegments(['fillStyleId']);
                
                uniqueTextColorStyles.forEach(fillStyle => {
                    
                    //get the style currently applied to the node
                    let originalStyle = figma.getStyleById(fillStyle.fillStyleId);

                    //apply style if there is a match in selected theme
                    let matchedStyle = returnMatchingStyle(originalStyle.name, 'PAINT');
                    if (matchedStyle!== null) {
                        //apply the style to the correct range
                        node.setRangeFillStyleId(fillStyle.start, fillStyle.end, matchedStyle.id);
                        count.push(node.id);
                    }
                
                });
            }
        }
        //for nodes with strokes
        if (colorStyles && hasStrokeStyle(node) && node.strokeStyleId != '') {
            //get the style currently applied to the node
            let originalStyle = figma.getStyleById(node.strokeStyleId) as PaintStyle;

            //see if there is a matching style in the selected theme, apply it if there is
            let matchedStyle = returnMatchingStyle(originalStyle.name, 'PAINT') as PaintStyle;
            if (matchedStyle !== null) {
                node.strokeStyleId = matchedStyle.id;
                count.push(node.id);
            }
        }


        //TEXT STYLES
        if (textStyles && node.type === "TEXT") {
            
            //do this for text nodes with a single style applied
            if (node.textStyleId != '' && typeof(node.textStyleId) != 'symbol') {

                //get the currently applied text style
                let originalStyle = figma.getStyleById(node.textStyleId) as TextStyle;

                //see if there is a matching style in the selected theme
                let matchedStyle = returnMatchingStyle(originalStyle.name, 'TEXT') as TextStyle;
                if (matchedStyle!== null) {

                    //load the fonts for the new style
                    await figma.loadFontAsync({
                        'family': matchedStyle.fontName.family,
                        'style': matchedStyle.fontName.style
                    });
                    node.textStyleId = matchedStyle.id;
                    count.push(node.id);
                }

            //do this for text nodes that have multiple text styles
            } else if (typeof(node.textStyleId) === 'symbol') {

                //do this if there are multiple text styles in the same text box
                let uniqueTextStyles = node.getStyledTextSegments(['textStyleId']);

                for await (const textStyle of uniqueTextStyles) {

                    let originalStyle = figma.getStyleById(textStyle.textStyleId);
                    let matchedStyle = returnMatchingStyle(originalStyle.name, 'TEXT') as TextStyle;
                    if (matchedStyle !== null) {

                        //load the fonts for the new style
                        await figma.loadFontAsync({
                            'family': matchedStyle.fontName.family,
                            'style': matchedStyle.fontName.style
                        });

                        //apply the style to the correct range
                        node.setRangeTextStyleId(textStyle.start, textStyle.end,matchedStyle.id);
                        count.push(node.id);

                    }
                }
            }
        }

        //EFFECT STYLES
        if (effectStyles && hasEffects(node) && node.effectStyleId != '' && typeof(node.effectStyleId) != 'symbol') {
            
            //get currently applied effect style
            let originalStyle = figma.getStyleById(node.effectStyleId) as EffectStyle;

            //see if there is a matching style in the selected theme
            let matchedStyle = returnMatchingStyle(originalStyle.name, 'EFFECT') as EffectStyle;

            if (matchedStyle !== null) {
                node.effectStyleId = matchedStyle.id;
                count.push(node.id);
            }

        }
    }

    //repeat the process for all children
    if (hasChildren(node)) {
        if(node.children.length >= 1) {
            node.children.forEach(child => {
                applyStyleToNode(child);
            })
        }
    }
}

//special function for linting
export function lintSelection() {

    lint = true;

    //get for selection
    let selection = figma.currentPage.selection;

    //check for selection
    if (selection.length >= 1) {

        //now we iterate through every node in the selection
        selection.forEach(node => {
            lintNode(node);
        })

        //Msg to user
        figma.notify('Found ' + lintCount + ' layers without styles.');

    } else {
        figma.notify('Please make a selection');
    }

}

//apply linting styles
function lintNode(node) {

    //handle normal color nodes
    if (hasFills(node) && node.fillStyleId ==='' && typeof(node.fills) !== 'symbol') {

        if(node.fills.length >= 1 && node.fills[0].visible === true) {
            if (node.fills.length === 1) {
                let newFills = [...node.fills];

                if (node.type === 'TEXT') {
                    newFills.push(lintFillText);
                } else {
                    newFills.push(lintFill);
                }
                node.fills = newFills;
            }
        }

    } else if (node.type ==='TEXT' && typeof(node.fills) === 'symbol') {

        //do this if there are multiple text styles in the same text box
        let uniqueTextFills = node.getStyledTextSegments(['fills', 'fillStyleId']);

        uniqueTextFills.forEach(fill => {

            if (fill.fillStyleId === '') {
                let newFills = [...node.fills];
                newFills.push(lintFillText);
                node.fills = newFills;
                node.setRangeFills(fill.start, fill.end, newFills);
            }

        });

    }

    //handle strokes
    if (hasStrokes(node) && node.strokeStyleId ==='') {

        if(node.strokes.length > 0) {
            if (node.strokes.length === 1 && node.strokes[0].visible === true) {
                let newFills = [...node.strokes];
                newFills.push(lintFill);
                node.strokes = newFills;
            }
        }

    }

    //repeat the process for all children
    if (hasChildren(node)) {
        if(node.children.length >= 1) {
            node.children.forEach(child => {
                lintNode(child);
            })
        }
    }
}

//HELPERS

//find a matching style in the selected theme
function returnMatchingStyle(name, type):BaseStyle {

    console.log('name of original style:', name)

    //make an array of all of the unique theme names
    let uniqueThemes = [...new Set(allThemes.map(item => item.theme))];

    //normalize style name for matching
    let normalizedCurrentStyleName = processStyleNameWithThemeNameIncluded(name, uniqueThemes);

    console.log('name of original style (normalized):', normalizedCurrentStyleName)

    let match = null;

    //iterate through all styles
    importedStyles.forEach(style => {
        let normalizedNewStyleName = processStyleNameWithThemeNameIncluded(style.name, uniqueThemes);       
        if (normalizedNewStyleName === normalizedCurrentStyleName && style.type === type) {
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
            if(splitName[0].includes(theme.toLowerCase())){
                splitName.shift();
                newName = splitName.join('/').toString(); 
            }
        });
    }

    return newName ? newName : name;
}