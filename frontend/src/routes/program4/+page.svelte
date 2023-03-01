<script>
	import { error } from "@sveltejs/kit";


	let firstName = '';
	let lastName = '';
	let errorText = '';
	let resultsText = '';
	let loadDataLoading = false;
	let clearDataLoading = false;
	let queryLoading = false;
	// keep clear button disabled if data is not loaded
	let clearDisabled = true;
	// only let one button operation run at a time
	let operationRunning = false;

	const onLoad = () => {
		clearDisabled = false;
		errorText = 'Data loaded successfully!';
	};

	const onClear = () => {
		firstName = '';
		lastName = '';
		clearDisabled = true;
		errorText = 'Data cleared';
	};

	const onSubmit = () => {
		// if the user has not entered either a first or last name
		if (firstName === '' && lastName === '') {
			// TODO: change small text color to red
			errorText = 'Error: either a first name or last name must be specified';
		} else {
			// TODO: change small text color to normal (in case it's still red)
			if (firstName !== '' && lastName !== '') {
				errorText = 'Results for ' + firstName + ' ' + lastName + ':';
			} else if (firstName !== '') {
				errorText = 'Results for ' + firstName + ':';
			} else {
				errorText = 'Results for ' + lastName + ':';
			}
		}
		queryLoading = true;
		fetch(import.meta.env.VITE_BACKEND_HOSTNAME + "/program4/loadData")
		.then((response) => response.text()
		.then((data) => {
			resultsText = data;
			queryLoading = false;
		}));
	};
</script>

<svelte:head>
	<title>CSS 436 Program 4</title>
</svelte:head>

<main class="container">
	<h2>CSS 436 Program 4</h2>
	<form>
		<div class="grid">
			{#if loadDataLoading}
			<button type="button" class="secondary" aria-busy={queryLoading ? "true" : "false"}>Please wait...</button>
			{:else}
			<button type="button" class="secondary" on:click={onLoad}
			disabled={(loadDataLoading || clearDataLoading || queryLoading) ? true : false}>Load Data</button>
			{/if}
			{#if clearDataLoading}
			<button type="reset" class="destructive" aria-busy={queryLoading ? "true" : "false"}>Please wait...</button>
			{:else}
				<button type="reset" class="destructive" disabled={clearDisabled} on:click={onClear}
					>Clear Data</button>
			{/if}
		</div>
		<fieldset>
			<div class="grid">
				<label>
					First Name
					<input type="text" placeholder="Enter a first name" bind:value={firstName} />
				</label>
				<label>
					Last Name
					<input type="text" placeholder="Enter a last name" bind:value={lastName} />
				</label>
			</div>
			<small>At least one field must be entered</small>
			{#if queryLoading}
			<button type="submit" aria-busy={queryLoading ? "true" : "false"}>Please wait...</button>
			{:else}
			<button type="submit" on:click={onSubmit} disabled={(loadDataLoading || clearDataLoading || queryLoading) ? true : false}>Query</button>
			{/if}
		</fieldset>
		<div class="container">
			<h3>Results</h3>
			<output>
				{#if resultsText.length > 0}
					{#each JSON.parse(resultsText).users as user}
						<details>
							<summary>
								{user.firstName} {user.lastName}
							</summary>
							<ul>
								{#each Object.entries(user) as [attr, val]}
									{#if attr !== "firstName" && attr !== "lastName"}
										<li>{attr}: {val}</li>
									{/if}
								{/each}
							</ul>
						</details>
					{/each}
				{:else}
					<p>{resultsText}</p>
				{/if}
			</output>
		</div>
	</form>
</main>
