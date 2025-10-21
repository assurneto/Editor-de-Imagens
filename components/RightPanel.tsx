
import React from 'react';

type ImageFilters = {
    brightness: number;
    contrast: number;
    sepia: number;
    grayscale: number;
};

interface RightPanelProps {
    isLoading: boolean;
    generatedImage: string | null;
    onEditCurrentImage: () => void;
    error: string | null;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    imageFilters: ImageFilters;
    setImageFilters: React.Dispatch<React.SetStateAction<ImageFilters>>;
    rotation: number;
    setRotation: React.Dispatch<React.SetStateAction<number>>;
}

const downloadImage = (imageUrl: string, rotation: number, filters: ImageFilters) => {
    const image = new Image();
    image.crossOrigin = 'anonymous'; // Required for tainted canvas
    image.src = imageUrl;
    image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const radians = rotation * Math.PI / 180;
        const sin = Math.abs(Math.sin(radians));
        const cos = Math.abs(Math.cos(radians));
        const newWidth = image.width * cos + image.height * sin;
        const newHeight = image.width * sin + image.height * cos;
        
        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) sepia(${filters.sepia}%) grayscale(${filters.grayscale}%)`;

        ctx.translate(newWidth / 2, newHeight / 2);
        ctx.rotate(radians);
        
        ctx.drawImage(image, -image.width / 2, -image.height / 2);

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/jpeg');
        link.download = `ai-image-edited-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    image.onerror = () => {
        // Fallback for CORS issues or other errors: open in new tab
        console.error("Could not load image on canvas, falling back to direct link.");
        const link = document.createElement('a');
        link.href = imageUrl;
        link.target = '_blank';
        link.download = `ai-image-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
};

export const RightPanel: React.FC<RightPanelProps> = ({ 
    isLoading, generatedImage, onEditCurrentImage, error, onUndo, onRedo, canUndo, canRedo,
    imageFilters, setImageFilters, rotation, setRotation
}) => {
    
    const handleFilterChange = (filterName: keyof ImageFilters, value: number) => {
        setImageFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const handlePresetFilter = (filterName: 'sepia' | 'grayscale') => {
        setImageFilters(prev => ({ ...prev, [filterName]: prev[filterName] > 0 ? 0 : 100 }));
    };

    const handleRotate = () => {
        setRotation(prev => (prev + 90) % 360);
    };
    
    const resetFilters = () => {
        setImageFilters({ brightness: 100, contrast: 100, sepia: 0, grayscale: 0 });
        setRotation(0);
    };

    return (
        <div className="right-panel md:w-2/3 lg:w-3/4 flex-grow flex items-center justify-center bg-gray-800 p-6 rounded-2xl shadow-lg min-h-[60vh] md:min-h-0">
            {isLoading && (
                <div id="loadingContainer" className="loading-container text-center">
                    <div className="loading-spinner w-16 h-16 border-4 border-t-transparent border-purple-500 rounded-full animate-spin mx-auto"></div>
                    <div className="loading-text mt-4 text-xl text-gray-300">Gerando sua imagem...</div>
                </div>
            )}

            {!isLoading && !generatedImage && (
                <div id="resultPlaceholder" className="result-placeholder text-center text-gray-500">
                    <div className="result-placeholder-icon text-7xl mb-4">🎨</div>
                    <div className="text-2xl font-semibold">Sua obra de arte aparecerá aqui</div>
                    {error && <div className="text-red-400 mt-4">{error}</div>}
                </div>
            )}
            
            {!isLoading && generatedImage && (
                <div id="imageContainer" className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <div className="relative w-full flex-grow group flex items-center justify-center">
                        <img 
                          id="generatedImage" 
                          src={generatedImage} 
                          alt="Generated Art" 
                          className="generated-image max-w-full max-h-full object-contain rounded-lg transition-transform duration-300"
                          style={{
                            transform: `rotate(${rotation}deg)`,
                            filter: `brightness(${imageFilters.brightness}%) contrast(${imageFilters.contrast}%) sepia(${imageFilters.sepia}%) grayscale(${imageFilters.grayscale}%)`
                          }}
                        />
                        <div className="image-actions absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button className="action-btn bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed" onClick={onUndo} disabled={!canUndo} title="Desfazer">↩️</button>
                            <button className="action-btn bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed" onClick={onRedo} disabled={!canRedo} title="Refazer">↪️</button>
                            <button className="action-btn bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75" onClick={onEditCurrentImage} title="Editar com Prompt">✏️</button>
                            <button className="action-btn bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75" onClick={() => downloadImage(generatedImage, rotation, imageFilters)} title="Download">💾</button>
                        </div>
                    </div>
                    <div id="editingTools" className="bg-gray-700 p-3 rounded-lg w-full max-w-2xl flex flex-col gap-4 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label htmlFor="brightness" className="text-gray-300">Brilho: {imageFilters.brightness}%</label>
                                <input type="range" id="brightness" min="50" max="150" value={imageFilters.brightness} onChange={(e) => handleFilterChange('brightness', parseInt(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label htmlFor="contrast" className="text-gray-300">Contraste: {imageFilters.contrast}%</label>
                                <input type="range" id="contrast" min="50" max="150" value={imageFilters.contrast} onChange={(e) => handleFilterChange('contrast', parseInt(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            <button onClick={handleRotate} className="edit-tool-btn">🔄 Girar</button>
                            <button onClick={() => handlePresetFilter('sepia')} className={`edit-tool-btn ${imageFilters.sepia > 0 ? 'active' : ''}`}>🎞️ Sépia</button>
                            <button onClick={() => handlePresetFilter('grayscale')} className={`edit-tool-btn ${imageFilters.grayscale > 0 ? 'active' : ''}`}>🎱 P&B</button>
                            <button onClick={resetFilters} className="edit-tool-btn">🗑️ Resetar</button>
                        </div>
                    </div>
                     <style>{`
                        .edit-tool-btn { background-color: #4A5568; color: white; padding: 8px; border-radius: 6px; font-weight: 600; transition: background-color 0.2s; }
                        .edit-tool-btn:hover { background-color: #2D3748; }
                        .edit-tool-btn.active { background-color: #805AD5; color: white; }
                        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; background: #805AD5; cursor: pointer; border-radius: 50%; }
                        input[type=range]::-moz-range-thumb { width: 16px; height: 16px; background: #805AD5; cursor: pointer; border-radius: 50%; }
                    `}</style>
                </div>
            )}
        </div>
    );
};
