//imports
import { getStyleData } from './scripts/getStyleData';
import { resetThemer } from './scripts/resetThemer';
import { saveCredentials } from './scripts/saveCredentials';


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
		case 'notify':
            figma.notify(msg.message);
		break;

		//when the UI needs Figma to gather data to create a new theme, this function is executed
		case 'saveCredentials':
			console.log('save cred: ', msg.apiKey, msg.binURL);
            saveCredentials(msg.apiKey, msg.binURL);
		break;

		//resets api key data storred in client storage
		case 'reset':
			resetThemer();
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

			console.log(apiURL, apiSecret);

			//send a message to the UI with the credentials storred in the client
			figma.ui.postMessage({
				'type': 'apiCredentials',
				'status': true,
				'binURL': apiURL,
				'apiKey': apiSecret
			});

		} else {

			console.log(apiURL, apiSecret);

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