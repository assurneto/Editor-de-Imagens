
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { MobileModal } from './components/MobileModal';
import { generateImage as apiGenerateImage } from './services/imageService';
import { generateRestorePrompt } from './services/promptService';
import { Mode, CreateFunction, EditFunction, ArtisticStyle, AspectRatio } from './types';
import type { ImageFile } from './types';

type AuthStep = 'loading' | 'login' | 'selectKey' | 'ready';

const App: React.FC = () => {
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
    const [authStep, setAuthStep] = useState<AuthStep>('loading');

    useEffect(() => {
        const checkKeyStatus = async () => {
            try {
                if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
                    setAuthStep('ready');
                } else {
                    setAuthStep('login');
                }
            } catch (e) {
                console.error("Error checking for API key:", e);
                setAuthStep('login'); // Default to login if check fails
            }
        };
        checkKeyStatus();
    }, []);

    const handleGenerateImage = useCallback(async (promptOverride?: string) => {
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
                 setError('Sua chave de API parece ser inválida. Por favor, autentique-se novamente.');
                 setAuthStep('login');
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

    const renderAuthModals = () => {
        if (authStep === 'login') {
            return (
                <div className="absolute inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50 p-4">
                    <div className="text-center bg-gray-800 p-8 rounded-2xl shadow-xl max-w-lg w-full">
                        <h2 className="text-2xl font-bold mb-4 text-white">Conectar Conta Google</h2>
                        <p className="text-gray-400 mb-6">
                            Para usar o AI Image Studio, por favor, conecte sua Conta Google. Isso permitirá que o aplicativo acesse sua chave de API do Gemini.
                        </p>
                        <button
                            onClick={() => setAuthStep('selectKey')}
                            className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105"
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            );
        }

        if (authStep === 'selectKey') {
            return (
                 <div className="absolute inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50 p-4">
                    <div className="text-center bg-gray-800 p-8 rounded-2xl shadow-xl max-w-lg w-full">
                        <h2 className="text-2xl font-bold mb-4 text-white">Selecione sua Chave de API</h2>
                        <p className="text-gray-400 mb-6">
                            {error || 'Agora, selecione a chave de API que você criou no Google AI Studio para continuar.'}
                        </p>
                        <button
                            onClick={async () => {
                                if (window.aistudio) {
                                    try {
                                        await window.aistudio.openSelectKey();
                                        if (await window.aistudio.hasSelectedApiKey()) {
                                            setAuthStep('ready');
                                            setError(null);
                                        }
                                    } catch (e) {
                                        console.error("Error opening key selection:", e);
                                        setError("Não foi possível abrir a seleção de chave de API.");
                                    }
                                }
                            }}
                            className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-105"
                        >
                            Selecionar Chave de API
                        </button>
                        <button
                            onClick={() => setAuthStep('login')}
                            className="w-full mt-3 text-gray-400 font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                           Voltar
                        </button>
                         <p className="text-xs text-gray-500 mt-4">
                            Não tem uma chave? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-400">Crie uma gratuitamente</a>.
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    }

    if (authStep !== 'ready') {
        return (
            <div className="container mx-auto p-4 md:p-6 lg:p-8 min-h-screen relative">
                 {authStep === 'loading' && (
                     <div className="absolute inset-0 flex items-center justify-center">
                         <div className="loading-spinner w-16 h-16 border-4 border-t-transparent border-purple-500 rounded-full animate-spin"></div>
                     </div>
                 )}
                 {renderAuthModals()}
            </div>
        );
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
