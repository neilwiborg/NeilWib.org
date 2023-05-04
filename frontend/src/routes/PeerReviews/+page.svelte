<script lang="ts">
	import { onMount } from 'svelte';

	type student = {
		name: string;
		studentNumber: number;
	};
	type project = {
		name: string;
		increment: number;
	};
	let students: student[] = [];
	let projects: project[] = [];
	let loading = true;
	let badInput = false;
	let selectedStudent = -1;
	let selectedProject = -1;
	let firstReviewee = "";
	let secondReviewee = "";

	onMount(async () => {
		const res = await fetch(import.meta.env.VITE_BACKEND_HOSTNAME + "/peerreviews");
		({peers: students, projects} = await res.json());
		loading = false;
	});

	const getFirstReviewee = (studentNumber: number, increment: number) => {
		studentNumber += -1 + increment;
		if (studentNumber < students.length) {
			return students[studentNumber].name;
		}
		studentNumber -= students.length;
		return students[studentNumber].name;
	}

	const getSecondReviewee = (studentNumber: number, increment: number) => {
		studentNumber += increment;
		if (studentNumber < students.length) {
			return students[studentNumber].name;
		}
		studentNumber -= students.length;
		return students[studentNumber].name;
	}

	const setReviewees = (studentNumber: number, increment: number) => {
		// handle no selection
		if (selectedStudent === -1 || selectedProject === -1) {
			badInput = true;
		} else {
			badInput = false;
			firstReviewee = getFirstReviewee(studentNumber, increment);
			secondReviewee = getSecondReviewee(studentNumber, increment);
		}
	}

	const resetReviewees = () => {
		firstReviewee = "";
		secondReviewee = "";
	}
</script>

<svelte:head>
	<title>CSS 490 Peer Reviews</title>
</svelte:head>

<main class="container">
	<article>
		<h2>CSS 490 Peer Reviews</h2>
		<form>
			<div class="grid">
				<label>
					Select yourself:
					{#if loading}
						<select value="Fetching..." disabled>
							<option value="Fetching...">Fetching...</option>
						</select>
					{:else}
						<select name="studentsList" id="studentsList" bind:value={selectedStudent} aria-invalid={badInput ? "true" : null} on:change={resetReviewees} aria-busy={loading}>
							{#each students as {name, studentNumber}}
								<option value={studentNumber}>{name}</option>
							{/each}
						</select>
					{/if}
				</label>
				<label>
					Select a project:
					{#if loading}
						<select value="Fetching..." disabled>
							<option value="Fetching...">Fetching...</option>
						</select>
					{:else}
						<select name="projectsList" id="projectsList" bind:value={selectedProject} aria-invalid={badInput ? "true" : null} on:change={resetReviewees} aria-busy={loading}>
							{#each [...projects].reverse() as {name, increment}}
								<option value={increment}>{name}</option>
							{/each}
						</select>
					{/if}
				</label>
			</div>
			<button type="submit" on:click|preventDefault={() => setReviewees(selectedStudent, selectedProject)}>Find Reviewees</button>
		</form>
		{#if firstReviewee !== ""}
			<output>
				<h3>You should review:</h3>
				<h4>{firstReviewee}</h4>
				<h4>{secondReviewee}</h4>
			</output>
		{/if}
	</article>
</main>
