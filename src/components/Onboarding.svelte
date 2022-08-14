<script>    

    //imports
    import cssVars from 'svelte-css-vars';
    import { winWidth, onboarding } from '../scripts/stores.js';

    //ui visible
    //controls left position of the UI
    $: uiLeftPos = ($onboarding) ? '0px' : $winWidth + 'px';

    //a collection of CSS vars that are referenced to control dynamic positioning of elements in the UI
    $: styleVars = {
        uiLeft: uiLeftPos
    };

</script>

<div class="container flex column" use:cssVars="{styleVars}">

    <button on:click={() => $onboarding = false}>Skip Tour...</button>

</div>

<style>

.container {
    position: absolute;
    top: 0;
    left: var(--uiLeft);
    width: 100%;
    height: calc(100% - 2px);
    background-color: var(--white);
    transition: left 200ms ease-out;
    z-index: 100;
}

</style>