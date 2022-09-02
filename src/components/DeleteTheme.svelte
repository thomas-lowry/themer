<script>    

    //imports
    import cssVars from 'svelte-css-vars';
    import { winHeight, deleteTheme, themeToDelete, selectedTheme, themeData, loading, binURL, apiKey, reOrdered } from '../scripts/stores.js';
    import { Button, Type } from 'figma-plugin-ds-svelte';

    //ui visible
    //controls left position of the UI
    $: uiTopPos = ($deleteTheme) ? '0px' : $winHeight + 'px';

    //a collection of CSS vars that are referenced to control dynamic positioning of elements in the UI
    $: styleVars = {
        uiTop: uiTopPos
    };

    //function to delete a theme
    function removeTheme() {

        //turn on the loading state
        $loading = true;

        //create a new var that does not contain the chosen theme
        let updatedArray = $themeData.filter(function(style) { return style.theme != $themeToDelete; });
        
        //check to see if it is empty, if so, make valid empty array for jsonBin
        if (updatedArray.length === 0) {
            updatedArray = [{}];
        }
        
        //stringify the json to go to jsonBin
        updatedArray = JSON.stringify(updatedArray);

        //push new data to JSONBin
        //next we send this brand new array to jsonBin
        let req = new XMLHttpRequest();

        req.onreadystatechange = () => {

            //if the request is successful
            if (req.readyState == XMLHttpRequest.DONE && req.status === 200) {

                //parse the respond data as a JSON array, update them $themeDate
                let responseData = JSON.parse(req.responseText);
                $themeData = responseData.record;
                $reOrdered = false;
            
            } else if (req.status >= 400) { //if unsuccessful

                //send error message to user
                parent.postMessage({ pluginMessage: { 'type': 'notify', 'message': 'There was an error deleting the theme. Double check your API key.'} }, '*');

                //turn off the loading state with brief delay
                setTimeout(() => {
                    $loading = false;
                }, 400);

            }
        };

        req.open('PUT', $binURL, true);
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader('X-Master-Key', $apiKey);
        req.setRequestHeader('X-Bin-Versioning', false);
        req.send(updatedArray);

        //reset the theme to delete, and ui state
        $themeToDelete = '';
        $deleteTheme = false;
        $selectedTheme = '';

        //turn off the loading state with brief delay
        setTimeout(() => {
            $loading = false;
        }, 1000);

    }

</script>

<div class="container flex column" use:cssVars="{styleVars}">

    <div class="p-xsmall">

        <!-- Heading -->
        <Type size="medium" weight="medium" class="mb-xsmall">Delete theme</Type>

        <!-- Message to user -->
        <Type size="xsmall" class="mb-xxsmall">Are you sure you want to delete the <strong>{$themeToDelete}</strong> theme?</Type>

        <!-- Warning -->
        <Type size="xsmall" color="--figma-color-text-secondary"  class="mb-small">You cannot undo this action.</Type>

        <!-- Actions -->
        <div class="flex justify-content-start">
            <Button on:click={() => { $deleteTheme = false, $themeToDelete = '' }} variant="secondary" class="mr-xsmall">Cancel</Button>
            <Button on:click={() => { removeTheme() }} variant="primary" destructive=true>Delete theme</Button>
        </div>

    </div>

</div>

<style>

.container {
    position: absolute;
    top: var(--uiTop);
    left: 0;
    width: 100%;
    height: calc(100% - 2px);
    background-color: var(--figma-color-bg);
    transition: top 200ms ease-out;
    z-index: 100;
}

</style>