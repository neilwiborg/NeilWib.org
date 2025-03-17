<script lang="ts">
	import { onMount } from 'svelte';

	type photoAuthor = {
		firstName: string;
		middleName?: string;
		lastName: string;
		profileURL: string;
	};

	type photoResponse = {
		sourceName: string;
		sourceURL: string;
		imageURL: string;
		author: photoAuthor;
	};

	let seattlePhoto: photoResponse | null = $state(null);

	onMount(async () => {
		const res = await fetch(import.meta.env.VITE_BACKEND_HOSTNAME + '/photos/seattle');
		seattlePhoto = (await res.json()) as photoResponse;
	});
</script>

<svelte:head>
	<title>Neil Wiborg's Website</title>
</svelte:head>

<main class="container">
	<article>
		<h2>Hi, I'm Neil</h2>
		<div class="grid">
			<p>
				Visit <a href="/MemeMaker">Meme Maker here</a>
			</p>
			<figure>
				<img src={seattlePhoto?.imageURL} alt="Seattle, WA" />
				<figcaption>
					Photo by <a href={seattlePhoto?.author.profileURL}
						>{seattlePhoto?.author.firstName} {seattlePhoto?.author.lastName}</a
					>
					on <a href={seattlePhoto?.sourceURL}>{seattlePhoto?.sourceName}</a>
				</figcaption>
			</figure>
		</div>
	</article>
</main>
