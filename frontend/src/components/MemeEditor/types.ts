import type Konva from "konva";

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
export const DEFAULT_SHADOW_BLUR = 30;
export const IMAGE_MIME_TYPE = "image/png";

export type BackgroundSource =
	| { kind: "file"; file: File }
	| { kind: "url"; url: string };

export type KeyType = "text" | "image";
export type NodeKey = `${KeyType}:${string}`;

export type Point = {
	x: number;
	y: number;
};

export type EditorNode = Point & {
	id: string;
	rotation: number;
	width: number;
};

export type TextAlignment = "center" | "left" | "right";

export type TextStyle = {
	fontSize: number;
	fill: string;
	textAlign: TextAlignment;
	strokeWidth: number;
	shadowBlur: number;
};

export type Textbox = EditorNode &
	TextStyle & {
		text: string;
	};

export type EditorImage = EditorNode & {
	image: HTMLImageElement;
	height: number;
};

export type EditorNodeTransform = Partial<{
	x: EditorNode["x"];
	y: EditorNode["y"];
	rotation: EditorNode["rotation"];
	width: EditorNode["width"];
}>;

export type TextboxTransform = EditorNodeTransform &
	Partial<{
		fontSize: Textbox["fontSize"];
	}>;

export type ImageTransform = EditorNodeTransform &
	Partial<{
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
