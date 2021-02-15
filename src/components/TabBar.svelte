<script>

    import { GlobalCSS, IconButton, IconPlus } from 'figma-plugin-ds-svelte';
    import { mainSection, createThemeUI } from '../scripts/stores.js';

</script>

<div class="tab-container flex flex-no-shrink justify-content-between align-items-center pr-xxxsmall pl-xsmall">

    <div class="tabs flex">
        <span class="tab" tabNumber=1 on:click={() => mainSection.set('themes')} class:active="{$mainSection === 'themes'}">Themes</span>
        <span class="tab" tabNumber=2 on:click={() => mainSection.set('settings')} class:active="{$mainSection === 'settings'}">Settings</span>
    </div>

    <IconButton on:click={() => $createThemeUI = true} iconName={IconPlus} />

</div>

<style>

.tab-container {
    box-shadow: 0px 1px 0px var(--black1);
    height: 40px;
}

.tab {
    font-family: var(--font-stack);
    font-size: var(--font-size-xsmall);
    line-height: var(--font-line-height);
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--font-letter-spacing-pos-small);
    color: var(--black3);
    padding-right: var(--size-xsmall);
    cursor: default;
    user-select: none;
}

.tab:hover {
    color: var(--black8);
}

.active {
    color: var(--black8);
}


</style>