<script lang="ts">
	import { getAuthContext } from '$lib/components/auth/authContext';

	const auth = getAuthContext();
</script>

<div class="flex w-full flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
	<h2 class="mb-2 text-center text-2xl font-bold text-slate-900">
		{auth.state.showSignIn ? 'Sign In' : 'Sign Up'}
	</h2>

	<button
		type="button"
		onclick={auth.startGoogleSignIn}
		disabled={auth.state.startingGoogle}
		class="cursor-pointer rounded-md bg-slate-900 px-4 py-2 text-white transition-colors hover:bg-slate-700 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
	>
		{auth.state.startingGoogle ? 'Redirecting...' : 'Continue with Google'}
	</button>

	<div class="text-center text-sm text-slate-500">or</div>

	<form onsubmit={auth.sendMagicLink} class="flex flex-col gap-4">
		<input
			type="email"
			bind:value={auth.state.email}
			placeholder="Email"
			required
			class="rounded-md border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
		/>
		<button
			type="submit"
			disabled={auth.state.sending}
			class="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
		>
			{auth.state.sending
				? 'Sending...'
				: auth.state.showSignIn
					? 'Send sign-in link'
					: 'Send sign-up link'}
		</button>
	</form>

	<p class="mt-2 text-center text-sm text-slate-600">
		{auth.state.showSignIn ? "Don't have an account? " : 'Already have an account? '}
		<button
			type="button"
			onclick={auth.toggleSignMode}
			class="cursor-pointer border-none bg-transparent text-blue-600 underline hover:text-blue-800"
		>
			{auth.state.showSignIn ? 'Sign up' : 'Sign in'}
		</button>
	</p>

	{#if auth.state.authStatus}
		<p class="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">{auth.state.authStatus}</p>
	{/if}
</div>
