import { query } from './_generated/server';

type ConvexEnvironment = 'dev' | 'preview' | 'prod';

function readEnvironment(): ConvexEnvironment {
	const value = process.env.ENVIRONMENT?.trim().toLowerCase();
	if (value === 'dev' || value === 'preview' || value === 'prod') {
		return value;
	}
	return 'dev';
}

export const environment = query({
	args: {},
	handler: async () => {
		return {
			message: 'hello from convex',
			environment: readEnvironment()
		};
	}
});
