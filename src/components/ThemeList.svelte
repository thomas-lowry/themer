<script>

	//import Global CSS from the svelte boilerplate
    import { GlobalCSS, Button, SelectMenu } from 'figma-plugin-ds-svelte';
    import DragList from './DragList';
    import ThemeRow from './ThemeRow';
    import { themeData, winWidth, createThemeUI, selectedTheme } from '../scripts/stores.js';
    import EmptyStateIllustation from '../assets/empty-state.svg';
    
    let className = '';
    let width = $winWidth + 'px';
    //export { className as class };

    let themes = [];

    //reactive function that will run every time there is a change to theme data
    $: $themeData, themeDataChange();

    //handle changes to the theme data
    function themeDataChange() {

        if (JSON.stringify($themeData) != '[{}]') {

            themes = [];
            console.log('there is data');

            //next we will populate an array of each individual
            let uniqueThemes = [...new Set($themeData.map(item => item.theme))];

            //turn this into an array of objects where each theme as an id
            uniqueThemes.forEach((theme, index) => {
                let item = {
                    id: index,
                    theme: theme
                }
                themes.push(item);
            });
        } else {
            themes = [];
        }
    }

    //update the theme ordering after the drop action
    function onDrop(newItems) {
		themes = newItems;
	}

    let themeIsSelected = false;
    $: $selectedTheme, $selectedTheme ? themeIsSelected=false : themeIsSelected=true;

    //apply theme
    function applyTheme() {
    
    }

</script>

<div class="container flex column" style="width:{width};">

    <!-- render list of themes if they exist, else render empty state-->
    {#if themes.length >= 1 && themes[0].theme != ''}

            <div class="themelist flex-grow {className}">
                <DragList itemsData={themes} itemComponent={ThemeRow} onDrop={onDrop}/>
            </div>

            <div class="footer flex row justify-content-end pt-xxsmall pb-xxsmall pr-xsmall pl-xsmall">
                <Button on:click={() => applyTheme()} variant='primary' bind:disabled={themeIsSelected} class="flex-grow align-item justify-content-center">Apply to selection</Button>
            </div>

    {:else}

        <!-- Empty state -->
        <div class="flex column flex-grow align-items-center justify-content-center"> 
            {@html EmptyStateIllustation}
            <Button on:click={() => $createThemeUI = true} variant='secondary' class="mt-xsmall mb-small">Create a theme</Button>
        </div>

    {/if}

</div>



<style>

.container {
    height: calc(100% - 2px);
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