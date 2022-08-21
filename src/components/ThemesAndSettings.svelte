<script>

    import { GlobalCSS } from 'figma-plugin-ds-svelte';
	import ThemeList from './ThemeList';
	import Settings from './Settings';
    import TabBar from './TabBar';
    import { mainSection, winWidth } from '../scripts/stores.js';

    let position = 0;

    $: if($mainSection === 'settings') {
        position = '-' + (1 * $winWidth) + 'px';
    } else {
        position = '0px';
    }

</script>


<div class="container flex column">
    <TabBar />
    <div class="screens flex flex-grow">
        <div class="screen-carousel flex flex-grow" style="left: {position}">
            <ThemeList />
            <Settings />
        </div>
    </div>
</div>

<style>

.container  {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
}

.screens {
    position: relative;
    height: 100%;
}

.screen-carousel {
    position: absolute;
    top: 0;
    left: 0;
    transition-property: left;
    transition-timing-function: ease-in-out;
    transition-duration: 200ms;
    height: 100%;
}

</style>