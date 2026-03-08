import { type SyntheticEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BACKEND_HOSTNAME } from "../../../config";
import type { Meme, MemeResponse } from "../../../types/api";

const MEMES_PER_ROW = 5;

const toRows = (memes: Meme[]): Meme[][] => {
	const rows: Meme[][] = [[]];
	let rowCount = 0;

	for (const meme of memes) {
		if (rowCount >= MEMES_PER_ROW) {
			rows.push([]);
			rowCount = 0;
		}

		rows[rows.length - 1].push(meme);
		rowCount += 1;
	}

	return rows;
};

export const TemplateListRoute = () => {
	const [loading, setLoading] = useState<boolean>(true);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [memeResults, setMemeResults] = useState<Meme[]>([]);

	useEffect(() => {
		const fetchTopMemes = async () => {
			const response = await fetch(`${BACKEND_HOSTNAME}/mememaker/top100`);
			const responseData = (await response.json()) as MemeResponse;
			setMemeResults(responseData.data.memes);
			setLoading(false);
		};

		void fetchTopMemes();
	}, []);

	const onSearch = async (event: SyntheticEvent<HTMLFormElement>) => {
		event.preventDefault();
		setLoading(true);

		const response = await fetch(
			`${BACKEND_HOSTNAME}/mememaker/searchmemes?${new URLSearchParams({
				searchterm: searchQuery,
			}).toString()}`,
		);

		const responseData = (await response.json()) as MemeResponse;
		setMemeResults(responseData.data.memes);
		setLoading(false);
	};

	const rows = useMemo(() => toRows(memeResults), [memeResults]);

	return (
		<>
			<title>Meme Maker Templates</title>
			<main className="container">
				<article>
					<h2>Meme Maker Templates</h2>
					<form onSubmit={(event) => void onSearch(event)}>
						<input
							type="search"
							placeholder="Search templates..."
							value={searchQuery}
							onChange={(event) => setSearchQuery(event.target.value)}
						/>
						<button type="submit">Search Templates</button>
					</form>
					{loading ? (
						<p aria-busy="true">Loading results...</p>
					) : (
						rows.map((row, rowIndex) => (
							<div className="grid" key={`row-${rowIndex.toString()}`}>
								{row.map((meme) => {
									const params = new URLSearchParams({
										name: meme.name,
										templateUrl: encodeURIComponent(meme.url),
									}).toString();
									const href = `/MemeMaker/template/temp?${params}`;

									return (
										<article key={meme.id}>
											<Link to={href}>
												<img
													src={meme.url}
													alt={meme.name}
													style={{
														maxWidth: "150px",
														maxHeight: "150px",
														width: "auto",
														height: "auto",
													}}
												/>
											</Link>
											<p>
												<Link to={href}>{meme.name}</Link>
											</p>
										</article>
									);
								})}
							</div>
						))
					)}
				</article>
			</main>
		</>
	);
};
