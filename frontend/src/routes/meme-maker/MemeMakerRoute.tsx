import { Link } from "react-router-dom";
import { Pages } from "../../types/pages";

export const MemeMakerRoute = () => {
	return (
		<>
			<title>Meme Maker</title>
			<main className="container">
				<article>
					<h2>Meme Maker</h2>
					<p>
						Please upload a{" "}
						<Link to={Pages.MEME_MAKER_NEW}>new meme template here</Link>, or{" "}
						<Link to={Pages.MEME_MAKER_TEMPLATES}>
							click here to browse templates.
						</Link>
					</p>
				</article>
			</main>
		</>
	);
};
