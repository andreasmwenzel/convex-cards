import { query } from './_generated/server';

type ConvexEnvironment = 'dev' | 'preview' | 'prod';

function parseDeploymentType(value: string | undefined): ConvexEnvironment | null {
	if (!value) return null;

	if (value.startsWith('dev:')) return 'dev';
	if (value.startsWith('preview:')) return 'preview';
	if (value.startsWith('prod:')) return 'prod';
	if (value === 'dev' || value === 'preview' || value === 'prod') return value;

	return null;
}

function inferFromSiteUrl(siteUrl: string | undefined): ConvexEnvironment {
	if (!siteUrl) return 'dev';

	const normalized = siteUrl.toLowerCase();
	if (normalized.includes('localhost') || normalized.includes('127.0.0.1')) {
		return 'dev';
	}
	if (normalized.includes('.vercel.app') && normalized.includes('-git-')) {
		return 'preview';
	}
	return 'prod';
}

function inferEnvironment(): ConvexEnvironment {
	return (
		parseDeploymentType(process.env.CONVEX_DEPLOYMENT) ??
		parseDeploymentType(process.env.CONVEX_DEPLOY_KEY) ??
		inferFromSiteUrl(process.env.SITE_URL)
	);
}

export const environment = query({
	args: {},
	handler: async () => {
		return {
			message: 'hello from convex',
			environment: inferEnvironment()
		};
	}
});
