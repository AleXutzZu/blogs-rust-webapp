import type {LoaderFunction, LoaderFunctionArgs} from "react-router";
import {redirect} from "react-router"
import {createContext, useContext} from "react";

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
        if (response.status == 204) {
            await this.checkAuth();
            return {success: true};
        }
        const body = await response.json() as ApiError;
        return {success: false, error: body.message};
    },

    async signOut(): Promise<AuthResult> {
        let response = await fetch("/api/auth/logout", {
            credentials: "include",
            method: "POST"
        });

        if (response.status == 204) {
            await this.checkAuth();
            return {success: true};
        }
        const body = await response.json() as ApiError;
        return {success: false, error: body.message};
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
        if (response.status == 204) {
            await this.checkAuth();
            return {success: true};
        }
        const body = await response.json() as ApiError;
        return {success: false, error: body.message};
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

export interface AuthContextMethods {
    getLoggedUser: () => AuthUser | null,
    updateProfilePictureLink: () => void,
    getProfilePictureLink: () => string,
    isStockPhoto: () => boolean,
    setStockPhoto: (state: boolean) => void
}

export const AuthContext = createContext<AuthContextMethods | null>(null);

export const useAuthContext = () : AuthContextMethods => {
    const methods = useContext(AuthContext);
    if (!methods) throw new Error("Context cannot be null");
    return methods;
}