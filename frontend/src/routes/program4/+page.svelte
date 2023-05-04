<script>
	let firstName = '';
	let lastName = '';
	let errorText = '';
	let resultsText = '';
	let dataLoaded = false;
	let inputError = false;
	$: inputDisabled = !dataLoaded;
	$: queryDisabled = !dataLoaded;
	let loadDataLoading = false;
	let clearDataLoading = false;
	let queryLoading = false;
	// keep clear button disabled if data is not loaded
	let clearDisabled = true;

	const onLoad = () => {
		loadDataLoading = true;
		fetch(import.meta.env.VITE_BACKEND_HOSTNAME + "/program4/data", {method: 'PUT'})
		.then((response) => response.text()
		.then((data) => {
			clearDisabled = false;
			errorText = 'Data loaded successfully!';
			loadDataLoading = false;
			dataLoaded = true;
		}));
	};

	const onClear = () => {
		clearDataLoading = true;
		inputError = false;
		firstName = '';
		lastName = '';
		resultsText = '';
		fetch(import.meta.env.VITE_BACKEND_HOSTNAME + "/program4/data", {method: 'DELETE'})
		.then((response) => response.text()
		.then((data) => {
			dataLoaded = false;
			clearDisabled = true;
			errorText = 'Data cleared';
			clearDataLoading = false;
		}));
	};

	const onSubmit = () => {
		// if the user has not entered either a first or last name
		if (firstName === '' && lastName === '') {
			// TODO: change small text color to red
			inputError = true;
			errorText = 'Error: either a first name or last name must be specified';
		} else {
			queryLoading = true;
			inputError = false;
			// TODO: change small text color to normal (in case it's still red)
			if (firstName !== '' && lastName !== '') {
				errorText = 'Results for ' + firstName + ' ' + lastName + ':';
			} else if (firstName !== '') {
				errorText = 'Results for ' + firstName + ':';
			} else {
				errorText = 'Results for ' + lastName + ':';
			}

			fetch(import.meta.env.VITE_BACKEND_HOSTNAME + "/program4/data?" +
			new URLSearchParams({
				firstName: firstName,
				lastName: lastName
			}), {method: 'GET'})
			.then((response) => response.text()
			.then((data) => {
				resultsText = data;
				queryLoading = false;
			}));
		}
	};
</script>

<svelte:head>
	<title>CSS 436 Program 4</title>
</svelte:head>

<main class="container">
	<article>
		<h2>CSS 436 Program 4</h2>
		<form>
			<div class="grid">
				{#if loadDataLoading}
				<button type="button" class="secondary" aria-busy={loadDataLoading ? "true" : "false"}>Please wait...</button>
				{:else}
				<button type="button" class="secondary" on:click={onLoad}
				disabled={(clearDataLoading || queryLoading) ? true : false}>Load Data</button>
				{/if}
				{#if clearDataLoading}
				<button type="reset" class="destructive" aria-busy={clearDataLoading ? "true" : "false"}>Please wait...</button>
				{:else}
					<button type="reset" class="destructive" disabled={clearDisabled || ((loadDataLoading || queryLoading) ? true : false)} on:click={onClear}
						>Clear Data</button>
				{/if}
			</div>
			<fieldset>
				<div class="grid">
					<label>
						First Name
						<input type="text" placeholder="Enter a first name" bind:value={firstName} disabled={inputDisabled} aria-invalid={inputError ? "true" : null} />
					</label>
					<label>
						Last Name
						<input type="text" placeholder="Enter a last name" bind:value={lastName} disabled={inputDisabled} aria-invalid={inputError ? "true" : null} />
					</label>
				</div>
				<small>At least one field must be entered</small>
				{#if queryLoading}
				<button type="submit" aria-busy={queryLoading ? "true" : "false"}>Please wait...</button>
				{:else}
				<button type="submit" on:click={onSubmit} disabled={queryDisabled || ((loadDataLoading || clearDataLoading || queryLoading) ? true : false)}>Query</button>
				{/if}
			</fieldset>
			<div class="container">
				{#if resultsText != ""}
					<h3>Results</h3>
					<output>
						{#if JSON.parse(resultsText).users.length > 0}
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
							<p style="color: red;">No results found</p>
						{/if}
					</output>
				{:else}
					<p></p>
				{/if}
				
			</div>
		</form>
	</article>
</main>
