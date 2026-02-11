import Google from '@auth/core/providers/google';
import { Email } from '@convex-dev/auth/providers/Email';
import { convexAuth } from '@convex-dev/auth/server';
import { Resend } from 'resend';

const googleClientId = process.env.AUTH_GOOGLE_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET;

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
