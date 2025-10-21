import React, { useState, useEffect } from 'react';
import { styleTips } from '../services/promptService';
import { ArtisticStyle } from '../types';

interface TipsBoxProps {
    selectedStyle: ArtisticStyle;
}

export const TipsBox: React.FC<TipsBoxProps> = ({ selectedStyle }) => {
    const [currentTipIndex, setCurrentTipIndex] = useState(0);

    const tipsForStyle = styleTips[selectedStyle] || styleTips.DEFAULT;

    // When the selected style changes, reset the tip index to the beginning.
    useEffect(() => {
        setCurrentTipIndex(0);
    }, [selectedStyle]);

    const handleNextTip = () => {
        setCurrentTipIndex(prevIndex => (prevIndex + 1) % tipsForStyle.length);
    };

    const handlePreviousTip = () => {
        setCurrentTipIndex(prevIndex => (prevIndex - 1 + tipsForStyle.length) % tipsForStyle.length);
    };

    const currentTip = tipsForStyle[currentTipIndex] || "Seja criativo e descreva sua ideia em detalhes!";

    return (
        <div className="tips-box-section bg-gray-700 p-4 rounded-lg">
            <div className="section-title font-semibold text-gray-300 mb-2 flex items-center justify-between">
                <div className="flex items-center">
                    <span role="img" aria-label="light-bulb" className="mr-2">💡</span> Dicas de Prompt
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePreviousTip}
                        className="bg-gray-600 hover:bg-gray-500 text-white font-bold h-6 w-6 rounded-full flex items-center justify-center text-xs transition-colors"
                        aria-label="Dica anterior"
                    >
                        &lt;
                    </button>
                    <button
                        onClick={handleNextTip}
                        className="bg-gray-600 hover:bg-gray-500 text-white font-bold h-6 w-6 rounded-full flex items-center justify-center text-xs transition-colors"
                        aria-label="Próxima dica"
                    >
                        &gt;
                    </button>
                </div>
            </div>
            <p className="text-sm text-gray-400 mb-3 min-h-[40px] transition-opacity duration-300" key={currentTip}>
                {currentTip}
            </p>
        </div>
    );
};
