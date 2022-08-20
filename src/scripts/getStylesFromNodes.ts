//imports
import { hasChildren } from "./hasChildren";
import { hasFillStyles } from "./hasFillStyles";
import { hasEffects } from "./hasEffects";
import { isPublished } from "./isPublished";
import { assembleStylesArray } from "./assembleStylesArray";
import { hasStrokeStyle } from "./hasStrokeStyle";

let styles:BaseStyle[] = [];

export async function getStylesFromNodes(nodes:SceneNode[], styleTypes) {

        if (nodes.length != 0) {

            //this will loop over all nodes passed to the function
            //it will past each node to a function to extract any styles
            //if the node has children, it will pass the array of children back through the function
            nodes.forEach(node=> {
                getStylesFromNode(node, styleTypes);
            });

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

        } else {

            console.log('is this firing?');

            //send the data back to the UI with the empty array
            figma.ui.postMessage({
                'type': 'createStyleData',
                'styles': nodes,
                'publishedStatus': 'none'
            });
        }

}



//get all possible styles from the node
function getStylesFromNode(node, styleTypes) {

    //COLOR
    if(styleTypes.color) {

        //check to see if node supports fills
        if (hasFillStyles(node) || hasStrokeStyle(node)) {

            //check to see if the node is text
            //text nodes can contain multiple styles
            if (node.type === 'TEXT') {
                let uniqueTextColorStyles = node.getStyledTextSegments(['fillStyleId']);

                if (uniqueTextColorStyles.length != 0) {

                    uniqueTextColorStyles.forEach(fillStyle => {

                        let id = fillStyle.fillStyleId as string;
                        let style = figma.getStyleById(id) as PaintStyle;

                        //add style to the array
                        styles.push(style);
                        
                    });

                }

            } else {

                //if node supports fills check for fill styles
                if (hasFillStyles(node)) {
                    if (node.fillStyleId != '') {
                        //get the style
                        let id = node.fillStyleId as string;
                        let style = figma.getStyleById(id) as PaintStyle;
                        
                        //add style to the array
                        styles.push(style);
                    }
                }

                //if node supports strokes check for fill styles
                if (hasStrokeStyle(node)) {
                    if (node.strokeStyleId != '') {
                        //get the style
                        let id = node.strokeStyleId as string;
                        let style = figma.getStyleById(id) as PaintStyle;
                        
                        //add style to the array
                        styles.push(style);
                    }
                }


            }
        }


    }

    //TEXT
    if(styleTypes.text) {

        //check to see if the node is text
        //text nodes can contain multiple styles
        if (node.type === 'TEXT') {

            if (node.textStyleId != '') {

                if (typeof(node.textStyleId) === 'symbol') {

                    let uniqueTextStyles = node.getStyledTextSegments(['textStyleId']);
                    uniqueTextStyles.forEach(textStyle => {

                        let id = textStyle.textStyleId as string;
                        let style = figma.getStyleById(id) as TextStyle;
    
                        //add style to the array
                        styles.push(style);
                        
                    });

                } else {

                    let id = node.textStyleId as string;
                    let style = figma.getStyleById(id) as TextStyle;

                    //add style to the array
                    styles.push(style);

                }

            }
        }
    }

    //EFFECT
    if(styleTypes.effect) {

        //check to see if node supports fills
        if (hasEffects(node)) {

            if (node.effectStyleId != '') {
                //get the style
                let id = node.effectStyleId as string;
                let style = figma.getStyleById(id) as EffectStyle;

                //add style to the array
                styles.push(style);
            }
        }
    }

    //repeat the process of the node has children
    if (hasChildren(node)) {
        if(node.children.length >= 1) {
            node.children.forEach(child => {
                getStylesFromNode(child, styleTypes);
            })
        }
    }
}