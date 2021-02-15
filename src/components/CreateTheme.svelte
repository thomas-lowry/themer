<script>

    //imports
    import { Button, Icon, IconButton, IconBack, IconTheme, Switch, Radio, Checkbox, Input, Type, Label } from 'figma-plugin-ds-svelte';
    import cssVars from 'svelte-css-vars';
    import { step, styleSource, styleTypeColor, styleTypeText, styleTypeEffect, winWidth, createThemeUI, loading, themes } from '../scripts/stores.js';
    
    let totalSteps = 3; //number of steps in the create theme process, easy to add more later
    
    //theme name
    let newThemeName; //stores name of theme, only use this value if the user does not use foldered/prefixed names
    let invalidThemeName = false; //this will be true if the name of the theme is invalid (currently only checks for duplicate theme names)
    let errorMessage; //if there is an error with theme name, this stores the msg to display under the theme name input field

    //Validates the name of the theme
    function themeNameValidate() {
        if(newThemeName != null) {
            let match = $themes.find(theme => newThemeName.toLowerCase().trim() === theme.name.toLowerCase().trim());
            if(match != undefined){
                invalidThemeName = true;
                errorMessage = 'Theme name already exists'
            } else{
                invalidThemeName = false;
            }
        }
    }
    $: newThemeName, themeNameValidate(); //run this function every time the theme name changes 
    //(with a reactive declaration, we don't need on:input because the variable is bound to the input value)


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
        invalidThemeName = false;

    }
    $: $createThemeUI, resetCreateThemeUI(); //this var controls visibility of the create theme UI, run the reset when this value changes


    //a collection of CSS vars that are referenced to control dynamic positioning of elements in the UI
    $: styleVars = {
        stepLabelTop: -Math.abs(($step - 1) * 40) + 'px',
        stepContainerLeft: -Math.abs(($step - 1) * $winWidth) + 'px',
        uiLeft: uiLeftPos
    };


    //check to see if at least one type of style switch selected
    //if none are selected, the styleTypeInvalid var will be true
    let styleTypeInvalid;
    $: $styleTypeColor, validateStyleTypes();
    $: $styleTypeText, validateStyleTypes();
    $: $styleTypeEffect, validateStyleTypes();

    function validateStyleTypes() {
        if ($styleTypeColor === false && $styleTypeText === false && $styleTypeEffect === false) {
            styleTypeInvalid = true;
        } else {
            styleTypeInvalid = false;
        }
    }


    //navigate to a different step in the create thee flow
    //it excepts a numerical value, 1, 2 or 3
    //it can also accept a string "next" or "prev"
    function gotoToStep(destination) {
       if (typeof(destination) === 'number') {
           $step = destination;
       } else if (typeof(destination) === 'string') {
           if(destination==='next') {
                if ($step != totalSteps) {
                    $step++;
                }
            } else if (destination === 'prev') {
                if ($step != 1) {
                    $step--;
                }
            }
       }
    }


    //makes request to Figma plugin API to get style data
    function getStyleData() {

        let styleTypes = {
            color: $styleTypeColor,
            text: $styleTypeText,
            effect: $styleTypeEffect
        }

        //display loading state
        $loading = true;

        //send message to plugin api
        parent.postMessage({ pluginMessage: { 'type': 'createTheme', 'styleTypes': styleTypes, 'styleSource': $styleSource } }, '*');

    }


    //This function will run when the UI recieves data about the available styles back from the plugin code
    function validateStyleData(styles, publishedStatus) {

        //first we need to 

    }

    // listen for msgs from plugin code
	window.onmessage = async (event) => {
		if (event.data.pluginMessage.type === 'createStyleData') {
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
                <Radio bind:group={$styleSource} value="local">Local styles (default)</Radio>
                <Radio bind:group={$styleSource} value="selection">Styles in current selection</Radio>
                <Radio bind:group={$styleSource} value="page">Styles on current page</Radio>
            </div>

            <!-- Step 3 -->
            <div class="content__step">
                <div class="flex column pl-xxsmall pr-xxsmall mb-xxsmall">
                    <Type class="pt-xxsmall pb-xxsmall">Theme name</Type>
                    <Input iconName={IconTheme} placeholder="Unique theme name" borders=true bind:invalid={invalidThemeName} bind:errorMessage={errorMessage} bind:value={newThemeName}/> 
                </div>
                <div class="flex column">
                    <Checkbox>Create multiple themes using prefixed style names</Checkbox>
                </div>
            </div>

        </div>

    </div>


    <!-- Footer -->
    <div class="footer flex row justify-content-between align-items-center pl-xsmall pr-xsmall">
        <ul class="pager flex row">
            <li class="pager__dot" class:pager__dot--active="{$step === 1}" on:click={() => gotoToStep(1)}></li>
            <li class="pager__dot" class:pager__dot--active="{$step === 2}" on:click={() => gotoToStep(2)}></li>
            <li class="pager__dot" class:pager__dot--active="{$step === 3}" on:click={() => gotoToStep(3)}></li>
        </ul>
        <Button on:click={() => gotoToStep('next')} bind:disabled={styleTypeInvalid}>
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
   height: 40px;
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

.pager__dot:hover {
    background-color: var(--black3);
}

.pager__dot--active {
    background-color: var(--blue);
}


</style>