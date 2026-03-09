import { create } from "zustand";
import { updateTextbox } from "./translation";
import {
	DEFAULT_FONT_SIZE,
	DEFAULT_PRIMARY_TEXT_COLOR,
	DEFAULT_SHADOW_BLUR,
	DEFAULT_STROKE_WIDTH,
	DEFAULT_TEXT_ALIGNMENT,
	type EditorImage,
	type ImageTransform,
	type Textbox,
	type TextboxTransform,
	type TextStyle,
} from "./types";

type MemeEditorStore = {
	backgroundImage: HTMLImageElement | null;
	textboxes: Textbox[];
	images: EditorImage[];
	textStyle: TextStyle;
	setBackgroundImage: (image: HTMLImageElement) => void;
	addTextbox: (textbox: Textbox) => void;
	addImage: (image: EditorImage) => void;
	setTextboxText: (id: string, text: string) => void;
	setTextboxTransform: (id: string, transform: TextboxTransform) => void;
	setImageTransform: (id: string, transform: ImageTransform) => void;
	setTextStyle: <K extends keyof TextStyle>(
		field: K,
		value: TextStyle[K],
	) => void;
};

export const useMemeEditorStore = create<MemeEditorStore>((set) => ({
	backgroundImage: null,
	textboxes: [],
	images: [],
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
	addImage: (image) =>
		set((state) => ({
			images: [...state.images, image],
		})),
	setTextboxText: (id, text) =>
		set((state) => ({
			textboxes: updateTextbox(state.textboxes, id, { text }),
		})),
	setTextboxTransform: (id, transform) =>
		set((state) => ({
			textboxes: updateTextbox(state.textboxes, id, transform),
			textStyle:
				transform.fontSize === undefined
					? state.textStyle
					: {
							...state.textStyle,
							fontSize: Math.round(transform.fontSize),
						},
		})),
	setImageTransform: (id, transform) =>
		set((state) => ({
			images: state.images.map((image) =>
				image.id === id
					? {
							...image,
							...transform,
						}
					: image,
			),
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
