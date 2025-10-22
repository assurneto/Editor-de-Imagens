import React, { useState } from 'react';
import { authService } from '../services/authService';

interface LoginScreenProps {
    onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await authService.login();
            // After the login attempt (which might open a new window in production),
            // we call onLoginSuccess to update the app's state.
            // The main app component will re-verify the auth status.
            onLoginSuccess();
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
            console.error("Error during login:", e);
            setError(`Falha no login: ${errorMessage}`);
            setIsLoading(false);
        }
        // Note: We don't necessarily set isLoading to false here on success,
        // because the component will unmount and be replaced by the main app.
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md text-center bg-gray-800 p-8 rounded-2xl shadow-2xl">
                <h1 className="text-4xl font-bold mb-2">🎨 AI Image Studio</h1>
                <p className="text-gray-400 mb-8">Gerador profissional de imagens com IA.</p>
                <p className="text-gray-300 mb-6">Para começar, entre com sua Conta Google e autorize o acesso.</p>
                
                <button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full bg-white text-gray-800 font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-gray-200 disabled:opacity-50"
                >
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-t-transparent border-purple-500 rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48" aria-hidden="true">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                <path fill="none" d="M0 0h48v48H0z"></path>
                            </svg>
                            Entrar com Google
                        </>
                    )}
                </button>
                
                {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}

                 <p className="text-xs text-gray-500 mt-6">
                    Ao entrar, você será solicitado a selecionar um projeto e uma chave de API para habilitar as chamadas à API do Gemini.
                    Não tem uma chave? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-400">Crie uma gratuitamente</a>.
                </p>
            </div>
        </div>
    );
};
