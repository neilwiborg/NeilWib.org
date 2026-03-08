import { create } from "zustand";
import { updateTextbox } from "./translation";
import {
	DEFAULT_FONT_SIZE,
	DEFAULT_PRIMARY_TEXT_COLOR,
	DEFAULT_SHADOW_BLUR,
	DEFAULT_STROKE_WIDTH,
	DEFAULT_TEXT_ALIGNMENT,
	type Point,
	type Textbox,
	type TextStyle,
} from "./types";

type MemeEditorStore = {
	backgroundImage: HTMLImageElement | null;
	textboxes: Textbox[];
	textStyle: TextStyle;
	setBackgroundImage: (image: HTMLImageElement) => void;
	addTextbox: (textbox: Textbox) => void;
	setTextboxText: (id: string, text: string) => void;
	setTextboxPosition: (id: string, position: Point) => void;
	setTextboxTransform: (
		id: string,
		transform: Pick<Textbox, "x" | "y" | "rotation" | "width" | "fontSize">,
	) => void;
	setTextStyle: <K extends keyof TextStyle>(field: K, value: TextStyle[K]) => void;
};

export const useMemeEditorStore = create<MemeEditorStore>((set) => ({
	backgroundImage: null,
	textboxes: [],
	textStyle: {
		fontSize: DEFAULT_FONT_SIZE,
		fill: DEFAULT_PRIMARY_TEXT_COLOR,
		textAlign: DEFAULT_TEXT_ALIGNMENT,
		strokeWidth: DEFAULT_STROKE_WIDTH,
		shadowBlur: DEFAULT_SHADOW_BLUR,
	},
	setBackgroundImage: (image) =>
		set({
			backgroundImage: image,
		}),
	addTextbox: (textbox) =>
		set((state) => ({
			textboxes: [...state.textboxes, textbox],
		})),
	setTextboxText: (id, text) =>
		set((state) => ({
			textboxes: updateTextbox(state.textboxes, id, { text }),
		})),
	setTextboxPosition: (id, position) =>
		set((state) => ({
			textboxes: updateTextbox(state.textboxes, id, position),
		})),
	setTextboxTransform: (id, transform) =>
		set((state) => ({
			textboxes: updateTextbox(state.textboxes, id, transform),
			textStyle: {
				...state.textStyle,
				fontSize: Math.round(transform.fontSize),
			},
		})),
	setTextStyle: (field, value) =>
		set((state) => ({
			textStyle: {
				...state.textStyle,
				[field]: value,
			},
			textboxes: state.textboxes.map((textbox) => ({
				...textbox,
				[field]: value,
			})),
		})),
}));
