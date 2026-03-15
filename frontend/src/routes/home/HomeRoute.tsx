import { Link } from "react-router-dom";
import { useSeattlePhoto } from "../../api/hooks/useSeattlePhoto";
import type { PhotoResponse } from "../../types/api";
import { matchLoadable } from "../../types/loadable";
import { Pages } from "../../types/pages";

type ImageProps = {
	photo: PhotoResponse;
};

const Image = ({ photo }: ImageProps) => {
	return (
		<>
			<img src={photo.imageURL} alt="Seattle, WA" />
			<figcaption>
				Photo by{" "}
				<a href={photo.author.profileURL}>
					{`${photo.author.firstName} ${photo.author.lastName}`}
				</a>{" "}
				on <a href={photo.sourceURL}>{photo.sourceName}</a>
			</figcaption>
		</>
	);
};

const HomeRoute = () => {
	const seattlePhoto = useSeattlePhoto();

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
							{matchLoadable(seattlePhoto, {
								loading: () => <p aria-busy="true">Loading photo...</p>,
								error: (error) => <p>{error.message}</p>,
								done: (done) => <Image photo={done.value} />,
							})}
						</figure>
					</div>
				</article>
			</main>
		</>
	);
};

export default HomeRoute;
