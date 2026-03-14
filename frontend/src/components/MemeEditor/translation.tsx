import type Konva from "konva";
import type { JSX } from "react";
import { Image as KonvaImage, Text } from "react-konva";
import { randomID } from "../../util/util";
import {
	DEFAULT_DISPLAY_FONT_SIZE,
	DEFAULT_ROTATION,
	DEFAULT_SECONDARY_TEXT_COLOR,
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
	(textbox: Textbox, handlers: TextboxHandlers) =>
	(event: Konva.KonvaEventObject<Event>) => {
		const node = event.target as Konva.Text;
		const scaleX = node.scaleX();
		const scaleY = node.scaleY();

		node.scaleX(1);
		node.scaleY(1);

		handlers.onTransformTextbox(textbox.id, {
			x: node.x(),
			y: node.y(),
			rotation: node.rotation(),
			width: Math.max(MIN_TEXTBOX_WIDTH, node.width() * scaleX),
			fontSize: Math.round(Math.max(MIN_FONT_SIZE, textbox.fontSize * scaleY)),
		});
	};

const onTransformImageEnd =
	(image: EditorImage, handlers: ImageHandlers) =>
	(event: Konva.KonvaEventObject<Event>) => {
		const node = event.target as Konva.Image;
		const scaleX = node.scaleX();
		const scaleY = node.scaleY();

		node.scaleX(1);
		node.scaleY(1);

		handlers.onTransformImage(image.id, {
			x: node.x(),
			y: node.y(),
			rotation: node.rotation(),
			width: Math.max(MIN_IMAGE_WIDTH, image.width * scaleX),
			height: Math.max(MIN_IMAGE_HEIGHT, image.height * scaleY),
		});
	};

const getTextboxDisplayText = (textbox: Textbox) => {
	return textbox.caps ? textbox.text.toUpperCase() : textbox.text;
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
	x: initialPosition.x,
	y: initialPosition.y,
	rotation: DEFAULT_ROTATION,
	fontSize: textStyle.fontSize,
	fontFamily: textStyle.fontFamily,
	fill: textStyle.fill,
	textAlign: textStyle.textAlign,
	strokeWidth: textStyle.strokeWidth,
	shadowBlur: textStyle.shadowBlur,
	caps: textStyle.caps,
	bold: textStyle.bold,
	italic: textStyle.italic,
	underline: textStyle.underline,
	strikethrough: textStyle.strikethrough,
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
	};
};

export const textboxesToKonvaText = (
	textboxes: Textbox[],
	handlers: TextboxHandlers,
): JSX.Element[] =>
	textboxes.map((textbox) => (
		<Text
			key={textbox.id}
			ref={(node) => handlers.setNodeRef(textbox.id, node)}
			x={textbox.x}
			y={textbox.y}
			rotation={textbox.rotation}
			width={textbox.width}
			text={getTextboxDisplayText(textbox)}
			fontFamily={textbox.fontFamily}
			fontSize={textbox.fontSize}
			fontStyle={getTextboxFontStyle(textbox)}
			fill={textbox.fill}
			align={textbox.textAlign}
			textDecoration={getTextboxTextDecoration(textbox)}
			stroke={DEFAULT_SECONDARY_TEXT_COLOR}
			strokeWidth={textbox.strokeWidth}
			shadowColor={DEFAULT_SECONDARY_TEXT_COLOR}
			shadowBlur={textbox.shadowBlur}
			draggable
			onClick={() => handlers.onSelect(textbox.id)}
			onTap={() => handlers.onSelect(textbox.id)}
			onDblClick={() => handlers.onEditTextbox(textbox.id)}
			onDblTap={() => handlers.onEditTextbox(textbox.id)}
			onDragEnd={onDragEditorNodeEnd(textbox, handlers.onDrag)}
			onTransformEnd={onTransformTextboxEnd(textbox, handlers)}
		/>
	));

export const imagesToKonvaImages = (
	images: EditorImage[],
	handlers: ImageHandlers,
): JSX.Element[] =>
	images.map((image) => (
		<KonvaImage
			key={image.id}
			ref={(node) => handlers.setNodeRef(image.id, node)}
			image={image.image}
			x={image.x}
			y={image.y}
			width={image.width}
			height={image.height}
			rotation={image.rotation}
			draggable
			onClick={() => handlers.onSelect(image.id)}
			onTap={() => handlers.onSelect(image.id)}
			onDragEnd={onDragEditorNodeEnd(image, handlers.onDrag)}
			onTransformEnd={onTransformImageEnd(image, handlers)}
		/>
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
