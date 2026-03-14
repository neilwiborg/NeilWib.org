import { create } from "zustand";
import { parseNodeKey, updateTextbox } from "./translation";
import {
	DEFAULT_FONT_SIZE,
	DEFAULT_MEME_FONT,
	DEFAULT_PRIMARY_TEXT_COLOR,
	DEFAULT_SECONDARY_TEXT_COLOR,
	DEFAULT_SHADOW_BLUR,
	DEFAULT_STROKE_WIDTH,
	DEFAULT_TEXT_ALIGNMENT,
	type EditorImage,
	type ImageTransform,
	type NodeKey,
	type Textbox,
	type TextboxTransform,
	type TextStyle,
	type TextStyleScope,
} from "./types";

type MemeEditorState = {
	textboxes: Textbox[];
	images: EditorImage[];
	textStyleScope: TextStyleScope;
	selectedNodeKey: NodeKey | null;
	defaultFontSize: number | null;
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
	setSelectedNodeKey: (nodeKey: NodeKey | null) => void;
	deleteSelectedNode: () => void;
	setDefaultFontSize: (fontSize: number) => void;
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
	fontFamily: textbox.fontFamily,
	fontSize: textbox.fontSize,
	primaryColor: textbox.primaryColor,
	secondaryColor: textbox.secondaryColor,
	textAlign: textbox.textAlign,
	strokeWidth: textbox.strokeWidth,
	shadowBlur: textbox.shadowBlur,
	caps: textbox.caps,
	bold: textbox.bold,
	italic: textbox.italic,
	underline: textbox.underline,
	strikethrough: textbox.strikethrough,
});

const getSelectedTextbox = (state: MemeEditorState) => {
	if (!state.selectedNodeKey) {
		return null;
	}

	const { keyType, id } = parseNodeKey(state.selectedNodeKey);
	if (keyType !== "text") {
		return null;
	}

	const textbox = state.textboxes.find((item) => item.id === id);
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
	} else if (state.selectedNodeKey !== null) {
		const { keyType, id } = parseNodeKey(state.selectedNodeKey);
		if (keyType !== "text") {
			throw new Error(
				"cannot set text style when non-textbox node is selected",
			);
		}

		textboxes = updateTextbox(textboxes, id, {
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
		const defaultTextStyle = createDefaultTextStyle(state.defaultFontSize);
		return {
			textStyleScope: newScope,
			globalTextStyle: defaultTextStyle,
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

const applySelectedNodeDeletion = (
	state: MemeEditorState,
): Partial<MemeEditorState> => {
	if (!state.selectedNodeKey) {
		return state;
	}

	const { keyType, id } = parseNodeKey(state.selectedNodeKey);
	if (keyType === "text") {
		return {
			textboxes: state.textboxes.filter((textbox) => textbox.id !== id),
			selectedNodeKey: null,
		};
	}

	return {
		images: state.images.filter((image) => image.id !== id),
		selectedNodeKey: null,
	};
};

const createDefaultTextStyle = (fontSize: number | null): TextStyle => ({
	fontFamily: DEFAULT_MEME_FONT.fontFamily,
	fontSize: fontSize ?? DEFAULT_FONT_SIZE,
	primaryColor: DEFAULT_PRIMARY_TEXT_COLOR,
	secondaryColor: DEFAULT_SECONDARY_TEXT_COLOR,
	textAlign: DEFAULT_TEXT_ALIGNMENT,
	strokeWidth: DEFAULT_STROKE_WIDTH,
	shadowBlur: DEFAULT_SHADOW_BLUR,
	caps: true,
	bold: false,
	italic: false,
	underline: false,
	strikethrough: false,
});

const createInitialState = (
	defaultFontSize: number | null = null,
): MemeEditorState => ({
	textboxes: [],
	images: [],
	textStyleScope: "global",
	selectedNodeKey: null,
	defaultFontSize,
	globalTextStyle: createDefaultTextStyle(defaultFontSize),
});

export const useMemeEditorStore = create<MemeEditorStore>((set, get) => ({
	...createInitialState(),
	resetEditor: () =>
		set((state) =>
			createInitialState(state.defaultFontSize ?? DEFAULT_FONT_SIZE),
		),
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
	setSelectedNodeKey: (nodeKey) =>
		set(() => ({
			selectedNodeKey: nodeKey,
		})),
	deleteSelectedNode: () => set((state) => applySelectedNodeDeletion(state)),
	setDefaultFontSize: (fontSize) =>
		set(() => ({
			defaultFontSize: fontSize,
			globalTextStyle: createDefaultTextStyle(fontSize),
		})),
	setTextStyle: (field, value) =>
		set((state) => applyTextStyleChange(state, field, value)),
	getTextStyle: (field) => getTextStyleValue(get(), field),
}));
