<script>

	//imports
	import { GlobalCSS } from 'figma-plugin-ds-svelte';
	import ThemesAndSettings from './components/ThemesAndSettings';
	import Loading from './components/Loading';
	import CreateTheme from './components/CreateTheme';
	import Onboarding from './components/Onboarding';
	import { loading, apiKey, binURL, mainSection, onboarding } from './scripts/stores.js';

	//display the loading screen first
	$loading = true;


	//when the plugin first runs, we listen for a msg from Figma to prep populate the UI
	//with credentials for jsob bin
	window.addEventListener('message', (event) => {

		switch(event.data.pluginMessage.type) {

			//getting API credentials saved to the Figma Client
			case 'apiCredentials':

				//show the new user onboarding because no jsobbin credentials are found
				if (event.data.pluginMessage.status == false) {

					$onboarding =  true;
					$mainSection = 'settings';

					//turn off the loading state with brief delay
					setTimeout(() => {
						$loading = false;
					}, 200);

				} else { //pre populate fields in the UI

					console.log('got data!');

					$binURL = event.data.pluginMessage.binURL;
					$apiKey = event.data.pluginMessage.apiKey;

					//we will then attempt to connect to JSON bin to retrieve the themes

					//turn off the loading state with brief delay
					setTimeout(() => {
						$loading = false;
					}, 200);
					
				}

				break;

			//When Themer is reset, we send a msg to clear the api key and url
			//This is called from the settings screen
			//once successful, the plugin code sends a msg back
			//we will then make sure the data is empty and show the first time user onboarding
			case 'reset':

				//clear previous values
				$apiKey = '';
				$binURL = '';

				//re-anable onboarding flow
				$onboarding = true;

				//disable loading (with slight delay)
				setTimeout(() => {
					$loading = false;
				}, 200);

				break;

			//after an attempt to create a brand new bin
			case 'binCreated':

				//disable loading (with slight delay)
				setTimeout(() => {
					$loading = false;
				}, 200);

				break;
		}
	});

</script>

<!-- loading screen -->
<Loading />


<div class="container">

	<!-- this container contains all screens -->
	<ThemesAndSettings />

</div>

<!-- create theme sequence -->
<CreateTheme />


<!-- onboarding -->
<Onboarding />

<style>

	.container {
		width: 100%;
	}

</style>