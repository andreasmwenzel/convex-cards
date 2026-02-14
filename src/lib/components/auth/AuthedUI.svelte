<script lang="ts">
	import { getAuthContext } from '$lib/components/auth/authContext';

	const auth = getAuthContext();
</script>

<div class="w-full rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
	<div class="mb-4 text-xl font-semibold text-slate-900">
		Hello {auth.currentUser.data?.name ?? auth.currentUser.data?.email ?? 'there'}!
	</div>

	<div class="mb-4 rounded-md bg-slate-50 p-4 text-left">
		<h3 class="mb-2 text-sm font-medium text-slate-700">Access Token Demo</h3>
		<button
			onclick={auth.fetchToken}
			disabled={auth.state.tokenLoading}
			class="cursor-pointer rounded-md bg-blue-600 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
		>
			{auth.state.tokenLoading ? 'Fetching...' : 'Fetch Access Token'}
		</button>
		{#if auth.state.accessToken}
			<div class="mt-2 rounded border bg-white p-2 text-xs break-all text-slate-600">
				{auth.state.accessToken.length > 50
					? auth.state.accessToken.substring(0, 50) + '...'
					: auth.state.accessToken}
			</div>
		{/if}
	</div>

	<button
		onclick={auth.signOut}
		disabled={auth.state.signingOut}
		class="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
	>
		{auth.state.signingOut ? 'Signing out...' : 'Sign out'}
	</button>
</div>
