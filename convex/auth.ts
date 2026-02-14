import Google from '@auth/core/providers/google';
import { Email } from '@convex-dev/auth/providers/Email';
import { convexAuth } from '@convex-dev/auth/server';
import { Resend } from 'resend';

const googleClientId = process.env.AUTH_GOOGLE_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET;

function getSiteOrigin() {
	const siteUrl = process.env.SITE_URL?.trim();
	if (!siteUrl) return null;

	try {
		return new URL(siteUrl).origin;
	} catch {
		throw new Error(`Invalid SITE_URL: ${siteUrl}`);
	}
}

function deploymentEnvironment() {
	return process.env.ENVIRONMENT?.trim().toLowerCase();
}

function isLocalHost(hostname: string) {
	return hostname === 'localhost' || hostname === '127.0.0.1';
}

function isAllowedPreviewRedirect(redirectUrl: URL) {
	if (deploymentEnvironment() !== 'preview') return false;

	const projectName = process.env.VERCEL_PROJECT_NAME?.trim().toLowerCase();
	const projectUrlEnding = process.env.VERCEL_PROJECT_URL_ENDING?.trim().toLowerCase();
	if (!projectName || !projectUrlEnding) return false;
	if (redirectUrl.protocol !== 'https:') return false;

	const hostname = redirectUrl.hostname.toLowerCase();
	return hostname.startsWith(projectName) && hostname.endsWith(projectUrlEnding);
}

function validateRedirect(redirectTo: string): string {
	const siteOrigin = getSiteOrigin();
	const isDev = deploymentEnvironment() === 'dev';

	if (redirectTo.startsWith('/') || redirectTo.startsWith('?')) {
		if (!siteOrigin) {
			throw new Error(
				'Missing SITE_URL for relative redirect. Set SITE_URL in Convex env or pass an absolute redirectTo URL.'
			);
		}
		return `${siteOrigin}${redirectTo}`;
	}

	let parsed: URL;
	try {
		parsed = new URL(redirectTo);
	} catch {
		throw new Error('Invalid redirect URL. Provide an absolute URL or a relative path.');
	}

	const isLocal = isLocalHost(parsed.hostname);
	if (!isLocal && parsed.protocol !== 'https:') {
		throw new Error('Invalid redirect URL protocol. Use https.');
	}

	if (siteOrigin && parsed.origin === siteOrigin) {
		return parsed.toString();
	}

	if (isDev && isLocal) {
		return parsed.toString();
	}

	if (isAllowedPreviewRedirect(parsed)) {
		return parsed.toString();
	}

	throw new Error(
		`Redirect URL is not allowed: ${redirectTo}. It must match SITE_URL or the configured preview pattern.`
	);
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	callbacks: {
		redirect: async ({ redirectTo }) => validateRedirect(redirectTo)
	},
	providers: [
		...(googleClientId && googleClientSecret
			? [
					Google({
						clientId: googleClientId,
						clientSecret: googleClientSecret
					})
				]
			: []),
		Email({
			authorize: undefined,
			maxAge: 60 * 15,
			sendVerificationRequest: async ({ identifier, url }) => {
				const resendKey = process.env.AUTH_RESEND_KEY;
				const emailFrom = process.env.AUTH_EMAIL_FROM;

				if (!resendKey || !emailFrom) {
					console.warn('Skipping email send. Set AUTH_RESEND_KEY and AUTH_EMAIL_FROM to enable magic links.');
					console.info(`Magic link for ${identifier}: ${url}`);
					return;
				}

				const resend = new Resend(resendKey);

				await resend.emails.send({
					from: emailFrom,
					to: identifier,
					subject: 'Sign in to Convex Cards',
					html: `<p>Click <a href="${url}">this magic link</a> to sign in.</p>`
				});
			}
		})
	]
});
