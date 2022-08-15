<script>

    //imports
    import { Button, Icon, IconButton, IconBack, IconTheme, Switch, Radio, Checkbox, Input, Type, Label } from 'figma-plugin-ds-svelte';
    import cssVars from 'svelte-css-vars';
    import { step, styleSource, styleTypeColor, styleTypeText, styleTypeEffect, winWidth, createThemeUI, loading, themeData, binURL, apiKey, mainSection } from '../scripts/stores.js';

    //var to store the raw style data we get back from Figma before processing it into theme data to store in JSON BIn
    //the UI will need to populate the "theme" property of each object depending on what the user decides
    let rawStyleData;

    //number of steps in the create theme process, easy to add more later
    let totalSteps = 3; 

    //counter for styles that do not have themes
    let numOfThemelessItems = 0;
    
    //theme name
    let newThemeName; //stores name of theme, only use this value if the user does not use foldered/prefixed names
    let invalidThemeName = false; //this will be true if the name of the theme is invalid (currently only checks for duplicate theme names)
    let errorMessage; //if there is an error with theme name, this stores the msg to display under the theme name input field
    let themeNamePlaceholder = "Unique theme name";


    //Validates the name of the theme
    function themeNameValidate() {
        // if(newThemeName != null) {
        //     let match = $themeData.find(theme => newThemeName.toLowerCase().trim() === theme.theme.toLowerCase().trim());
        //     if(match != undefined){
        //         invalidThemeName = false;
        //         errorMessage = 'A theme with this name already exists. Continuing will modify the existing theme.'
        //     } else{
        //         invalidThemeName = false;
        //     }
        // }
    }
    $: newThemeName, themeNameValidate(); //run this function every time the theme name changes 
    $: prefixedStyleNames, themeNameInput();
    
    //runs when prefixed style name checkbox changes valye
    //if enabled, will update the placeholder text when the field is disabled
    function themeNameInput() {
        if (prefixedStyleNames === true) {
            newThemeName = '';
            themeNamePlaceholder = uniqueThemeNamesFromPrefixes.join(', ');
        } else {
            themeNamePlaceholder = "Unique theme name";
        }
    }

    //this option determines if the user wants to use prefixed style names
    //default is set to false, it is bound to the checked value of the checkbox
    let prefixedStyleNames = false;

    //this var determines if there are prefixed style names available
    //this won't be determined until trying to advance from step 2 - 3 where we request style data from the plugin code
    //default is true so this option will be disabled unless available
    let prefixedNamesUnavailable = true;

    //unique theme names
    let uniqueThemeNamesFromPrefixes = [];


    //ui visible
    //controls left position of the UI
    $: uiLeftPos = ($createThemeUI) ? '0px' : $winWidth + 'px';
    
    //reset the UI
    //this runs after the create theme flow,
    //or when the user returns back to the theme list
    function resetCreateThemeUI() {
        $step = 1;
        $styleSource = 'local';
        $styleTypeColor = true; 
        $styleTypeText = false;
        $styleTypeEffect = false;
        newThemeName = null;
        themeNamePlaceholder = "Unique theme name";
        invalidThemeName = false;
        uniqueThemeNamesFromPrefixes = [];
        prefixedStyleNames = false;
        prefixedNamesUnavailable = false;
        numOfThemelessItems = 0;
        rawStyleData = [];

    }
    $: $createThemeUI, resetCreateThemeUI(); //this var controls visibility of the create theme UI, run the reset when this value changes


    //a collection of CSS vars that are referenced to control dynamic positioning of elements in the UI
    $: styleVars = {
        stepLabelTop: -Math.abs(($step - 1) * 40) + 'px',
        stepContainerLeft: -Math.abs(($step - 1) * $winWidth) + 'px',
        uiLeft: uiLeftPos
    };


    //Reactive delcarations for a number of variable changes
    //that can impact the next/complete disabled state
    $: $step, validateButton();
    $: $styleTypeColor, validateButton();
    $: $styleTypeText, validateButton();
    $: $styleTypeEffect, validateButton();
    $: newThemeName, validateButton();
    $: prefixedStyleNames, validateButton();


    //next / primary action button
    // do different things based on step 1, 2, or 3
    function nextStep() {

        if ($step === 1) {
            $step = 2;
        } else if ($step === 2) {
            getStyleData();
        } else if ($step === 3) {
            createTheme();
        }
    }


    //nextButtonValidator
    //this is a function that will bind the disabled value of the next button to a number of factors
    //doing this as a function because being able to move next is based on a lot of factors
    //that are unique to each step
    let buttonDisabled;
    function validateButton() {

        if ($step === 1) {
            
            if ($styleTypeColor === false && $styleTypeText === false && $styleTypeEffect === false) {
                buttonDisabled = true;
            } else {
                buttonDisabled = false;
            }

        } else if ($step === 2) {

            buttonDisabled =  false;

        } else if ($step === 3) {

            if (invalidThemeName === true || newThemeName === '' || newThemeName === null || newThemeName === undefined) {
                buttonDisabled =  true;
            } else {
                buttonDisabled =  false;
            }

            if (prefixedStyleNames === true) {
                buttonDisabled =  false;
            }

        }
    }

    //makes request to Figma plugin API to get style data
    function getStyleData() {

        //this an object of all of the styles types
        //and if the user chose to include them as part of theme
        let styleTypes = {
            color: $styleTypeColor,
            text: $styleTypeText,
            effect: $styleTypeEffect
        }

        //display loading state while we wait for the data to be retrieved
        $loading = true;

        //send message to plugin api
        parent.postMessage({ pluginMessage: { 'type': 'createTheme', 'styleTypes': styleTypes, 'styleSource': $styleSource } }, '*');

    }


    //This function will run when the UI recieves data about the available styles back from the plugin code
    function validateStyleData(styles, publishedStatus) {

        rawStyleData = styles;

        console.log('raw:', styles);

        //first, we check if there are any styles
        //if there are none, there is no point in proceeding to step 3
        //tell the user by passing a msg back to the plugin
        //return to step 2
        if (styles.length === 0) {

            let errorMsg;
            
            //customize error message based type the source of styles selected
            if ($styleSource === 'local') {
                errorMsg = 'There are no local styles in this document';
            } else if ($styleSource === 'selection') {
                errorMsg = 'There are no styles in the selection';
            } else {
                errorMsg = 'There are no styles on the current page';
            }

            //tell the user there are no styles
            //add a slight 1s delay before disabling the loading state so it does not feel jarring
            setTimeout(() => {
                parent.postMessage({ pluginMessage: { 'type': 'notify', 'message': errorMsg } }, '*');
                $loading = false;
            }, 1000);

            //revert to step 2
            $step = 2;

        } else if(publishedStatus != 'all') {

            let errorMsg;

            //customize error message based on published status
            if (publishedStatus === 'some') {
                errorMsg = 'Some styles are not published. Publish them to continue.'
            } else {
                errorMsg = 'None of the styles are published. Publish them to continue.'
            }

            //tell the user that the styles need to be published
            //add a slight 1s delay before disabling the loading state so it does not feel jarring
            setTimeout(() => {
                parent.postMessage({ pluginMessage: { 'type': 'notify', 'message': errorMsg } }, '*');
                $loading = false;
            }, 1000);

            //revert to step 2
            $step = 2;

        } else {

            //determine if prefixes are present
            //if they are, put the prefix only into a new array
            //if there is a duplicate, don't push it
            //this way we can use the length of the array to determine amount of unqiue themes that will be created
            styles.forEach(style => {
                if (style.name.includes('/')) {
                    let prefix = style.name.split('/');
                    if (!uniqueThemeNamesFromPrefixes.some(themePrefix => themePrefix === prefix[0])) {
                        uniqueThemeNamesFromPrefixes.push(prefix[0]);
                    }
                } else {
                    numOfThemelessItems++;
                }
            });


            //this will determine whether or not we enable the checkbox to split up prefixed theme names
            //if all styles have a corresponding theme, show it
            //if they do not, keep this option disabled
            if (uniqueThemeNamesFromPrefixes.length >= 2) {

                console.log('uniquePRef: ', uniqueThemeNamesFromPrefixes);

                //if all styles have an associated theme, we can enable this option
                //if there are outliers, we just allow the user to specify their own theme name
                //keeping the checkbox disabled
                if (numOfThemelessItems === 0) {
                    prefixedNamesUnavailable = false;
                } else {
                    prefixedNamesUnavailable = true;
                }

            } else {
                prefixedNamesUnavailable = true;
            }

            //advance to step 3
            $step = 3;

            //turn off the loading screen
            setTimeout(function(){ 
                $loading = false;
            }, 1000);

        }

    }

    //create a theme, and send it to JSON Bin
    function createTheme() {

        //make sure the loading state is turned on
        $loading = true;

        //populate a var with the existing theme data
        let combinedThemeData = $themeData;

        //remove the empty object if there is no existing data
        //this is because we need to have at least one object in the array
        //for the array to be valid json @ jsonBin
        if (JSON.stringify($themeData) === '[{}]') {
            combinedThemeData = [];
        }

        if (rawStyleData) {

            //remove the id attribute, we don't need to save it
            //add the appropriate theme name
            //push the style into the existing theme data array
            rawStyleData.forEach(style => {
                delete style.id;

                if (prefixedStyleNames) {
                    if (style.name.includes('/')) {
                        let prefix = style.name.split('/');
                        style.theme = prefix[0];
                    }
                } else {
                    style.theme = newThemeName;
                }

                combinedThemeData.push(style);
            });

            //reverse the array so we start with newer records
            combinedThemeData = combinedThemeData.reverse();

            console.log('pre clean data:', combinedThemeData);

            //next we check for duplicates
            //duplicate = two entries with same key and theme name
            //if there is a duplicate, we will keep the one with the bigger index
            function isDuplicate(style, arr) {
                return arr.some(x => (style.key == x.key) && (style.theme == x.theme))
            }

            //a new array that we know is clean of duplicates
            let cleanData = [];
            for (const style of combinedThemeData) {
                if (!isDuplicate(style, cleanData)) { cleanData.push(style) }
            }

            console.log('clean data: ', cleanData);

            //stringify the data to send
            cleanData = JSON.stringify(cleanData);

            //next we send this brand new array to jsonBin
            let req = new XMLHttpRequest();

            req.onreadystatechange = () => {

                //if the request is successful
                if (req.readyState == XMLHttpRequest.DONE && req.status === 200) {

                    //parse the respond data as a JSON array, update them $themeDate
                    let responseData = JSON.parse(req.responseText);
                    $themeData = responseData.record;

                    //reset create theme UI for the next time
                    $createThemeUI = false;

                    //go to the theme list
                    $mainSection = 'themes';

                    //turn off the loading state with brief delay
                    setTimeout(() => {
                        $loading = false;
                    }, 200);
                
                } else if (req.status >= 400) { //if unsuccessful (2)

                    //reset create theme UI
                    $createThemeUI = false;

                    //send user to the settings page
                    $mainSection = 'settings';
                    
                    //send error message to user
                    parent.postMessage({ pluginMessage: { 'type': 'notify', 'message': 'Connection to JSONBin failed. Double check your API key.'} }, '*');

                    //turn off the loading state with brief delay
                    setTimeout(() => {
                        $loading = false;
                    }, 200);

                }
            };

            req.open('PUT', $binURL, true);
            req.setRequestHeader("Content-Type", "application/json");
            req.setRequestHeader('X-Master-Key', $apiKey);
            req.setRequestHeader('X-Bin-Versioning', false);
            req.send(cleanData);

        } else {
            //tell the user there was an error
            parent.postMessage({ pluginMessage: { 'type': 'notify', 'message': 'There was a problem creating the theme(s).' } }, '*');
        }
    }



    // listen for msgs from plugin code
	window.onmessage = async (event) => {
		if (event.data.pluginMessage.type === 'createStyleData') {
            console.log('fresh from plugin:', event.data.pluginMessage.styles)
			validateStyleData(event.data.pluginMessage.styles, event.data.pluginMessage.publishedStatus);
		}
	}

