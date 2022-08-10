<script>

	//imports
	import { GlobalCSS } from 'figma-plugin-ds-svelte';
	import ThemesAndSettings from './components/ThemesAndSettings';
	import Loading from './components/Loading';
	import CreateTheme from './components/CreateTheme';
	import { apiKey, binURL } from './scripts/stores.js';

	console.log('main ui loaded');

	//when the plugin first runs, we listen for a msg from Figma to prep populate the UI
	//with credentials for jsob bin

	window.addEventListener('message', (event) => {

		if (event.data.pluginMessage.type === 'apiCredentials') {

			console.log('plugin: data found, initialization started');

			//show the new user onboarding because no jsobbin credentials are found
			if (event.data.pluginMessage.status == false) {

				console.log('plugin: initialization: no existing data found');
				
			} else { //pre populate fields in the UI
				$binURL = event.data.pluginMessage.url;
				$apiKey = event.data.pluginMessage.secret;
			}

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
<!-- to do -->

<style>

	.container {
		width: 100%;
	}

</style>