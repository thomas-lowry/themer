<script>

	//import Global CSS from the svelte boilerplate
	//contains Figma color vars, spacing vars, utility classes and more
    import { GlobalCSS, Input, Label, IconKey, IconHyperlink, Button } from 'figma-plugin-ds-svelte';
    import windowWidth from '../scripts/windowSize';
    import HeaderGraphic from '../assets/header.svg';

    let className = '';
    let width = windowWidth() + 'px';

    export { className as class };

</script>

<div class="container flex column {className}" style="width:{width};">

    <div class="header">
        {@html HeaderGraphic}
    </div>

    <div class="flex column flex-grow p-xsmall justify-content-center">
        <Label>API Key</Label>
        <Input iconName={IconKey} placeholder="Enter some info..." class="mb-xxsmall"/>

        <Label>URL to your jsonBin</Label>
        <Input iconName={IconHyperlink} placeholder="Enter some info..."/>
    </div>

    <div class="flex pb-xsmall pr-xsmall pl-xsmall justify-content-end">
        <Button variant='primary'>Save</Button>
    </div>

    </div>


<style>

.container {
    width: 100%;
    height: 100%;
}

</style>