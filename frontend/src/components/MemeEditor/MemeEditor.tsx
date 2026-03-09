import { type ChangeEvent, type MouseEvent, useEffect, useRef } from "react";
import { Canvas } from "./Canvas";
import { useMemeEditorStore } from "./store";
import {
	createEditorImage,
	createTextbox,
	getCanvasMiddlePosition,
} from "./translation";
import type { BackgroundSource, TextAlignment, TextStyle } from "./types";

export type MemeEditorProps = {
	background: BackgroundSource;
};

const textAlignments: TextAlignment[] = ["center", "left", "right"];

const loadImage = (url: string) =>
	new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new window.Image();
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error(`Failed to load image from ${url}`));
		image.src = url;
	});

const TextSizeInput = () => {
	const value = useMemeEditorStore((state) => state.textStyle.fontSize);
	const setTextStyle = useMemeEditorStore((state) => state.setTextStyle);

	return (
		<label>
			Text size
			<input
				type="number"
				value={value}
				onChange={(event) =>
					setTextStyle("fontSize", Math.round(Number(event.target.value)))
				}
			/>
		</label>
	);
};

const TextColorInput = () => {
	const value = useMemeEditorStore((state) => state.textStyle.fill);
	const setTextStyle = useMemeEditorStore((state) => state.setTextStyle);

	return (
		<label>
			Text color
			<input
				type="color"
				value={value}
				onChange={(event) => setTextStyle("fill", event.target.value)}
			/>
		</label>
	);
};

const TextAlignmentInput = () => {
	const value = useMemeEditorStore((state) => state.textStyle.textAlign);
	const setTextStyle = useMemeEditorStore((state) => state.setTextStyle);

	return (
		<label>
			Text alignment
			<select
				value={value}
				onChange={(event) =>
					setTextStyle("textAlign", event.target.value as TextAlignment)
				}
			>
				{textAlignments.map((alignment) => (
					<option value={alignment} key={alignment}>
						{alignment}
					</option>
				))}
			</select>
		</label>
	);
};

const OutlineWidthInput = () => {
	const value = useMemeEditorStore((state) => state.textStyle.strokeWidth);
	const setTextStyle = useMemeEditorStore((state) => state.setTextStyle);

	return (
		<label>
			Outline width: {value}
			<input
				type="range"
				min="0.5"
				max="10"
				step="0.5"
				value={value}
				onChange={(event) =>
					setTextStyle("strokeWidth", Number(event.target.value))
				}
			/>
		</label>
	);
};

const ShadowStrengthInput = () => {
	const value = useMemeEditorStore((state) => state.textStyle.shadowBlur);
	const setTextStyle = useMemeEditorStore((state) => state.setTextStyle);

	return (
		<label>
			Shadow strength: {value}
			<input
				type="range"
				min="0"
				max="50"
				step="1"
				value={value}
				onChange={(event) =>
					setTextStyle("shadowBlur", Number(event.target.value))
				}
			/>
		</label>
	);
};

type AddImageButtonProps = {
	backgroundImage: HTMLImageElement;
	onAddImage: (image: ReturnType<typeof createEditorImage>) => void;
};

const AddImageButton = ({
	backgroundImage,
	onAddImage,
}: AddImageButtonProps) => {
	const imageUploadInputRef = useRef<HTMLInputElement | null>(null);

	const openImageUpload = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		const inputClicker = imageUploadInputRef.current;
		if (!inputClicker) {
			throw new Error("Image upload input ref is not set");
		}

		inputClicker.click();
	};

	const addImage = async (event: ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files || files.length === 0) {
			return;
		}

		// reset input
		event.target.value = "";

		const imageFile = files[0];
		const imageUrl = URL.createObjectURL(imageFile);
		try {
			const loadedImage = await loadImage(imageUrl);
			const middlePosition = getCanvasMiddlePosition(backgroundImage);
			onAddImage(createEditorImage(middlePosition, loadedImage));
		} finally {
			URL.revokeObjectURL(imageUrl);
		}
	};

	return (
		<>
			<button type="button" onClick={openImageUpload}>
				Add image
			</button>
			<input
				ref={imageUploadInputRef}
				type="file"
				accept="image/*"
				onChange={(event) => void addImage(event)}
				hidden
			/>
		</>
	);
};

type AddTextboxButtonProps = {
	backgroundImage: HTMLImageElement;
	textStyle: TextStyle;
	onAddTextbox: (textbox: ReturnType<typeof createTextbox>) => void;
};

const AddTextboxButton = ({
	backgroundImage,
	textStyle,
	onAddTextbox,
}: AddTextboxButtonProps) => {
	const addTextbox = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		const middlePosition = getCanvasMiddlePosition(backgroundImage);
		onAddTextbox(createTextbox(middlePosition, textStyle));
	};

	return (
		<button type="button" onClick={addTextbox}>
			Add textbox
		</button>
	);
};

export const MemeEditor = ({ background }: MemeEditorProps) => {
	const backgroundImage = useMemeEditorStore((state) => state.backgroundImage);
	const textStyle = useMemeEditorStore((state) => state.textStyle);
	const setBackgroundImage = useMemeEditorStore(
		(state) => state.setBackgroundImage,
	);
	const addTextboxToStore = useMemeEditorStore((state) => state.addTextbox);
	const addImageToStore = useMemeEditorStore((state) => state.addImage);

	const downloadMeme = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};

	const copyToClipboard = async (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};

	useEffect(() => {
		const controller = new AbortController();
		let objectUrl = "";

		const hydrateBackground = async () => {
			try {
				if (background.kind === "file") {
					objectUrl = URL.createObjectURL(background.file);
				} else {
					const response = await fetch(background.url, {
						signal: controller.signal,
					});
					const imageBlob = await response.blob();
					objectUrl = URL.createObjectURL(imageBlob);
				}

				const loadedBackgroundImage = await loadImage(objectUrl);
				if (controller.signal.aborted) {
					return;
				}

				setBackgroundImage(loadedBackgroundImage);
			} catch (error) {
				if (controller.signal.aborted) {
					return;
				}

				console.error("Failed to load background image", error);
			}
		};

		void hydrateBackground();

		return () => {
			controller.abort();
			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
			}
		};
	}, [background, setBackgroundImage]);

	if (!backgroundImage) {
		return <p>Loading canvas...</p>;
	}

	return (
		<>
			<form>
				<div className="grid">
					<TextSizeInput />
					<TextColorInput />
					<TextAlignmentInput />
				</div>
				<div className="grid">
					<OutlineWidthInput />
					<ShadowStrengthInput />
				</div>
				<div className="grid">
					<AddImageButton
						backgroundImage={backgroundImage}
						onAddImage={addImageToStore}
					/>
					<AddTextboxButton
						backgroundImage={backgroundImage}
						textStyle={textStyle}
						onAddTextbox={addTextboxToStore}
					/>
					<button onClick={downloadMeme}>Download meme</button>
					<button onClick={(event) => void copyToClipboard(event)}>
						Copy meme to clipboard
					</button>
				</div>
			</form>
			<Canvas backgroundImage={backgroundImage} />
		</>
	);
};
