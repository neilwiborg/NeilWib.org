import { type ChangeEvent, useState } from "react";
import { MemeEditor } from "../../../components/MemeEditor";

export const NewTemplateRoute = () => {
	const [templateFile, setTemplateFile] = useState<File | null>(null);

	const onTemplateSelected = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] ?? null;
		setTemplateFile(file);
	};

	return (
		<>
			<title>Meme Maker - New Template</title>
			<main className="container">
				<article>
					<h2>New Meme Maker Template</h2>
					{!templateFile && (
						<>
							<form>
								<input
									type="file"
									id="template"
									name="template"
									accept="image/*"
									onChange={onTemplateSelected}
								/>
							</form>
							<p>Please upload a meme template.</p>
						</>
					)}
					{templateFile && (
						<MemeEditor
							background={{
								kind: "file",
								file: templateFile,
							}}
						/>
					)}
				</article>
			</main>
		</>
	);
};
