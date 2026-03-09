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
	textboxes: Textbox[];
	images: EditorImage[];
	textStyle: TextStyle;
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

const applyTextboxTransform = (
	textboxes: Textbox[],
	id: string,
	transform: TextboxTransform,
	textStyle: TextStyle,
) => {
	if (transform.fontSize === undefined) {
		return {
			textboxes: updateTextbox(textboxes, id, transform),
			textStyle,
		};
	}

	const roundedFontSize = Math.round(transform.fontSize);
	const nextTextboxes = updateTextbox(textboxes, id, {
		...transform,
		fontSize: roundedFontSize,
	});

	return {
		textboxes: nextTextboxes.map((textbox) => ({
			...textbox,
			fontSize: roundedFontSize,
		})),
		textStyle: {
			...textStyle,
			fontSize: roundedFontSize,
		},
	};
};

export const useMemeEditorStore = create<MemeEditorStore>((set) => ({
	textboxes: [],
	images: [],
	textStyle: {
		fontSize: DEFAULT_FONT_SIZE,
		fill: DEFAULT_PRIMARY_TEXT_COLOR,
		textAlign: DEFAULT_TEXT_ALIGNMENT,
		strokeWidth: DEFAULT_STROKE_WIDTH,
		shadowBlur: DEFAULT_SHADOW_BLUR,
	},
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
		set((state) => {
			const result = applyTextboxTransform(
				state.textboxes,
				id,
				transform,
				state.textStyle,
			);

			return {
				textboxes: result.textboxes,
				textStyle: result.textStyle,
			};
		}),
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
