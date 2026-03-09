import type Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Image as KonvaImage, Layer, Stage, Transformer } from "react-konva";
import { useMemeEditorStore } from "./store";
import {
	createNodeKey,
	imagesToKonvaImages,
	parseNodeKey,
	textboxesToKonvaText,
} from "./translation";
import type {
	EditorImage,
	ImageHandlers,
	NodeKey,
	Textbox,
	TextboxHandlers,
} from "./types";

type CanvasProps = {
	backgroundImage: HTMLImageElement;
};

const syncTransformerSelection = (
	transformer: Konva.Transformer | null,
	selectedNodeKey: NodeKey | null,
	nodeRefs: Map<NodeKey, Konva.Node>,
) => {
	if (!transformer) {
		return;
	}

	if (!selectedNodeKey) {
		transformer.nodes([]);
		transformer.getLayer()?.batchDraw();
		return;
	}

	const selectedNode = nodeRefs.get(selectedNodeKey);
	if (!selectedNode) {
		transformer.nodes([]);
		transformer.getLayer()?.batchDraw();
		return;
	}

	transformer.nodes([selectedNode]);
	transformer.getLayer()?.batchDraw();
};

const clearStaleSelection = (
	selectedNodeKey: NodeKey | null,
	textboxes: Textbox[],
	images: EditorImage[],
	setSelectedNodeKey: (id: NodeKey | null) => void,
) => {
	if (!selectedNodeKey) {
		return;
	}

	const { keyType, id } = parseNodeKey(selectedNodeKey);
	const exists =
		(keyType === "text" && textboxes.some((textbox) => textbox.id === id)) ||
		(keyType === "image" && images.some((image) => image.id === id));
	if (!exists) {
		setSelectedNodeKey(null);
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

const setNodeRef = (
	nodeRefs: Map<NodeKey, Konva.Node>,
	nodeKey: NodeKey,
	node: Konva.Node | null,
) => {
	if (node) {
		nodeRefs.set(nodeKey, node);
		return;
	}

	nodeRefs.delete(nodeKey);
};

export const Canvas = ({ backgroundImage }: CanvasProps) => {
	const textboxes = useMemeEditorStore((state) => state.textboxes);
	const images = useMemeEditorStore((state) => state.images);
	const setTextboxText = useMemeEditorStore((state) => state.setTextboxText);
	const setTextboxTransform = useMemeEditorStore(
		(state) => state.setTextboxTransform,
	);
	const setImageTransform = useMemeEditorStore(
		(state) => state.setImageTransform,
	);

	const [selectedNodeKey, setSelectedNodeKey] = useState<NodeKey | null>(null);
	const transformerRef = useRef<Konva.Transformer | null>(null);
	const nodeRefs = useRef<Map<NodeKey, Konva.Node>>(new Map());

	useEffect(() => {
		syncTransformerSelection(
			transformerRef.current,
			selectedNodeKey,
			nodeRefs.current,
		);
	}, [selectedNodeKey]);

	useEffect(() => {
		clearStaleSelection(selectedNodeKey, textboxes, images, setSelectedNodeKey);
	}, [selectedNodeKey, textboxes, images]);

	const textboxHandlers: TextboxHandlers = {
		onEditTextbox: (id) => editTextbox({ textboxes, setTextboxText, id }),
		onSelect: (id) => setSelectedNodeKey(createNodeKey("text", id)),
		onDrag: setTextboxTransform,
		onTransformTextbox: setTextboxTransform,
		setNodeRef: (id, node) =>
			setNodeRef(nodeRefs.current, createNodeKey("text", id), node),
	};

	const imageHandlers: ImageHandlers = {
		onSelect: (id) => setSelectedNodeKey(createNodeKey("image", id)),
		onDrag: setImageTransform,
		onTransformImage: setImageTransform,
		setNodeRef: (id, node) =>
			setNodeRef(nodeRefs.current, createNodeKey("image", id), node),
	};

	const konvaText = textboxesToKonvaText(textboxes, textboxHandlers);
	const konvaImages = imagesToKonvaImages(images, imageHandlers);

	return (
		<Stage
			width={backgroundImage.naturalWidth}
			height={backgroundImage.naturalHeight}
			onMouseDown={(event) => {
				if (isStageBackgroundClick(event)) {
					setSelectedNodeKey(null);
				}
			}}
			onTouchStart={(event) => {
				if (isStageBackgroundClick(event)) {
					setSelectedNodeKey(null);
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
				{konvaImages}
				{konvaText}
				<Transformer ref={transformerRef} rotateEnabled resizeEnabled />
			</Layer>
		</Stage>
	);
};
