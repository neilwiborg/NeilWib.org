import type Konva from "konva";
import type { JSX } from "react";
import { Text } from "react-konva";
import { randomID } from "../../util/util";
import {
	DEFAULT_ROTATION,
	DEFAULT_TEXT,
	DEFAULT_X_OFFSET,
	DEFAULT_Y_OFFSET,
	type Point,
	type TextboxHandlers,
	type Textbox,
	DEFAULT_STROKE_WIDTH,
	DEFAULT_PRIMARY_TEXT_COLOR,
	DEFAULT_SECONDARY_TEXT_COLOR,
	DEFAULT_FONT_SIZE,
	DEFAULT_FONT_FAMILY,
} from "./types";

const DEFAULT_TEXTBOX_WIDTH = 200;
const MIN_TEXTBOX_WIDTH = 30;
const MIN_FONT_SIZE = 8;

const onDragTextboxEnd = (
	textbox: Textbox,
	handlers: TextboxHandlers,
) => (event: Konva.KonvaEventObject<DragEvent>) => {
	const newPoint = {
		x: event.target.x(),
		y: event.target.y(),
	};
	handlers.onDragTextbox(textbox.id, newPoint);
};

const onTransformTextboxEnd = (
	textbox: Textbox,
	handlers: TextboxHandlers,
) => (event: Konva.KonvaEventObject<Event>) => {
	const node = event.target as Konva.Text;
	const scaleX = node.scaleX();
	const scaleY = node.scaleY();

	node.scaleX(1);
	node.scaleY(1);

	handlers.onTransformTextbox(textbox.id, {
		x: node.x(),
		y: node.y(),
		rotation: node.rotation(),
		width: Math.max(MIN_TEXTBOX_WIDTH, textbox.width * scaleX),
		fontSize: Math.max(MIN_FONT_SIZE, textbox.fontSize * scaleY),
	});
};

export const createTextbox = (initialPosition: Point): Textbox => ({
	id: randomID(),
	text: DEFAULT_TEXT,
	x: initialPosition.x,
	y: initialPosition.y,
	rotation: DEFAULT_ROTATION,
	width: DEFAULT_TEXTBOX_WIDTH,
	fontSize: DEFAULT_FONT_SIZE,
});

export const getCanvasMiddlePosition = (
	backgroundImage: HTMLImageElement,
): Point => ({
	x: backgroundImage.naturalWidth / 2 + DEFAULT_X_OFFSET,
	y: backgroundImage.naturalHeight / 2 + DEFAULT_Y_OFFSET,
});

export const textboxesToKonvaText = (
	textboxes: Textbox[],
	handlers: TextboxHandlers,
): JSX.Element[] =>
	textboxes.map((textbox) => (
		<Text
			key={textbox.id}
			ref={(node) => handlers.setTextboxRef(textbox.id, node)}
			x={textbox.x}
			y={textbox.y}
			rotation={textbox.rotation}
			width={textbox.width}
			text={textbox.text}
			fontFamily={DEFAULT_FONT_FAMILY}
			fontSize={textbox.fontSize}
			fill={DEFAULT_PRIMARY_TEXT_COLOR}
			stroke={DEFAULT_SECONDARY_TEXT_COLOR}
			strokeWidth={DEFAULT_STROKE_WIDTH}
			draggable
			onClick={() => handlers.onSelectTextbox(textbox.id)}
			onTap={() => handlers.onSelectTextbox(textbox.id)}
			onDblClick={() => handlers.onEditTextbox(textbox.id)}
			onDblTap={() => handlers.onEditTextbox(textbox.id)}
			onDragEnd={onDragTextboxEnd(textbox, handlers)}
			onTransformEnd={onTransformTextboxEnd(textbox, handlers)}
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
