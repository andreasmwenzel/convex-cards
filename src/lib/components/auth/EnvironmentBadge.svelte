<script lang="ts">
	type EnvironmentData = {
		message?: string;
		environment?: string;
	};

	type EnvironmentState = {
		isLoading: boolean;
		error: Error | null | undefined;
		data: EnvironmentData | undefined;
	};

	let { environment } = $props<{
		environment: EnvironmentState;
	}>();
</script>

<div
	class="fixed right-4 bottom-4 rounded-md border border-slate-300 bg-white/95 px-3 py-2 text-xs text-slate-700 shadow-sm backdrop-blur"
>
	{#if environment.isLoading}
		convex: loading...
	{:else if environment.error}
		convex: unavailable
	{:else}
		{environment.data?.message} ({environment.data?.environment ?? 'dev'})
	{/if}
</div>
