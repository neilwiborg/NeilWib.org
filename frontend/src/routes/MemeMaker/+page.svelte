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
		if (mounted) {
			templateFabricCanvas = new fabric.Canvas(templateCanvas!);
			templateFabricCanvas.selection = false;
			fabric.Image.fromURL(URL.createObjectURL(background), function(oImg) {
				// oImg.set("selectable", false);
				templateFabricCanvas!.setBackgroundImage(oImg, () => {
					templateFabricCanvas!.setWidth(oImg.getScaledWidth());
					templateFabricCanvas!.setHeight(oImg.getScaledHeight());
					templateFabricCanvas!.renderAll();
					downloadURL = templateFabricCanvas!.toDataURL({format: "jpeg"});
				});
			// templateFabricCanvas!.add(oImg);
			});
			// const ctx = templateCanvas!.getContext('2d')!;
			// const templateBackground = new Image();
			// templateBackground.onload = () => {
			// 	canvasWidth = templateBackground.width;
			// 	canvasHeight = templateBackground.height;
			// 	ctx.drawImage(templateBackground, 0, 0);
			// };
			// templateBackground.src = URL.createObjectURL(background);
			// downloadURL = templateCanvas!.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
		}
	};

	$: if (templates) {
		loadBackground(templates[0]);
	}

	const downloadMeme = () => {
		if (mounted) {
			return templateCanvas!.toDataURL("image/png");
		}
		return "";
	};
</script>

<svelte:head>
	<title>Meme Maker</title>
</svelte:head>

<main class="container">
	<article>
		<h2>Meme Maker</h2>
		<form>
			<input type="file" id="template" name="template" accept="image/*" bind:files={templates}>
		</form>
		{#if !templates}
			<p>Please upload a meme template.</p>
		{/if}
		<canvas bind:this={templateCanvas} width=0 height=0>
		</canvas>
		<a role="button" href={downloadURL} download="image.jpeg">Download meme</a>
	</article>
</main>
