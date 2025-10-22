import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { MobileModal } from './components/MobileModal';
import { LoginScreen } from './components/LoginScreen';
import { generateImage as apiGenerateImage } from './services/imageService';
import { generateRestorePrompt } from './services/promptService';
import { Mode, CreateFunction, EditFunction, ArtisticStyle, AspectRatio } from './types';
import type { ImageFile } from './types';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

    const [mode, setMode] = useState<Mode>(Mode.CREATE);
    const [prompt, setPrompt] = useState<string>('');
    const [activeCreateFunction, setActiveCreateFunction] = useState<CreateFunction>(CreateFunction.FREE);
    const [activeEditFunction, setActiveEditFunction] = useState<EditFunction>(EditFunction.ADD_REMOVE);
    const [selectedStyle, setSelectedStyle] = useState<ArtisticStyle>(ArtisticStyle.REALISTIC);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);

    const [image1, setImage1] = useState<ImageFile | null>(null);
    const [image2, setImage2] = useState<ImageFile | null>(null);
    
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [history, setHistory] = useState<string[]>([]);
    const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(-1);

    const [showTwoImagesView, setShowTwoImagesView] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    
    const [colorize, setColorize] = useState<boolean>(false);
    const [imageFilters, setImageFilters] = useState({
        brightness: 100,
        contrast: 100,
        sepia: 0,
        grayscale: 0,
    });
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        const checkAuthStatus = async () => {
            if (window.aistudio) {
                try {
                    const hasKey = await window.aistudio.hasSelectedApiKey();
                    setIsAuthenticated(hasKey);
                } catch (e) {
                    console.error("Error checking auth status:", e);
                    setIsAuthenticated(false);
                }
            } else {
                 // Fallback for environments where aistudio is not present
                 setIsAuthenticated(false);
            }
            setIsAuthLoading(false);
        };
        checkAuthStatus();
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
    };

    const handleGenerateImage = useCallback(async (promptOverride?: string) => {
        if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
            setError("Sua sessão expirou ou a chave de API é inválida. Por favor, entre novamente.");
            handleLogout();
            return;
        }

        setIsLoading(true);
        setError(null);

        const promptToUse = promptOverride ?? prompt;

        const finalPrompt = (mode === Mode.EDIT && activeEditFunction === EditFunction.RESTORE)
            ? generateRestorePrompt(colorize)
            : promptToUse;

        try {
            const result = await apiGenerateImage({
                prompt: finalPrompt,
                mode,
                createFunction: activeCreateFunction,
                editFunction: activeEditFunction,
                selectedStyle,
                aspectRatio,
                image1,
                image2
            });
            setGeneratedImage(result);
            
            setImageFilters({ brightness: 100, contrast: 100, sepia: 0, grayscale: 0 });
            setRotation(0);

            const newHistory = [...history.slice(0, currentHistoryIndex + 1), result];
            setHistory(newHistory);
            setCurrentHistoryIndex(newHistory.length - 1);

            if (window.innerWidth < 768) {
                setIsModalOpen(true);
            }
        } catch (err) {
            if (err instanceof Error && (err.message.includes('API key not valid') || err.message.includes('Requested entity was not found'))) {
                 setError('Sua chave de API tornou-se inválida. Por favor, entre novamente para selecionar uma nova chave.');
                 handleLogout();
            } else {
                const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
                setError(`Falha ao gerar a imagem: ${errorMessage}`);
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, mode, activeCreateFunction, activeEditFunction, selectedStyle, aspectRatio, image1, image2, history, currentHistoryIndex, colorize]);

    const handleEditCurrentImage = useCallback(() => {
        if (!generatedImage) return;

        setMode(Mode.EDIT);
        setActiveEditFunction(EditFunction.ADD_REMOVE);
        const newImageFile: ImageFile = { url: generatedImage, file: null };
        setImage1(newImageFile);
        setGeneratedImage(null);
        setIsModalOpen(false);
        setShowTwoImagesView(false);
        window.scrollTo(0, 0);
    }, [generatedImage]);

    const handleNewImage = () => {
        setGeneratedImage(null);
        setIsModalOpen(false);
        setPrompt('');
        setImage1(null);
        setImage2(null);
        setMode(Mode.CREATE);
        setActiveCreateFunction(CreateFunction.FREE);
        setAspectRatio(AspectRatio.SQUARE);
        setHistory([]);
        setCurrentHistoryIndex(-1);
    };

    const resetImagesForMode = () => {
        setImage1(null);
        setImage2(null);
    };

    const handleModeChange = (newMode: Mode) => {
        if (mode !== newMode) {
            setMode(newMode);
            resetImagesForMode();
            setShowTwoImagesView(false);
        }
    };
    
    const handleCreateFunctionSelect = (func: CreateFunction) => {
        setActiveCreateFunction(func);
    };

    const handleEditFunctionSelect = (func: EditFunction) => {
        setActiveEditFunction(func);
        if (func === EditFunction.COMPOSE) {
            setShowTwoImagesView(true);
        } else {
            setShowTwoImagesView(false);
            setImage2(null);
        }
    };
    
    const handleUndo = useCallback(() => {
        if (currentHistoryIndex > 0) {
            const newIndex = currentHistoryIndex - 1;
            setCurrentHistoryIndex(newIndex);
            setGeneratedImage(history[newIndex]);
        }
    }, [currentHistoryIndex, history]);

    const handleRedo = useCallback(() => {
        if (currentHistoryIndex < history.length - 1) {
            const newIndex = currentHistoryIndex + 1;
            setCurrentHistoryIndex(newIndex);
            setGeneratedImage(history[newIndex]);
        }
    }, [currentHistoryIndex, history]);

    const canUndo = useMemo(() => currentHistoryIndex > 0, [currentHistoryIndex]);
    const canRedo = useMemo(() => currentHistoryIndex < history.length - 1, [currentHistoryIndex, history.length]);

    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                <div className="w-16 h-16 border-4 border-t-transparent border-purple-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 min-h-screen relative">
            <div className="flex flex-col md:flex-row gap-8">
                <LeftPanel
                    mode={mode}
                    onModeChange={handleModeChange}
                    prompt={prompt}
                    onPromptChange={setPrompt}
                    activeCreateFunction={activeCreateFunction}
                    onSelectCreateFunction={handleCreateFunctionSelect}
                    activeEditFunction={activeEditFunction}
                    onSelectEditFunction={handleEditFunctionSelect}
                    selectedStyle={selectedStyle}
                    onSelectStyle={setSelectedStyle}
                    aspectRatio={aspectRatio}
                    onSelectAspectRatio={setAspectRatio}
                    image1={image1}
                    setImage1={setImage1}
                    image2={image2}
                    setImage2={setImage2}
                    onGenerate={handleGenerateImage}
                    isLoading={isLoading}
                    showTwoImagesView={showTwoImagesView}
                    setShowTwoImagesView={setShowTwoImagesView}
                    colorize={colorize}
                    setColorize={setColorize}
                />
                <RightPanel
                    isLoading={isLoading}
                    generatedImage={generatedImage}
                    onEditCurrentImage={handleEditCurrentImage}
                    error={error}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    imageFilters={imageFilters}
                    setImageFilters={setImageFilters}
                    rotation={rotation}
                    setRotation={setRotation}
                />
            </div>
            {/* Fix: Corrected typo from isModalopen to isModalOpen */}
            {isModalOpen && generatedImage && (
                 <MobileModal
                    generatedImage={generatedImage}
                    onClose={() => setIsModalOpen(false)}
                    onEdit={handleEditCurrentImage}
                    onNewImage={handleNewImage}
                 />
            )}
        </div>
    );
};

export default App;