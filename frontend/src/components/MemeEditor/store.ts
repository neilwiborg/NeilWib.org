import { create } from "zustand";
import { updateTextbox } from "./translation";
import type { Point, Textbox } from "./types";

type MemeEditorStore = {
	backgroundImage: HTMLImageElement | null;
	textboxes: Textbox[];
	setBackgroundImage: (image: HTMLImageElement) => void;
	addTextbox: (textbox: Textbox) => void;
	setTextboxText: (id: string, text: string) => void;
	setTextboxPosition: (id: string, position: Point) => void;
	setTextboxTransform: (
		id: string,
		transform: Pick<Textbox, "x" | "y" | "rotation" | "width" | "fontSize">,
	) => void;
};

export const useMemeEditorStore = create<MemeEditorStore>((set) => ({
	backgroundImage: null,
	textboxes: [],
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
		})),
}));
