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

export type Textbox = Point & {
	id: string;
	text: string;
};
