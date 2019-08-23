//show the plugin UI
figma.showUI(__html__, {width: 480, height: 540 });

//VARIABLES ////////

// API credentials
var apiSecret = '';
var apiURL = '';

//initial API Data
var apiThemeData;

//theme data from canvas
var canvasThemeData;

//all theme data (used for creating)
var themeName = '';

//array to combine all data
var combinedThemeData = [];

//array for final combed data
var finalData;

//track if clear existing data is true
var clearData;

//INITIALIZE PLUGIN

//Check to see if client data exists first
//run on plugin initilization
(async () => {
	try {
		apiURL = await figma.clientStorage.getAsync('apiURL');
		apiSecret = await figma.clientStorage.getAsync('apiSecret');
		    
		if (apiURL && apiSecret) {

			//send a message to the UI to say api credntials exist
			figma.ui.postMessage({
				'type': 'apiCredentials',
				'status': true,
				'url': apiURL,
				'secret': apiSecret
			});

			figma.ui.resize(480, 330);

		} else {

			//send a message to the UI to say no credentials
			figma.ui.postMessage({
				'type': 'apiCredentials',
				'status': false
			});
		}

	} catch (err) {
		console.log('there was an error');
	}
})();

//Messages from Plugin UI
figma.ui.onmessage = async (msg) => {

	//initialize plugin
	if (msg.type == 'initData') {
		//set client storage
		(async () => {
			try {
				await figma.clientStorage.setAsync('apiSecret', msg.secret);
				await figma.clientStorage.setAsync('apiURL', msg.url);
			} catch (err) {
				console.log('Could not find in clientStorage');
			}
		})();

		//set the initial data
		apiThemeData = Array.from(JSON.parse(msg.apidata));
		console.log('api theme data:', apiThemeData);

		figma.ui.resize(480, 360);

	}

	//create themes
	if (msg.type == 'createTheme'){
		createTheme(msg);
	}

	//apply themes
	if (msg.type == 'applyTheme'){
		applyTheme(msg);
	}
	
}

//FUNCTIONS //////////


