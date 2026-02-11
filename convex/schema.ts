import { defineSchema, defineTable } from 'convex/server';
import { authTables } from '@convex-dev/auth/server';
import { v } from 'convex/values';

export default defineSchema({
	...authTables,
	users: defineTable({
		email: v.optional(v.string()),
		name: v.optional(v.string()),
		image: v.optional(v.string()),
		createdAt: v.number()
	}).index('by_email', ['email']),
	games: defineTable({
		hostUserId: v.id('users'),
		status: v.union(v.literal('lobby'), v.literal('active'), v.literal('finished')),
		createdAt: v.number()
	})
});
