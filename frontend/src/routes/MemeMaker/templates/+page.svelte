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

	const MEMES_PER_ROW = 5;

	let loading = true;
	let searchQuery = "";
	let memeResults: meme[][] = [[]];

	onMount(async () => {
		const res = await fetch(import.meta.env.VITE_BACKEND_HOSTNAME + "/mememaker/top100");
		let response = (await res.json() as memeResponse).data.memes;
		let rowCount = 0;
		for (let i = 0; i < response.length; i++) {
			if (rowCount >= MEMES_PER_ROW) {
				memeResults.push([]);
				rowCount = 0;
			}

			memeResults[memeResults.length - 1].push(response[i]);
			++rowCount;
		}
		loading = false;
	});

	const onSearch = () => {
		loading = true;
		fetch(import.meta.env.VITE_BACKEND_HOSTNAME + "/mememaker/searchmemes?" + new URLSearchParams({
			searchterm: searchQuery
		})).then((response) => response.json()
		.then((responseData: memeResponse) => {
			let response = responseData.data.memes;
			memeResults = [[]];
			let rowCount = 0;
			for (let i = 0; i < response.length; i++) {
				if (rowCount >= MEMES_PER_ROW) {
					memeResults.push([]);
					rowCount = 0;
				}

				memeResults[memeResults.length - 1].push(response[i]);
				++rowCount;
			}
			loading = false;
		}));
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
			{#each memeResults as row}
				<div class="grid">
					{#each row as meme}
						<article>
							<a href={"/MemeMaker/template/temp?" + new URLSearchParams({
								name: meme.name,
								templateUrl: encodeURIComponent(meme.url)
							})}><img src={meme.url} alt={meme.name}></a>
							<p><a href={"/MemeMaker/template/temp?" + new URLSearchParams({
								name: meme.name,
								templateUrl: encodeURIComponent(meme.url)
							})}>{meme.name}</a></p>
						</article>
					{/each}
				</div>
			{/each}
		{/if}
	</article>
</main>