//APPLY THEMES
function applyTheme(msg) {
	let scope;
	let themeName = msg.themeName;
	let colorStyles = msg.colorStyles;
	let textStyles = msg.textStyles;
	let effectStyles = msg.effectStyles;

	//scope of data
	if (msg.applyScope == 'doc') {
		scope = figma.root;
	} else {
		scope = figma.currentPage;
	}

	//color styles
	if (colorStyles) {
		let nodes = scope.findAll(f => f.fillStyleId != '' && f.type != 'FRAME' && f.type != 'COMPONENT' && f.type != 'GROUP' && f.type != 'PAGE' && f.type != 'INSTANCE');
		let bgNodes = scope.findAll(f => f.backgroundStyleId != '' && f.type === 'FRAME' || f.type === 'COMPONENT' || f.type != 'GROUP' && f.type != 'PAGE' && f.type != 'INSTANCE');
		let strokeNodes = scope.findAll(f => f.strokeStyleId != '' && f.type === 'FRAME' || f.type === 'COMPONENT' || f.type != 'GROUP' && f.type != 'PAGE' && f.type != 'INSTANCE');
		
		
		(async function() {
			//fill styles
			let nodesLength = nodes.length;
			for (let i = 0; i < nodesLength; i++ ) {
				let styleID = nodes[i].fillStyleId;
				let styleName;
				if (figma.getStyleById(styleID) === null) {
					continue;
				} else {
					styleName = figma.getStyleById(styleID).name;
				}
				let matchedKey = apiThemeData.filter(x => x.name === styleName && x.theme === themeName).map(x => x);

				if (matchedKey.length !== 0) {
					let libraryStyle = await figma.importStyleByKeyAsync(matchedKey[0].key);
					nodes[i].fillStyleId = libraryStyle.id;
				}

			}
			
			//background styles
			let bgNodesLength = bgNodes.length;
			for (let i = 0; i < bgNodesLength; i++ ) {
				let styleID = bgNodes[i].backgroundStyleId;
				let styleName;
				if (figma.getStyleById(styleID) === null) {
					continue;
				} else {
					styleName = figma.getStyleById(styleID).name;
				}
				let matchedKey = apiThemeData.filter(x => x.name === styleName && x.theme === themeName).map(x => x);

				if (matchedKey.length !== 0) {
					let libraryStyle = await figma.importStyleByKeyAsync(matchedKey[0].key);
					bgNodes[i].backgroundStyleId = libraryStyle.id;

				}
			}

			//stroke styles
			let strokeNodesLength = strokeNodes.length;
			for (let i = 0; i < strokeNodesLength; i++ ) {
				let styleID = strokeNodes[i].strokeStyleId;
				let styleName;
				if (figma.getStyleById(styleID) === null) {
					continue;
				} else {
					styleName = figma.getStyleById(styleID).name;
				}
				let matchedKey = apiThemeData.filter(x => x.name === styleName && x.theme === themeName).map(x => x);

				if (matchedKey.length !== 0) {
					let libraryStyle = await figma.importStyleByKeyAsync(matchedKey[0].key);
					strokeNodes[i].strokeStyleId = libraryStyle.id;

				}
			}



		})()

		
	}

	if (textStyles) {

		let textNodes = scope.findAll(f => f.textStyleId != '' && f.type === 'TEXT' );

		(async function() {
			//fill styles
			let textNodesLength = textNodes.length;
			for (let i = 0; i < textNodesLength; i++ ) {

				if (typeof textNodes[i].textStyleId === 'symbol') {
					continue;
				}
				
				let styleID = textNodes[i].textStyleId;
				let styleName;
				if (figma.getStyleById(styleID) === null) {
					continue;
				} else {
					let style = figma.getStyleById(styleID);
					let fontFamily = style.fontName.family;
					let fontStyle = style.fontName.style;
					// import font if unloaded
					await figma.loadFontAsync({
						'family': fontFamily,
						'style': fontStyle
					})

					styleName = style.name;

				}
				let matchedKey = apiThemeData.filter(x => x.name === styleName && x.theme === themeName).map(x => x);


				if (matchedKey.length !== 0) {
					let libraryStyle = await figma.importStyleByKeyAsync(matchedKey[0].key);
					let fontFamily = libraryStyle.fontName.family;
					let fontStyle = libraryStyle.fontName.style;
					await figma.loadFontAsync({
						'family': fontFamily,
						'style': fontStyle
					})
					textNodes[i].textStyleId = libraryStyle.id;
				}
			}
		})()

	}

	if (effectStyles) {

		let effectNodes = scope.findAll(f => f.effectStyleId != '' && f.type != 'PAGE');

		(async function() {
			let effectStylesLength = effectNodes.length;
			for (let i = 0; i < effectStylesLength; i++ ) {
				let styleID = effectNodes[i].effectStyleId;
				let styleName;
				if (figma.getStyleById(styleID) === null) {
					continue;
				} else {
					styleName = figma.getStyleById(styleID).name;
				}
				let matchedKey = apiThemeData.filter(x => x.name === styleName && x.theme === themeName).map(x => x);

				if (matchedKey.length !== 0) {
					let libraryStyle = await figma.importStyleByKeyAsync(matchedKey[0].key);
					effectNodes[i].effectStyleId = libraryStyle.id;

				}
			}
			})()

	}

	//send all the cleaned data back to the UI to be posted to the API
	figma.ui.postMessage({
		'type': 'applyingThemeComplete'
	});


}

//function to create new theme
function createTheme(msg) {

	canvasThemeData = [];
	
	//Vaiables
	themeName = msg.themeName;
	clearData = msg.clearData;

	let scope;
	let effects = msg.effects;
	let colorStyles = msg.colorStyles;
	let textStyles = msg.textStyles;

	//scope of data
	if (msg.scope == 'doc') {
		scope = figma.root;
	} else {
		scope = figma.currentPage;
	}

	//get all the data from the canvas
	getDataFromCanvas(scope, effects, colorStyles, textStyles);

}

