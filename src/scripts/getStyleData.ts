//imports
import { getLocalStyles } from './getLocalStyles';
import { getStylesFromNodes } from './getStylesFromNodes';

export function getStyleData(styleTypes, styleSource) {

    if(styleSource === 'local') {
        getLocalStyles(styleTypes);
    } else {

        let nodes:SceneNode[];
        let errorMsg:string;

        //get all of the nodes to pull styles from
        if (styleSource === 'selection') {
            nodes = Array.from(figma.currentPage.selection);
            errorMsg = 'selected.'
        } else {
            nodes = Array.from(figma.currentPage.children);
            errorMsg = 'on the current page.'
        }

        if (nodes.length < 1) {
            nodes.forEach(node => {
                getStylesFromNodes(node, styleTypes);
            });
        } else {
            //throw an error if there are no nodes
            figma.notify('There are no items ' + errorMsg);

            //tell the UI to fail style validation
            figma.ui.postMessage({
				'createThemeError': true
			});
        }

    }


}