<script lang="ts">
	import { fabric } from "fabric";
	import { onMount } from "svelte";

	let mounted = false;
	let templates: FileList | undefined = undefined;
	let templateCanvas: HTMLCanvasElement | undefined = undefined;
	let templateFabricCanvas: fabric.Canvas | undefined = undefined;
	let topText = "";
	let bottomText = "";
	let downloadURL =  "";

	onMount(() => {
		mounted = true;
	});

	const loadBackground = (background: File) => {
		if (mounted && templateFabricCanvas === undefined) {
			templateFabricCanvas = new fabric.Canvas(templateCanvas!);
			templateFabricCanvas.selection = false;
			fabric.Image.fromURL(URL.createObjectURL(background), function(oImg) {
				templateFabricCanvas!.setBackgroundImage(oImg, () => {
					templateFabricCanvas!.setWidth(oImg.getScaledWidth());
					templateFabricCanvas!.setHeight(oImg.getScaledHeight());
					templateFabricCanvas!.renderAll();
					downloadURL = templateFabricCanvas!.toDataURL({format: "jpeg"});
				});
			});
		}
	};

	const addTextbox = () => {
		let textbox = new fabric.Textbox("Enter text", {
			fontFamily: 'Impact',
			fill: "white",
			stroke: "black",
			width: 100,
			editable: true
		});

		templateFabricCanvas?.add(textbox);
	};

	$: if (templates) {
		loadBackground(templates[0]);
	}
</script>

<svelte:head>
	<title>Meme Maker</title>
</svelte:head>

<main class="container">
	<article>
		<h2>Meme Maker</h2>
		{#if !templates}
			<form>
				<input type="file" id="template" name="template" accept="image/*" bind:files={templates}>
			</form>
			<p>Please upload a meme template.</p>
		{/if}
		<div class="grid">
			<canvas bind:this={templateCanvas} width=0 height=0 hidden={!templates}/>
			{#if templates}
				<div>
					<button>Add image...</button>
					<button on:click={() => addTextbox()}>Add textbox</button>
					<a role="button" href={downloadURL} download="image.jpeg">Download meme</a>
				</div>
			{/if}
		</div>
	</article>
</main>
