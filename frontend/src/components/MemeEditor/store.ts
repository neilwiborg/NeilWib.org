import { create } from "zustand";
import { updateTextboxField } from "./translation";
import type { Point, Textbox } from "./types";

type MemeEditorStore = {
	backgroundImage: HTMLImageElement | null;
	textboxes: Textbox[];
	setBackgroundImage: (image: HTMLImageElement) => void;
	addTextbox: (textbox: Textbox) => void;
	setTextboxText: (id: string, text: string) => void;
	setTextboxPosition: (id: string, position: Point) => void;
	setTextboxRotation: (id: string, rotation: number) => void;
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
			textboxes: updateTextboxField(state.textboxes, id, "text", text),
		})),
	setTextboxPosition: (id, position) =>
		set((state) => {
			const withUpdatedX = updateTextboxField(state.textboxes, id, "x", position.x);
			return {
				textboxes: updateTextboxField(withUpdatedX, id, "y", position.y),
			};
		}),
	setTextboxRotation: (id, rotation) =>
		set((state) => ({
			textboxes: updateTextboxField(state.textboxes, id, "rotation", rotation),
		})),
}));
