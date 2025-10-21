
export enum Mode {
    CREATE = 'create',
    EDIT = 'edit',
}

export enum CreateFunction {
    FREE = 'free',
    STYLE = 'style',
}

export enum EditFunction {
    ADD_REMOVE = 'add-remove',
    RETOUCH = 'retouch',
    STYLE = 'style',
    COMPOSE = 'compose',
    RESTORE = 'restore',
}

export enum ArtisticStyle {
    REALISTIC = 'realistic',
    CARTOON = 'cartoon',
    OIL_PAINTING = 'oil_painting',
    ABSTRACT = 'abstract',
    PIXEL_ART = 'pixel_art',
    COMIC = 'comic',
    STICKER = 'sticker',
    LOGO = 'logo',
}

export enum AspectRatio {
    SQUARE = '1:1',
    LANDSCAPE = '16:9',
    PORTRAIT = '9:16',
    WIDE = '4:3',
    TALL = '3:4',
}

export const styleOptions: { id: ArtisticStyle; name: string }[] = [
    { id: ArtisticStyle.REALISTIC, name: 'Realista' },
    { id: ArtisticStyle.CARTOON, name: 'Desenho Animado' },
    { id: ArtisticStyle.OIL_PAINTING, name: 'Pintura a Óleo' },
    { id: ArtisticStyle.ABSTRACT, name: 'Abstrato' },
    { id: ArtisticStyle.PIXEL_ART, name: 'Pixel Art' },
    { id: ArtisticStyle.COMIC, name: 'HQ' },
    { id: ArtisticStyle.STICKER, name: 'Adesivo' },
    { id: ArtisticStyle.LOGO, name: 'Logo' },
];

export const aspectRatioOptions: { id: AspectRatio; name: string; icon: string }[] = [
    { id: AspectRatio.SQUARE, name: '1:1', icon: '■' },
    { id: AspectRatio.LANDSCAPE, name: '16:9', icon: '▬' },
    { id: AspectRatio.PORTRAIT, name: '9:16', icon: '▮' },
    { id: AspectRatio.WIDE, name: '4:3', icon: '▭' },
    { id: AspectRatio.TALL, name: '3:4', icon: '▯' },
];

export interface ImageFile {
    url: string;
    file: File | null;
}
