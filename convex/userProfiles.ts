import { getAuthUserId } from '@convex-dev/auth/server';
import { mutation, query } from './_generated/server';

export const current = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			return null;
		}

		return ctx.db
			.query('userProfiles')
			.withIndex('by_userId', (q) => q.eq('userId', userId))
			.unique();
	}
});

export const ensureCurrent = mutation({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) {
			throw new Error('Not authenticated');
		}

		const existing = await ctx.db
			.query('userProfiles')
			.withIndex('by_userId', (q) => q.eq('userId', userId))
			.unique();

		if (existing) {
			return existing;
		}

		const now = Date.now();
		const profileId = await ctx.db.insert('userProfiles', {
			userId,
			createdAt: now,
			updatedAt: now
		});

		return ctx.db.get(profileId);
	}
});
