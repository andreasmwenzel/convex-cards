import Google from '@auth/core/providers/google';
import { Email } from '@convex-dev/auth/providers/Email';
import { convexAuth } from '@convex-dev/auth/server';
import { Resend } from 'resend';

const googleClientId = process.env.AUTH_GOOGLE_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET;
const allowedRedirectOrigins = new Set(
	(process.env.AUTH_REDIRECT_ORIGINS ?? '')
		.split(',')
		.map((origin) => origin.trim())
		.filter(Boolean)
);

function isAllowedRedirectHost(hostname: string): boolean {
	if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
	if (hostname.endsWith('.vercel.app')) return true;
	return false;
}

function validateRedirect(redirectTo: string): string {
	let parsed: URL;
	try {
		parsed = new URL(redirectTo);
	} catch {
		throw new Error('Invalid redirect URL. Provide an absolute URL.');
	}

	const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
	if (!isLocal && parsed.protocol !== 'https:') {
		throw new Error('Invalid redirect URL protocol. Use https.');
	}

	if (allowedRedirectOrigins.has(parsed.origin) || isAllowedRedirectHost(parsed.hostname)) {
		return parsed.toString();
	}

	throw new Error(
		`Redirect URL origin is not allowed: ${parsed.origin}. Add it to AUTH_REDIRECT_ORIGINS if needed.`
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
