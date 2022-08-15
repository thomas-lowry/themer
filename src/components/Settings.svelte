<script>

	//import Global CSS from the svelte boilerplate
	//contains Figma color vars, spacing vars, utility classes and more
    import { GlobalCSS, Input, Label, IconKey, IconHyperlink, Button } from 'figma-plugin-ds-svelte';
    import { loading, winWidth, apiKey, binURL, mainSection, baseURL } from '../scripts/stores.js';
    import HeaderGraphic from '../assets/header.svg';

    let className = '';
    let width = $winWidth + 'px';
    export { className as class };

    let buttonDisabled = true;

    //function to reset Themer
    //this function needs to reset values of key variables
    //and also pass a msg to Figma to clear the API and BIN values
    function resetThemer() {
    
        //immediately turn on the loading state
        $loading = true;

        //reset onboarding data in Figma api
        parent.postMessage({ pluginMessage: { 'type': 'reset' } }, '*');

    }

    //function to connect to JSONBIn and create a new bin
    // we will run this function with save button is pressed
    function saveSettings() {

        //loading state
        $loading = true;

        //JSON bin needs an empty array for it to be valid
        let data = '[{}]';

        //connect to JSON bin and create the bin
        let req = new XMLHttpRequest();

        //waits for the request
        req.onreadystatechange = () => {
            if (req.readyState == XMLHttpRequest.DONE && req.status === 200) {

                let responseData = JSON.parse(req.responseText);

                //get the data about the new bin
                let binId = responseData.metadata.id;
                $binURL = $baseURL + binId;

                //send the data to figma to save to client storage + success msg
                parent.postMessage({ pluginMessage: { 'type': 'saveCredentials', 'apiKey': $apiKey, 'binURL': $binURL} }, '*');

                //turn off the loading state with brief delay
                setTimeout(() => {
                    $loading = false;
                }, 200);

                //turn off the loading state with brief delay
                setTimeout(() => {
                    $mainSection = 'themes';
                }, 700);


            } else if (req.status >= 400) {

                //send error message to user
                parent.postMessage({ pluginMessage: { 'type': 'notify', 'message': 'Connection to JSONBin failed. Double check your API key.'} }, '*');

                //turn off the loading state with brief delay
                setTimeout(() => {
                    $loading = false;
                }, 200);
            }
        };

        //make the request to JSON bin to create a bin to store theme data
        req.open('POST', 'https://api.jsonbin.io/v3/b', true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.setRequestHeader('X-Master-Key', $apiKey);
        req.setRequestHeader('X-Bin-Name', 'Themer Figma Plugin');
        req.send(data);
        
    }




</script>

<div class="container flex column {className}" style="width:{width};">

    <div class="header">
        {@html HeaderGraphic}
    </div>

    <div class="flex column flex-grow pt-xxxsmall pl-xsmall pr-xsmall pb-xsmall justify-content-center">
        <Label>API Key</Label>
        <Input iconName={IconKey} placeholder="API key from JSONBin.com" bind:value={$apiKey} class="mb-xxsmall" borders=true />

        <Label>URL to your JSONBin</Label>
        <Input iconName={IconHyperlink} bind:value={$binURL} placeholder="Leave empty to auto-generate" borders=true/>
    </div>

    <div class="flex pb-xxsmall pr-xsmall pl-xsmall justify-content-between">
        <Button variant='tertiary' on:click={() => resetThemer()}>Reset Themer</Button>
        <Button variant='primary' on:click={() => saveSettings()} disabled={$apiKey === ''}>Save</Button>
    </div>

    </div>


<style>

.header {
    padding-top: 1px;
    box-shadow: 0px 1px 0px var(--black1);

}

.container {
    width: 100%;
    height: 100%;
}

</style>