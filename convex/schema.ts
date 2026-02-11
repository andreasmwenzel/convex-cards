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
		status: v.union(v.literal('lobby'), v.literal('active'), v.literal('finished')),
		createdAt: v.number()
	})
});
