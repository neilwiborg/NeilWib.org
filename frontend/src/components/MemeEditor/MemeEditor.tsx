import {
	type ChangeEvent,
	type MouseEvent,
	useEffect,
	useRef,
} from "react";
import { Canvas } from "./Canvas";
import { useMemeEditorStore } from "./store";
import { createTextbox, getCanvasMiddlePosition } from "./translation";
import type { BackgroundSource, TextAlignment } from "./types";

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

export const MemeEditor = ({ background }: MemeEditorProps) => {
	const imageUploadInputRef = useRef<HTMLInputElement | null>(null);

	const backgroundImage = useMemeEditorStore((state) => state.backgroundImage);
	const textStyle = useMemeEditorStore((state) => state.textStyle);
	const setBackgroundImage = useMemeEditorStore(
		(state) => state.setBackgroundImage,
	);
	const addTextboxToStore = useMemeEditorStore((state) => state.addTextbox);

	const openImageUpload = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		imageUploadInputRef.current?.click();
	};

	const addTextbox = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		if (!backgroundImage) {
			throw new Error("Background image is not loaded");
		}

		const middlePosition = getCanvasMiddlePosition(backgroundImage);
		addTextboxToStore(createTextbox(middlePosition, textStyle));
	};

	const addImage = async (event: ChangeEvent<HTMLInputElement>) => {
		event.target.value = "";
	};

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

	const loading = backgroundImage === null;

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
					<button onClick={openImageUpload} disabled={loading}>
						Add image
					</button>
					<button onClick={addTextbox} disabled={loading}>
						Add textbox
					</button>
					<button onClick={downloadMeme} disabled={loading}>
						Download meme
					</button>
					<button
						onClick={(event) => void copyToClipboard(event)}
						disabled={loading}
					>
						Copy meme to clipboard
					</button>
				</div>
			</form>
			{backgroundImage ? <Canvas backgroundImage={backgroundImage} /> : <p>Loading canvas...</p>}
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
