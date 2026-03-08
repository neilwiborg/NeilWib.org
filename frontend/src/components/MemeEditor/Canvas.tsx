import type Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Image as KonvaImage, Layer, Stage, Transformer } from "react-konva";
import { textboxesToKonvaText } from "./translation";
import { useMemeEditorStore } from "./store";
import type { Textbox, TextboxHandlers } from "./types";

type CanvasProps = {
	backgroundImage: HTMLImageElement;
};

const syncTransformerSelection = (
	transformer: Konva.Transformer | null,
	selectedTextboxId: string | null,
	textboxNodeRefs: Map<string, Konva.Text>,
) => {
	if (!transformer) {
		return;
	}

	if (!selectedTextboxId) {
		transformer.nodes([]);
		transformer.getLayer()?.batchDraw();
		return;
	}

	const selectedNode = textboxNodeRefs.get(selectedTextboxId);
	if (!selectedNode) {
		transformer.nodes([]);
		transformer.getLayer()?.batchDraw();
		return;
	}

	transformer.nodes([selectedNode]);
	transformer.getLayer()?.batchDraw();
};

const clearStaleSelection = (
	selectedTextboxId: string | null,
	textboxes: Textbox[],
	setSelectedTextboxId: (id: string | null) => void,
) => {
	if (!selectedTextboxId) {
		return;
	}

	const textboxExists = textboxes.some((textbox) => textbox.id === selectedTextboxId);
	if (!textboxExists) {
		setSelectedTextboxId(null);
	}
};

const isStageBackgroundClick = (
	event: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
) => event.target === event.target.getStage();

const editTextbox = ({
	textboxes,
	setTextboxText,
	id,
}: {
	textboxes: Textbox[];
	setTextboxText: (id: string, text: string) => void;
	id: string;
}) => {
	const textbox = textboxes.find((item) => item.id === id);
	if (!textbox) {
		throw new Error("Textbox not found");
	}

	const updatedText = window.prompt("Edit text", textbox.text);
	if (updatedText === null) {
		return;
	}

	setTextboxText(id, updatedText);
};

const setTextboxRef = (
	textboxNodeRefs: Map<string, Konva.Text>,
	id: string,
	node: Konva.Text | null,
) => {
	if (node) {
		textboxNodeRefs.set(id, node);
		return;
	}

	textboxNodeRefs.delete(id);
};

export const Canvas = ({ backgroundImage }: CanvasProps) => {
	const textboxes = useMemeEditorStore((state) => state.textboxes);
	const setTextboxText = useMemeEditorStore((state) => state.setTextboxText);
	const setTextboxPosition = useMemeEditorStore((state) => state.setTextboxPosition);
	const setTextboxTransform = useMemeEditorStore((state) => state.setTextboxTransform);

	const [selectedTextboxId, setSelectedTextboxId] = useState<string | null>(null);
	const transformerRef = useRef<Konva.Transformer | null>(null);
	const textboxNodeRefs = useRef<Map<string, Konva.Text>>(new Map());

	useEffect(() => {
		syncTransformerSelection(
			transformerRef.current,
			selectedTextboxId,
			textboxNodeRefs.current,
		);
	}, [selectedTextboxId]);

	useEffect(() => {
		clearStaleSelection(selectedTextboxId, textboxes, setSelectedTextboxId);
	}, [selectedTextboxId, textboxes]);

	const textboxHandlers: TextboxHandlers = {
		onEditTextbox: (id) => editTextbox({ textboxes, setTextboxText, id }),
		onSelectTextbox: setSelectedTextboxId,
		onDragTextbox: setTextboxPosition,
		onTransformTextbox: setTextboxTransform,
		setTextboxRef: (id, node) => setTextboxRef(textboxNodeRefs.current, id, node),
	};

	const konvaText = textboxesToKonvaText(textboxes, textboxHandlers);

	return (
		<Stage
			width={backgroundImage.naturalWidth}
			height={backgroundImage.naturalHeight}
			onMouseDown={(event) => {
				if (isStageBackgroundClick(event)) {
					setSelectedTextboxId(null);
				}
			}}
			onTouchStart={(event) => {
				if (isStageBackgroundClick(event)) {
					setSelectedTextboxId(null);
				}
			}}
		>
			<Layer>
				<KonvaImage
					image={backgroundImage}
					width={backgroundImage.naturalWidth}
					height={backgroundImage.naturalHeight}
					listening={false}
				/>
				{konvaText}
				<Transformer
					ref={transformerRef}
					rotateEnabled
					resizeEnabled
				/>
			</Layer>
		</Stage>
	);
};
