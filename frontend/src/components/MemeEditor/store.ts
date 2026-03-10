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
	type TextStyleScope,
} from "./types";

type MemeEditorState = {
	textboxes: Textbox[];
	images: EditorImage[];
	textStyleScope: TextStyleScope;
	selectedTextboxId: string | null;
	globalTextStyle: TextStyle;
};

type MemeEditorStore = MemeEditorState & {
	resetEditor: () => void;
	addTextbox: (textbox: Textbox) => void;
	addImage: (image: EditorImage) => void;
	setTextboxText: (id: string, text: string) => void;
	setTextboxTransform: (id: string, transform: TextboxTransform) => void;
	setImageTransform: (id: string, transform: ImageTransform) => void;
	setTextStyleScope: (scope: TextStyleScope) => void;
	setSelectedTextboxId: (id: string | null) => void;
	setTextStyle: <K extends keyof TextStyle>(
		field: K,
		value: TextStyle[K],
	) => void;
	getTextStyle: <K extends keyof TextStyle>(field: K) => TextStyle[K];
};

const applyTextboxTransform = (
	state: MemeEditorState,
	id: string,
	transform: TextboxTransform,
) => {
	const textboxes = state.textboxes;
	const globalTextStyle = state.globalTextStyle;
	const textStyleScope = state.textStyleScope;

	if (transform.fontSize === undefined) {
		return {
			textboxes: updateTextbox(textboxes, id, transform),
			globalTextStyle,
		};
	}

	// update the textbox font size
	const roundedFontSize = Math.round(transform.fontSize);
	const nextTextboxes = updateTextbox(textboxes, id, {
		...transform,
		fontSize: roundedFontSize,
	});

	// if scope is global, update all textboxes to use the same font size
	if (textStyleScope === "global") {
		return applyGlobalTextStyleChange(
			{
				...state,
				textboxes: nextTextboxes,
			},
			"fontSize",
			roundedFontSize,
		);
	}

	return {
		textboxes: nextTextboxes,
		globalTextStyle,
	};
};

const toTextStyle = (textbox: Textbox): TextStyle => ({
	fontSize: textbox.fontSize,
	fill: textbox.fill,
	textAlign: textbox.textAlign,
	strokeWidth: textbox.strokeWidth,
	shadowBlur: textbox.shadowBlur,
});

const getSelectedTextbox = (state: MemeEditorState) => {
	if (!state.selectedTextboxId) {
		return null;
	}

	const textbox = state.textboxes.find(
		(textbox) => textbox.id === state.selectedTextboxId,
	);
	return textbox || null;
};

const getTextStyleValue = <K extends keyof TextStyle>(
	state: MemeEditorState,
	field: K,
): TextStyle[K] => {
	if (state.textStyleScope === "selected") {
		const selectedTextbox = getSelectedTextbox(state);
		if (selectedTextbox) {
			return selectedTextbox[field];
		}
	}

	return state.globalTextStyle[field];
};

const applyGlobalTextStyleChange = <K extends keyof TextStyle>(
	state: MemeEditorState,
	field: K,
	value: TextStyle[K],
): Pick<MemeEditorState, "textboxes" | "globalTextStyle"> => {
	const textboxes = state.textboxes.map((textbox) => ({
		...textbox,
		[field]: value,
	}));

	const globalTextStyle = {
		...state.globalTextStyle,
		[field]: value,
	};

	return {
		textboxes,
		globalTextStyle,
	};
};

const applyTextStyleChange = <K extends keyof TextStyle>(
	state: MemeEditorState,
	field: K,
	value: TextStyle[K],
) => {
	let textboxes = state.textboxes;

	// update all textboxes
	if (state.textStyleScope === "global") {
		return applyGlobalTextStyleChange(state, field, value);
		// update just the selected textbox
	} else if (state.selectedTextboxId) {
		textboxes = updateTextbox(textboxes, state.selectedTextboxId, {
			[field]: value,
		});
	}

	return {
		textboxes,
	};
};

const applyTextStyleScopeChange = (
	state: MemeEditorState,
	newScope: TextStyleScope,
) => {
	// short-circuit if scope isn't changing
	if (newScope === state.textStyleScope) {
		return { textStyleScope: newScope };
	}

	// if switching scope to selected, reset global text style to default
	if (newScope === "selected") {
		const intialState = createInitialState();
		return {
			textStyleScope: newScope,
			globalTextStyle: intialState.globalTextStyle,
		};
	}

	// short-circuit if switching scope to global and no textboxes exist
	if (state.textboxes.length === 0) {
		return { textStyleScope: newScope };
	}

	// if switching scope to global, update all textboxes to use the same style as the first textbox
	const firstTextbox = state.textboxes[0];
	const nextTextStyle = toTextStyle(firstTextbox);
	const textboxes = state.textboxes.map((textbox) => ({
		...textbox,
		...nextTextStyle,
	}));

	// update scope, set global text style to match the first textbox, and update all textboxes
	return {
		textStyleScope: newScope,
		globalTextStyle: nextTextStyle,
		textboxes,
	};
};

const createInitialState = (): MemeEditorState => ({
	textboxes: [],
	images: [],
	textStyleScope: "global",
	selectedTextboxId: null,
	globalTextStyle: {
		fontSize: DEFAULT_FONT_SIZE,
		fill: DEFAULT_PRIMARY_TEXT_COLOR,
		textAlign: DEFAULT_TEXT_ALIGNMENT,
		strokeWidth: DEFAULT_STROKE_WIDTH,
		shadowBlur: DEFAULT_SHADOW_BLUR,
	},
});

export const useMemeEditorStore = create<MemeEditorStore>((set, get) => ({
	...createInitialState(),
	resetEditor: () => set(createInitialState()),
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
			return applyTextboxTransform(state, id, transform);
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
	setTextStyleScope: (scope) =>
		set((state) => applyTextStyleScopeChange(state, scope)),
	setSelectedTextboxId: (id) =>
		set(() => ({
			selectedTextboxId: id,
		})),
	setTextStyle: (field, value) =>
		set((state) => applyTextStyleChange(state, field, value)),
	getTextStyle: (field) => getTextStyleValue(get(), field),
}));
