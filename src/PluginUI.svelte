<script>

	//components
	import { GlobalCSS } from 'figma-plugin-ds-svelte';
	import ThemesAndSettings from './components/ThemesAndSettings';
	import Loading from './components/Loading';
	import CreateTheme from './components/CreateTheme';


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


<style>

	.container {
		width: 100%;
	}

</style>