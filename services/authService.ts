/**
 * @fileoverview This service centralizes all authentication logic.
 * It provides a consistent interface for logging in, logging out, and checking
 * authentication status, while handling the differences between a local/preview
 * development environment and the production AI Studio environment.
 */

const AISTUDIO_PROBE_TIMEOUT = 2000; // Wait 2 seconds for the aistudio object to appear.

/**
 * Asynchronously determines if the app is running in the production AI Studio environment.
 * It does this by "probing" for the existence of the `window.aistudio` object, which is
 * injected by the production environment. If the object doesn't appear within the timeout,
 * it assumes a development/preview environment.
 * @returns {Promise<boolean>} A promise that resolves to true if in production, false otherwise.
 */
const checkIsProduction = (): Promise<boolean> => {
    return new Promise((resolve) => {
        // If it's already there on initial check, we're in production.
        if (window.aistudio) {
            return resolve(true);
        }

        const startTime = Date.now();
        const intervalId = setInterval(() => {
            if (window.aistudio) {
                clearInterval(intervalId);
                resolve(true); // Found it, we're in production.
            } else if (Date.now() - startTime > AISTUDIO_PROBE_TIMEOUT) {
                clearInterval(intervalId);
                // Timed out, we're in a dev/preview environment.
                resolve(false);
            }
        }, 100); // Check every 100ms
    });
};

// A memoized promise to avoid re-checking the environment on every call.
let isProductionPromise: Promise<boolean> | null = null;
const getIsProduction = (): Promise<boolean> => {
    if (!isProductionPromise) {
        isProductionPromise = checkIsProduction();
    }
    return isProductionPromise;
};


/**
 * The single, centralized authentication service for the application.
 */
export const authService = {
    /**
     * Checks if the user is currently authenticated.
     * In dev/preview, it checks sessionStorage for a mock flag.
     * In production, it checks for a selected API key via the aistudio object.
     * @returns {Promise<boolean>} A promise that resolves to true if authenticated, false otherwise.
     */
    async isAuthenticated(): Promise<boolean> {
        const isProd = await getIsProduction();
        if (!isProd) {
            return sessionStorage.getItem('mock_authenticated') === 'true';
        }
        
        // At this point, `window.aistudio` is guaranteed to exist.
        return await window.aistudio.hasSelectedApiKey();
    },

    /**
     * Initiates the login process.
     * In dev/preview, it simulates a successful login by setting a flag in sessionStorage.
     * In production, it opens the AI Studio key selection dialog.
     * @returns {Promise<void>} A promise that resolves when the login process is initiated.
     */
    async login(): Promise<void> {
        const isProd = await getIsProduction();
        if (!isProd) {
            console.log("Development/Preview Mode: Simulating successful login.");
            sessionStorage.setItem('mock_authenticated', 'true');
            // Simulate a small network delay for a better user experience.
            return new Promise(resolve => setTimeout(resolve, 300));
        }

        // At this point, `window.aistudio` is guaranteed to exist.
        try {
            await window.aistudio.openSelectKey();
        } catch (e) {
            console.error("Error opening AI Studio key selector:", e);
            // Re-throw the error to be handled by the UI.
            throw e;
        }
    },

    /**
     * Logs the user out.
     * In dev/preview, it removes the mock flag from sessionStorage.
     * In production, there's no explicit logout from the aistudio object;
     * app state is simply reset.
     */
    async logout(): Promise<void> {
        const isProd = await getIsProduction();
        if (!isProd) {
            sessionStorage.removeItem('mock_authenticated');
        }
        // No explicit action needed for production logout, it's handled by app state.
        return Promise.resolve();
    }
};
