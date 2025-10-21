
import { ArtisticStyle } from '../types';

const enhancements = [
    "ultra realistic photography", "cinematic lighting", "8k resolution", "vibrant colors",
    "dramatic angle", "detailed illustration", "fantasy concept art", "by Greg Rutkowski and Artgerm",
    "trending on ArtStation", "hyperdetailed", "sharp focus", "masterpiece", "volumetric lighting",
    "macro photography", "depth of field", "bokeh", "by Stanley Kubrick", "unreal engine 5 render",
    "octane render", "trending on behance", "intricate details", "studio quality", "professional photo"
];

const negativePrompts = [
    "ugly", "tiling", "poorly drawn hands", "poorly drawn feet", "poorly drawn face", "out of frame",
    "extra limbs", "disfigured", "deformed", "body out of frame", "blurry", "bad anatomy",
    "blurred", "watermark", "grainy", "signature", "cut off", "draft", "low quality", "jpeg artifacts",
    "weird colors"
];


export const generateProfessionalPrompt = (idea: string): Promise<string> => {
    console.log('Generating professional prompt for idea:', idea);
    
    return new Promise((resolve) => {
        setTimeout(() => {
            const shuffledEnhancements = enhancements.sort(() => 0.5 - Math.random());
            const selectedEnhancements = shuffledEnhancements.slice(0, Math.floor(Math.random() * 4) + 4).join(', ');

            const shuffledNegatives = negativePrompts.sort(() => 0.5 - Math.random());
            const selectedNegatives = shuffledNegatives.slice(0, Math.floor(Math.random() * 3) + 2).join(', ');

            const professionalPrompt = `${idea}, ${selectedEnhancements}, --no ${selectedNegatives}`;
            
            resolve(professionalPrompt);
        }, 1500);
    });
};

export const generateRestorePrompt = (colorize: boolean): string => {
    const basePrompt = `
professionally restore the attached antique/vintage photograph. The main goals are to:
- Remove Major Damage: Carefully eliminate significant scratches, tears, creases, and water/stain marks.
- Dust/Spot Removal: Clean up all small spots, dust, and minute imperfections without compromising the original texture.
- Clarity and Detail Enhancement: Gently sharpen and enhance facial features and important details (like clothing, text, or background elements) without creating an over-processed, unnatural look. Maintain a natural grain/texture if it exists.
- Reconstruction (If necessary): Carefully reconstruct any minor missing areas (e.g., small parts of the edge or background) using existing surrounding information to seamlessly blend the repair.`;

    const colorPrompt = `
- Color Correction/Grading: Address any yellowing, fading, or color shifts common in old photos, aiming for natural, historically appropriate tones. Colorize the black and white photo with realistic colors.`;

    const grayscalePrompt = `
- Color Correction/Grading: Address any yellowing, fading, or color shifts common in old photos, aiming for balanced grayscale for black and white photos or proper sepia for sepia-toned photos. Do not colorize.`;

    const finalPrompt = `Final Output: Provide a high-resolution digital file of the restored image. ${basePrompt} ${colorize ? colorPrompt : grayscalePrompt}`;

    return finalPrompt.replace(/\s+/g, ' ').trim();
};

