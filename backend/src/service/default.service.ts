export type DefaultService = {
	getWelcomeMessage: () => string;
};

export const createDefaultService = (): DefaultService => {
	return {
		getWelcomeMessage: () => {
			return "Welcome to Express!";
		},
	};
};
