<script>    

    //imports
    import cssVars from 'svelte-css-vars';
    import { winHeight, winWidth, onboarding, apiKey, binURL, baseURL, mainSection, loading, tutorialURL } from '../scripts/stores.js';
    import { Type, Button, Input, IconKey } from 'figma-plugin-ds-svelte';
    import Stepper from './Stepper';

    //illustrations
    import Onboarding1 from '../assets/onboarding-01-welcome.svg';
    import Onboarding2 from '../assets/onboarding-02-getting-started.svg';
    import Onboarding3 from '../assets/onboarding-03-connect.svg';
    import Onboarding4 from '../assets/onboarding-04-how-it-works.svg';
    import Onboarding5 from '../assets/onboarding-05-create-a-theme.svg';
    import Onboarding6 from '../assets/onboarding-06-applying-themes.svg';

    //function to skip onboarding
    function skip() {

        if ($apiKey === '' || $binURL === '') {
            $mainSection = 'settings';
        } else {
            $mainSection = 'themes';
        }

        $onboarding = false;

    }

    //vars
    let step = 1;
    let stepLeftPos;
    let width = $winWidth + 'px';
    let prevDisabled = true;
    let nextDisabled = false;

    //stepper event handler
    function changeStep(event) {
		//alert(event.detail.dir);

        //if the handle recieves a string (ex: 'next' or 'prev')
        if (typeof(event.detail.dir) === 'string') {

            if(event.detail.dir === 'next') { //next
                if (step < 6) {
                    step++;
                    console.log(step);
                }
            } else { //prev
                if (step > 1) {
                    step--;
                    console.log(step);
                }
            }

        } else {
            step = event.detail.dir;
        }

        //change the disabled vars
        if (step === 1) {
            prevDisabled = true;
            nextDisabled = false;
        } else if (step === 6) {
            prevDisabled = false;
            nextDisabled = true;
        } else {
            prevDisabled = false;
            nextDisabled = false;
        }

	}

    //connect to json bin and create theme
    function connect() {

        //loading state
        $loading = true;

        //if the bin url is empty, we create a new bin
        //this will send an empty json dataset to jsonBin
        if ($binURL === '') {

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
                        step = 4;
                    }, 500);

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

    }
    
    //funtion to get started
    function getStarted() {

        if ($apiKey === '' || $binURL === '') {
            $onboarding = false;
            $mainSection = 'settings';
        } else {
            $onboarding = false;
            $mainSection = 'themes';
        }

        prevDisabled = true;
        nextDisabled = false;

        //turn off the loading state with brief delay
        setTimeout(() => {
            step = 1;
        }, 200);
    }

    //ui visible
    //controls left position of the UI
    $: uiTopPos = ($onboarding) ? '0px' : $winHeight + 'px';
    $: step, stepLeftPos = '-' + ((step - 1) * $winWidth) + 'px';

    //a collection of CSS vars that are referenced to control dynamic positioning of elements in the UI
    $: styleVars = {
        uiTop: uiTopPos,
        uiLeft: stepLeftPos,
        width: width
    };

    function goToSettings() {
        $onboarding = false;
        $mainSection = 'settings';
    }

</script>

