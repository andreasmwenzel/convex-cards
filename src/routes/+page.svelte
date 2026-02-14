<script lang="ts">
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { useQuery } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import AuthedUI from '$lib/components/auth/AuthedUI.svelte';
	import { setAuthContext } from '$lib/components/auth/authContext';
	import EnvironmentBadge from '$lib/components/auth/EnvironmentBadge.svelte';
	import UnauthedUI from '$lib/components/auth/UnauthedUI.svelte';
	import { useAuth } from '$lib/components/auth/useAuth.svelte';

	const auth = useAuth(PUBLIC_CONVEX_URL);
	setAuthContext(auth);
	const helloEnvironment = useQuery(api.hello.environment, () => (PUBLIC_CONVEX_URL ? {} : 'skip'));
</script>

<main class="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-8 px-6 py-12">
	<section class="space-y-3 text-center">
		<p class="text-sm font-semibold uppercase tracking-wide text-emerald-600">Convex Cards</p>
		<h1 class="text-4xl font-bold text-slate-900">Play cards with friends</h1>
		<p class="text-base text-slate-600">Sign in to start creating and joining games.</p>
	</section>

	<section class="w-full max-w-md">
		{#if !PUBLIC_CONVEX_URL}
			<div class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
				Set <code>PUBLIC_CONVEX_URL</code> to enable authentication.
			</div>
		{:else if auth.isLoading}
			<div class="text-lg text-slate-600">Loading...</div>
		{:else if auth.currentUser.error}
			<div class="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
				Auth query failed: {auth.currentUser.error instanceof Error
					? auth.currentUser.error.message
					: 'Unknown query error'}
			</div>
		{:else if !auth.isAuthenticated}
			<UnauthedUI />
		{:else}
			<AuthedUI />
		{/if}
	</section>
</main>

<EnvironmentBadge environment={helloEnvironment} />
