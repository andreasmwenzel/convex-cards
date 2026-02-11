import Google from '@auth/core/providers/google';
import Email from '@convex-dev/auth/providers/Email';
import { convexAuth } from '@convex-dev/auth/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.AUTH_RESEND_KEY);

const googleClientId = process.env.AUTH_GOOGLE_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET;

if (!googleClientId || !googleClientSecret) {
	console.warn('Google OAuth is disabled. Set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET to enable it.');
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
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
			id: 'magic-link',
			authorize: undefined,
			maxAge: 60 * 15,
			sendVerificationRequest: async ({ identifier, url }) => {
				if (!process.env.AUTH_RESEND_KEY || !process.env.AUTH_EMAIL_FROM) {
					console.warn('Skipping email send. Set AUTH_RESEND_KEY and AUTH_EMAIL_FROM to enable magic links.');
					console.info(`Magic link for ${identifier}: ${url}`);
					return;
				}

				await resend.emails.send({
					from: process.env.AUTH_EMAIL_FROM,
					to: identifier,
					subject: 'Sign in to Convex Cards',
					html: `<p>Click <a href="${url}">this magic link</a> to sign in.</p>`
				});
			}
		})
	]
});
