import Konva from "konva";
import type { FlipAxis, FlipMode, Point } from "./types";

export const isFlippedOnAxis = (mode: FlipMode, axis: FlipAxis) =>
	mode === "both" || mode === axis;

export const getFlipScale = (mode: FlipMode) => ({
	scaleX: isFlippedOnAxis(mode, "horizontal") ? -1 : 1,
	scaleY: isFlippedOnAxis(mode, "vertical") ? -1 : 1,
});

export const getFlipOffsets = (
	mode: FlipMode,
	width: number,
	height: number,
) => ({
	offsetX: isFlippedOnAxis(mode, "horizontal") ? width : 0,
	offsetY: isFlippedOnAxis(mode, "vertical") ? height : 0,
});

export const toggleFlipMode = (mode: FlipMode, axis: FlipAxis): FlipMode => {
	const horizontal =
		isFlippedOnAxis(mode, "horizontal") !== (axis === "horizontal");
	const vertical = isFlippedOnAxis(mode, "vertical") !== (axis === "vertical");

	if (horizontal) {
		return vertical ? "both" : "horizontal";
	}

	return vertical ? "vertical" : "none";
};

export const getFlipModeAfterScale = (
	mode: FlipMode,
	scaleX: number,
	scaleY: number,
): FlipMode => {
	let nextMode = mode;
	if (scaleX < 0) {
		nextMode = toggleFlipMode(nextMode, "horizontal");
	}
	if (scaleY < 0) {
		nextMode = toggleFlipMode(nextMode, "vertical");
	}
	return nextMode;
};

export const getFlipAdjustedPosition = (
	position: Point,
	rotation: number,
	width: number,
	height: number,
	scaleX: number,
	scaleY: number,
): Point => {
	const radians = (rotation * Math.PI) / 180;
	const offsetX = scaleX < 0 ? -width : 0;
	const offsetY = scaleY < 0 ? -height : 0;
	const correction = new Konva.Transform()
		.rotate(radians)
		.point({ x: offsetX, y: offsetY });

	return {
		x: position.x + correction.x,
		y: position.y + correction.y,
	};
};
