import { getContext, setContext } from 'svelte';
import type { useAuth } from '$lib/components/auth/useAuth.svelte';

type AuthContextValue = ReturnType<typeof useAuth>;

const AUTH_CONTEXT_KEY = Symbol('auth-context');

export function setAuthContext(auth: AuthContextValue) {
	return setContext(AUTH_CONTEXT_KEY, auth);
}

export function getAuthContext() {
	const auth = getContext<AuthContextValue | undefined>(AUTH_CONTEXT_KEY);
	if (!auth) {
		throw new Error('Auth context is missing. Call setAuthContext() in a parent component.');
	}
	return auth;
}