//get data from canvas
function getDataFromCanvas(scope, effects, colorStyles, textStyles) {
	
	//Color Styles
	if (colorStyles) {

		//find all unique fill styles
		let fillStyleData = scope.findAll(f => f.fillStyleId != '' && f.type != 'FRAME' && f.type != 'COMPONENT' && f.type != 'GROUP' && f.type != 'PAGE' && f.type != 'INSTANCE');
		let fillStyleDataLength = fillStyleData.length;
		for (let i = 0; i < fillStyleDataLength; i++) {
	
			if (typeof fillStyleData[i].fillStyleId != 'symbol') {
				let styleId = fillStyleData[i].fillStyleId;
				let styleName = figma.getStyleById(styleId).name;
				let styleKey = figma.getStyleById(styleId).key;

				//assemble into array
				let style = {
					theme: themeName,
					name: styleName,
					key: styleKey,
					type: 'PAINT'
				}

				//push item item into array
				canvasThemeData.push(style);
				//console.log(style);

			} else {
				continue;
			}

		}

		//find all unique stroke styles
		let strokeStyleData = scope.findAll(s => s.strokeStyleId != '' && s.type != 'FRAME' && s.type != 'COMPONENT' && s.type != 'GROUP' && s.type != 'PAGE' && s.type != 'INSTANCE');
		let strokeStyleDataLength = strokeStyleData.length;
		for (let i = 0; i < strokeStyleDataLength; i++) {

			if (typeof fillStyleData[i].fillStyleId != 'symbol') {

				let styleId = fillStyleData[i].fillStyleId;
				let styleName = figma.getStyleById(styleId).name;
				let styleKey = figma.getStyleById(styleId).key;
				
				//assemble into array
				let style = {
					theme: themeName,
					name: styleName,
					key: styleKey,
					type: 'PAINT'
				}

				//push item item into array
				canvasThemeData.push(style);

			} else {
				continue;
			}
		}

	}

	//find unique text styles
	if (textStyles) {
		
		//find all unique stroke styles
		let textStyleData = scope.findAll(s => s.textStyleId != '' && s.type === 'TEXT');
		let textStyleDataLength = textStyleData.length;
		for (let i = 0; i < textStyleDataLength; i++) {
			//console.log(textStyleData[i]);
			if (typeof textStyleData[i].textStyleId != 'symbol') {
				let styleId = textStyleData[i].textStyleId;
				let styleName = figma.getStyleById(styleId).name;
				let styleKey = figma.getStyleById(styleId).key;
				
				//assemble into array
				let style = {
					theme: themeName,
					name: styleName,
					key: styleKey,
					type: 'TEXT'
				}

				//push item item into array
				canvasThemeData.push(style);

			} else {
				continue;
			}
			
		}
		
	}

	//find unique text styles
	if (effects) {

		//find all unique stroke styles
		let effectStyleData = scope.findAll(s => s.effectStyleId != '' && s.type != 'PAGE');
		let effectStyleDataLength = effectStyleData.length;
		for (let i = 0; i < effectStyleDataLength; i++) {

			if (typeof effectStyleData[i].effectStyleId != 'symbol') {
				let styleId = effectStyleData[i].effectStyleId;
				//console.log(effectStyleData[i]);
				let styleName = figma.getStyleById(styleId).name;
				let styleKey = figma.getStyleById(styleId).key;
				
				//assemble into array
				let style = {
					theme: themeName,
					name: styleName,
					key: styleKey,
					type: 'EFFECT'
				}

				//push item item into array
				canvasThemeData.push(style);
				
			} else {
				continue;
			}
			
		}

	}

	dataPrep();

}


//prepare data for posting to API
function dataPrep() {

	if (clearData == true) {
		//add data fom canvas only
		let canvasThemeDataLength = canvasThemeData.length;
		for (let i = 0; i < canvasThemeDataLength; i++) {
			combinedThemeData.push(canvasThemeData[i]);
		}
	} else {
		//add data fom API
		let apiThemeDataLength = apiThemeData.length;
		for (let i = 0; i < apiThemeDataLength; i++) {
			combinedThemeData.push(apiThemeData[i]);
		}
		//add data fom canvas
		let canvasThemeDataLength = apiThemeData.length;
		for (let j = 0; j < canvasThemeDataLength; j++) {
			combinedThemeData.push(canvasThemeData[j])
		}
	}

	cleanData();
}

//cleans the data by removing an entries which have a duplicate key
function cleanData() {

	let filteredCombined = combinedThemeData.filter(function (el) {
		return el != null;
	});

	removeDuplicates(filteredCombined);

	//send all the cleaned data back to the UI to be posted to the API
	figma.ui.postMessage({
		'type': 'themeDataReadyToPost',
		'data': filteredCombined
	});

	
	
}



// HELPER FUNCTIONS //////////

//remove duplicates
function removeDuplicates(data) {
	
	finalData = data.reduce((unique, o) => {
		if(!unique.some(obj => obj.key === o.key && obj.theme === o.theme && obj.name === o.name)) {
			unique.push(o);
		}
		return unique;
	},[]);

}
