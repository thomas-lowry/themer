<script>

	//import Global CSS from the svelte boilerplate
    import { GlobalCSS, Button } from 'figma-plugin-ds-svelte';
    import ThemeRow from './ThemeRow';
    import { themes, mainSection } from '../scripts/stores.js';
    import windowWidth from '../scripts/windowSize';
    import EmptyStateIllustation from '../assets/empty-state.svg';
    
    let className = '';
    let width = windowWidth() + 'px';
    
    export { className as class };


</script>

<div class="container flex column" style="width:{width};">

    <!-- render list of themes if they exist, else render empty state-->
    {#if $themes.length > 0}

        <!-- Theme list -->
        <div class="themelist flex-grow pt-xxsmall {className}">
            {#each $themes as theme}
                <ThemeRow themeName={theme.name}></ThemeRow>
            {/each}
        </div>

    {:else}

        <!-- Empty state -->
        <div class="flex column flex-grow align-items-center justify-content-center"> 
            {@html EmptyStateIllustation}
            <Button on:click={() => mainSection.set('settings')} variant='secondary' class="mt-xsmall mb-small">Create a theme</Button>
        </div>

    {/if}

    {#if $themes.length > 0}

        <!-- actions -->
        <div class="flex flex-no-shrink footer pt-xxsmall pb-xxsmall pr-xsmall pl-xsmall justify-content-end">
            <Button variant='primary'>Hello</Button>
        </div>

    {/if}

</div>



<style>

.container {
    height: calc(100% - 1px);
}

.themelist {
    overflow-y: auto;
}

.themelist::-webkit-scrollbar {
    width: 12px;
    background-color: transparent;
    background-image: none;
    background-repeat: repeat-x;
    background-size: 100% auto;
}

.themelist::-webkit-scrollbar-track {
    border: solid 3px transparent;
    box-shadow: inset 0 0 10px 10px transparent;
}

.themelist::-webkit-scrollbar-thumb {
    border: solid 3px transparent;
    border-radius: 6px;
    box-shadow: inset 0 0 10px 10px rgba(0,0,0,.3);
}

.footer {
    border-top: 1px solid var(--black1);
    height: calc (var(--size-xlarge)+1px);
}

</style>