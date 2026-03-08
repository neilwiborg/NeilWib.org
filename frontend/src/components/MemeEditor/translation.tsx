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

export const createNewTextbox = (initialPosition: Point): Textbox => ({
	id: randomID(),
	text: DEFAULT_TEXT,
	x: initialPosition.x,
	y: initialPosition.y,
	rotation: DEFAULT_ROTATION,
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
			text={textbox.text}
			fontFamily={DEFAULT_FONT_FAMILY}
			fontSize={DEFAULT_FONT_SIZE}
			fill={DEFAULT_PRIMARY_TEXT_COLOR}
			stroke={DEFAULT_SECONDARY_TEXT_COLOR}
			strokeWidth={DEFAULT_STROKE_WIDTH}
			draggable
			onClick={() => handlers.onSelectTextbox(textbox.id)}
			onTap={() => handlers.onSelectTextbox(textbox.id)}
			onDblClick={() => handlers.onEditTextbox(textbox.id)}
			onDblTap={() => handlers.onEditTextbox(textbox.id)}
			onDragEnd={(event) => {
					const newPoint = {
						x: event.target.x(),
						y: event.target.y(),
					};
					handlers.onDragTextbox(textbox.id, newPoint);
				}
			}
			onTransformEnd={(event) => {
				const node = event.target as Konva.Text;
				handlers.onRotateTextbox(textbox.id, node.rotation());
			}}
		/>
	));

export const updateTextboxField = <K extends keyof Textbox>(
	textboxes: Textbox[],
	id: string,
	field: K,
	value: Textbox[K],
) =>
	textboxes.map((textbox) =>
		textbox.id === id
			? {
					...textbox,
					[field]: value,
				}
			: textbox,
	);
