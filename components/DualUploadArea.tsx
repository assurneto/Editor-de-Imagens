
import React from 'react';
import { UploadArea } from './UploadArea';
import type { ImageFile } from '../types';

interface DualUploadAreaProps {
    image1: ImageFile | null;
    setImage1: (file: ImageFile | null) => void;
    image2: ImageFile | null;
    setImage2: (file: ImageFile | null) => void;
    onBack: () => void;
}

export const DualUploadArea: React.FC<DualUploadAreaProps> = ({ image1, setImage1, image2, setImage2, onBack }) => {
    return (
        <div id="twoImagesSection" className="functions-section flex flex-col gap-4">
            <div className="section-title font-semibold text-gray-300">📸 Duas Imagens Necessárias</div>
            <UploadArea image={image1} setImage={setImage1} />
            <UploadArea image={image2} setImage={setImage2} />
            <button
                className="back-btn text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                onClick={onBack}
            >
                ← Voltar para Edição
            </button>
        </div>
    );
};
