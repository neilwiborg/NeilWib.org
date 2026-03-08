import { Canvas, FabricImage, Shadow, Textbox } from "fabric";
import {
	type ChangeEvent,
	type MouseEvent,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

type TextAlignment = "center" | "left" | "right";

const textAlignments: TextAlignment[] = ["center", "left", "right"];

type BackgroundSource =
	| { kind: "file"; file: File }
	| { kind: "url"; url: string };

export type MemeEditorProps = {
	background: BackgroundSource;
};

export const MemeEditor = ({ background }: MemeEditorProps) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const fabricCanvasRef = useRef<Canvas | null>(null);
	const textboxesRef = useRef<Textbox[]>([]);
	const imageUploadInputRef = useRef<HTMLInputElement | null>(null);

	const [fontSize, setFontSize] = useState<number>(50);
	const [strokeWidth, setStrokeWidth] = useState<number>(3);
	const [shadowBlur, setShadowBlur] = useState<number>(30);
	const [fontColor, setFontColor] = useState<string>("#FFFFFF");
	const [textAlignment, setTextAlignment] = useState<TextAlignment>("center");
	const [isLoaded, setIsLoaded] = useState<boolean>(false);

	const textShadow = useMemo(
		() =>
			new Shadow({
				color: "black",
				blur: shadowBlur,
			}),
		[shadowBlur],
	);

	useEffect(() => {
		let objectUrlToRevoke = "";
		let isDisposed = false;

		const loadBackground = async () => {
			const element = canvasRef.current;
			if (!element) {
				return;
			}

			setIsLoaded(false);
			textboxesRef.current = [];

			fabricCanvasRef.current?.dispose();
			fabricCanvasRef.current = null;

			let imageUrl = "";
			if (background.kind === "file") {
				imageUrl = URL.createObjectURL(background.file);
				objectUrlToRevoke = imageUrl;
			} else {
				const response = await fetch(background.url);
				const imageBlob = await response.blob();
				imageUrl = URL.createObjectURL(imageBlob);
				objectUrlToRevoke = imageUrl;
			}

			const backgroundImage = await FabricImage.fromURL(imageUrl);
			if (isDisposed) {
				backgroundImage.dispose();
				return;
			}

			const width = backgroundImage.getScaledWidth();
			const height = backgroundImage.getScaledHeight();
			element.width = width;
			element.height = height;

			const canvas = new Canvas(element);
			canvas.setDimensions({ width, height });
			fabricCanvasRef.current = canvas;

			canvas.backgroundImage = backgroundImage;
			canvas.requestRenderAll();
			setIsLoaded(true);
		};

		void loadBackground();

		return () => {
			isDisposed = true;
			fabricCanvasRef.current?.dispose();
			fabricCanvasRef.current = null;
			if (objectUrlToRevoke) {
				URL.revokeObjectURL(objectUrlToRevoke);
			}
		};
	}, [background]);

	useEffect(() => {
		const canvas = fabricCanvasRef.current;
		if (!canvas) {
			return;
		}

		for (const textbox of textboxesRef.current) {
			textbox.set("textAlign", textAlignment);
			textbox.set("fontSize", fontSize);
			textbox.set("fill", fontColor);
			textbox.set("strokeWidth", strokeWidth);
			textbox.set("shadow", textShadow);
		}

		canvas.renderAll();
	}, [fontColor, fontSize, strokeWidth, textAlignment, textShadow]);

	const addTextbox = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		const canvas = fabricCanvasRef.current;
		if (!canvas) {
			return;
		}

		const textbox = new Textbox("Enter text", {
			textAlign: textAlignment,
			fontFamily: "Impact",
			fontSize,
			fill: fontColor,
			stroke: "black",
			strokeWidth,
			width: 100,
			shadow: textShadow,
			editable: true,
		});

		textboxesRef.current.push(textbox);
		canvas.add(textbox);
	};

	const addImage = async (event: ChangeEvent<HTMLInputElement>) => {
		const canvas = fabricCanvasRef.current;
		if (!canvas || !event.target.files?.[0]) {
			return;
		}

		const imageFile = event.target.files[0];
		const imageUrl = URL.createObjectURL(imageFile);
		const image = await FabricImage.fromURL(imageUrl);
		canvas.add(image);
		event.target.value = "";
		URL.revokeObjectURL(imageUrl);
	};

	const openImageUpload = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		imageUploadInputRef.current?.click();
	};

	const downloadMeme = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		const canvas = fabricCanvasRef.current;
		if (!canvas) {
			return;
		}

		const downloadUrl = canvas.toDataURL({ format: "jpeg", multiplier: 1 });
		const link = document.createElement("a");
		link.download = "image.jpeg";
		link.href = downloadUrl;
		link.click();
	};

	const copyToClipboard = async (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		const canvas = fabricCanvasRef.current;
		if (!canvas) {
			return;
		}

		const downloadUrl = canvas.toDataURL({ format: "png", multiplier: 1 });
		const image = await fetch(downloadUrl);
		const imageBlob = await image.blob();
		const item = new ClipboardItem({ "image/png": imageBlob });
		await navigator.clipboard.write([item]);
	};

	return (
		<>
			<form>
				<div className="grid">
					<label>
						Text size
						<input
							type="number"
							value={fontSize}
							onChange={(event) => setFontSize(Number(event.target.value))}
						/>
					</label>
					<label>
						Text color
						<input
							type="color"
							value={fontColor}
							onChange={(event) => setFontColor(event.target.value)}
						/>
					</label>
					<label>
						Text alignment
						<select
							value={textAlignment}
							onChange={(event) =>
								setTextAlignment(event.target.value as TextAlignment)
							}
						>
							{textAlignments.map((alignment) => (
								<option value={alignment} key={alignment}>
									{alignment}
								</option>
							))}
						</select>
					</label>
				</div>
				<div className="grid">
					<label>
						Outline width: {strokeWidth}
						<input
							type="range"
							min="0.5"
							max="10"
							step="0.5"
							value={strokeWidth}
							onChange={(event) => setStrokeWidth(Number(event.target.value))}
						/>
					</label>
					<label>
						Shadow strength: {shadowBlur}
						<input
							type="range"
							min="0"
							max="50"
							step="1"
							value={shadowBlur}
							onChange={(event) => setShadowBlur(Number(event.target.value))}
						/>
					</label>
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
					<button onClick={copyToClipboard} disabled={!isLoaded}>
						Copy meme to clipboard
					</button>
				</div>
			</form>
			<canvas ref={canvasRef} width={0} height={0} hidden={!isLoaded}></canvas>
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
