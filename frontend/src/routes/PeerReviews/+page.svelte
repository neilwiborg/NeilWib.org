<script lang="ts">
	let students = ["Dongin Cho", "Joseph Matthew Collora", "James Andrew Day", "Rachel Ann Ferrer Graham", "Filo Henein", "Mehak Kambo", "Safwaan Taher", "Cheuk-Hang Tse", "Neil Wiborg", "David Woo"];
	let projects = {
		"Project 1": 1,
		"Project 2": 2,
		"Project 3": 3
	};
	let badInput = false;
	let selectedStudent = -1;
	let selectedProject = -1;
	let firstReviewee = "";
	let secondReviewee = "";

	const getFirstReviewee = (studentNumber: number, increment: number) => {
		studentNumber += -1 + increment;
		if (studentNumber < students.length) {
			return students[studentNumber];
		}
		studentNumber -= students.length;
		return students[studentNumber];
	}

	const getSecondReviewee = (studentNumber: number, increment: number) => {
		studentNumber += increment;
		if (studentNumber < students.length) {
			return students[studentNumber];
		}
		studentNumber -= students.length;
		return students[studentNumber];
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
					<select name="studentsList" id="studentsList" bind:value={selectedStudent} aria-invalid={badInput ? "true" : null} on:change={resetReviewees}>
						{#each students as student, i}
							<option value={i + 1}>{student}</option>
						{/each}
					</select>
				</label>
				<label>
					Select a project:
					<select name="projectsList" id="projectsList" bind:value={selectedProject} aria-invalid={badInput ? "true" : null} on:change={resetReviewees}>
						{#each Object.entries(projects) as [project, offset]}
							<option value={offset}>{project}</option>
						{/each}
					</select>
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
