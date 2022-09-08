<script>
    import { loading } from '../scripts/stores.js';
	import { fade } from 'svelte/transition';
	import { Button} from 'figma-plugin-ds-svelte';

	//reset onboarding data in Figma api
    function resetThemer() {
        parent.postMessage({ pluginMessage: { 'type': 'reset' } }, '*');
    }
	
</script>

{#if $loading}
<div class="loading" transition:fade="{{ duration: 200 }}">
	<div class="loading__animation">
		<div class="loading__themer">
				<svg fill="none" height="52" viewBox="0 0 52 52" width="52" xmlns="http://www.w3.org/2000/svg"><circle cx="26" cy="26" fill="var(--figma-color-bg-brand)" r="22"/><g clip-rule="evenodd" fill="#fff" fill-rule="evenodd"><path d="m17.6935 19.9808 4.7678 4.6353-1.0456 1.0755-6.0924-5.9231c-.1452-.1412-.2271-.3351-.2271-.5377s.0819-.3966.2271-.5378l6.0924-5.923 1.0456 1.0755-4.7678 4.6353h18.4603v1.5z"/><path d="m34.3065 33.5192-4.7678 4.6354 1.0456 1.0755 6.0924-5.9231c.1452-.1412.2271-.3352.2271-.5378 0-.2025-.0819-.3965-.2271-.5377l-6.0924-5.9231-1.0456 1.0755 4.7678 4.6353h-18.4603v1.5z"/></g></svg>
			</div>
		<div class="loading__spinner">
				<svg fill="none" height="52" viewBox="0 0 52 52" width="52" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><mask id="a" fill="#fff"><path clip-rule="evenodd" d="m50.5 26c0-13.531-10.969-24.5-24.5-24.5v-1c14.0833 0 25.5 11.4167 25.5 25.5s-11.4167 25.5-25.5 25.5-25.5-11.4167-25.5-25.5h1c0 13.531 10.969 24.5 24.5 24.5s24.5-10.969 24.5-24.5z" fill="#fff" fill-rule="evenodd"/></mask><g fill="var(--figma-color-bg-brand)"><path clip-rule="evenodd" d="m50.5 26c0-13.531-10.969-24.5-24.5-24.5v-1c14.0833 0 25.5 11.4167 25.5 25.5s-11.4167 25.5-25.5 25.5-25.5-11.4167-25.5-25.5h1c0 13.531 10.969 24.5 24.5 24.5s24.5-10.969 24.5-24.5z" fill-rule="evenodd"/><path d="m26 1.5h-1v1h1zm0-1v-1h-1v1zm-25.5 25.5v-1h-1v1zm1 0h1v-1h-1zm24.5-23.5c12.9787 0 23.5 10.5213 23.5 23.5h2c0-14.0833-11.4167-25.5-25.5-25.5zm-1-2v1h2v-1zm27.5 25.5c0-14.6355-11.8645-26.5-26.5-26.5v2c13.531 0 24.5 10.969 24.5 24.5zm-26.5 26.5c14.6355 0 26.5-11.8645 26.5-26.5h-2c0 13.531-10.969 24.5-24.5 24.5zm-26.5-26.5c0 14.6355 11.8645 26.5 26.5 26.5v-2c-13.531 0-24.5-10.969-24.5-24.5zm2-1h-1v2h1zm24.5 24.5c-12.9787 0-23.5-10.5213-23.5-23.5h-2c0 14.0833 11.4167 25.5 25.5 25.5zm23.5-23.5c0 12.9787-10.5213 23.5-23.5 23.5v2c14.0833 0 25.5-11.4167 25.5-25.5z" mask="url(#a)"/></g></svg>
		</div>
	</div>
	<div class="reset-button">
		<Button variant='tertiary' destructive=true on:click={() => resetThemer()}>Reset Themer</Button>
	</div>
</div>
{/if}


<style>

    .loading {
		position: absolute;
		top: 0;
		left:0;
		opacity: 1.0;
		z-index: 200;
		width: 100%;
		height: 100%;
		background-color: var(--figma-color-bg);
		display: flex;
		justify-content: center;
		align-items: center;
    }


    .loading__animation {
		width: 52px;
		height: 52px;
		margin-top: -30px;
		position: relative;
	}

    .loading__themer {
        position: absolute;
        top:0;
        left:0;
    }

    .loading__spinner {
        animation: rotating 1.0s linear infinite;
    }

    @keyframes rotating {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

	.reset-button {
		position: absolute;
		bottom: var(--size-xxxsmall);
		right: var(--size-xsmall);
	}


</style>