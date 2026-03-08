import { Link, Navigate, Outlet, Route, Routes } from "react-router-dom";
import HomeRoute from "./routes/home/HomeRoute";
import { TemplateEditorRoute } from "./routes/meme-maker/edit/TemplateEditorRoute";
import { MemeMakerRoute } from "./routes/meme-maker/MemeMakerRoute";
import { NewTemplateRoute } from "./routes/meme-maker/new/NewTemplateRoute";
import { TemplateListRoute } from "./routes/meme-maker/templates/TemplateListRoute";
import { Pages } from "./types/pages";

const Hero = () => {
  return (
    <div className="hero">
				<header className="container">
					<hgroup>
						<h1>
							<Link to={Pages.HOME} className="contrast">
								Neil Wiborg
							</Link>
						</h1>
						<h2 className="contrast">
							The home of projects made by the software engineer and computer
							science student Neil Wiborg
						</h2>
					</hgroup>
				</header>
			</div>
  )
}

const Page = () => {
	return (
		<>
			<Hero />
			<Outlet />
		</>
	);
};

export const App = () => {
	return (
		<Routes>
			<Route element={<Page />}>
				<Route path={Pages.HOME} element={<HomeRoute />} />
				<Route path={Pages.MEME_MAKER} element={<MemeMakerRoute />} />
				<Route path={Pages.MEME_MAKER_NEW} element={<NewTemplateRoute />} />
				<Route
					path={Pages.MEME_MAKER_TEMPLATES}
					element={<TemplateListRoute />}
				/>
				<Route
					path={Pages.MEME_MAKER_TEMPLATE}
					element={<TemplateEditorRoute />}
				/>
				<Route
					path={Pages.SPLAT}
					element={<Navigate to={Pages.HOME} replace />}
				/>
			</Route>
		</Routes>
	);
};
