import Konva from "konva";
import { uniformInt } from "pure-rand/distribution/uniformInt";
import { xoroshiro128plus } from "pure-rand/generator/xoroshiro128plus";
import { type JSX, useLayoutEffect, useRef } from "react";
import { Group, Image as KonvaImage, Text } from "react-konva";
import { randomID } from "../../util/util";
import {
	getFlipAdjustedPosition,
	getFlipModeAfterScale,
	getFlipOffsets,
	getFlipScale,
} from "./transforms";
import {
	DEFAULT_DISPLAY_FONT_SIZE,
	DEFAULT_ROTATION,
	DEFAULT_TEXT,
	DEFAULT_X_OFFSET,
	DEFAULT_Y_OFFSET,
	EDITOR_PREVIEW_MAX_HEIGHT,
	EDITOR_PREVIEW_MAX_WIDTH,
	type EditorImage,
	type ImageHandlers,
	type KeyType,
	MIN_FONT_SIZE,
	type NodeKey,
	type Point,
	type Textbox,
	type TextboxHandlers,
	type TextStyle,
} from "./types";

const MIN_TEXTBOX_WIDTH = 30;
const MIN_IMAGE_WIDTH = 20;
const MIN_IMAGE_HEIGHT = 20;
const DEFAULT_IMAGE_SCALE = 0.25;
const UINT32_RANGE = 2 ** 32;
// Match letters from any writing system, while leaving punctuation and symbols alone.
const UNICODE_LETTER_PATTERN = /\p{L}/u;

export const getPreviewScale = (backgroundImage: HTMLImageElement) => {
	const widthScale = EDITOR_PREVIEW_MAX_WIDTH / backgroundImage.naturalWidth;
	const heightScale = EDITOR_PREVIEW_MAX_HEIGHT / backgroundImage.naturalHeight;
	return Math.min(widthScale, heightScale, 1);
};

export const getDefaultFontSize = (previewScale: number) => {
	return Math.max(
		MIN_FONT_SIZE,
		Math.round(DEFAULT_DISPLAY_FONT_SIZE / previewScale),
	);
};

export const createNodeKey = (keyType: KeyType, id: string): NodeKey =>
	`${keyType}:${id}`;

export const parseNodeKey = (
	nodeKey: NodeKey,
): { keyType: KeyType; id: string } => {
	const [keyType, ...idParts] = nodeKey.split(":");
	return {
		keyType: keyType as KeyType,
		id: idParts.join(":"),
	};
};

const onDragEditorNodeEnd =
	<T extends { id: string }>(
		element: T,
		onDrag: (id: string, position: Point) => void,
	) =>
	(event: Konva.KonvaEventObject<DragEvent>) => {
		const newPoint = {
			x: event.target.x(),
			y: event.target.y(),
		};
		onDrag(element.id, newPoint);
	};

const onTransformTextboxEnd =
	(
		textbox: Textbox,
		handlers: TextboxHandlers,
		getTextNode: () => Konva.Text | null,
	) =>
	(event: Konva.KonvaEventObject<Event>) => {
		const node = event.target;
		if (!(node instanceof Konva.Group)) {
			return;
		}

		const textNode = getTextNode();
		if (!textNode) {
			return;
		}

		const signedScaleX = node.scaleX();
		const signedScaleY = node.scaleY();
		const scaleX = Math.abs(signedScaleX);
		const scaleY = Math.abs(signedScaleY);
		// Konva may decompose a handle crossing into a flip and a 180° rotation.
		// Keep the model rotation stable; the flip is stored separately in flipMode.
		const rotation =
			signedScaleX < 0 || signedScaleY < 0 ? textbox.rotation : node.rotation();
		const width = Math.max(MIN_TEXTBOX_WIDTH, textNode.width() * scaleX);
		const fontSize = Math.round(
			Math.max(MIN_FONT_SIZE, textbox.fontSize * scaleY),
		);
		const height = textNode.clone({ width, fontSize }).height();
		const position = getFlipAdjustedPosition(
			{ x: node.x(), y: node.y() },
			rotation,
			width,
			height,
			signedScaleX,
			signedScaleY,
		);
		const flipMode = getFlipModeAfterScale(
			textbox.flipMode,
			signedScaleX,
			signedScaleY,
		);

		node.scaleX(1);
		node.scaleY(1);

		handlers.onTransformTextbox(textbox.id, {
			...position,
			rotation,
			width,
			fontSize,
			flipMode,
		});
	};

