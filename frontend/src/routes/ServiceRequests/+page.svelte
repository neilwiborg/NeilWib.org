<script lang="ts">
	let city = "";
	let requestNumber: number | null = null;

</script>

<svelte:head>
	{#if city == ""}
		<title>Service Requests</title>
	{:else}
		<title>Service Requests - {city}</title>
	{/if}
</svelte:head>

<main class="container">
	<article>
		{#if city == ""}
			<h2>Service Requests</h2>
		{:else}
			<h2>Service Requests - {city}</h2>
		{/if}
		<select name="city" aria-label="Select a city..." bind:value={city}>
			<option>St. Louis</option>
		</select>
		{#if city != ""}
			<form>
				<div class="grid">
					<input type="text" placeholder="Enter new request number..." bind:value={requestNumber} />
					<button type="submit" >Add request</button>
				</div>
			</form>
		{/if}
	</article>
</main>
