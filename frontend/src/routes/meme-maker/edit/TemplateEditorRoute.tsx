import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MemeEditor } from "../../../components/MemeEditor";
import {
	createDone,
	createError,
	createLoading,
	type Loadable,
	matchLoadable,
} from "../../../types/loadable";
import { loadImage } from "../../../util/images";

const fetchImageBlob = async (imageUrl: string, signal: AbortSignal) => {
	const response = await fetch(imageUrl, { signal });
	if (!response.ok) {
		throw new Error(`Failed to fetch image: ${response.status}`);
	}

	return response.blob();
};

const loadBackgroundImageFromUrl = async (
	imageUrl: string,
	signal: AbortSignal,
) => {
	const imageBlob = await fetchImageBlob(imageUrl, signal);
	const objectUrl = URL.createObjectURL(imageBlob);

	try {
		const image = await loadImage(objectUrl);
		return {
			image,
			objectUrl,
		};
	} catch (error) {
		URL.revokeObjectURL(objectUrl);
		throw error;
	}
};

const cleanupObjectUrl = (objectUrl: string) => {
	if (objectUrl) {
		URL.revokeObjectURL(objectUrl);
	}
};

const toErrorMessage = (caughtError: unknown) =>
	caughtError instanceof Error ? caughtError.message : "Failed to load editor";

export const TemplateEditorRoute = () => {
	const [searchParams] = useSearchParams();
	const name = searchParams.get("name");
	const templateUrlEncoded = searchParams.get("templateUrl");
	const [backgroundImage, setBackgroundImage] = useState<
		Loadable<HTMLImageElement>
	>(createLoading());

	if (!name || !templateUrlEncoded) {
		throw new Error("Missing template name and/or URL");
	}

	const templateUrl = decodeURIComponent(templateUrlEncoded);

	useEffect(() => {
		const controller = new AbortController();
		let objectUrl = "";
		setBackgroundImage(createLoading());

		const hydrateBackgroundImage = async () => {
			try {
				const result = await loadBackgroundImageFromUrl(
					templateUrl,
					controller.signal,
				);
				if (controller.signal.aborted) {
					cleanupObjectUrl(result.objectUrl);
					return;
				}

				objectUrl = result.objectUrl;
				setBackgroundImage(createDone(result.image));
			} catch (error) {
				if (controller.signal.aborted) {
					return;
				}

				console.error("Failed to load background image", error);
				setBackgroundImage(createError(toErrorMessage(error)));
			}
		};

		void hydrateBackgroundImage();

		return () => {
			controller.abort();
			cleanupObjectUrl(objectUrl);
		};
	}, [templateUrl]);

	return (
		<>
			<title>Meme Maker - {name}</title>
			<main className="container">
				<article>
					<h2>Meme Template: {name}</h2>
					{matchLoadable(backgroundImage, {
						loading: () => <p aria-busy="true">Loading editor...</p>,
						error: (error) => <p>{error.message}</p>,
						done: (image) => <MemeEditor backgroundImage={image.value} />,
					})}
				</article>
			</main>
		</>
	);
};