const onTransformImageEnd =
	(image: EditorImage, handlers: ImageHandlers) =>
	(event: Konva.KonvaEventObject<Event>) => {
		const node = event.target;
		if (!(node instanceof Konva.Group)) {
			return;
		}

		const signedScaleX = node.scaleX();
		const signedScaleY = node.scaleY();
		const scaleX = Math.abs(signedScaleX);
		const scaleY = Math.abs(signedScaleY);
		// Keep rotation stable when Konva represents a handle crossing as a flip.
		const rotation =
			signedScaleX < 0 || signedScaleY < 0 ? image.rotation : node.rotation();
		const width = Math.max(MIN_IMAGE_WIDTH, image.width * scaleX);
		const height = Math.max(MIN_IMAGE_HEIGHT, image.height * scaleY);
		const position = getFlipAdjustedPosition(
			{ x: node.x(), y: node.y() },
			rotation,
			width,
			height,
			signedScaleX,
			signedScaleY,
		);
		const flipMode = getFlipModeAfterScale(
			image.flipMode,
			signedScaleX,
			signedScaleY,
		);

		node.scaleX(1);
		node.scaleY(1);

		handlers.onTransformImage(image.id, {
			...position,
			rotation,
			width,
			height,
			flipMode,
		});
	};

export const createRandomSeed = () => Math.floor(Math.random() * UINT32_RANGE);

export const randomizeTextCase = (text: string, seed: number) => {
	// A seeded generator keeps the same casing pattern between editor renders.
	const random = xoroshiro128plus(seed);

	return Array.from(text, (character) => {
		if (!UNICODE_LETTER_PATTERN.test(character)) {
			return character;
		}

		return uniformInt(random, 0, 1) === 0
			? character.toLowerCase()
			: character.toUpperCase();
	}).join("");
};

const getTextboxDisplayText = (textbox: Textbox) => {
	switch (textbox.caseMode) {
		case "uppercase":
			return textbox.text.toUpperCase();
		case "mocking":
			return randomizeTextCase(textbox.text, textbox.mockSeed);
		default:
			return textbox.text;
	}
};

const getTextboxFontStyle = (textbox: Textbox) => {
	const fontStyles = [];

	if (textbox.bold) {
		fontStyles.push("bold");
	}

	if (textbox.italic) {
		fontStyles.push("italic");
	}

	return fontStyles.join(" ");
};

const getTextboxTextDecoration = (textbox: Textbox) => {
	const decorations = [];

	if (textbox.underline) {
		decorations.push("underline");
	}

	if (textbox.strikethrough) {
		decorations.push("line-through");
	}

	return decorations.join(" ");
};

export const getCanvasMiddlePosition = (
	backgroundImage: HTMLImageElement,
): Point => ({
	x: backgroundImage.naturalWidth / 2 + DEFAULT_X_OFFSET,
	y: backgroundImage.naturalHeight / 2 + DEFAULT_Y_OFFSET,
});

export const createTextbox = (
	initialPosition: Point,
	textStyle: TextStyle,
): Textbox => ({
	id: randomID(),
	text: DEFAULT_TEXT,
	mockSeed: createRandomSeed(),
	x: initialPosition.x,
	y: initialPosition.y,
	rotation: DEFAULT_ROTATION,
	fontSize: textStyle.fontSize,
	fontFamily: textStyle.fontFamily,
	primaryColor: textStyle.primaryColor,
	secondaryColor: textStyle.secondaryColor,
	textAlign: textStyle.textAlign,
	strokeWidth: textStyle.strokeWidth,
	shadowBlur: textStyle.shadowBlur,
	caseMode: textStyle.caseMode,
	bold: textStyle.bold,
	italic: textStyle.italic,
	underline: textStyle.underline,
	strikethrough: textStyle.strikethrough,
	flipMode: "none",
});

