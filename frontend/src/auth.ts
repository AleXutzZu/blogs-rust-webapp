import type {LoaderFunction, LoaderFunctionArgs} from "react-router";
import {redirect} from "react-router"

export interface AuthUser {
    username: string;
}

interface AuthResult {
    success: boolean;
    error?: string;
}

interface ApiError {
    error: string,
    message: string,
}

interface AuthProvider {

    signIn(username: string, password: string): Promise<AuthResult>,

    checkAuth(): Promise<AuthUser | null>,

    signOut(): Promise<AuthResult>,

    isAuthenticated(): Promise<boolean>,

    signUp(username: string, password: string): Promise<AuthResult>,
}

export const authProvider: AuthProvider = {
    async checkAuth() {
        let response = await fetch("/api/auth/me", {credentials: "include"});

        if (response.ok) {
            return await response.json() as AuthUser;
        } else {
            return null;
        }
    },

    async signIn(username: string, password: string): Promise<AuthResult> {
        let response = await fetch("/api/auth/login", {
            credentials: "include",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password,
            })
        });
        const body = await response.json();
        if (!response.ok) return {success: false, error: (body as ApiError).message};

        await this.checkAuth();
        return {success: true};
    },

    async signOut(): Promise<AuthResult> {
        let response = await fetch("/api/auth/logout", {
            credentials: "include",
            method: "POST"
        });
        const body = await response.json();
        if (!response.ok) return {success: false, error: (body as ApiError).message};

        return {success: true};
    },

    async isAuthenticated(): Promise<boolean> {
        const user = await this.checkAuth();
        return user != null;
    },

    async signUp(username: string, password: string): Promise<AuthResult> {
        const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                username,
                password
            })
        });
        const body = await response.json();
        if (!response.ok) return {success: false, error: (body as ApiError).message};
        return {success: true};
    }
}


export const protectedLoaderWrapper = (loader?: LoaderFunction<any>) => {
    return async (args: LoaderFunctionArgs) => {
        if (!await authProvider.isAuthenticated()) {
            let params = new URLSearchParams();
            params.set("redirectTo", new URL(args.request.url).pathname);
            return redirect("/login?" + params.toString());
        }
        if (typeof loader === "undefined") return;

        return loader(args);
    }
}
