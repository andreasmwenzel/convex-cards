<script lang="ts">
	import { PUBLIC_CONVEX_URL } from '$env/static/public';

	const authBase = PUBLIC_CONVEX_URL ? `${PUBLIC_CONVEX_URL}/api/auth` : null;
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
		<p class="mt-2 text-sm text-slate-600">
			Google OAuth and magic links are configured in <code>convex/auth.ts</code>. Finish env setup and
			then run <code>npx convex dev</code> to generate typed APIs.
		</p>

		{#if authBase}
			<div class="mt-6 flex flex-wrap gap-3">
				<a
					class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
					href={`${authBase}/signin/google`}
				>
					Continue with Google
				</a>
				<a
					class="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
					href={`${authBase}/signin/magic-link`}
				>
					Magic link (step 1)
				</a>
			</div>
		{:else}
			<p class="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
				Set <code>PUBLIC_CONVEX_URL</code> to enable auth links.
			</p>
		{/if}
	</section>
</main>
