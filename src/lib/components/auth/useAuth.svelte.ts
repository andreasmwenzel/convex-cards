import { useConvexClient, useQuery } from 'convex-svelte';
import { api } from '../../../../convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';

type SignInResult = FunctionReturnType<typeof api.auth.signIn>;

const TOKEN_STORAGE_KEY = 'convex_auth_token';
const REFRESH_TOKEN_STORAGE_KEY = 'convex_auth_refresh_token';

export function useAuth(publicConvexUrl: string | undefined) {
	const client = useConvexClient();
	const currentUser = useQuery(api.users.current, () => (publicConvexUrl ? {} : 'skip'));

	const state = $state({
		authToken: null as string | null,
		authInitialized: false,
		completingMagicLink: false,
		showSignIn: true,
		email: '',
		authStatus: null as string | null,
		sending: false,
		startingGoogle: false,
		signingOut: false,
		tokenLoading: false,
		accessToken: null as string | null
	});

	let isLoading = $derived(
		Boolean(publicConvexUrl) &&
			(!state.authInitialized || state.completingMagicLink || currentUser.isLoading)
	);
	let isAuthenticated = $derived(Boolean(state.authToken && currentUser.data));

	function applyClientAuth(token: string | null) {
		client.setAuth(async () => token);
	}

	function currentRedirectTo() {
		if (typeof window === 'undefined') throw new Error('Redirect URL unavailable on server.');
		return `${window.location.origin}/`;
	}

	function errorMessage(error: unknown, fallback: string) {
		return error instanceof Error ? error.message : fallback;
	}

	function setStoredTokens(tokens: { token: string; refreshToken: string } | null) {
		state.authToken = tokens?.token ?? null;
		applyClientAuth(state.authToken);

		if (typeof window === 'undefined') return;

		if (tokens) {
			window.localStorage.setItem(TOKEN_STORAGE_KEY, tokens.token);
			window.localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
		} else {
			window.localStorage.removeItem(TOKEN_STORAGE_KEY);
			window.localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
		}
	}

	async function completeMagicLink(code: string) {
		state.completingMagicLink = true;
		state.authStatus = null;

		try {
			const result: SignInResult = await client.action(api.auth.signIn, {
				params: { code }
			});

			if (result.tokens?.token && result.tokens.refreshToken) {
				setStoredTokens(result.tokens);
				state.authStatus = 'Signed in successfully.';
			} else {
				state.authStatus = 'Magic link verification returned no session tokens.';
			}
		} catch (error) {
			state.authStatus = errorMessage(error, 'Failed to complete magic-link sign in.');
		} finally {
			state.completingMagicLink = false;
		}
	}

	$effect(() => {
		if (typeof window === 'undefined' || state.authInitialized) return;
		state.authInitialized = true;
		if (!publicConvexUrl) return;

		const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
		if (storedToken) {
			state.authToken = storedToken;
			applyClientAuth(storedToken);
		} else {
			applyClientAuth(null);
		}

		const url = new URL(window.location.href);
		const code = url.searchParams.get('code');
		if (!code) return;

		void completeMagicLink(code);
		url.searchParams.delete('code');
		window.history.replaceState({}, '', url.toString());
	});

	async function sendMagicLink(event: SubmitEvent) {
		event.preventDefault();

		const trimmedEmail = state.email.trim();
		if (!trimmedEmail) {
			state.authStatus = 'Enter an email address first.';
			return;
		}

		state.sending = true;
		state.authStatus = null;

		try {
			const redirectTo = currentRedirectTo();
			await client.action(api.auth.signIn, {
				provider: 'email',
				params: { email: trimmedEmail, redirectTo }
			});
			state.authStatus =
				'Magic link requested. If Resend is not configured, check `npx convex logs` for the login URL.';
		} catch (error) {
			state.authStatus = errorMessage(error, 'Failed to start magic-link sign in.');
		} finally {
			state.sending = false;
		}
	}

	async function startGoogleSignIn() {
		state.startingGoogle = true;
		state.authStatus = null;

		try {
			const redirectTo = currentRedirectTo();
			const result: SignInResult = await client.action(api.auth.signIn, {
				provider: 'google',
				params: { redirectTo }
			});

			if (result.redirect && typeof window !== 'undefined') {
				window.location.href = result.redirect;
				return;
			}

			state.authStatus = 'Google sign-in did not return a redirect URL.';
		} catch (error) {
			state.authStatus = errorMessage(error, 'Failed to start Google sign-in.');
		} finally {
			state.startingGoogle = false;
		}
	}

	async function signOut() {
		state.signingOut = true;
		state.authStatus = null;

		try {
			await client.action(api.auth.signOut, {});
		} catch (_error) {
			// Always clear local token state, even if server-side signout fails.
		} finally {
			setStoredTokens(null);
			state.signingOut = false;
			state.accessToken = null;
		}
	}

	async function fetchToken() {
		state.tokenLoading = true;
		try {
			if (typeof window !== 'undefined') {
				state.accessToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
			} else {
				state.accessToken = state.authToken;
			}
		} finally {
			state.tokenLoading = false;
		}
	}

	function toggleSignMode() {
		state.showSignIn = !state.showSignIn;
	}

	return {
		currentUser,
		state,
		isLoading,
		isAuthenticated,
		sendMagicLink,
		startGoogleSignIn,
		signOut,
		fetchToken,
		toggleSignMode
	};
}
