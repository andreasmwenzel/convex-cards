import Google from '@auth/core/providers/google';
import Email from '@convex-dev/auth/providers/Email';
import { convexAuth } from '@convex-dev/auth/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.AUTH_RESEND_KEY);

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [
		Google,
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
