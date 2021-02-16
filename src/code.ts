//imports
import { getStyleData } from './scripts/getStyleData';


//Vars

//api credentials
var apiSecret:string;
var apiURL:string;

// show the UI
figma.showUI(__html__, {width: 240, height: 312 });


//recieves msgs from the UI
figma.ui.onmessage = msg => {

	switch(msg.type){

		case 'createTheme':
            getStyleData(msg.styleTypes, msg.styleSource);
		break;

	} 

};