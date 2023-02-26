<script>
</script>

<svelte:head>
    <title>CSS 436 Program 4</title>
</svelte:head>

<main class="container">
    <h1>Welcome to CSS 436 Program 4</h1>
    <form>
        <div class="grid">
            <button class="secondary">Load Data</button>
            <button class="destructive" disabled>Clear Data</button>
        </div>
        <div class="grid">
            <label>
                First Name
                <input type="text" />
            </label>
            <label>
                Last Name
                <input type="text" />
            </label>
            <button>Query</button>
        </div>
    </form>
</main>
