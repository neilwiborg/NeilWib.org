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
	let strokeWidth = 3.0;
	let shadowBlur = 30;
	let fontColor = '#FFFFFF';

	onMount(() => {
		mounted = true;
		loadBackground();
	});

	const loadBackground = () => {
		if (mounted && templateFabricCanvas === undefined) {
			fetch(decodeURIComponent(data.params.imageURL))
			.then((res) => {
				res.blob()
				.then((blob: Blob) => {
					templateFabricCanvas = new fabric.Canvas(templateCanvas!);
					templateFabricCanvas.selection = false;
					fabric.Image.fromURL(URL.createObjectURL(blob), function (oImg) {
						templateFabricCanvas!.setBackgroundImage(oImg, () => {
							templateFabricCanvas!.setWidth(oImg.getScaledWidth());
							templateFabricCanvas!.setHeight(oImg.getScaledHeight());
							templateFabricCanvas!.renderAll();
						});
					});
				});
			});
		}
	};

	const addTextbox = () => {
		let shadow = new fabric.Shadow({
			color: "black",
			blur: shadowBlur
		});
		let textbox = new fabric.Textbox('Enter text', {
			fontFamily: 'Impact',
			fontSize: fontSize,
			fill: fontColor,
			stroke: 'black',
			strokeWidth: strokeWidth,
			width: 100,
			shadow: shadow,
			editable: true
		});
		fabricObjects.textboxes.push(textbox);

		templateFabricCanvas!.add(textbox);
	};

	const convertToCaps = (text: string) => {
		return text.toUpperCase();
	};

	const changeFontProperties = () => {
		fabricObjects.textboxes.forEach((item, index) => {
			item.fontSize = fontSize;
			item.set('fill', fontColor);
			item.strokeWidth = strokeWidth;
			item.shadow = new fabric.Shadow({
				color: "black",
				blur: shadowBlur
			});
			item.text = convertToCaps(item.text!);
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

	const copyToClipboard = () => {
		let downloadURL = templateFabricCanvas!.toDataURL({ format: 'png' });
		fetch(downloadURL)
		.then((res) => res.blob())
		.then((blob) => {
			const item = new ClipboardItem({ "image/png": blob });
    		navigator.clipboard.write([item]); 
		});
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
					<label>
						Outline width: {strokeWidth}
						<input type="range" min="0.5" max="10" step="0.5" bind:value={strokeWidth} on:input={changeFontProperties} />
					</label>
					<label>
						Shadow strength: {shadowBlur}
						<input type="range" min="0" max="50" step="1" bind:value={shadowBlur} on:input={changeFontProperties} />
					</label>
				</div>
				<div class="grid">
					<button>Add image</button>
					<button on:click|preventDefault={() => addTextbox()}>Add textbox</button>
					<button on:click|preventDefault={() => downloadMeme()}>Download meme</button>
					<button on:click|preventDefault={() => copyToClipboard()}>Copy meme to clipboard</button>
				</div>
			</form>
			<canvas bind:this={templateCanvas} width="0" height="0" />
	</article>
</main>
