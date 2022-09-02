<script>
//imports
import { Icon, IconButton, IconBack, IconForward } from 'figma-plugin-ds-svelte';
import { createEventDispatcher } from 'svelte';

//vars
export let nextDisabled = false;
export let prevDisabled = false;
export let step;

const dispatch = createEventDispatcher();

// button functions
function changeStep(direction) {
    dispatch('message', {
        dir: direction
    });
}

</script>

<div class="container flex row align-items-center justify-content-between pr-xxxsmall pl-xxxsmall">

    <div class:disabled={prevDisabled}><IconButton iconName={IconBack} on:click={() => changeStep('prev')}/></div>
    <div class="steps flex row">
        <div on:click={() => changeStep(1)} class:selected="{step === 1}" class="step"></div>
        <div on:click={() => changeStep(2)} class:selected="{step === 2}" class="step"></div>
        <div on:click={() => changeStep(3)} class:selected="{step === 3}" class="step"></div>
        <div on:click={() => changeStep(4)} class:selected="{step === 4}" class="step"></div>
        <div on:click={() => changeStep(5)} class:selected="{step === 5}" class="step"></div>
        <div on:click={() => changeStep(6)} class:selected="{step === 6}" class="step"></div>
    </div>
    <div class:disabled={nextDisabled}><IconButton iconName={IconForward} on:click={() => changeStep('next')}/></div>

</div>



<style>

.container {
    border-top: 1px solid var(--figma-color-border);
    height: calc(var(--size-large) + 1px);
}

.step {
    height: var(--size-xxsmall);
    width: var(--size-xxsmall);
    margin-right: var(--size-xxsmall);
    background-color: var(--figma-color-icon-tertiary);
    border-radius: 50%;
}

.disabled {
    opacity: 0.2;
    pointer-events: none;
}

.selected {
    background-color: var(--figma-color-bg-brand);
}
.steps:last-child {
    margin-right: 0px;
}

</style>