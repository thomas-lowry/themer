<script>

	//import Global CSS from the svelte boilerplate
	//contains Figma color vars, spacing vars, utility classes and more
    import { GlobalCSS, IconButton, IconTrash } from 'figma-plugin-ds-svelte';
    import ThemeIcon from '../assets/theme-color.svg';
   
    let className = '';

    export let themeName;
    export { className as class };

</script>


<div {themeName} class="themeRow flex flex-no-shrink align-items-center pl-xxsmall pr-xxxsmall {className}">

    <div class="icon">
        {@html ThemeIcon}
    </div>
    
    <div class="name flex-grow pr-xsmall">{themeName}</div>

    <div class="actions">
        <IconButton iconName={IconTrash} />
    </div>

</div>



<style>

.themeRow {
    height: var(--size-medium);
    cursor: default;
}

.name {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    font-family: var(--font-stack);
    font-size: var(--font-size-small);
    line-height: var(--font-line-height);
    font-weight: var(--font-weight-normal);
    letter-spacing: var(--font-letter-spacing-pos-small);
}

.themeRow:hover .actions {
    display: block;
}

.actions {
    display: none;
}

</style>