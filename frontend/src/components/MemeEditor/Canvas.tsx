import { Image as KonvaImage, Layer, Stage } from "react-konva";

type CanvasProps = {
	backgroundImage: HTMLImageElement | null;
};

export const Canvas = ({ backgroundImage }: CanvasProps) => {
	if (!backgroundImage) {
		return null;
	}

	return (
		<Stage width={backgroundImage.naturalWidth} height={backgroundImage.naturalHeight}>
			<Layer>
				<KonvaImage
					image={backgroundImage}
					width={backgroundImage.naturalWidth}
					height={backgroundImage.naturalHeight}
					listening={false}
				/>
			</Layer>
		</Stage>
	);
};