</script>

<div class="container flex column" use:cssVars="{styleVars}">

    <!-- Header -->
    <div class="header flex row align-items-center">
        <IconButton on:click={() => $createThemeUI = false} iconName={IconBack} class="ml-xxxsmall mr-xxxsmall"/>
        <Type color="black8">Create new theme</Type>
    </div>

    <!-- Step -->
    <div class="step flex row align-items-center">
        <div class="step__number flex justify-content-center align-items-center">
            {$step}
        </div>

        <div class="step__labels">
            <div class="step__label-container" use:cssVars="{styleVars}">
                <div class="step__label">Choose style types to include</div>
                <div class="step__label">Choose a style source</div>
                <div class="step__label">Give your theme a unique name</div>
            </div>
        </div>

    </div>


    <!-- Content -->
    <div class="content">

        <div class="content__container" use:cssVars="{styleVars}">

            <!-- Step 1 -->
            <div class="content__step">
                <Switch bind:checked={$styleTypeColor}>Color styles</Switch>
                <Switch bind:checked={$styleTypeText}>Text styles</Switch>
                <Switch bind:checked={$styleTypeEffect}>Effect styles</Switch>
            </div>

            <!-- Step 2 -->
            <div class="content__step">
                <Radio bind:group={$styleSource} value="local">Local styles</Radio>
                <Radio bind:group={$styleSource} value="selection">Styles in current selection</Radio>
                <Radio bind:group={$styleSource} value="page">Styles on current page</Radio>
            </div>

            <!-- Step 3 -->
            <div class="content__step">
                <div class="flex column pl-xxsmall pr-xxsmall mb-xxsmall">
                    <Type class="pt-xxsmall pb-xxsmall">Theme name</Type>
                    <Input iconName={IconTheme} bind:placeholder={themeNamePlaceholder} borders=true bind:invalid={invalidThemeName} bind:errorMessage={errorMessage} bind:value={newThemeName} bind:disabled={prefixedStyleNames}/> 
                </div>
                <div class="flex column">
                    <Checkbox bind:checked={prefixedStyleNames} bind:disabled={prefixedNamesUnavailable}>Create multiple themes using prefixed style names</Checkbox>
                </div>

                {#if prefixedStyleNames === true}
                    <div class="flex column pl-medium">
                    <Type color="blue">
                        Themer will create {uniqueThemeNamesFromPrefixes.length} 
                        {#if uniqueThemeNamesFromPrefixes.length > 1}
                            themes
                        {:else}
                            theme
                        {/if}
                        from prefixed style names.
                    </Type>
                    </div>
                {/if}
            </div>

        </div>

    </div>


    <!-- Footer -->
    <div class="footer flex row justify-content-between align-items-center pl-xsmall pr-xsmall">
        <ul class="pager flex row">
            <li class="pager__dot" class:pager__dot--active="{$step === 1}" on:click={() => { if($step === 2 || $step === 3) { $step = 1 }}}></li>
            <li class="pager__dot" class:pager__dot--active="{$step === 2}" on:click={() => { if($step === 3) { $step = 2 }}}></li>
            <li class="pager__dot" class:pager__dot--active="{$step === 3}"></li>
        </ul>
        <Button on:click={nextStep} bind:disabled={buttonDisabled}>
            {#if $step === 3}
                Create theme
            {:else}
                Next
            {/if}
        </Button>
    </div>

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

.header {
   height: 42px;
   box-shadow: 0px 1px 0px var(--black1);
}

.content {
    flex: 1;
    position: relative;
    overflow: hidden;
}

.content__container {
    position: absolute;
    display: flex;
    flex-direction: row;
    top: 0;
    left: var(--stepContainerLeft);
    width: 100%;
    height: 100%;
    transition: left 200ms ease-out;
}

.content__step {
    width: 100%;
    height: 100%;
    flex-shrink: 0;
    padding: var(--size-xxsmall);
}

.step {
   height: 40px;
   box-shadow: 0px 2px 0px var(--black1);
   box-shadow: 0px -1px 0px var(--black1);
   padding-left: 14px;
   padding-right: 16px;
   position: relative;
   background-color: #EDF5FA;
}

.step__number {
    width: 16px;
    height: 16px;
    font-family: var(--font-stack);
    font-size: var(--font-size-xsmall);
    line-height: var(--font-line-height);
    font-weight: var(--font-weight-bold);
    color: var(--white);
    background-color: var(--blue);
    border-radius: 8px;
    margin-right: 10px;
}

.step__labels {
    flex: 1;
    height: 100%;
    overflow: hidden;
    position: relative;
}

.step__label-container {
    position: absolute;
    top: var(--stepLabelTop);
    left: 0;
    transition: top 200ms ease-out;
}

.step__label {
    font-family: var(--font-stack);
    font-size: var(--font-size-xsmall);
    line-height: var(--font-line-height);
    font-weight: var(--font-weight-normal);
    color: var(--black8);
    height: 40px;
    display: flex;
    align-items: center;
}

.footer {
    box-shadow: 0px -1px 0px var(--black1);
    height: 48px;
}


.pager {
    list-style: none;
    margin: 0;
    padding: 0;
}

.pager__dot {
    width: 8px;
    height: 8px;
    margin-right: 8px;
    background-color: var(--black1);
    border-radius: 4px;
}

.pager__dot--active {
    background-color: var(--blue);
}


</style>