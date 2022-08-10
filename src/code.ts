//imports
import { getStyleData } from './scripts/getStyleData';

//Vars

//api credentials
var apiSecret:string;
var apiURL:string;

//recieves msgs from the UI
figma.ui.onmessage = msg => {

	switch(msg.type){

		//when the UI needs Figma to gather data to create a new theme, this function is executed
		case 'createTheme':
            getStyleData(msg.styleTypes, msg.styleSource);
		break;

		//take msgs from the UI and show them to the user
		case 'error':
            figma.notify(msg.errorMsg);
		break;

	}
};

// show the UI
figma.showUI(__html__, {width: 240, height: 312 });

//INITIALIZE PLUGIN
//Check to see if credentials exist in client storage
//we check to see if there is an API key for jsonbin and also a url to the bin
//run on plugin initilization
(async () => {
	try {

		console.log('figma: looking for existing themer data');

		apiURL = await figma.clientStorage.getAsync('apiURL');
        apiSecret = await figma.clientStorage.getAsync('apiSecret');
		    
		if (apiURL && apiSecret) {
			//send a message to the UI with the credentials storred in the client
			figma.ui.postMessage({
				'type': 'apiCredentials',
				'status': true,
				'url': apiURL,
				'secret': apiSecret
			});

		} else {

			console.log('figma: sending api credentials to UI');

			//send a message to the UI that says there are no credentials storred in the client
			figma.ui.postMessage({
				'type': 'apiCredentials',
				'status': false
            });
		}

	} catch (err) {
        figma.ui.postMessage({
			'type': 'apiCredentials',
			'status': false
		});
	}
})();


setTimeout(() => {
	console.log('trying again...just in case');
	figma.ui.postMessage({
		'type': 'apiCredentials',
		'status': false
	});
}, 1000);
