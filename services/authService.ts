/**
 * @fileoverview This service centralizes all authentication logic.
 * It provides a consistent interface for logging in, logging out, and checking
 * authentication status, while handling the differences between a local
 * development environment and the production AI Studio environment.
 */

// A simple check to determine if we are in a local development environment.
const isDevelopment = window.location.hostname === 'localhost';

/**
 * The single, centralized authentication service for the application.
 */
export const authService = {
    /**
     * Checks if the user is currently authenticated.
     * In development, it checks sessionStorage for a mock flag.
     * In production, it checks for a selected API key via the aistudio object.
     * @returns {Promise<boolean>} A promise that resolves to true if authenticated, false otherwise.
     */
    async isAuthenticated(): Promise<boolean> {
        if (isDevelopment) {
            // In dev mode, we consider the user "authenticated" if our mock flag is set.
            return sessionStorage.getItem('mock_authenticated') === 'true';
        }

        // In production, authentication depends on the AI Studio environment and a selected API key.
        if (window.aistudio) {
            try {
                return await window.aistudio.hasSelectedApiKey();
            } catch (e) {
                console.error("Error checking for selected API key:", e);
                return false;
            }
        }
        
        // If not in dev and aistudio is not available, user is not authenticated.
        return false;
    },

    /**
     * Initiates the login process.
     * In development, it simulates a successful login by setting a flag in sessionStorage.
     * In production, it opens the AI Studio's key selection dialog.
     * @returns {Promise<void>} A promise that resolves when the login process is initiated.
     */
    async login(): Promise<void> {
        if (isDevelopment) {
            console.log("Development Mode: Simulating successful login.");
            // Set a mock flag in session storage to persist the "logged in" state.
            sessionStorage.setItem('mock_authenticated', 'true');
            // Simulate a brief network delay for a more realistic UX.
            return new Promise(resolve => setTimeout(resolve, 300));
        }

        // In production, we trigger the official login/key selection flow.
        if (window.aistudio) {
            try {
                // This function prompts the user to both sign in with Google (if not already)
                // and select an API key for the project.
                await window.aistudio.openSelectKey();
                return;
            } catch (e) {
                // The user may have closed the dialog, or an error occurred.
                console.error("Error or user cancellation during API key selection:", e);
                throw new Error('O processo de seleção de chave foi cancelado ou falhou.');
            }
        }
        
        // If the aistudio object isn't available in a non-dev environment, we cannot proceed.
        throw new Error('Ambiente de AI Studio não detectado.');
    },

    /**
     * Logs the user out.
     * In development, it simply removes the mock flag from sessionStorage.
     * In production, there is no explicit logout function in aistudio; logging out
     * is handled by changing the application's state.
     */
    async logout(): Promise<void> {
        if (isDevelopment) {
            sessionStorage.removeItem('mock_authenticated');
        }
        // In the production environment, "logout" is managed by the App's state.
        // There's no session to clear on the aistudio object itself.
        return Promise.resolve();
    }
};
