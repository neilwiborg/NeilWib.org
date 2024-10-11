<script lang="ts">
	import { Canvas, Textbox, Shadow, FabricImage } from 'fabric';
	import { onMount } from 'svelte';
	import { page } from "$app/stores";

	type canvasObjects = {
		images: FabricImage[];
		textboxes: Textbox[];
	};

	type templateDataType = {
		id: string;
		templateURL: string;
		imgflipID: number;
		title: string;
	};

	const textAlignments = [
		"center",
		"left",
		"right"
	];

	let templateData: templateDataType | null = null;

	let mounted = false;
	let templateCanvas: HTMLCanvasElement | undefined = undefined;
	let templateFabricCanvas: Canvas | undefined = undefined;
	let fabricObjects: canvasObjects = {
		images: [],
		textboxes: []
	};
	let fontSize = 50;
	let strokeWidth = 3.0;
	let shadowBlur = 30;
	let fontColor = '#FFFFFF';
	let textAlignment = textAlignments[0];
	let uploadImage: FileList | undefined = undefined;

	onMount(async () => {
		await getTemplateData();
		mounted = true;
		await loadBackground();
	});

	const getTemplateData = async () => {
      const res = await fetch(import.meta.env.VITE_BACKEND_HOSTNAME + "/mememaker/meme?" + new URLSearchParams({
        id: $page.params.slug
      }));
      templateData = (await res.json())[0];
    }

	const loadBackground = async () => {
		if (mounted && templateFabricCanvas === undefined) {
			let res = await fetch(templateData!.templateURL);
			let blob = await res.blob();
			templateFabricCanvas = new Canvas(templateCanvas!);
			templateFabricCanvas.selection = false;
			let oImage = await FabricImage.fromURL(URL.createObjectURL(blob));
			templateFabricCanvas!.set("backgroundImage", oImage);
			templateFabricCanvas!.setDimensions({
				width: oImage.getScaledWidth(),
				height: oImage.getScaledHeight()
			});
			templateFabricCanvas!.renderAll();
		}
	};

	const openFileDialog = () => {
		let fileInput = document.getElementById("fileInput");
		fileInput!.click();
	};

	const addImage = async () => {
		console.log("change");
		if (uploadImage) {
			let image = await FabricImage.fromURL(URL.createObjectURL(uploadImage[0]));
			fabricObjects.images.push(image);
			templateFabricCanvas!.add(image);
		}
	};

	const addTextbox = () => {
		let shadow = new Shadow({
			color: "black",
			blur: shadowBlur
		});
		let textbox = new Textbox('Enter text', {
			textAlign: textAlignment,
			fontFamily: 'Impact',
			fontSize: fontSize,
			fill: fontColor,
			stroke: 'black',
			strokeWidth: strokeWidth,
			width: 100,
			shadow: shadow,
			editable: true
		});
		textbox.set
		fabricObjects.textboxes.push(textbox);

		templateFabricCanvas!.add(textbox);
	};

	const convertToCaps = (text: string) => {
		return text.toUpperCase();
	};

	const changeFontProperties = () => {
		fabricObjects.textboxes.forEach((item, index) => {
			item.set('textAlign', textAlignment);
			item.fontSize = fontSize;
			item.set('fill', fontColor);
			item.strokeWidth = strokeWidth;
			item.shadow = new Shadow({
				color: "black",
				blur: shadowBlur
			});
		});
		templateFabricCanvas!.renderAll();
	};

	const downloadMeme = () => {
		let downloadURL = templateFabricCanvas!.toDataURL({ multiplier: 1, format: 'jpeg' });
		let link = document.createElement('a');
		link.download = 'image.jpeg';
		link.href = downloadURL;
		link.click();
	};

	const copyToClipboard = async () => {
		let downloadURL = templateFabricCanvas!.toDataURL({ multiplier: 1, format: 'jpeg' });
		let res = await fetch(downloadURL);
		let blob = await res.blob();
		const item = new ClipboardItem({ "image/png": blob });
		navigator.clipboard.write([item]);
	};
</script>

<svelte:head>
	{#if templateData}
		<title>Meme Maker - {templateData.title}</title>
	{:else}
	<title>Meme Maker - loading template...</title>
	{/if}
	<meta name="robots" content="noindex">
</svelte:head>

<main class="container">
	<article>
		{#if templateData}
		<h2>Meme Template: {templateData.title}</h2>
			<form>
				<div class="grid">
					<label>
						Text size
						<input type="text" bind:value={fontSize} on:input={changeFontProperties} />
					</label>
					<label>
						Text color
						<input type="color" bind:value={fontColor} on:input={changeFontProperties} />
					</label>
					<label>
						Text alignment
						<select bind:value={textAlignment} on:change={changeFontProperties}>
							{#each textAlignments as align}
								<option value={align}>{align}</option>
							{/each}
						</select>
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
					<button on:click|preventDefault={() => openFileDialog()} on:input={async () => await addImage()}>Add image</button>
					<button on:click|preventDefault={() => addTextbox()}>Add textbox</button>
					<button on:click|preventDefault={() => downloadMeme()}>Download meme</button>
					<button on:click|preventDefault={async () => await copyToClipboard()}>Copy meme to clipboard</button>
				</div>
			</form>
			<canvas bind:this={templateCanvas} width=0 height=0 />
	{:else}
		<h2 aria-busy="true">Loading template...</h2>
	{/if}
	</article>
</main>

<input name="fileInput" id="fileInput" type="file" accept="image/*" bind:files={uploadImage} hidden/>
