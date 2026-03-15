import type Konva from "konva";

export const EDITOR_PREVIEW_MAX_WIDTH = 525;
export const EDITOR_PREVIEW_MAX_HEIGHT = 550;
export const DEFAULT_DISPLAY_FONT_SIZE = 50;
export const DEFAULT_TEXT = "Enter text";
export const DEFAULT_X_OFFSET = -100;
export const DEFAULT_Y_OFFSET = 0;
export const DEFAULT_ROTATION = 0;
export const DEFAULT_TEXT_ALIGNMENT: TextAlignment = "center";
export const DEFAULT_FONT_SIZE = 50;
export const MIN_FONT_SIZE = 8;
export const MIN_STROKE_WIDTH = 0;
export const MAX_STROKE_WIDTH = 10;
export const DEFAULT_STROKE_WIDTH = 3;
export const DEFAULT_PRIMARY_TEXT_COLOR = "#FFFFFF";
export const DEFAULT_SECONDARY_TEXT_COLOR = "#000000";
export const MIN_SHADOW_BLUR = 0;
export const MAX_SHADOW_BLUR = 50;
export const DEFAULT_SHADOW_BLUR = 30;
export const IMAGE_MIME_TYPE = "image/png";

export type KeyType = "text" | "image";
export type NodeKey = `${KeyType}:${string}`;

export type Point = {
	x: number;
	y: number;
};

export type EditorNode = Point & {
	id: string;
	rotation: number;
};

export type MemeFont = {
	label: string;
	fontFamily: string;
};

export const MEME_FONTS: MemeFont[] = [
	{
		label: "Impact",
		fontFamily: 'Impact, "Anton", sans-serif',
	},
	{
		label: "Arial",
		fontFamily: 'Arial, "Arimo", sans-serif',
	},
	{
		label: "Arial Black",
		fontFamily: '"Arial Black", "Archivo Black", sans-serif',
	},
	{
		label: "Comic Sans MS",
		fontFamily: '"Comic Sans MS", "Comic Neue", cursive',
	},
	{
		label: "Montserrat",
		fontFamily: '"Montserrat", sans-serif',
	},
	{
		label: "Bebas Neue",
		fontFamily: '"Bebas Neue", sans-serif',
	},
	{
		label: "Oswald",
		fontFamily: '"Oswald", sans-serif',
	},
	{
		label: "Luckiest Guy",
		fontFamily: '"Luckiest Guy", cursive',
	},
	{
		label: "Bangers",
		fontFamily: '"Bangers", cursive',
	},
];

export const DEFAULT_MEME_FONT = MEME_FONTS[0];

export type TextStyleScope = "global" | "selected";
export type TextAlignment = "center" | "left" | "right";

export type TextStyle = {
	fontFamily: string;
	fontSize: number;
	primaryColor: string;
	secondaryColor: string;
	textAlign: TextAlignment;
	strokeWidth: number;
	shadowBlur: number;
	caps: boolean;
	bold: boolean;
	italic: boolean;
	underline: boolean;
	strikethrough: boolean;
};

export type Textbox = EditorNode &
	TextStyle & {
		text: string;
		width?: number;
	};

export type EditorImage = EditorNode & {
	image: HTMLImageElement;
	width: number;
	height: number;
};

export type EditorNodeTransform = Partial<{
	x: EditorNode["x"];
	y: EditorNode["y"];
	rotation: EditorNode["rotation"];
}>;

export type TextboxTransform = EditorNodeTransform &
	Partial<{
		fontSize: Textbox["fontSize"];
		width: Textbox["width"];
	}>;

export type ImageTransform = EditorNodeTransform &
	Partial<{
		width: EditorImage["width"];
		height: EditorImage["height"];
	}>;

export type EditorNodeHandlers = {
	onSelect: (id: string) => void;
	onDrag: (id: string, position: Point) => void;
	setNodeRef: (id: string, node: Konva.Node | null) => void;
};

export type TextboxHandlers = EditorNodeHandlers & {
	onEditTextbox: (id: string) => void;
	onTransformTextbox: (id: string, transform: TextboxTransform) => void;
};

export type ImageHandlers = EditorNodeHandlers & {
	onTransformImage: (id: string, transform: ImageTransform) => void;
};
