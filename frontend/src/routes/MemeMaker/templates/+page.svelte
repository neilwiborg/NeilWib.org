<script lang="ts">
	import { onMount } from "svelte";

	type meme = {
        id: string;
        name: string;
        url: string;
        width: number;
        height: number;
        box_count: number;
        captions: number;
	};

	type memeResponse = {
        data: {memes: meme[]};
	};

	let loading = true;
	let searchQuery = "";
	let memeResults: meme[] = [];

	onMount(async () => {
		const res = await fetch(import.meta.env.VITE_BACKEND_HOSTNAME + "/mememaker/top100");
		memeResults = (await res.json() as memeResponse).data.memes;
		loading = false;
	});

	const onSearch = () => {
		loading = true;
		fetch(import.meta.env.VITE_BACKEND_HOSTNAME + "/mememaker/searchmemes?" + new URLSearchParams({
			searchterm: searchQuery
		})).then((response) => response.json()
		.then((responseData: memeResponse) => {
			memeResults = responseData.data.memes;
		}));
		loading = false;
	};
</script>

<style>
	img {
		max-width: 150px;
		max-height: 150px;
		width: auto;
		height: auto;
	}

</style>

<svelte:head>
	<title>Meme Maker Templates</title>
</svelte:head>

<main class="container">
	<article>
		<h2>Meme Maker Templates</h2>
		<form>
			<input type="search" placeholder="Search templates..." bind:value={searchQuery} />
			<button type="submit" on:click={onSearch}>Search Templates</button>
		</form>
		{#if loading}
		<p aria-busy="true">Loading results...</p>
		{:else}
			{#each memeResults as meme}
				<article>
					<a href={"/MemeMaker/template/" + new URLSearchParams({
						templateUrl: encodeURIComponent(meme.url)
					})}><img src={meme.url} alt={meme.name}></a>
					<p><a href={"/MemeMaker/template/" + new URLSearchParams({
						templateUrl: encodeURIComponent(meme.url)
					})}>{meme.name}</a></p>
				</article>
			{/each}
		{/if}
	</article>
</main>
