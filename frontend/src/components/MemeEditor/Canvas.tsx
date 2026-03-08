import { Image as KonvaImage, Layer, Stage } from "react-konva";
import { textboxesToKonvaText } from "./translation";
import type { Textbox } from "./types";

type CanvasProps = {
	backgroundImage: HTMLImageElement;
	textboxes: Textbox[];
	onEditTextbox: (id: string) => void;
};

export const Canvas = ({
	backgroundImage,
	textboxes,
	onEditTextbox,
}: CanvasProps) => {
	const konvaText = textboxesToKonvaText(textboxes, onEditTextbox);

	return (
		<Stage
			width={backgroundImage.naturalWidth}
			height={backgroundImage.naturalHeight}
		>
			<Layer>
				<KonvaImage
					image={backgroundImage}
					width={backgroundImage.naturalWidth}
					height={backgroundImage.naturalHeight}
					listening={false}
				/>
				{konvaText}
			</Layer>
		</Stage>
	);
};
