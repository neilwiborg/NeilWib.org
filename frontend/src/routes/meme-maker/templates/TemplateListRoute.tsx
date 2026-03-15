import { type SyntheticEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMemeTemplates } from "../../../api/hooks/useMemeTemplates";
import type { Meme } from "../../../types/api";
import { matchLoadable } from "../../../types/loadable";
import { Pages } from "../../../types/pages";

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

type TemplateProps = {
	meme: Meme;
};

const createTemplateHref = (meme: Meme) => {
	const path = Pages.MEME_MAKER_TEMPLATE.replace(":templateID", "temp");
	const params = new URLSearchParams({
		name: meme.name,
		templateUrl: encodeURIComponent(meme.url),
	}).toString();

	return `${path}?${params}`;
};

const Template = ({ meme }: TemplateProps) => {
	const href = createTemplateHref(meme);

	return (
		<article>
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
};

const renderRows = (rows: Meme[][]) =>
	rows.map((row, rowIndex) => (
		<div className="grid" key={`row-${rowIndex.toString()}`}>
			{row.map((meme) => (
				<Template key={meme.id} meme={meme} />
			))}
		</div>
	));

export const TemplateListRoute = () => {
	const [searchQuery, setSearchQuery] = useState<string>("");
	const { memes, searchMemes } = useMemeTemplates();

	const onSearch = async (event: SyntheticEvent<HTMLFormElement>) => {
		event.preventDefault();
		await searchMemes(searchQuery);
	};

	const rows = useMemo(() => {
		if (memes.state !== "done") {
			return [];
		}
		return toRows(memes.value);
	}, [memes]);

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
					{matchLoadable(memes, {
						loading: () => <p aria-busy="true">Loading results...</p>,
						error: (error) => <p>{error.message}</p>,
						done: () => <>{renderRows(rows)}</>,
					})}
				</article>
			</main>
		</>
	);
};
