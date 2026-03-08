import { useSearchParams } from "react-router-dom";
import { MemeEditor } from "../../../components/MemeEditor/MemeEditor";

export const TemplateEditorRoute = () => {
	const [searchParams] = useSearchParams();
	const name = searchParams.get("name");
	const templateUrlEncoded = searchParams.get("templateUrl");

	if (!name || !templateUrlEncoded) {
		throw new Error("Missing template name and/or URL");
	}

	const templateUrl = decodeURIComponent(templateUrlEncoded);

	return (
		<>
			<title>Meme Maker - {name}</title>
			<main className="container">
				<article>
					<h2>Meme Template: {name}</h2>
					<MemeEditor
						background={{
							kind: "url",
							url: templateUrl,
						}}
					/>
				</article>
			</main>
		</>
	);
};
