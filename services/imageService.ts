
import { Mode, CreateFunction, EditFunction, ArtisticStyle, AspectRatio } from '../types';
import type { ImageFile } from '../types';

interface GenerateImageParams {
    prompt: string;
    mode: Mode;
    createFunction: CreateFunction;
    editFunction: EditFunction;
    selectedStyle: ArtisticStyle;
    aspectRatio: AspectRatio;
    image1: ImageFile | null;
    image2: ImageFile | null;
}

const getDimensions = (ratio: AspectRatio): { width: number, height: number } => {
    const base = 1024;
    switch (ratio) {
        case AspectRatio.LANDSCAPE: // 16:9
            return { width: base, height: Math.round(base * 9 / 16) }; // 1024x576
        case AspectRatio.PORTRAIT: // 9:16
            return { width: Math.round(base * 9 / 16), height: base }; // 576x1024
        case AspectRatio.WIDE: // 4:3
            return { width: base, height: Math.round(base * 3 / 4) }; // 1024x768
        case AspectRatio.TALL: // 3:4
            return { width: Math.round(base * 3 / 4), height: base }; // 768x1024
        case AspectRatio.SQUARE: // 1:1
        default:
            return { width: base, height: base }; // 1024x1024
    }
}

export const generateImage = (params: GenerateImageParams): Promise<string> => {
    console.log('Generating image with params:', params);
    
    return new Promise((resolve) => {
        setTimeout(() => {
            const { width, height } = getDimensions(params.aspectRatio);
            const randomId = Math.floor(Math.random() * 1000);
            const imageUrl = `https://picsum.photos/id/${randomId}/${width}/${height}`;
            resolve(imageUrl);
        }, 2500); // Simulate network delay
    });
};