<script lang="ts">
	import { fabric } from 'fabric';
	import { onMount } from 'svelte';

	export let data: paramsData;

	type paramsData = {
		params: params;
	};

	type params = {
		name: string;
		imageURL: string;
	};

	type canvasObjects = {
		images: fabric.Image[];
		textboxes: fabric.Textbox[];
	};

	let mounted = false;
	let templateCanvas: HTMLCanvasElement | undefined = undefined;
	let templateFabricCanvas: fabric.Canvas | undefined = undefined;
	let fabricObjects: canvasObjects = {
		images: [],
		textboxes: []
	};
	let fontSize = 50;
	let fontColor = '#FFFFFF';

	onMount(() => {
		mounted = true;
		loadBackground();
	});

	const loadBackground = () => {
		if (mounted && templateFabricCanvas === undefined) {
			templateFabricCanvas = new fabric.Canvas(templateCanvas!);
			templateFabricCanvas.selection = false;
			fabric.Image.fromURL(decodeURIComponent(data.params.imageURL), function (oImg) {
				templateFabricCanvas!.setBackgroundImage(oImg, () => {
					templateFabricCanvas!.setWidth(oImg.getScaledWidth());
					templateFabricCanvas!.setHeight(oImg.getScaledHeight());
					templateFabricCanvas!.renderAll();
				}, {crossOrigin: "anonymous"});
			});
		}
	};

	const addTextbox = () => {
		let textbox = new fabric.Textbox('Enter text', {
			fontFamily: 'Impact',
			fontSize: fontSize,
			fill: fontColor,
			stroke: 'black',
			width: 100,
			editable: true
		});
		fabricObjects.textboxes.push(textbox);

		templateFabricCanvas!.add(textbox);
	};

	const changeFontProperties = () => {
		fabricObjects.textboxes.forEach((item, index) => {
			item.fontSize = fontSize;
			item.set('fill', fontColor);
		});
		templateFabricCanvas!.renderAll();
	};

	const downloadMeme = () => {
		let downloadURL = templateFabricCanvas!.toDataURL({ format: 'jpeg' });
		let link = document.createElement('a');
		link.download = 'image.jpeg';
		link.href = downloadURL;
		link.click();
	};
</script>

<svelte:head>
	<title>Meme Maker - {data.params.name}</title>
</svelte:head>

<main class="container">
	<article>
		<h2>Meme Template: {data.params.name}</h2>
			<form>
				<div class="grid">
					<label>
						Font size
						<input type="text" bind:value={fontSize} on:input={changeFontProperties} />
					</label>
					<label>
						Text color
						<input type="color" bind:value={fontColor} on:input={changeFontProperties} />
					</label>
				</div>
				<div class="grid">
					<button>Add image</button>
					<button on:click|preventDefault={() => addTextbox()}>Add textbox</button>
					<button on:click|preventDefault={() => downloadMeme()}>Download meme</button>
				</div>
			</form>
			<canvas bind:this={templateCanvas} width="0" height="0" />
	</article>
</main>
