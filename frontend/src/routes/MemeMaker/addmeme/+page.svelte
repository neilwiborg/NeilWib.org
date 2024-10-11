<script lang="ts">
	import { goto } from '$app/navigation';

	let url = "";
	let errorMessage = "";
	let loading = false;

	type addResponse = {
		message: string;
        id?: string;
	};
	
	const onSearch = async () => {
		loading = true;
		let response = await fetch(import.meta.env.VITE_BACKEND_HOSTNAME + "/mememaker/addmeme?" + new URLSearchParams({
			url: url
		}), {method: 'PUT'});
		let responseData: addResponse = await response.json();
		if (responseData.message != "AddedMeme" && responseData.message != "AlreadyExists")
		{
			errorMessage = responseData.message;
		} else {
			goto(`/MemeMaker/template/${responseData.id}`);
		}
		loading = false;
	};
</script>

<svelte:head>
	<title>Add New Meme</title>
</svelte:head>

<main class="container">
	<article>
		<h2>Add New Meme</h2>
		<form>
			<input type="text" placeholder="Enter Imgflip URL..." bind:value={url} />
			{#if loading}
				<button type="submit" disabled aria-busy="true">Adding meme...</button>
			{:else}
				<button type="submit" on:click={async () => await onSearch()}>Add meme</button>
			{/if}
		</form>
	</article>
</main>
