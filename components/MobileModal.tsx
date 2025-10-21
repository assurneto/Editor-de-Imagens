
import React from 'react';

interface MobileModalProps {
    generatedImage: string;
    onClose: () => void;
    onEdit: () => void;
    onNewImage: () => void;
}

export const MobileModal: React.FC<MobileModalProps> = ({ generatedImage, onClose, onEdit, onNewImage }) => {
    const downloadImage = (imageUrl: string) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.target = '_blank';
        link.download = `ai-image-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        onClose();
    };

    return (
        <div id="mobileModal" className="mobile-modal fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center p-4 z-50 md:hidden">
            <div className="modal-content bg-gray-800 rounded-2xl w-full max-w-md flex flex-col gap-4 p-4">
                <img id="modalImage" src={generatedImage} alt="Generated Art" className="modal-image w-full h-auto object-contain rounded-lg max-h-[60vh]" />
                <div id="modal-actions" className="grid grid-cols-3 gap-2">
                    <button className="modal-btn edit bg-gray-700 text-white p-3 rounded-lg flex flex-col items-center gap-1" onClick={onEdit}>
                        <span className="text-2xl">✏️</span>
                        <span className="text-xs font-semibold">Editar</span>
                    </button>
                    <button className="modal-btn download bg-gray-700 text-white p-3 rounded-lg flex flex-col items-center gap-1" onClick={() => downloadImage(generatedImage)}>
                        <span className="text-2xl">💾</span>
                        <span className="text-xs font-semibold">Salvar</span>
                    </button>
                    <button className="modal-btn new bg-purple-600 text-white p-3 rounded-lg flex flex-col items-center gap-1" onClick={onNewImage}>
                        <span className="text-2xl">✨</span>
                        <span className="text-xs font-semibold">Nova</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
