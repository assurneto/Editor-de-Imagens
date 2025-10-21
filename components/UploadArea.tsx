import React, { useRef, useState, useCallback } from 'react';
import type { ImageFile } from '../types';

interface UploadAreaProps {
    image: ImageFile | null;
    setImage: (file: ImageFile | null) => void;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export const UploadArea: React.FC<UploadAreaProps> = ({ image, setImage }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    const processFile = useCallback((file: File) => {
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
            setError(`Tipo de arquivo inválido. Use: PNG, JPG, WebP.`);
            setUploadStatus('error');
            return;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            setError(`Arquivo muito grande. O tamanho máximo é de ${MAX_FILE_SIZE_MB}MB.`);
            setUploadStatus('error');
            return;
        }

        setError(null);
        setUploadStatus('loading');

        const reader = new FileReader();
        reader.onloadend = () => {
            setImage({ url: reader.result as string, file });
            setUploadStatus('idle');
        };
        reader.onerror = () => {
            setError('Falha ao ler o arquivo.');
            setUploadStatus('error');
        };
        reader.readAsDataURL(file);
    }, [setImage]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processFile(file);
        }
        // Reset input value to allow uploading the same file again
        if (event.target) {
            event.target.value = '';
        }
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleRetry = () => {
        setError(null);
        setUploadStatus('idle');
        fileInputRef.current?.click();
    };

    const renderContent = () => {
        if (image) {
            return (
                <div className="relative group">
                    <img src={image.url} alt="Preview" className="image-preview h-28 w-auto mx-auto rounded-md object-contain" />
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                        <span className="text-white font-semibold">Trocar Imagem</span>
                    </div>
                </div>
            );
        }

        switch (uploadStatus) {
            case 'loading':
                return (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                        <div className="w-8 h-8 border-2 border-t-transparent border-purple-500 rounded-full animate-spin"></div>
                        <span className="mt-2 font-semibold">Carregando...</span>
                    </div>
                );
            case 'error':
                return (
                    <div className="flex flex-col items-center justify-center text-red-400">
                        <div className="text-4xl">⚠️</div>
                        <div className="mt-2 font-semibold text-center">{error}</div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleRetry(); }}
                            className="mt-3 bg-purple-600 text-white px-4 py-1 rounded-md text-sm font-semibold hover:bg-purple-700 transition-colors"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                );
            case 'idle':
            default:
                return (
                    <div className="cursor-pointer">
                        <div className="text-4xl">📁</div>
                        <div className="mt-2 font-semibold">Clique ou arraste uma imagem</div>
                        <div className="upload-text text-xs text-gray-400 mt-1">PNG, JPG, WebP (máx. 10MB)</div>
                    </div>
                );
        }
    };

    return (
        <div 
            className={`upload-area border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 relative min-h-[170px] flex items-center justify-center
                ${uploadStatus === 'error' ? 'border-red-500' : 'border-gray-600 hover:border-purple-500'}
            `}
            onClick={() => !image && uploadStatus !== 'loading' && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={ACCEPTED_FILE_TYPES.join(',')}
                onChange={handleFileChange}
            />
            {renderContent()}
        </div>
    );
};