import React from 'react';
import { FunctionCard } from './FunctionCard';
import { UploadArea } from './UploadArea';
import { DualUploadArea } from './DualUploadArea';
import { TipsBox } from './TipsBox';
import { Mode, CreateFunction, EditFunction, ArtisticStyle, AspectRatio, styleOptions, aspectRatioOptions } from '../types';
import type { ImageFile } from '../types';
import { generateProfessionalPrompt } from '../services/promptService';

interface LeftPanelProps {
    mode: Mode;
    onModeChange: (mode: Mode) => void;
    prompt: string;
    onPromptChange: (prompt: string) => void;
    activeCreateFunction: CreateFunction;
    onSelectCreateFunction: (func: CreateFunction) => void;
    activeEditFunction: EditFunction;
    onSelectEditFunction: (func: EditFunction) => void;
    selectedStyle: ArtisticStyle;
    onSelectStyle: (style: ArtisticStyle) => void;
    aspectRatio: AspectRatio;
    onSelectAspectRatio: (ratio: AspectRatio) => void;
    image1: ImageFile | null;
    setImage1: (file: ImageFile | null) => void;
    image2: ImageFile | null;
    setImage2: (file: ImageFile | null) => void;
    onGenerate: () => void;
    isLoading: boolean;
    showTwoImagesView: boolean;
    setShowTwoImagesView: (show: boolean) => void;
    colorize: boolean;
    setColorize: (colorize: boolean) => void;
}

const createFunctions = [
    { id: CreateFunction.FREE, icon: '✨', name: 'Prompt' },
    { id: CreateFunction.STYLE, icon: '🎨', name: 'Estilo' },
];

const editFunctions = [
    { id: EditFunction.ADD_REMOVE, icon: '➕', name: 'Adicionar' },
    { id: EditFunction.RETOUCH, icon: '🎯', name: 'Retoque' },
    { id: EditFunction.STYLE, icon: '🎨', name: 'Estilo' },
    { id: EditFunction.COMPOSE, icon: '🖼️', name: 'Unir', requiresTwo: true },
    { id: EditFunction.RESTORE, icon: '🛠️', name: 'Restaurar', requiresTwo: false },
];