<div class="container flex column flex-grow" use:cssVars="{styleVars}">

    <div class="steps-container flex flex-grow">
        <div class="steps-carousel flex row">

            <!-- Step 1 -->
            <div class="step flex column">
                <div class="illustration">{@html Onboarding1}</div><!-- illustration -->
                <div class="flex-grow pr-xsmall pl-xsmall">
                    <!-- Heading -->
                    <div class="flex row align-items-center justify-content-between">
                        <Type size="xsmall" weight="bold">Welcome to Themer</Type>
                        <Button on:click={() => skip()} variant='tertiary'>Skip tour</Button>
                    </div>
                    <!-- content -->
                    <Type size="xsmall" class="mb-xxsmall">This onboarding guide will help you get up and running with Themer.</Type>
                    <Type size="xsmall"><a href="http://www.youtube.com" target="_blank">Watch the tutorial</a> which will walk you through how to setup the plugin, or skip ahead to the <span on:click={() => goToSettings()} class="link">settings screen</span>, if you already have a config.</Type>
                </div>
            </div>

            <!-- Step 2 -->
            <div class="step flex column">
                <div class="illustration">{@html Onboarding2}</div><!-- illustration -->
                <div class="flex-grow pr-xsmall pl-xsmall">
                    <!-- Heading -->
                    <div class="flex row align-items-center justify-content-between">
                        <Type size="xsmall" weight="bold">Getting started</Type>
                        <Button on:click={() => skip()} variant='tertiary'>Skip tour</Button>
                    </div>
                    <!-- content -->
                    <Type size="xsmall">Themer uses an external data source called <a href="http://www.jsonbin.io" target="_blank">jsonbin.io</a> to store data about your themes. This enables you to use it across files, and also share your theme configuration with teammates.</Type>
                </div>
            </div>

            <!-- Step 3 -->
            <div class="step flex column">
                <div class="illustration">
                    <div class="api-key-input flex column pl-xsmall pr-xsmall">
                        <Input iconName={IconKey} placeholder="API key from JSONBin.com" bind:value={$apiKey} class="mb-xxsmall flex-grow" borders=true />
                        <div class="button-fix"><Button variant='primary' on:click={() => connect()} disabled={$apiKey === ''}>Save</Button></div>
                    </div>
                    {@html Onboarding3}
                </div><!-- illustration -->
                <div class="flex-grow pr-xsmall pl-xsmall">
                    <!-- Heading -->
                    <div class="flex row align-items-center justify-content-between">
                        <Type size="xsmall" weight="bold">Setup JSONBin</Type>
                        <Button on:click={() => skip()} variant='tertiary'>Skip tour</Button>
                    </div>
                    <!-- content -->
                    <Type size="xsmall" class="mb-xxsmall">Go to <a href="{$tutorialURL}" target="_blank">jsonbin.io</a>, here you can sign in with different login partners. Once in, retrieve your <a href="https://jsonbin.io/app/api-keys" target="_blank">API Key.</a></Type>
                    <Type size="xsmall" class="">Paste your API Key above and press connect to continue.</Type>
                </div>
            </div>

            <!-- Step 4 -->
            <div class="step flex column">
                <div class="illustration">{@html Onboarding4}</div><!-- illustration -->
                <div class="flex-grow pr-xsmall pl-xsmall">
                    <!-- Heading -->
                    <div class="flex row align-items-center justify-content-between">
                        <Type size="xsmall" weight="bold">How it works</Type>
                        <Button on:click={() => skip()} variant='tertiary'>Skip tour</Button>
                    </div>
                    <!-- content -->
                    <Type size="xsmall" class="mb-xxsmall">Themer allows you to create sets of styles (themes) that can be applied to your designs for easy theme switching.</Type>
                    <Type size="xsmall">For it to work, styles must share the same names in each theme.</Type>
                </div>
            </div>

            <!-- Step 5 -->
            <div class="step flex column">
                <div class="illustration">{@html Onboarding5}</div><!-- illustration -->
                <div class="flex-grow pr-xsmall pl-xsmall">
                    <!-- Heading -->
                    <div class="flex row align-items-center justify-content-between">
                        <Type size="xsmall" weight="bold">Creating themes</Type>
                        <Button on:click={() => skip()} variant='tertiary'>Skip tour</Button>
                    </div>
                    <!-- content -->
                    <Type size="xsmall">Themes can be created from <strong>published</strong> color, text, and effect styles. The “create theme” wizard will help you collect styles from your file and associate them with a theme name.</Type>
                </div>
            </div>

            <!-- Step 6 -->
            <div class="step flex column">
                <div class="illustration">{@html Onboarding6}</div><!-- illustration -->
                <div class="flex-grow pr-xsmall pl-xsmall">
                    <!-- Heading -->
                    <div class="flex row align-items-center justify-content-between">
                        <Type size="xsmall" weight="bold">Applying themes</Type>
                        <Button on:click={() => skip()} variant='tertiary'>Skip tour</Button>
                    </div>
                    <!-- content -->
                    <Type size="xsmall" class="mb-xxsmall">With themes created: make a selection, choose a theme, and press the Apply button. Any styles in the theme will be applied when matched.</Type>
                    <Button variant='primary' class="flex-grow align-item justify-content-center" on:click={getStarted}>Get started</Button>
                </div>
            </div>

        </div>
    </div>

    <Stepper bind:step={step} bind:prevDisabled={prevDisabled} bind:nextDisabled={nextDisabled} on:message={changeStep}/>

</div>

<style>

.container {
    position: absolute;
    top: var(--uiTop);
    left: 0;
    height: 100%;
    width: 100%;
    background-color: var(--figma-color-bg);
    transition: top 200ms ease-out;
    z-index: 100;
}

.steps-container {
    position: relative;
    overflow: hidden;
}

.steps-carousel {
    position: absolute;
    top: 0;
    left: var(--uiLeft);
    transition-property: left;
    transition-timing-function: ease-in-out;
    transition-duration: 200ms;
    height: 100%;
}

.step {
    height: 100%;
    width: var(--width);
    flex-shrink: 0;
}

.illustration {
    position: relative;
    border-bottom: 1px solid var(--figma-color-border);
}

.api-key-input {
    position: absolute;
    top: 24px;
    left: 0;
    width: 100%;
}

.button-fix {
    flex-basis: auto;
    margin: 0 auto 0 auto;
}

a, .link {
    color: var(--figma-color-text-brand);
    cursor: pointer;
}
a:visited {
    color: var(--figma-color-text-brand);
}

</style>