import type Konva from "konva";

export type TextAlignment = "center" | "left" | "right";

export type Point = {
	x: number;
	y: number;
};

export type BackgroundSource =
	| { kind: "file"; file: File }
	| { kind: "url"; url: string };

export const DEFAULT_TEXT = "Enter text";
export const DEFAULT_X_OFFSET = -100;
export const DEFAULT_Y_OFFSET = 0;
export const DEFAULT_ROTATION = 0;
export const DEFAULT_TEXT_ALIGNMENT: TextAlignment = "center";
export const DEFAULT_FONT_FAMILY = "Impact";
export const DEFAULT_FONT_SIZE = 50;
export const DEFAULT_STROKE_WIDTH = 3;
export const DEFAULT_PRIMARY_TEXT_COLOR = "#FFFFFF";
export const DEFAULT_SECONDARY_TEXT_COLOR = "#000000";

export type Textbox = Point & {
	id: string;
	text: string;
	rotation: number;
	width: number;
	fontSize: number;
};

export type TextboxHandlers = {
	onEditTextbox: (id: string) => void;
	onSelectTextbox: (id: string) => void;
	onDragTextbox: (id: string, position: Point) => void;
	onTransformTextbox: (
		id: string,
		transform: Pick<Textbox, "x" | "y" | "rotation" | "width" | "fontSize">,
	) => void;
	setTextboxRef: (id: string, node: Konva.Text | null) => void;
};
