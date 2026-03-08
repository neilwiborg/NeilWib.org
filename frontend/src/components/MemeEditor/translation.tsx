import type { JSX } from "react";
import { Text } from "react-konva";
import { randomID } from "../../util/util";
import {
	DEFAULT_TEXT,
	DEFAULT_X_OFFSET,
	DEFAULT_Y_OFFSET,
	type Point,
	type Textbox,
} from "./types";

export const createNewTextbox = (initialPosition: Point): Textbox => ({
	id: randomID(),
	text: DEFAULT_TEXT,
	x: initialPosition.x,
	y: initialPosition.y,
});

export const getCanvasMiddlePosition = (
	backgroundImage: HTMLImageElement,
): Point => ({
	x: backgroundImage.naturalWidth / 2 + DEFAULT_X_OFFSET,
	y: backgroundImage.naturalHeight / 2 + DEFAULT_Y_OFFSET,
});

export const textboxesToKonvaText = (
	textboxes: Textbox[],
	onEditTextbox: (id: string) => void,
): JSX.Element[] =>
	textboxes.map((textbox) => (
		<Text
			key={textbox.id}
			x={textbox.x}
			y={textbox.y}
			text={textbox.text}
			fontFamily="Impact"
			fontSize={50}
			fill="#FFFFFF"
			stroke="black"
			strokeWidth={3}
			onDblClick={() => onEditTextbox(textbox.id)}
			onDblTap={() => onEditTextbox(textbox.id)}
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
