<script lang="ts">
    type showType = {
        name: string,
        id: number,
        image: string
    }

    let loading = false;
	let searchQuery = "";
	let showResults: showType[] = [];

    const onSearch = async () => {
		loading = true;
		let response = await fetch(import.meta.env.VITE_BACKEND_HOSTNAME + "/tvshow/shows?" + new URLSearchParams({
			searchterm: searchQuery
		}));
        let responseData = await response.json();
        showResults = responseData.shows;
        loading = false;
	};
</script>

<svelte:head>
	<title>TV Show</title>
</svelte:head>

<main class="container">
	<article>
		<h2>TV Show</h2>
		<form>
			<input type="search" placeholder="Search TV shows..." bind:value={searchQuery} />
			<button type="submit" on:click={onSearch}>Search Templates</button>
		</form>
		{#if loading}
		<p aria-busy="true">Loading results...</p>
		{:else}
			{#each showResults as show}
				<div class="grid">
                    <a href={"/TVShow/shows/" + show.id}><img src={show.image} alt={show.name}></a>
				</div>
			{/each}
		{/if}
	</article>
</main>
