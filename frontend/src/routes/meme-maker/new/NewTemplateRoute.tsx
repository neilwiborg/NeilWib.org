import { type ChangeEvent, useEffect, useState } from "react";
import { MemeEditor } from "../../../components/MemeEditor";
import {
	createDone,
	createError,
	createLoading,
	type Loadable,
	matchLoadable,
} from "../../../types/loadable";
import { loadImage } from "../../../util/images";

const loadBackgroundImageFromFile = async (templateFile: File) => {
	const objectUrl = URL.createObjectURL(templateFile);

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

type TemplatePickerProps = {
	onTemplateSelected: (file: File | null) => void;
};

const TemplatePicker = ({ onTemplateSelected }: TemplatePickerProps) => {
	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		onTemplateSelected(event.target.files?.[0] ?? null);
	};

	return (
		<>
			<form>
				<input
					type="file"
					id="template"
					name="template"
					accept="image/*"
					onChange={handleChange}
				/>
			</form>
			<p>Please upload a meme template.</p>
		</>
	);
};

type TemplateEditorLoaderProps = {
	templateFile: File;
};

const TemplateEditorLoader = ({ templateFile }: TemplateEditorLoaderProps) => {
	const [backgroundImage, setBackgroundImage] = useState<
		Loadable<HTMLImageElement>
	>(createLoading());

	useEffect(() => {
		let isActive = true;
		let objectUrl = "";
		setBackgroundImage(createLoading());

		const hydrateBackgroundImage = async () => {
			try {
				const result = await loadBackgroundImageFromFile(templateFile);
				if (!isActive) {
					cleanupObjectUrl(result.objectUrl);
					return;
				}

				objectUrl = result.objectUrl;
				setBackgroundImage(createDone(result.image));
			} catch (error) {
				if (!isActive) {
					return;
				}

				console.error("Failed to load background image", error);
				setBackgroundImage(createError(toErrorMessage(error)));
			}
		};

		void hydrateBackgroundImage();

		return () => {
			isActive = false;
			cleanupObjectUrl(objectUrl);
		};
	}, [templateFile]);

	return matchLoadable(backgroundImage, {
		loading: () => <p aria-busy="true">Loading editor...</p>,
		error: (error) => <p>{error.message}</p>,
		done: (image) => <MemeEditor backgroundImage={image.value} />,
	});
};

export const NewTemplateRoute = () => {
	const [templateFile, setTemplateFile] = useState<File | null>(null);

	return (
		<>
			<title>Meme Maker - New Template</title>
			<main className="container">
				<article>
					<h2>New Meme Maker Template</h2>
					{templateFile ? (
						<TemplateEditorLoader templateFile={templateFile} />
					) : (
						<TemplatePicker onTemplateSelected={setTemplateFile} />
					)}
				</article>
			</main>
		</>
	);
};
