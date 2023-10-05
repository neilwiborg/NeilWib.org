<script lang="ts">
	import { fabric } from "fabric";
	import { onMount } from "svelte";

	type canvasObjects = {
		images: fabric.Image[],
		textboxes: fabric.Textbox[]
	}

	let mounted = false;
	let templates: FileList | undefined = undefined;
	let templateCanvas: HTMLCanvasElement | undefined = undefined;
	let templateFabricCanvas: fabric.Canvas | undefined = undefined;
	let fabricObjects: canvasObjects = {
		images: [],
		textboxes: []
	}
	let fontSize = 20;
	let fontColor = "#FFFFFF";

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
				});
			});
		}
	};

	const addTextbox = () => {
		let textbox = new fabric.Textbox("Enter text", {
			fontFamily: 'Impact',
			fontSize: fontSize,
			fill: fontColor,
			stroke: "black",
			width: 100,
			editable: true
		});
		fabricObjects.textboxes.push(textbox);

		templateFabricCanvas!.add(textbox);
	};

	const changeFontProperties = () => {
		fabricObjects.textboxes.forEach((item, index) => {
			item.fontSize = fontSize;
			item.set("fill", fontColor);
		});
		templateFabricCanvas!.renderAll();
	};

	$: if (templates) {
		loadBackground(templates[0]);
	}

	const downloadMeme = () => {
		let downloadURL = templateFabricCanvas!.toDataURL({format: "jpeg"});
		let link = document.createElement('a');
		link.download = "image.jpeg";
		link.href = downloadURL;
		link.click();
	};
</script>

<svelte:head>
	<title>Meme Maker - New Template</title>
</svelte:head>

<main class="container">
	<article>
		<h2>New Meme Maker Template</h2>
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
					<form>
						<label>
							Font size
							<input type="text" bind:value={fontSize} on:input={changeFontProperties} />
						</label>
						<label>
							Text color
							<input type="color" bind:value={fontColor} on:input={changeFontProperties} />
						</label>
						<button>Add image</button>
						<button on:click|preventDefault={() => addTextbox()}>Add textbox</button>
						<button on:click|preventDefault={() => downloadMeme()}>Download meme</button>
					</form>
				</div>
			{/if}
		</div>
	</article>
</main>
