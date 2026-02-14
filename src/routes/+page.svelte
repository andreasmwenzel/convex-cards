<script lang="ts">
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { anyApi } from 'convex/server';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';

	type SignInResult = {
		redirect?: string;
		verifier?: string;
		tokens?: { token: string; refreshToken: string } | null;
		started?: boolean;
	};

	const TOKEN_STORAGE_KEY = 'convex_auth_token';
	const REFRESH_TOKEN_STORAGE_KEY = 'convex_auth_refresh_token';
	const authSignInRef = anyApi.auth.signIn;
	const authSignOutRef = anyApi.auth.signOut;
	const usersCurrentRef = anyApi.users.current;
	const helloEnvironmentRef = anyApi.hello.environment;

	const client = useConvexClient();
	const currentUser = useQuery(usersCurrentRef as any, {} as any);
	const helloEnvironment = useQuery(helloEnvironmentRef as any, {} as any);

	let authToken = $state<string | null>(null);
	let authInitialized = $state(false);
	let completingMagicLink = $state(false);

	let email = $state('');
	let magicLinkStatus = $state<string | null>(null);
	let sending = $state(false);
	let startingGoogle = $state(false);
	let signingOut = $state(false);

	function applyClientAuth(token: string | null) {
		client.setAuth(async () => token);
	}

	function setStoredTokens(tokens: { token: string; refreshToken: string } | null) {
		authToken = tokens?.token ?? null;
		applyClientAuth(authToken);

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
		completingMagicLink = true;
		magicLinkStatus = null;

		try {
			const result = (await client.action(authSignInRef as any, {
				params: { code }
			})) as SignInResult;

			if (result.tokens?.token && result.tokens.refreshToken) {
				setStoredTokens(result.tokens);
				magicLinkStatus = 'Signed in successfully.';
			} else {
				magicLinkStatus = 'Magic link verification returned no session tokens.';
			}
		} catch (error) {
			magicLinkStatus =
				error instanceof Error ? error.message : 'Failed to complete magic-link sign in.';
		} finally {
			completingMagicLink = false;
		}
	}

	$effect(() => {
		if (typeof window === 'undefined' || authInitialized) return;
		authInitialized = true;

		const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
		if (storedToken) {
			authToken = storedToken;
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

		const trimmedEmail = email.trim();
		if (!trimmedEmail) {
			magicLinkStatus = 'Enter an email address first.';
			return;
		}

		sending = true;
		magicLinkStatus = null;

		try {
			await client.action(authSignInRef as any, {
				provider: 'email',
				params: { email: trimmedEmail }
			});
			magicLinkStatus =
				'Magic link requested. If Resend is not configured, check `npx convex logs` for the login URL.';
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to start magic-link sign in.';
			if (message.includes('Missing environment variable `SITE_URL`')) {
				magicLinkStatus =
					'Set SITE_URL in Convex env first (example: `npx convex env set SITE_URL http://localhost:5173`).';
			} else {
				magicLinkStatus = message;
			}
		} finally {
			sending = false;
		}
	}

	async function startGoogleSignIn() {
		startingGoogle = true;
		magicLinkStatus = null;

		try {
			const result = (await client.action(authSignInRef as any, {
				provider: 'google',
				params: { redirectTo: '/' }
			})) as SignInResult;

			if (result.redirect && typeof window !== 'undefined') {
				window.location.href = result.redirect;
				return;
			}

			magicLinkStatus = 'Google sign-in did not return a redirect URL.';
		} catch (error) {
			magicLinkStatus = error instanceof Error ? error.message : 'Failed to start Google sign-in.';
		} finally {
			startingGoogle = false;
		}
	}

	async function signOut() {
		signingOut = true;
		magicLinkStatus = null;

		try {
			await client.action(authSignOutRef as any, {} as any);
		} catch (_error) {
			// Always clear local token state, even if server-side signout fails.
		} finally {
			setStoredTokens(null);
			signingOut = false;
		}
	}
</script>

<main class="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-12">
	<section class="space-y-4">
		<p class="text-sm font-semibold uppercase tracking-wide text-emerald-600">Convex Cards</p>
		<h1 class="text-4xl font-bold text-slate-900">Play cards with friends</h1>
		<p class="text-base text-slate-600">
			SvelteKit + Tailwind + Convex are scaffolded and ready for feature planning.
		</p>
	</section>

	<section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
		<h2 class="text-xl font-semibold text-slate-900">Authentication scaffold</h2>

		{#if !PUBLIC_CONVEX_URL}
			<p class="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
				Set <code>PUBLIC_CONVEX_URL</code> to enable auth actions.
			</p>
		{:else if completingMagicLink || currentUser.isLoading}
			<p class="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
				Checking authentication state...
			</p>
		{:else if currentUser.error}
			<p class="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
				Auth query failed: {currentUser.error.message}
			</p>
		{:else if currentUser.data && authToken}
			<div class="mt-4 space-y-3">
				<p class="text-sm text-slate-600">You are signed in.</p>
				<p class="text-base font-medium text-slate-900">{currentUser.data.email ?? 'No email available'}</p>
				{#if currentUser.data.name}
					<p class="text-sm text-slate-600">{currentUser.data.name}</p>
				{/if}
				<button
					class="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
					type="button"
					onclick={signOut}
					disabled={signingOut}
				>
					{signingOut ? 'Logging out...' : 'Log out'}
				</button>
			</div>
		{:else}
			<p class="mt-2 text-sm text-slate-600">
				Google OAuth and magic links are configured in <code>convex/auth.ts</code>.
			</p>

			<div class="mt-6 flex flex-wrap gap-3">
				<button
					class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
					type="button"
					onclick={startGoogleSignIn}
					disabled={startingGoogle}
				>
					{startingGoogle ? 'Redirecting...' : 'Continue with Google'}
				</button>
				<form class="flex w-full flex-wrap gap-2" onsubmit={sendMagicLink}>
					<input
						class="min-w-64 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
						type="email"
						placeholder="you@example.com"
						bind:value={email}
						required
					/>
					<button
						class="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
						type="submit"
						disabled={sending}
					>
						{sending ? 'Sending...' : 'Send magic link'}
					</button>
				</form>
			</div>

			{#if magicLinkStatus}
				<p class="mt-3 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">{magicLinkStatus}</p>
			{/if}
		{/if}
	</section>
</main>

<div
	class="fixed right-4 bottom-4 rounded-md border border-slate-300 bg-white/95 px-3 py-2 text-xs text-slate-700 shadow-sm backdrop-blur"
>
	{#if helloEnvironment.isLoading}
		convex: loading...
	{:else if helloEnvironment.error}
		convex: unavailable
	{:else}
		{helloEnvironment.data?.message} ({helloEnvironment.data?.environment ?? 'dev'})
	{/if}
</div>