export const LeftPanel: React.FC<LeftPanelProps> = ({
    mode, onModeChange, prompt, onPromptChange,
    activeCreateFunction, onSelectCreateFunction,
    activeEditFunction, onSelectEditFunction,
    selectedStyle, onSelectStyle,
    aspectRatio, onSelectAspectRatio,
    image1, setImage1, image2, setImage2,
    onGenerate, isLoading, showTwoImagesView, setShowTwoImagesView,
    colorize, setColorize
}) => {
    const [promptIdea, setPromptIdea] = React.useState<string>('');
    const [isGeneratingPrompt, setIsGeneratingPrompt] = React.useState<boolean>(false);
    const [promptGeneratedSuccess, setPromptGeneratedSuccess] = React.useState<boolean>(false);

    const handleGeneratePrompt = async () => {
        if (!promptIdea.trim()) return;
        setIsGeneratingPrompt(true);
        setPromptGeneratedSuccess(false);
        try {
            const professionalPrompt = await generateProfessionalPrompt(promptIdea);
            onPromptChange(professionalPrompt);
            setPromptGeneratedSuccess(true);
            setTimeout(() => setPromptGeneratedSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to generate prompt:", error);
        } finally {
            setIsGeneratingPrompt(false);
        }
    };

    const isRestoreMode = mode === Mode.EDIT && activeEditFunction === EditFunction.RESTORE;

    const renderDynamicContent = () => {
        if (mode === Mode.EDIT) {
            if (showTwoImagesView) {
                return (
                    <DualUploadArea
                        image1={image1}
                        setImage1={setImage1}
                        image2={image2}
                        setImage2={setImage2}
                        onBack={() => setShowTwoImagesView(false)}
                    />
                );
            }
            return (
                <div id="uploadArea" className="mt-6">
                    <UploadArea image={image1} setImage={setImage1} />
                </div>
            );
        }
        return null;
    };

    return (
        <div className="left-panel md:w-2/5 lg:w-1/3 bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col gap-6 h-fit">
            <header>
                <h1 className="panel-title text-3xl font-bold text-white">🎨 AI Image Studio</h1>
                <p className="panel-subtitle text-gray-400 mt-1">Gerador profissional de imagens</p>
            </header>
            
            <div className={`prompt-section ${isRestoreMode ? 'hidden' : ''}`}>
                <div className="section-title font-semibold text-gray-300 mb-2">💭 Descreva sua ideia</div>
                <textarea
                    id="prompt"
                    className="prompt-input w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition duration-200 h-28 resize-none"
                    placeholder="Descreva a imagem que você deseja criar..."
                    value={prompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                />
            </div>
            
            <div className={`prompt-generator-section bg-gray-700 p-4 rounded-lg ${isRestoreMode ? 'hidden' : ''}`}>
                <div className="section-title font-semibold text-gray-300 mb-2">💡 Gerador de Prompt</div>
                <p className="text-xs text-gray-400 mb-3">Sem inspiração? Dê uma ideia simples e a transformaremos em um prompt detalhado.</p>
                <textarea
                    id="prompt-idea"
                    className="prompt-input w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition duration-200 h-20 resize-none"
                    placeholder="Ex: um gato astronauta flutuando no espaço"
                    value={promptIdea}
                    onChange={(e) => setPromptIdea(e.target.value)}
                />
                <button
                    onClick={handleGeneratePrompt}
                    disabled={isGeneratingPrompt || !promptIdea.trim()}
                    className="mt-3 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGeneratingPrompt ? (
                        <>
                            <div className="spinner w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                            <span>Criando...</span>
                        </>
                    ) : (
                        <span>🪄 Gerar Prompt Profissional</span>
                    )}
                </button>
                {promptGeneratedSuccess && (
                    <p className="text-green-400 text-xs mt-2 text-center animate-pulse">
                        ✅ Prompt aprimorado com sucesso!
                    </p>
                )}
            </div>

            <TipsBox selectedStyle={selectedStyle} />

            <div className="mode-toggle grid grid-cols-2 gap-2 bg-gray-700 p-1 rounded-lg">
                <button
                    onClick={() => onModeChange(Mode.CREATE)}
                    className={`mode-btn py-2 rounded-md font-semibold transition-colors duration-200 ${mode === Mode.CREATE ? 'bg-purple-600 text-white' : 'bg-transparent text-gray-300 hover:bg-gray-600'}`}
                >
                    Criar
                </button>
                <button
                    onClick={() => onModeChange(Mode.EDIT)}
                    className={`mode-btn py-2 rounded-md font-semibold transition-colors duration-200 ${mode === Mode.EDIT ? 'bg-purple-600 text-white' : 'bg-transparent text-gray-300 hover:bg-gray-600'}`}
                >
                    Editar
                </button>
            </div>
            
            {!showTwoImagesView && (
                <div className="functions-section">
                    {mode === Mode.CREATE ? (
                         <div id="createFunctions" className="functions-grid grid grid-cols-2 gap-3">
                            {createFunctions.map(f => (
                                <FunctionCard 
                                    key={f.id}
                                    icon={f.icon} 
                                    name={f.name}
                                    isActive={activeCreateFunction === f.id}
                                    onClick={() => onSelectCreateFunction(f.id)}
                                />
                            ))}
                        </div>
                    ) : (
                         <div id="editFunctions" className="functions-grid grid grid-cols-3 gap-3">
                             {editFunctions.map(f => (
                                <FunctionCard 
                                    key={f.id}
                                    icon={f.icon} 
                                    name={f.name}
                                    isActive={activeEditFunction === f.id}
                                    onClick={() => onSelectEditFunction(f.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            {isRestoreMode && !showTwoImagesView && (
                <div className="restore-options-section bg-gray-700 p-4 rounded-lg">
                    <div className="section-title font-semibold text-gray-300 mb-2">Opções de Restauração</div>
                    <p className="text-xs text-gray-400 mb-3">
                        Envie uma foto antiga ou danificada. A IA irá limpá-la e restaurá-la. O campo de prompt será ignorado.
                    </p>
                    <label htmlFor="colorize-checkbox" className="flex items-center gap-2 cursor-pointer">
                        <input
                            id="colorize-checkbox"
                            type="checkbox"
                            checked={colorize}
                            onChange={(e) => setColorize(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-500 bg-gray-900 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-gray-300">Colorir a foto</span>
                    </label>
                </div>
            )}

            {mode === Mode.CREATE && activeCreateFunction === CreateFunction.STYLE && !showTwoImagesView && (
                <div className="style-section">
                    <label htmlFor="style-select" className="section-title font-semibold text-gray-300 mb-2 block">🎨 Escolha um Estilo</label>
                    <select
                        id="style-select"
                        value={selectedStyle}
                        onChange={(e) => onSelectStyle(e.target.value as ArtisticStyle)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition duration-200 appearance-none"
                        style={{ background: 'url(\'data:image/svg+xml;utf8,<svg fill="white" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>\') no-repeat right 1rem center/1.5em 1.5em', paddingRight: '2.5rem' }}
                    >
                    {styleOptions.map(style => (
                        <option className="bg-gray-700 text-white" key={style.id} value={style.id}>{style.name}</option>
                    ))}
                    </select>
              </div>
            )}

            {mode === Mode.CREATE && !showTwoImagesView && (
                 <div className="aspect-ratio-section">
                    <div className="section-title font-semibold text-gray-300 mb-2">📐 Proporção</div>
                    <div className="grid grid-cols-5 gap-2">
                        {aspectRatioOptions.map(option => (
                            <button
                                key={option.id}
                                onClick={() => onSelectAspectRatio(option.id)}
                                className={`aspect-ratio-btn flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                    aspectRatio === option.id ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                                title={option.name}
                            >
                                <span className="text-xl leading-none">{option.icon}</span>
                                <span className="text-xs mt-1">{option.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="dynamic-content">
                {renderDynamicContent()}
            </div>

            <button
                id="generateBtn"
                className="generate-btn w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onGenerate}
                disabled={isLoading || (!prompt && !isRestoreMode)}
            >
                {isLoading ? (
                    <>
                        <div className="spinner w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                        <span className="btn-text">Gerando...</span>
                    </>
                ) : (
                    <span className="btn-text">🚀 Gerar Imagem</span>
                )}
            </button>
        </div>
    );
};