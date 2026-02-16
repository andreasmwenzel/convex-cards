<script lang="ts">
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api';
	import type { Id } from '../../../../convex/_generated/dataModel';
	import { getAuthContext } from '$lib/components/auth/authContext';

	const auth = getAuthContext();

	const publicGames = useQuery(api.games.listPublic, {});
	const client = useConvexClient();

	const state = $state({
		newGameName: '',
		selectedGameId: null as Id<'games'> | null,
		chatDraft: '',
		actionStatus: null as string | null,
		busy: false
	});

	const selectedGame = useQuery(api.games.detail, () =>
		state.selectedGameId ? { gameId: state.selectedGameId } : 'skip'
	);

	function formatTime(ts: number) {
		return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	async function runAction(action: () => Promise<unknown>, successMessage: string) {
		state.busy = true;
		state.actionStatus = null;
		try {
			await action();
			state.actionStatus = successMessage;
		} catch (error) {
			state.actionStatus = error instanceof Error ? error.message : 'Action failed';
		} finally {
			state.busy = false;
		}
	}

	async function handleCreateGame(event: SubmitEvent) {
		event.preventDefault();
		const name = state.newGameName.trim();
		if (!name) {
			state.actionStatus = 'Enter a table name.';
			return;
		}

		await runAction(async () => {
			const gameId = await client.mutation(api.games.create, { name, isPublic: true });
			state.selectedGameId = gameId;
			state.newGameName = '';
		}, 'Public table created.');
	}

	function selectGame(gameId: Id<'games'>) {
		state.selectedGameId = gameId;
		state.chatDraft = '';
		state.actionStatus = null;
	}

	async function handleSendMessage(event: SubmitEvent) {
		event.preventDefault();
		const body = state.chatDraft.trim();
		if (!body || !state.selectedGameId) return;
		await runAction(async () => {
			await client.mutation(api.games.sendMessage, { gameId: state.selectedGameId as Id<'games'>, body });
			state.chatDraft = '';
		}, 'Message sent.');
	}

	const currentUserId = $derived(auth.currentUser.data?._id ?? null);
	const isHost = $derived(selectedGame.data?.hostUserId === currentUserId);
	const isInSelectedGame = $derived(
		Boolean(selectedGame.data?.players?.some((player) => player.userId === currentUserId))
	);
</script>

<div class="flex w-full flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
	<div class="flex items-center justify-between gap-3">
		<h2 class="text-xl font-semibold text-slate-900">Public tables</h2>
		<button
			onclick={auth.signOut}
			disabled={auth.state.signingOut}
			class="cursor-pointer rounded-md bg-red-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
		>
			{auth.state.signingOut ? 'Signing out...' : 'Sign out'}
		</button>
	</div>

	<form onsubmit={handleCreateGame} class="flex gap-2">
		<input
			type="text"
			bind:value={state.newGameName}
			placeholder="New table name"
			class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
		/>
		<button
			type="submit"
			disabled={state.busy}
			class="cursor-pointer rounded-md bg-emerald-600 px-3 py-2 text-sm text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
		>
			Create
		</button>
	</form>

	<div class="max-h-52 space-y-2 overflow-auto rounded-md border border-slate-200 p-2">
		{#if publicGames.isLoading}
			<div class="text-sm text-slate-500">Loading public games...</div>
		{:else if publicGames.error}
			<div class="text-sm text-rose-700">Failed to load games.</div>
		{:else if !publicGames.data?.length}
			<div class="text-sm text-slate-500">No active public games yet.</div>
		{:else}
			{#each publicGames.data as game}
				<button
					type="button"
					onclick={() => selectGame(game._id)}
					class="w-full rounded border px-3 py-2 text-left text-sm transition-colors {state.selectedGameId === game._id
						? 'border-emerald-300 bg-emerald-50'
						: 'border-slate-200 hover:bg-slate-50'}"
				>
					<div class="font-medium text-slate-900">{game.name}</div>
					<div class="text-xs text-slate-600">
						Host: {game.hostName} · Players: {game.activePlayerCount} · Status: {game.status}
					</div>
				</button>
			{/each}
		{/if}
	</div>

	{#if state.selectedGameId}
		<div class="space-y-3 rounded-md border border-slate-200 p-3">
			{#if selectedGame.isLoading}
				<div class="text-sm text-slate-500">Loading table...</div>
			{:else if selectedGame.error || !selectedGame.data}
				<div class="text-sm text-rose-700">Could not load selected table.</div>
			{:else}
				<div class="flex flex-wrap items-center gap-2">
					<h3 class="text-lg font-semibold text-slate-900">{selectedGame.data.name}</h3>
					<span class="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
						>{selectedGame.data.status}</span
					>
				</div>
				<div class="text-xs text-slate-600">Host: {selectedGame.data.hostName}</div>

				<div class="flex flex-wrap gap-2">
					<button
						type="button"
						onclick={() =>
							runAction(
								() => client.mutation(api.games.join, { gameId: selectedGame.data!._id }),
								'Joined table.'
							)}
						disabled={state.busy || selectedGame.data.status === 'finished' || isInSelectedGame}
						class="cursor-pointer rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
					>
						Join
					</button>
					<button
						type="button"
						onclick={() =>
							runAction(
								() => client.mutation(api.games.leave, { gameId: selectedGame.data!._id }),
								'Left table.'
							)}
						disabled={state.busy || !isInSelectedGame}
						class="cursor-pointer rounded-md bg-slate-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
					>
						Leave
					</button>
					<button
						type="button"
						onclick={() =>
							runAction(
								() => client.mutation(api.games.start, { gameId: selectedGame.data!._id }),
								'Game started.'
							)}
						disabled={state.busy || !isHost || selectedGame.data.status !== 'lobby'}
						class="cursor-pointer rounded-md bg-amber-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
					>
						Start
					</button>
					<button
						type="button"
						onclick={() =>
							runAction(() => client.mutation(api.games.end, { gameId: selectedGame.data!._id }), 'Game ended.')}
						disabled={state.busy || !isHost || selectedGame.data.status === 'finished'}
						class="cursor-pointer rounded-md bg-rose-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
					>
						End
					</button>
				</div>

				<div>
					<div class="mb-1 text-sm font-medium text-slate-700">Players</div>
					<div class="max-h-24 space-y-1 overflow-auto rounded border border-slate-200 p-2 text-sm">
						{#each selectedGame.data.players as player}
							<div class="text-slate-700">
								{player.name}{player.isHost ? ' (host)' : ''}
							</div>
						{/each}
					</div>
				</div>

				<div>
					<div class="mb-1 text-sm font-medium text-slate-700">Table chat</div>
					<div class="max-h-40 space-y-1 overflow-auto rounded border border-slate-200 p-2 text-sm">
						{#if !selectedGame.data.messages.length}
							<div class="text-slate-500">No chat messages yet.</div>
						{:else}
							{#each selectedGame.data.messages as message}
								<div class="text-slate-700">
									<span class="font-medium">{message.userName}</span>
									<span class="text-slate-400">[{formatTime(message.createdAt)}]</span>:
									{message.body}
								</div>
							{/each}
						{/if}
					</div>
					<form onsubmit={handleSendMessage} class="mt-2 flex gap-2">
						<input
							type="text"
							bind:value={state.chatDraft}
							placeholder={isInSelectedGame ? 'Say something...' : 'Join table to chat'}
							disabled={!isInSelectedGame || selectedGame.data.status === 'finished'}
							class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
						/>
						<button
							type="submit"
							disabled={!isInSelectedGame || state.busy || selectedGame.data.status === 'finished'}
							class="cursor-pointer rounded-md bg-indigo-600 px-3 py-2 text-sm text-white disabled:opacity-50"
						>
							Send
						</button>
					</form>
				</div>
			{/if}
		</div>
	{/if}

	{#if state.actionStatus}
		<div class="rounded bg-slate-50 px-3 py-2 text-sm text-slate-700">{state.actionStatus}</div>
	{/if}
</div>
