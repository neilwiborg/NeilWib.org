import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BACKEND_HOSTNAME } from "../../config";
import type { PhotoResponse } from "../../types/api";
import { Pages } from "../../types/pages";

const HomeRoute = () => {
	const [seattlePhoto, setSeattlePhoto] = useState<PhotoResponse | null>(null);

	useEffect(() => {
		const fetchPhoto = async () => {
			const response = await fetch(`${BACKEND_HOSTNAME}/photos/seattle`);
			const data = (await response.json()) as PhotoResponse;
			setSeattlePhoto(data);
		};

		void fetchPhoto();
	}, []);

	return (
		<>
			<title>Neil Wiborg&apos;s Website</title>
			<main className="container">
				<article>
					<h2>Hi, I&apos;m Neil</h2>
					<div className="grid">
						<p>
							Visit <Link to={Pages.MEME_MAKER}>Meme Maker here</Link>
						</p>
						<figure>
							<img src={seattlePhoto?.imageURL} alt="Seattle, WA" />
							<figcaption>
								Photo by{" "}
								<a href={seattlePhoto?.author.profileURL}>
									{`${seattlePhoto?.author.firstName ?? ""} ${seattlePhoto?.author.lastName ?? ""}`}
								</a>{" "}
								on{" "}
								<a href={seattlePhoto?.sourceURL}>{seattlePhoto?.sourceName}</a>
							</figcaption>
						</figure>
					</div>
				</article>
			</main>
		</>
	);
};

export default HomeRoute;
