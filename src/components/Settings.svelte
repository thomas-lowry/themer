<script>

	//import Global CSS from the svelte boilerplate
	//contains Figma color vars, spacing vars, utility classes and more
    import { GlobalCSS, Input, Label, IconKey, IconHyperlink, Button, IconButton } from 'figma-plugin-ds-svelte';
    import { loading, winWidth, apiKey, binURL, mainSection, baseURL, themeData } from '../scripts/stores.js';
    import HeaderGraphic from '../assets/header.svg';
    import IconHelp from '../assets/help.svg';

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

    //function to connect to JSONBIn and connect to a bin
    //if the url is empty, we create a new empty bin
    function saveSettings() {

        //loading state
        $loading = true;

        //if the bin url is empty, we create a new bin
        //this will send an empty json dataset to jsonBin
        if (binURL === '') {

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

        //binurl is present, make sure its a json bin url
        //this could probably be more sophisticated but I am an idiot
        } else if (!binURL.includes('https://api.jsonbin.io/v3/b/')) { 
            
            //send a message to the user with error state
            parent.postMessage({ pluginMessage: { 'type': 'notify', 'message': 'Invalid bin url.'} }, '*');

            //turn off the loading state with brief delay
            setTimeout(() => {
                $loading = false;
            }, 200);

        //if url is present we just want to connect to it and load the data
        } else {

            //detect if this is an older jsonbin url
            if (!apiURL.includes('https://api.jsonbin.io/v3/b')) {
                apiURL.replace("https://api.jsonbin.io/b","https://api.jsonbin.io/v3/b");
				console.log('old json bin url, migrating to v3');
            }

            let req = new XMLHttpRequest();

            req.onreadystatechange = () => {

                //if the request is successful (1)
                if (req.readyState == XMLHttpRequest.DONE && req.status === 200) {

                    let responseData = JSON.parse(req.responseText);
                    $themeData = responseData.record;

                    //turn off the loading state with brief delay
                    setTimeout(() => {
                        $loading = false;
                    }, 200);
                
                } else if (req.status >= 400) { //if unsuccessful (2)

                    //send user to the settings page
                    $mainSection = 'settings';
                    
                    //send error message to user
                    parent.postMessage({ pluginMessage: { 'type': 'notify', 'message': 'Connection to JSONBin failed. Double check your API key.'} }, '*');

                    //turn off the loading state with brief delay
                    setTimeout(() => {
                        $loading = false;
                    }, 500);

                    //turn off the loading state with brief delay
                    setTimeout(() => {
                        $mainSection = 'themes';
                    }, 700);

                }
            };

            req.open('GET', $binURL + '/latest', true);
            req.setRequestHeader('X-Master-Key', $apiKey);
            req.send();

        }
        
    }

    //launch the video tutorial 
    function videoTutorial() {

    }


</script>

<div class="container flex column {className}" style="width:{width};">

    <div class="header">
        <div class="get-help flex aling-content-center justify-content-center align-items-center">
            <IconButton iconName={IconHelp} on:click={() => videoTutorial() } />
        </div>
        {@html HeaderGraphic}
    </div>

    <div class="flex column flex-grow pt-xsmall pl-xsmall pr-xsmall">
        <div class="label-offset"><Label>API Key</Label></div>
        <Input iconName={IconKey} placeholder="API key from JSONBin.com" bind:value={$apiKey} class="mb-xxsmall" borders=true />

        <div class="label-offset"><Label>URL to your JSONBin</Label></div>
        <Input iconName={IconHyperlink} bind:value={$binURL} placeholder="Leave empty to auto-generate" borders=true/>
    </div>

    <div class="footer flex pr-xsmall pl-xsmall align-items-center justify-content-between">
        <Button variant='primary' on:click={() => saveSettings()} disabled={$apiKey === ''}>Save</Button>
        <Button variant='tertiary' on:click={() => resetThemer()}>Reset Themer</Button>
    </div>

    </div>


<style>

.header {
    position: relative;
    padding-top: 1px;
    box-shadow: 0px 1px 0px var(--black1);

}

.label-offset {
    margin-left: -8px;
}

.get-help {
    display: block;
    position: absolute;
    top: 5px;
    right: 4px;
}

.footer {
    border-top: 1px solid var(--black1);
    height:var(--size-xlarge);
}

.container {
    width: 100%;
    height: 100%;
}

</style>