export const styleTips: Record<ArtisticStyle | 'DEFAULT', string[]> = {
    [ArtisticStyle.REALISTIC]: [
        'Descreva a iluminação: "luz do sol da tarde", "iluminação de estúdio suave", "neon".',
        'Especifique o tipo de lente: "lente grande angular", "teleobjetiva", "macro".',
        'Use termos como "fotorrealista", "hiperdetalhado", "8K" para máxima qualidade.',
        'Mencione texturas: "pele com poros visíveis", "tecido de linho áspero", "metal escovado".',
        'Para retratos, especifique a expressão facial: "sorriso sutil", "olhar pensativo".',
        'Controle a profundidade de campo com "fundo desfocado" ou "bokeh" para destacar o sujeito.',
        'Indique a hora do dia para obter uma iluminação natural e sombras realistas.',
        'Peça por "imperfeições sutis" para evitar um visual excessivamente digital e plástico.',
        'Tente "fotografia de produto, fundo branco, iluminação profissional" para objetos.',
        'Use nomes de fotógrafos como "no estilo de Ansel Adams" para inspirar a composição.',
    ],
    [ArtisticStyle.CARTOON]: [
        'Mencione estilos famosos: "no estilo da Pixar", "como um desenho da Disney dos anos 90", "estilo Ghibli".',
        'Descreva a espessura das linhas: "contornos grossos e pretos", "linhas finas e delicadas".',
        'Especifique a paleta de cores: "cores pastel suaves", "cores vibrantes e saturadas".',
        'Peça por expressões exageradas para dar mais personalidade aos personagens.',
        'Use termos como "personagem 2D", "animação clássica", "cel shading".',
        'Descreva o design do personagem: "olhos grandes e expressivos", "cabeça desproporcional".',
        'Peça por um "estilo de desenho do Hora de Aventura", com formas simples e cores chapadas.',
        'Crie um "Mascote para uma marca de cereal, alegre e energético".',
        'Tente "Vilão de desenho animado, sorriso malicioso, sombras dramáticas".',
        'Para cenas de ação, use "estilo de um anime shonen, linhas de velocidade, cores intensas".',
    ],
    [ArtisticStyle.OIL_PAINTING]: [
        'Cite artistas famosos: "no estilo de Van Gogh", "pinceladas de Monet", "realismo de Rembrandt".',
        'Descreva a textura da tinta: "pinceladas grossas e visíveis (impasto)", "tinta a óleo suave".',
        'Especifique a superfície: "pintura a óleo sobre tela", "sobre madeira envelhecida".',
        'Use "iluminação chiaroscuro" para um contraste dramático de luz e sombra.',
        'Descreva o tipo de cena: "paisagem impressionista", "retrato renascentista", "natureza morta".',
        'Experimente: "Pintura a óleo de um navio em um mar tempestuoso, pinceladas dramáticas".',
        'Para retratos clássicos: "no estilo de Johannes Vermeer, luz suave vindo da janela".',
        'Recrie uma cena: "Um campo de girassóis sob um céu azul, inspirado em Van Gogh".',
        'Para cenas urbanas: "Cena de um café parisiense, estilo impressionista, pessoas desfocadas".',
        'Use a técnica de "sfumato" para transições suaves, como Leonardo da Vinci.',
    ],
    [ArtisticStyle.ABSTRACT]: [
        'Use formas e cores em vez de objetos: "composição de formas geométricas vermelhas e azuis".',
        'Descreva emoções ou conceitos: "uma representação visual da solidão", "a energia do caos".',
        'Mencione movimentos artísticos: "cubismo", "surrealismo", "expressionismo abstrato".',
        'Cite artistas: "no estilo de Kandinsky", "uma peça inspirada em Piet Mondrian".',
        'Use termos como "não-figurativo", "composicional", "fluido e orgânico".',
        'Descreva texturas: "textura granulada", "superfícies lisas e brilhantes".',
        'Tente: "Explosão de cores vibrantes em um fundo escuro".',
        'Para algo suave: "Linhas fluidas e entrelaçadas criando uma sensação de movimento".',
        'Seja minimalista: "Arte abstrata minimalista, poucas linhas, muito espaço em branco".',
        'Crie uma "paisagem de sonho surreal, com elementos flutuantes e ilógicos".',
    ],
    [ArtisticStyle.PIXEL_ART]: [
        'Especifique a resolução: "pixel art 16-bit", "estilo 8-bit", "sprite de 32x32 pixels".',
        'Mencione paletas de cores limitadas: "paleta de 4 cores", "estilo Game Boy (tons de verde)".',
        'Descreva o tipo de jogo: "personagem de RPG isométrico", "cenário de plataforma 2D".',
        'Use o termo "dithering" para criar gradientes e texturas com um número limitado de cores.',
        'Peça por "contornos nítidos de 1 pixel" para um visual limpo e clássico.',
        'Crie um "Cenário de cidade cyberpunk em pixel art, com chuva de neon".',
        'Para itens pequenos: "Item de inventário, uma poção mágica brilhante, 16x16 pixels".',
        'Faça um "Retrato de personagem em close-up, estilo arcade dos anos 90".',
        'Descreva uma cena complexa: "Pixel art isométrico de um pequeno quarto aconchegante".',
        'Crie um "Logo de título para um jogo retrô, pixelado e colorido".',
    ],
    [ArtisticStyle.COMIC]: [
        'Especifique o estilo: "estilo de mangá shonen", "quadrinhos americanos", "banda desenhada franco-belga".',
        'Mencione artistas: "no estilo de Jack Kirby", "traços de Frank Miller", "arte de Katsuhiro Otomo".',
        'Use termos técnicos: "hachuras para sombreamento", "linhas de ação dinâmicas", "cores chapadas".',
        'Descreva um painel: "close-up dramático do rosto do herói", "página inteira (splash page)".',
        'Peça por "texturas de meio-tom (halftone)" para um visual de impressão retrô.',
        'Crie uma "Capa de gibi de super-herói, pose heroica, título em negrito".',
        'Para um estilo noir: "Cena de luta em preto e branco, alto contraste".',
        'Tente o estilo de "Sin City": "preto, branco e uma cor de destaque como vermelho".',
        'Peça por onomatopeias como "BOOM!" ou "CRASH!" integradas na arte.',
        'Para cenários, tente "cenário de ficção científica detalhado, no estilo de Moebius".',
    ],
    [ArtisticStyle.STICKER]: [
        'Sempre peça por um "contorno branco grosso" ou "borda branca" para o visual clássico.',
        'Use "design de adesivo de vinil" ou "die-cut sticker" para obter o formato correto.',
        'Para um estilo fofo, use termos como "kawaii", "chibi", ou "personagem adorável".',
        'Peça por um design "gráfico e ousado" com cores fortes e saturadas.',
        'Exemplo: "Adesivo de um abacate sorridente, estilo kawaii, contorno branco.".',
        'Para um visual mais descolado: "Design de adesivo de um crânio com rosas, estilo de tatuagem".',
        'Crie frases: "Frase motivacional \'Você Consegue!\' em caligrafia, formato de adesivo".',
        'Use "vector art" ou "arte vetorial" para um visual limpo, com cores chapadas.',
        'Peça por acabamentos especiais: "adesivo com efeito holográfico ou brilhante".',
        'Crie um personagem simples: "Um fantasma amigável dizendo \'Boo!\', design simples para adesivo".',
    ],
    [ArtisticStyle.LOGO]: [
        'Especifique o tipo: "logotipo minimalista", "emblema", "mascote", "lettermark".',
        'Use "design de logo vetorial" para obter linhas limpas e um resultado escalável.',
        'Descreva o conceito da marca: "logo para uma cafeteria, usando um grão de café estilizado".',
        'Defina a paleta de cores: "duas cores, azul e branco", "monocromático", "cores terrosas".',
        'Peça por "espaço negativo" para um design inteligente e moderno.',
        'Exemplo: "Logo minimalista de uma montanha para uma marca de aventura.".',
        'Crie um mascote: "Mascote de uma raposa inteligente para uma empresa de tecnologia.".',
        'Para um visual clássico: "Emblema circular para uma barbearia, estilo vintage.".',
        'Brinque com letras: "Logo de letra \'S\' com formato de raio, para uma marca de energia.".',
        'Use formas: "Design de logo usando apenas formas geométricas, limpo e moderno".',
    ],
    'DEFAULT': [
        'Seja específico! Em vez de "um carro", diga "um conversível vermelho de 1960 em uma estrada costeira ao pôr do sol".',
        'Combine conceitos inesperados: "um astronauta cavalgando um cavalo", "uma biblioteca em uma floresta".',
        'Use `--no` para remover elementos. Ex: "um jardim --no flores vermelhas".',
        'Descreva a composição da cena: "close-up", "vista de cima (top-down view)", "plano geral (wide shot)".',
        'Mencione a emoção ou atmosfera: "uma cena melancólica e chuvosa", "um ambiente alegre e festivo".',
        'Adicione "trending on ArtStation" ou "unreal engine 5" para resultados mais épicos.',
        'Use adjetivos descritivos para enriquecer seu prompt: "antigo", "futurista", "misterioso", "brilhante".',
        'Não tenha medo de escrever prompts longos e detalhados. Mais informação leva a melhores resultados.',
        'Se o resultado não for o esperado, reformule o prompt em vez de usar o mesmo repetidamente.',
        'Pense como um diretor de cinema: onde está a câmera? Qual é a iluminação? O que os personagens estão sentindo?',
    ]
};
