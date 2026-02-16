import { defineSchema, defineTable } from 'convex/server';
import { authTables } from '@convex-dev/auth/server';
import { v } from 'convex/values';

export default defineSchema({
	...authTables,
	userProfiles: defineTable({
		userId: v.id('users'),
		displayName: v.optional(v.string()),
		avatarUrl: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number()
	}).index('by_userId', ['userId']),
	games: defineTable({
		hostUserId: v.id('users'),
		name: v.string(),
		isPublic: v.boolean(),
		status: v.union(v.literal('lobby'), v.literal('active'), v.literal('finished')),
		createdAt: v.number(),
		updatedAt: v.number(),
		startedAt: v.optional(v.number()),
		endedAt: v.optional(v.number())
	})
		.index('by_createdAt', ['createdAt'])
		.index('by_status', ['status'])
		.index('by_public_status', ['isPublic', 'status']),
	gamePlayers: defineTable({
		gameId: v.id('games'),
		userId: v.id('users'),
		joinedAt: v.number(),
		leftAt: v.optional(v.number())
	})
		.index('by_gameId', ['gameId'])
		.index('by_gameId_userId', ['gameId', 'userId'])
		.index('by_userId', ['userId']),
	gameMessages: defineTable({
		gameId: v.id('games'),
		userId: v.id('users'),
		body: v.string(),
		createdAt: v.number()
	})
		.index('by_gameId_createdAt', ['gameId', 'createdAt'])
		.index('by_userId', ['userId'])
});
