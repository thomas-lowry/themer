<script lang="ts">
  import { onMount } from "svelte";
  import { writeCredentials, credentials } from "./libs/credentials";
  import LoadingScreen from "./screens/Loading.svelte";

  onMount(() => {
    writeCredentials();
  });

  let screenStep = $credentials ? "app" : "loading";
</script>

<main>
  {#if screenStep === "loading"}
    <LoadingScreen />
  {:else if screenStep === "onboarding"}
    <h1>Onboarding</h1>
  {:else}
    <h1>Hello!</h1>
  {/if}
</main>

<style>
  /* TODO  */
</style>
