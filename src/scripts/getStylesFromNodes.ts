//imports
import { hasChildren } from "./hasChildren";
import { removeDuplicatesBy } from "./removeDuplicatesBy";
import { isPublished } from "./isPublished";

let styles:BaseStyle[] = [];

export async function getStylesFromNodes(nodes:SceneNode[], styleTypes) {

    //collect all styles
    nodes.forEach(node=> {
        getStylesFromNode(node, styleTypes);
    });

    //remove duplicate styles in the array
    let cleanedStyleData = removeDuplicatesBy(style => style.key, styles);

    //determine if ALL, SOME, or NONE of the styles are published
    let publishedStatus = await isPublished(styles);

    //send the data back to the UI
    figma.ui.postMessage({
        'type': 'createStyleData',
        'styles': styles,
        'publishedStatus': publishedStatus
    });

}



//get all possible styles from the node
function getStylesFromNode(node:SceneNode, styleTypes) {

    //COLOR
    if(styleTypes.color) {
        let colorStyles:PaintStyle[] = [];

        //ignore these types of notes because they cannot have a fill style
        //text nodes will be treated separately
        if (node.type != 'SLICE' && node.type != 'GROUP') {

            //check for unique style when adding to array
            let pushUniqueColor = (style: PaintStyle) => {
                if (!colorStyles.some((item) => item.key === style.key)) {
                    colorStyles.push(style)
                }
            }

            if (node.type === 'TEXT' && typeof node.fillStyleId === 'symbol') {

                let length = node.characters.length
                for (let i = 0; i < length; i++) {
                    let styleId = node.getRangeFillStyleId(i, i + 1) as string;
                    let style:PaintStyle;
                    if (styleId != '' && styleId.length > 0) {
                        style = figma.getStyleById(styleId) as PaintStyle;
                    }
                    pushUniqueColor(style);
                }

            } else if (node.fillStyleId != '' && typeof node.fillStyleId != 'symbol' && node.fillStyleId.length > 0) {

                let style = figma.getStyleById(node.fillStyleId) as PaintStyle;
                colorStyles.push(style);

            }
        }

        //if there are color styles found, add them to the stylea array
        if(colorStyles.length > 0) {
            styles.concat(colorStyles);
        }
    }

    //TEXT
    if(styleTypes.text) {
        let textStyles:TextStyle[] = []; 

        //verify if text node, otherwise skip
        if(node.type === 'TEXT') {

            //check for unique style when adding to array
            let pushUniqueText = (style: TextStyle) => {
                if (!textStyles.some((item) => item.key === style.key)) {
                    textStyles.push(style)
                }
            }

            //check if symbol, if true
            //this means there are multiple text styles in the text box and we need to iterate per character
            if (typeof node.textStyleId === 'symbol') {
                
                let length = node.characters.length
                for (let i = 0; i < length; i++) {
                    let styleId = node.getRangeTextStyleId(i, i + 1) as string;
                    let style:TextStyle;
                    if (styleId != '' && styleId.length > 0) {
                        style = figma.getStyleById(styleId) as TextStyle;
                    }
                    pushUniqueText(style);
                }

            } else if (node.textStyleId != '' && node.textStyleId.length > 0) {

                let style = figma.getStyleById(node.textStyleId) as TextStyle;
                textStyles.push(style);
            
            }
        }

        //if there are text styles found, add them to the styles array
        if(textStyles.length > 0) {
            styles.concat(textStyles);
        }
    }

    //EFFECT
    if(styleTypes.effect) {
        let effectStyles:EffectStyle[] = [];

        if (node.type != 'SLICE' && node.type != 'GROUP') {

            if (node.effectStyleId != '' && node.effectStyleId.length > 0) {
                let style = figma.getStyleById(node.effectStyleId) as EffectStyle;
                effectStyles.push(style);
            }

        }


        //if there are effect styles found, add them to the stylea array
        if(effectStyles.length > 0) {
            styles.concat(effectStyles);
        }

    }


    //if the node has children, run the same function recursively
    if (hasChildren(node)) {        
        node.children.forEach(async child => {
            getStylesFromNode(child, styleTypes);            
        });
    }

    
}