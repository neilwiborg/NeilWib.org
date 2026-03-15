export type Loading = {
	state: "loading";
};

export type Error = {
	state: "error";
	message: string;
};

export type Done<T> = {
	state: "done";
	value: T;
};

export type Loadable<T> = Loading | Error | Done<T>;

type LoadableMatchers<T, TResult> = {
	loading: (loading: Loading) => TResult;
	error: (error: Error) => TResult;
	done: (done: Done<T>) => TResult;
};

export const matchLoadable = <T, TResult>(
	loadable: Loadable<T>,
	matchers: LoadableMatchers<T, TResult>,
): TResult => {
	switch (loadable.state) {
		case "loading":
			return matchers.loading(loadable);
		case "error":
			return matchers.error(loadable);
		case "done":
			return matchers.done(loadable);
	}
};
