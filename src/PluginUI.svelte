<script>

	//import Global CSS from the svelte boilerplate
	//contains Figma color vars, spacing vars, utility classes and more
	import { GlobalCSS } from 'figma-plugin-ds-svelte';


	function createShapes() {
		parent.postMessage({ pluginMessage: { 
			'type': 'create-shapes', 
			'count': count,
			'shape': selectedShape.value
		} }, '*');
	}

	window.onmessage = async (event) => {

	switch (event.data.pluginMessage.type) {

		case 'apiCredentials':
			if (event.data.pluginMessage.status == false) {
				setTimeout(function(){ 
					onboarding.classList.remove('onboarding--hidden');
				}, 500);
				setTimeout(function(){ 
					loadingScreen('off');
				}, 1000);
			} else {
				//pre populate input fields
				inputApiURL.value = event.data.pluginMessage.url;
				inputApiSecret.value = event.data.pluginMessage.secret;

				//initalize themer data
				initializeWithThemerData();
			}
			break;

		case 'addNewTheme':
			addNewTheme(event.data.pluginMessage.themeData, event.data.pluginMessage.themeCount);
			break;

	}


}

</script>


<div class="wrapper p-xxsmall">


</div>


<style>

/* Add additional global or scoped styles here */

</style>