
import React from 'react';

interface FunctionCardProps {
    icon: string;
    name: string;
    isActive: boolean;
    onClick: () => void;
}

export const FunctionCard: React.FC<FunctionCardProps> = ({ icon, name, isActive, onClick }) => {
    return (
        <div
            className={`function-card flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-all duration-200 transform hover:-translate-y-1 ${isActive ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            onClick={onClick}
        >
            <div className="text-2xl">{icon}</div>
            <div className="mt-2 font-semibold text-sm">{name}</div>
        </div>
    );
};
