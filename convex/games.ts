import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import { mutation, query, type MutationCtx, type QueryCtx } from './_generated/server';

async function requireUserId(ctx: QueryCtx | MutationCtx) {
	const userId = await getAuthUserId(ctx);
	if (!userId) {
		throw new Error('Not authenticated');
	}
	return userId;
}

export const listPublic = query({
	args: {},
	handler: async (ctx) => {
		const games = await ctx.db
			.query('games')
			.withIndex('by_public_status', (q) => q.eq('isPublic', true))
			.collect();

		const visible = games
			.filter((game) => game.status !== 'finished')
			.sort((a, b) => b.createdAt - a.createdAt)
			.slice(0, 100);

		const enriched = await Promise.all(
			visible.map(async (game) => {
				const host = await ctx.db.get(game.hostUserId);
				const players = await ctx.db
					.query('gamePlayers')
					.withIndex('by_gameId', (q) => q.eq('gameId', game._id))
					.collect();

				return {
					...game,
					hostName: host?.name ?? host?.email ?? 'Unknown host',
					activePlayerCount: players.filter((p) => !p.leftAt).length
				};
			})
		);

		return enriched;
	}
});

export const detail = query({
	args: { gameId: v.id('games') },
	handler: async (ctx, args) => {
		const game = await ctx.db.get(args.gameId);
		if (!game) return null;
		if (!game.isPublic) {
			const userId = await getAuthUserId(ctx);
			if (!userId) throw new Error('Not authenticated');
		}

		const players = await ctx.db
			.query('gamePlayers')
			.withIndex('by_gameId', (q) => q.eq('gameId', args.gameId))
			.collect();

		const activePlayers = players.filter((p) => !p.leftAt);
		const playerUsers = await Promise.all(activePlayers.map((player) => ctx.db.get(player.userId)));

		const messages = await ctx.db
			.query('gameMessages')
			.withIndex('by_gameId_createdAt', (q) => q.eq('gameId', args.gameId))
			.collect();
		const latest = messages.sort((a, b) => a.createdAt - b.createdAt).slice(-50);
		const messageUsers = await Promise.all(latest.map((m) => ctx.db.get(m.userId)));

		const host = await ctx.db.get(game.hostUserId);

		return {
			...game,
			hostName: host?.name ?? host?.email ?? 'Unknown host',
			players: activePlayers.map((player, index) => ({
				userId: player.userId,
				name: playerUsers[index]?.name ?? playerUsers[index]?.email ?? 'Unknown player',
				joinedAt: player.joinedAt,
				isHost: player.userId === game.hostUserId
			})),
			messages: latest.map((message, index) => ({
				_id: message._id,
				body: message.body,
				createdAt: message.createdAt,
				userId: message.userId,
				userName: messageUsers[index]?.name ?? messageUsers[index]?.email ?? 'Unknown user'
			}))
		};
	}
});

export const create = mutation({
	args: {
		name: v.string(),
		isPublic: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const now = Date.now();
		const trimmedName = args.name.trim();
		if (!trimmedName) throw new Error('Table name is required.');

		const gameId = await ctx.db.insert('games', {
			hostUserId: userId,
			name: trimmedName,
			isPublic: args.isPublic ?? true,
			status: 'lobby',
			createdAt: now,
			updatedAt: now
		});

		await ctx.db.insert('gamePlayers', {
			gameId,
			userId,
			joinedAt: now
		});

		return gameId;
	}
});

export const join = mutation({
	args: { gameId: v.id('games') },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const game = await ctx.db.get(args.gameId);
		if (!game) throw new Error('Game not found.');
		if (!game.isPublic) throw new Error('Game is private.');
		if (game.status === 'finished') throw new Error('Game already ended.');

		const existing = await ctx.db
			.query('gamePlayers')
			.withIndex('by_gameId_userId', (q) => q.eq('gameId', args.gameId).eq('userId', userId))
			.unique();

		if (existing && !existing.leftAt) return { alreadyJoined: true };

		const now = Date.now();
		if (existing && existing.leftAt) {
			await ctx.db.patch(existing._id, { leftAt: undefined, joinedAt: now });
		} else {
			await ctx.db.insert('gamePlayers', { gameId: args.gameId, userId, joinedAt: now });
		}

		await ctx.db.patch(args.gameId, { updatedAt: now });
		return { joined: true };
	}
});

export const leave = mutation({
	args: { gameId: v.id('games') },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const game = await ctx.db.get(args.gameId);
		if (!game) throw new Error('Game not found.');

		const membership = await ctx.db
			.query('gamePlayers')
			.withIndex('by_gameId_userId', (q) => q.eq('gameId', args.gameId).eq('userId', userId))
			.unique();
		if (!membership || membership.leftAt) throw new Error('You are not in this game.');

		const now = Date.now();
		await ctx.db.patch(membership._id, { leftAt: now });

		if (game.hostUserId === userId && game.status !== 'finished') {
			await ctx.db.patch(game._id, { status: 'finished', endedAt: now, updatedAt: now });
		} else {
			await ctx.db.patch(game._id, { updatedAt: now });
		}
	}
});

export const start = mutation({
	args: { gameId: v.id('games') },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const game = await ctx.db.get(args.gameId);
		if (!game) throw new Error('Game not found.');
		if (game.hostUserId !== userId) throw new Error('Only the host can start this game.');
		if (game.status !== 'lobby') throw new Error('Game is not in lobby state.');

		const now = Date.now();
		await ctx.db.patch(game._id, {
			status: 'active',
			startedAt: now,
			updatedAt: now
		});
	}
});

export const end = mutation({
	args: { gameId: v.id('games') },
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const game = await ctx.db.get(args.gameId);
		if (!game) throw new Error('Game not found.');
		if (game.hostUserId !== userId) throw new Error('Only the host can end this game.');
		if (game.status === 'finished') return;

		const now = Date.now();
		await ctx.db.patch(game._id, {
			status: 'finished',
			endedAt: now,
			updatedAt: now
		});
	}
});

export const sendMessage = mutation({
	args: {
		gameId: v.id('games'),
		body: v.string()
	},
	handler: async (ctx, args) => {
		const userId = await requireUserId(ctx);
		const game = await ctx.db.get(args.gameId);
		if (!game) throw new Error('Game not found.');
		if (game.status === 'finished') throw new Error('Game has ended.');

		const membership = await ctx.db
			.query('gamePlayers')
			.withIndex('by_gameId_userId', (q) => q.eq('gameId', args.gameId).eq('userId', userId))
			.unique();
		if (!membership || membership.leftAt) throw new Error('Join the game before chatting.');

		const body = args.body.trim();
		if (!body) throw new Error('Message cannot be empty.');

		const now = Date.now();
		await ctx.db.insert('gameMessages', {
			gameId: args.gameId,
			userId,
			body: body.slice(0, 500),
			createdAt: now
		});
		await ctx.db.patch(game._id, { updatedAt: now });
	}
});
