//imports
import { isPublished } from "./isPublished";
import { assembleStylesArray } from "./assembleStylesArray";

export async function getLocalStyles(styleTypes) {

    //first get all local styles based on the style types they chose
    //add them all to a single array
    //next determine if all of the styles are published

    //possible outcomes:
    //all styles are published, tell the user nothing, advance to step 3
    //some styles are published, this doesn't seem good, tell the user, stay at step 2
    //none of the styles are published, continue to step 3, but tell the user

    let styles:BaseStyle[] = [];

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
    let publishedStatus = await isPublished(cleanedStyleData);

    //send the data back to the UI
    figma.ui.postMessage({
        'type': 'createStyleData',
        'styles': cleanedStyleData,
        'publishedStatus': publishedStatus
    });

}