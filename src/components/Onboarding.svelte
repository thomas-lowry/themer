<script>    

    //imports
    import cssVars from 'svelte-css-vars';
    import { winHeight, onboarding } from '../scripts/stores.js';

    //ui visible
    //controls left position of the UI
    $: uiTopPos = ($onboarding) ? '0px' : $winHeight + 'px';

    //a collection of CSS vars that are referenced to control dynamic positioning of elements in the UI
    $: styleVars = {
        uiTop: uiTopPos
    };

</script>

<div class="container flex column" use:cssVars="{styleVars}">

    <button on:click={() => $onboarding = false}>Skip Tour...</button>

</div>

<style>

.container {
    position: absolute;
    top: var(--uiTop);
    left: 0;
    width: 100%;
    height: calc(100% - 2px);
    background-color: var(--white);
    transition: top 200ms ease-out;
    z-index: 100;
}

</style>