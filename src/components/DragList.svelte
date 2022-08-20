<script>
	import {dndzone} from 'svelte-dnd-action';
	import {flip} from 'svelte/animate';
	import { GlobalCSS } from 'figma-plugin-ds-svelte';
	import { themeData, apiKey, binURL, reOrdered } from '../scripts/stores.js';
	import { debounce } from '../scripts/debounce.js';

	export let itemsData;
	export let itemComponent;
	export let onDrop;
	export let idPropertyName = "id";
	export let flipDurationMs = 300;
	
	function handleConsider(e) {
		itemsData = e.detail.items;
	}
	
	function handleFinalize(e) {
		onDrop(e.detail.items);
		$reOrdered = true;
		saveNewOrder();
	}

	//function
	var saveNewOrder = debounce(function() {

		//create a temporary array
		let themesWithNewOrder = [];

		console.log('pre reorder:', $themeData);

		itemsData.forEach(item => {
			$themeData.forEach(theme => {
				if(item.theme === theme.theme) {
					themesWithNewOrder.push(theme);
				}
			})
		});

		console.log('after reorder:', themesWithNewOrder);

		//stringify the results to send to JSONBin
		themesWithNewOrder = JSON.stringify(themesWithNewOrder);

		//next we send this brand new array to jsonBin
		let req = new XMLHttpRequest();

		req.onreadystatechange = () => {

			//if the request is successful
			if (req.readyState == XMLHttpRequest.DONE && req.status === 200) {

				//parse the respond data as a JSON array, update them $themeDate
				let responseData = JSON.parse(req.responseText);
				$themeData = responseData.record;

				console.log('response: ', responseData.record);

			
			} else if (req.status >= 400) { //if unsuccessful (2)

				//send error message to user
				parent.postMessage({ pluginMessage: { 'type': 'notify', 'message': 'There was an error saving the new theme order to JSONBin. Please try again.'} }, '*');

			}
		};

		req.open('PUT', $binURL, true);
		req.setRequestHeader("Content-Type", "application/json");
		req.setRequestHeader('X-Master-Key', $apiKey);
		req.setRequestHeader('X-Bin-Versioning', false);
		req.send(themesWithNewOrder);

	}, 1000);

</script>

<section use:dndzone={{items: itemsData, flipDurationMs, autoAriaDisabled:true, morphDisabled:true, dropTargetStyle:{}}} on:consider={handleConsider} on:finalize={handleFinalize} class="pt-xxsmall">
	{#each itemsData as item(item[idPropertyName])}
		<div animate:flip={{duration: flipDurationMs}}>
				<svelte:component this={itemComponent} themeName={item.theme}/>	
		</div>
	{/each}
</section>

<style>
	section {
		width: 100%;
		height: 100%;
	}

</style>