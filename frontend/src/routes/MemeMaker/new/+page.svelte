<script lang="ts">
	import { fabric } from 'fabric';
	import { onMount } from 'svelte';

	type canvasObjects = {
		images: fabric.Image[];
		textboxes: fabric.Textbox[];
	};

	const textAlignments = [
		"center",
		"left",
		"right"
	];

	let mounted = false;
	let templates: FileList | undefined = undefined;
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
	let textAlignment = textAlignments[0];

	onMount(() => {
		mounted = true;
	});

	const loadBackground = (background: File) => {
		if (mounted && templateFabricCanvas === undefined) {
			templateFabricCanvas = new fabric.Canvas(templateCanvas!);
			templateFabricCanvas.selection = false;
			fabric.Image.fromURL(URL.createObjectURL(background), function (oImg) {
				templateFabricCanvas!.setBackgroundImage(oImg, () => {
					templateFabricCanvas!.setWidth(oImg.getScaledWidth());
					templateFabricCanvas!.setHeight(oImg.getScaledHeight());
					templateFabricCanvas!.renderAll();
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
		fabricObjects.textboxes.push(textbox);

		templateFabricCanvas!.add(textbox);
	};

	const changeFontProperties = () => {
		fabricObjects.textboxes.forEach((item, index) => {
			item.set('textAlign', textAlignment);
			item.fontSize = fontSize;
			item.set('fill', fontColor);
			item.strokeWidth = strokeWidth;
			item.shadow = new fabric.Shadow({
				color: "black",
				blur: shadowBlur
			});
		});
		templateFabricCanvas!.renderAll();
	};

	$: if (templates) {
		loadBackground(templates[0]);
	}

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
	<title>Meme Maker - New Template</title>
</svelte:head>

<main class="container">
	<article>
		<h2>New Meme Maker Template</h2>
		{#if !templates}
			<form>
				<input type="file" id="template" name="template" accept="image/*" bind:files={templates} />
			</form>
			<p>Please upload a meme template.</p>
		{/if}
		{#if templates}
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
					<button>Add image</button>
					<button on:click|preventDefault={() => addTextbox()}>Add textbox</button>
					<button on:click|preventDefault={() => downloadMeme()}>Download meme</button>
					<button on:click|preventDefault={() => copyToClipboard()}>Copy meme to clipboard</button>
				</div>
			</form>
		{/if}
		<canvas bind:this={templateCanvas} width="0" height="0" hidden={!templates} />
	</article>
</main>
