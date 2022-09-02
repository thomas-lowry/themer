<script>

	//import Global CSS from the svelte boilerplate
	//contains Figma color vars, spacing vars, utility classes and more
    import { GlobalCSS, IconButton, IconTrash } from 'figma-plugin-ds-svelte';
    import ThemeIcon from '../assets/theme-color.svg';
    import { deleteTheme, themeToDelete, selectedTheme } from '../scripts/stores.js';
   
    let className = '';

    export let themeName;
    export { className as class };

</script>


<div {themeName} on:mousedown={() => $selectedTheme = themeName} class:selected="{$selectedTheme === themeName}" class="themeRow flex flex-no-shrink align-items-center pl-xxsmall pr-xxxsmall {className}">

    <div class="icon">
        {@html ThemeIcon}
    </div>
    
    <div class="name flex-grow pr-xsmall">{themeName}</div>

    <div class="actions">
        <IconButton iconName={IconTrash} on:click={() => { $deleteTheme = true, $themeToDelete = themeName }} />
    </div>

</div>



<style>

.themeRow {
    height: calc(var(--size-medium) + 4px);
    cursor: default;
    outline: 1px solid transparent;
}
.themeRow:hover {
    outline: 1px solid var(--figma-color-border-selected);
    outline-offset: -1px;
}

.themeRow.selected:hover {
    outline: none;
}

.themeRow:active {
    outline: none;
}

.selected {
    background-color: var(--figma-color-bg-selected);
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
    color: var(--figma-color-text);
}

.themeRow:hover .actions {
    display: block;
}

.actions {
    display: none;
}

</style>