import {
	type ChangeEvent,
	type MouseEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import { Canvas } from "./Canvas";
import {
	createNewTextbox,
	getCanvasMiddlePosition,
	updateTextboxField,
} from "./translation";
import type { BackgroundSource, TextAlignment, Textbox } from "./types";

export type MemeEditorProps = {
	background: BackgroundSource;
};

const loadImage = (url: string) =>
	new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new window.Image();
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error(`Failed to load image from ${url}`));
		image.src = url;
	});

const TextSizeInput = () => {
	const [value, setValue] = useState<number>(50);

	return (
		<label>
			Text size
			<input
				type="number"
				value={value}
				onChange={(event) => setValue(Number(event.target.value))}
			/>
		</label>
	);
};

const TextColorInput = () => {
	const [value, setValue] = useState<string>("#FFFFFF");

	return (
		<label>
			Text color
			<input
				type="color"
				value={value}
				onChange={(event) => setValue(event.target.value)}
			/>
		</label>
	);
};

const textAlignments: TextAlignment[] = ["center", "left", "right"];

const TextAlignmentInput = () => {
	const [value, setValue] = useState<TextAlignment>("center");

	return (
		<label>
			Text alignment
			<select
				value={value}
				onChange={(event) => setValue(event.target.value as TextAlignment)}
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
	const [value, setValue] = useState<number>(3);

	return (
		<label>
			Outline width: {value}
			<input
				type="range"
				min="0.5"
				max="10"
				step="0.5"
				value={value}
				onChange={(event) => setValue(Number(event.target.value))}
			/>
		</label>
	);
};

const ShadowStrengthInput = () => {
	const [value, setValue] = useState<number>(30);

	return (
		<label>
			Shadow strength: {value}
			<input
				type="range"
				min="0"
				max="50"
				step="1"
				value={value}
				onChange={(event) => setValue(Number(event.target.value))}
			/>
		</label>
	);
};

export const MemeEditor = ({ background }: MemeEditorProps) => {
	const imageUploadInputRef = useRef<HTMLInputElement | null>(null);

	const [backgroundImage, setBackgroundImage] =
		useState<HTMLImageElement | null>(null);
	const [textboxes, setTextboxes] = useState<Textbox[]>([]);
	const [isLoaded, setIsLoaded] = useState<boolean>(false);

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
		setTextboxes((previousTextboxes) => [
			...previousTextboxes,
			createNewTextbox(middlePosition),
		]);
	};

	const editTextbox = (id: string) => {
		const textbox = textboxes.find((item) => item.id === id);
		if (!textbox) {
			throw new Error("Textbox not found");
		}

		const updatedText = window.prompt("Edit text", textbox.text);
		if (updatedText === null) {
			return;
		}

		setTextboxes((previousTextboxes) =>
			updateTextboxField(previousTextboxes, id, "text", updatedText),
		);
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
			setIsLoaded(false);
			setBackgroundImage(null);
			setTextboxes([]);

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
				setIsLoaded(true);
			} catch (error) {
				if (controller.signal.aborted) {
					return;
				}

				console.error("Failed to load background image", error);
				return;
			}
		};

		void hydrateBackground();

		return () => {
			controller.abort();
			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
			}
		};
	}, [background]);

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
					<button onClick={openImageUpload} disabled={!isLoaded}>
						Add image
					</button>
					<button onClick={addTextbox} disabled={!isLoaded}>
						Add textbox
					</button>
					<button onClick={downloadMeme} disabled={!isLoaded}>
						Download meme
					</button>
					<button
						onClick={(event) => void copyToClipboard(event)}
						disabled={!isLoaded}
					>
						Copy meme to clipboard
					</button>
				</div>
			</form>
			{backgroundImage ? (
				<Canvas
					backgroundImage={backgroundImage}
					textboxes={textboxes}
					onEditTextbox={editTextbox}
				/>
			) : (
				<p>Loading canvas...</p>
			)}
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
