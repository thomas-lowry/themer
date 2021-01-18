<script>

	import { GlobalCSS } from 'figma-plugin-ds-svelte';
	import ThemesAndSettings from './components/ThemesAndSettings';
	import Loading from './components/Loading';

</script>

<!-- loading screen -->
<Loading />


<div class="container">

	<!-- this container contains all screens -->
	<ThemesAndSettings />

</div>

<!-- create theme sequence -->



<!-- onboarding -->


<style>

	.container {
		width: 100%;
	}

</style>