// API credentials
var apiSecret:string;
var apiURL:string;

// VARS

// this is the latest data from JSON Bin,
// we will append this to the cleaned data
var jsonBinData = []; 

// this is all of the raw styles data we collect when creating a new theme
// it may contain duplicates, and themes using prefixed names have not been split up
var collectedStyleData = [];

// clean data, this is an array of all of the processed new data
var cleanedStyleData = [];

// this is the assembled clean data that is ready 
// to be sent back to the UI to push to JSON bin
var newJsonBinData = [];


// settings
var usePrefixes:boolean;
var newThemeName:string;



// show the UI
figma.showUI(__html__, {width: 240, height: 312 });


//INITIALIZE PLUGIN
//Check to see if credentials exist in client storage
//run on plugin initilization
(async () => {
	try {
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
			//send a message to the UI that says there are no credentials storred in the client
			figma.ui.postMessage({
				'type': 'apiCredentials',
				'status': false
            });
		}

	} catch (err) {
        figma.closePlugin('There was an error.');
        return;
	}
})();





//MESSAGING TO PLUGIN UI
figma.ui.onmessage = async (msg) => {

    switch (msg.type) {

        case 'notify':
            figma.notify(msg.msg, {timeout: 1500 });
            break;

        case 'initialThemerData':
            updateCredentials(msg.secret, msg.url);
            figma.notify(msg.msg, {timeout: 1000 });
            break;

        case 'createTheme':
            updatedDataFromAPI(msg.apiData);
            
            // prefixes
            if (msg.usePrefixes === true) {
                usePrefixes = true;
            } else {
                usePrefixes =  false;
            }

            console.log(msg);

            //theme name
            if (msg.themeName) {
                newThemeName = msg.themeName;
            }

            switch (msg.source) {
                case 'local':

                    if (msg.colorStyles) {
                        getLocalStyles('color');
                    }
                    if (msg.textStyles) {
                        getLocalStyles('text');
                    }
                    if (msg.effectStyles) {
                        getLocalStyles('effect');
                    }

                    break;

                case 'selection':

                    break;

                case 'page':

                    break;

            }



    }
}




// CREATE THEMES



//collect styles from local styles
function getLocalStyles(type) {
    if (type === 'color') {
        let colorStyles = figma.getLocalPaintStyles();

        if (colorStyles) {
            colorStyles.forEach(color => {
                if (publishedStyleCheck(color)) {
                    let name = color.name;
                    let key = color.key;
                    let theme = themeName(name);
                    let type = 'PAINT';

                    console.log(name);
                } else {
                    figma.notify('Styles must be published as a team library');
                    return;
                }
            });
        } else {
            figma.notify('There are no color styles in the document');
            return;
        }
    } else if (type === 'text') {

    } else if (type === 'effect') {

    }
}

// get theme name

function publishedStyleCheck(style) {
    if (style.key) {
        return true;
    } else {
        return false;
    }
}


function themeName(name) {
    if (usePrefixes) {
        if (name.includes('/')) {
            name = name.split('/');
            return name[0];
        } else {
            figma.notify('Styles names must be prefixed. Ex: themeName/colorName')
        }
    } else {
        return newThemeName;
    }
}






// HELPER FUNCTIONS

// populate latest data from API
function updatedDataFromAPI(data) {
    jsonBinData = JSON.parse(data);
}

// update credentials
function updateCredentials(secret, url) {
    (async () => {
        try {
            await figma.clientStorage.setAsync('apiSecret', secret);
            await figma.clientStorage.setAsync('apiURL', url);
        } catch (err) {
            figma.notify('There was an issue saving your credentials. Please try again.')
        }
    })();
}