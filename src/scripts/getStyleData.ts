//imports
import { getLocalStyles } from './getLocalStyles';
import { getStylesFromNodes } from './getStylesFromNodes';

export function getStyleData(styleTypes, styleSource) {

    if(styleSource === 'local') {
        getLocalStyles(styleTypes);
    } else {
        let nodes:SceneNode[];

        //get all of the nodes to pull styles from
        if (styleSource === 'selection') {
            nodes = Array.from(figma.currentPage.selection);
        } else {
            nodes = Array.from(figma.currentPage.children);
        }

        //run the function which will iterate through all nodes
        getStylesFromNodes(nodes, styleTypes);
        
    }


}