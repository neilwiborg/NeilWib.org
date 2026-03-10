import {
	type ChangeEvent,
	type MouseEvent,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Canvas, type CanvasHandle } from "./Canvas";
import { useMemeEditorStore } from "./store";
import {
	createEditorImage,
	createTextbox,
	getCanvasMiddlePosition,
	getDefaultFontSize,
	getPreviewScale,
} from "./translation";
import type {
	BackgroundSource,
	TextAlignment,
	TextStyle,
	TextStyleScope,
} from "./types";
import { IMAGE_MIME_TYPE } from "./types";

export type MemeEditorProps = {
	background: BackgroundSource;
};

const textAlignments: TextAlignment[] = ["center", "left", "right"];

const loadImage = (url: string) => {
	return new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new window.Image();
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error(`Failed to load image from ${url}`));
		image.src = url;
	});
};

type TextSizeInputProps = {
	previewScale: number;
};

const TextSizeInput = ({ previewScale }: TextSizeInputProps) => {
	const value = useMemeEditorStore((state) => state.textStyle.fontSize);
	const setTextStyle = useMemeEditorStore((state) => state.setTextStyle);
	const displayValue = Math.max(1, Math.round(value * previewScale));

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		// round text size to nearest int
		const inputSize = Math.round(Number(event.target.value));
		const isValidNumber = Number.isFinite(inputSize) && inputSize > 0;

		// clamp display size to 1 if input is invalid
		const clampedDisplaySize = isValidNumber ? inputSize : 1;

		// convert display size to actual size
		const actualSize = Math.max(
			1,
			Math.round(clampedDisplaySize / previewScale),
		);

		setTextStyle("fontSize", actualSize);
	};

	return (
		<label>
			Text size
			<input
				type="number"
				value={displayValue}
				onChange={handleChange}
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

const TextStyleScopeInput = () => {
	const value = useMemeEditorStore((state) => state.textStyleScope);
	const setTextStyleScope = useMemeEditorStore(
		(state) => state.setTextStyleScope,
	);

	const onToggle = (event: ChangeEvent<HTMLInputElement>) => {
		const nextScope: TextStyleScope = event.target.checked ? "all" : "selected";
		setTextStyleScope(nextScope);
	};

		return (
			<label>
				<input
					type="checkbox"
					role="switch"
					aria-checked={value === "all"}
					checked={value === "all"}
					onChange={onToggle}
				/>
				Apply styles to all textboxes
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

type DownloadMemeButtonProps = {
	getMemeBlob: () => Promise<Blob>;
};

const DownloadMemeButton = ({ getMemeBlob }: DownloadMemeButtonProps) => {
	const downloadLinkRef = useRef<HTMLAnchorElement | null>(null);

	const downloadMeme = async () => {
		const link = downloadLinkRef.current;
		if (!link) {
			throw new Error("Download link is not ready");
		}

		const imageBlob = await getMemeBlob();
		const downloadUrl = URL.createObjectURL(imageBlob);
		link.href = downloadUrl;
		link.download = "meme.png";
		link.click();
		window.requestAnimationFrame(() => {
			URL.revokeObjectURL(downloadUrl);
		});
	};

	return (
		<>
			<button type="button" onClick={downloadMeme}>
				Download meme
			</button>
			{/** biome-ignore lint/a11y/useAnchorContent: not a real link */}
			{/** biome-ignore lint/a11y/useValidAnchor: not a real link */}
			<a ref={downloadLinkRef} hidden></a>
		</>
	);
};

type CopyMemeButtonProps = {
	getMemeBlob: () => Promise<Blob>;
};

const CopyMemeButton = ({ getMemeBlob }: CopyMemeButtonProps) => {
	const copyToClipboard = async () => {
		const imageBlob = await getMemeBlob();
		const clipboardItem = new window.ClipboardItem({
			[IMAGE_MIME_TYPE]: imageBlob,
		});
		await window.navigator.clipboard.write([clipboardItem]);
	};

	return (
		<button type="button" onClick={copyToClipboard}>
			Copy meme to clipboard
		</button>
	);
};

export const MemeEditor = ({ background }: MemeEditorProps) => {
	const textStyle = useMemeEditorStore((state) => state.textStyle);
	const addTextboxToStore = useMemeEditorStore((state) => state.addTextbox);
	const addImageToStore = useMemeEditorStore((state) => state.addImage);
	const resetEditor = useMemeEditorStore((state) => state.resetEditor);
	const setTextStyle = useMemeEditorStore((state) => state.setTextStyle);
	const [backgroundImage, setBackgroundImage] =
		useState<HTMLImageElement | null>(null);
	const canvasRef = useRef<CanvasHandle>(null);

	const downloadBlob = useCallback(async () => {
		const canvas = canvasRef.current;
		if (!canvas) {
			throw new Error("Canvas export is not ready");
		}
		return canvas.exportBlob();
	}, []);

	useEffect(() => {
		const controller = new AbortController();
		let objectUrl = "";
		setBackgroundImage(null);
		resetEditor();

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
	}, [background, resetEditor]);

	const previewScale = useMemo(() => {
		if (!backgroundImage) {
			return 1;
		}
		return getPreviewScale(backgroundImage);
	}, [backgroundImage]);

	useEffect(() => {
		const defaultActualFontSize = getDefaultFontSize(previewScale);
		setTextStyle("fontSize", defaultActualFontSize);
	}, [previewScale, setTextStyle]);

	if (!backgroundImage) {
		return <p>Loading canvas...</p>;
	}

	return (
		<>
			<form>
				<div className="grid">
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
					</div>
					<div></div>
				</div>
				<div className="grid">
					<div>
						<Canvas
							ref={canvasRef}
							backgroundImage={backgroundImage}
							previewScale={previewScale}
						/>
					</div>
					<div>
						<TextStyleScopeInput />
						<div className="grid">
							<TextSizeInput previewScale={previewScale} />
							<TextColorInput />
							<TextAlignmentInput />
						</div>
						<div className="grid">
							<OutlineWidthInput />
							<ShadowStrengthInput />
						</div>
					</div>
				</div>
			</form>
			<div className="grid">
				<DownloadMemeButton getMemeBlob={downloadBlob} />
				<CopyMemeButton getMemeBlob={downloadBlob} />
			</div>
		</>
	);
};