export const createEditorImage = (
	initialPosition: Point,
	overlayImage: HTMLImageElement,
): EditorImage => {
	const width = overlayImage.naturalWidth * DEFAULT_IMAGE_SCALE;
	const height = overlayImage.naturalHeight * DEFAULT_IMAGE_SCALE;
	return {
		id: randomID(),
		image: overlayImage,
		x: initialPosition.x - width / 2,
		y: initialPosition.y - height / 2,
		rotation: DEFAULT_ROTATION,
		width,
		height,
		flipMode: "none",
	};
};

const TextboxKonvaNode = ({
	textbox,
	handlers,
}: {
	textbox: Textbox;
	handlers: TextboxHandlers;
}): JSX.Element => {
	const textNodeRef = useRef<Konva.Text | null>(null);

	// Use Konva's measured text bounds to keep flips in place before the canvas paints.
	useLayoutEffect(() => {
		const node = textNodeRef.current;
		if (!node) {
			return;
		}

		const { offsetX, offsetY } = getFlipOffsets(
			textbox.flipMode,
			node.width(),
			node.height(),
		);
		node.offsetX(offsetX);
		node.offsetY(offsetY);
	}, [textbox]);
	const flipScale = getFlipScale(textbox.flipMode);

	return (
		<Group
			ref={(node) => handlers.setNodeRef(textbox.id, node)}
			x={textbox.x}
			y={textbox.y}
			rotation={textbox.rotation}
			draggable
			onClick={() => handlers.onSelect(textbox.id)}
			onTap={() => handlers.onSelect(textbox.id)}
			onDblClick={() => handlers.onEditTextbox(textbox.id)}
			onDblTap={() => handlers.onEditTextbox(textbox.id)}
			onDragEnd={onDragEditorNodeEnd(textbox, handlers.onDrag)}
			onTransformEnd={onTransformTextboxEnd(
				textbox,
				handlers,
				() => textNodeRef.current,
			)}
		>
			<Text
				ref={textNodeRef}
				{...flipScale}
				width={textbox.width}
				text={getTextboxDisplayText(textbox)}
				fontFamily={textbox.fontFamily}
				fontSize={textbox.fontSize}
				fontStyle={getTextboxFontStyle(textbox)}
				fill={textbox.primaryColor}
				align={textbox.textAlign}
				textDecoration={getTextboxTextDecoration(textbox)}
				stroke={textbox.secondaryColor}
				strokeWidth={textbox.strokeWidth}
				shadowColor={textbox.secondaryColor}
				shadowBlur={textbox.shadowBlur}
			/>
		</Group>
	);
};

export const textboxesToKonvaText = (
	textboxes: Textbox[],
	handlers: TextboxHandlers,
): JSX.Element[] =>
	textboxes.map((textbox) => (
		<TextboxKonvaNode key={textbox.id} textbox={textbox} handlers={handlers} />
	));
const ImageKonvaNode = ({
	image,
	handlers,
}: {
	image: EditorImage;
	handlers: ImageHandlers;
}): JSX.Element => {
	const flipScale = getFlipScale(image.flipMode);
	const flipOffsets = getFlipOffsets(image.flipMode, image.width, image.height);

	return (
		<Group
			ref={(node) => handlers.setNodeRef(image.id, node)}
			x={image.x}
			y={image.y}
			rotation={image.rotation}
			draggable
			onClick={() => handlers.onSelect(image.id)}
			onTap={() => handlers.onSelect(image.id)}
			onDragEnd={onDragEditorNodeEnd(image, handlers.onDrag)}
			onTransformEnd={onTransformImageEnd(image, handlers)}
		>
			<KonvaImage
				image={image.image}
				width={image.width}
				height={image.height}
				{...flipScale}
				{...flipOffsets}
			/>
		</Group>
	);
};

export const imagesToKonvaImages = (
	images: EditorImage[],
	handlers: ImageHandlers,
): JSX.Element[] =>
	images.map((image) => (
		<ImageKonvaNode key={image.id} image={image} handlers={handlers} />
	));

export const updateTextbox = (
	textboxes: Textbox[],
	id: string,
	patch: Partial<Textbox>,
) =>
	textboxes.map((textbox) =>
		textbox.id === id
			? {
					...textbox,
					...patch,
				}
			: textbox,
	);
