/** obstáculo desenhado na frente de um alvo, cobrindo só parte dele */
export interface Cover {
  emoji: string
  /** tamanho da fonte em px */
  size: number
  /** deslocamento em px em relação ao alvo (mantém o alvo parcialmente visível) */
  dx: number
  dy: number
}

export interface HiddenItem {
  id: string
  name: string
  emoji: string
  /** posição normalizada (0 a 1) dentro da cena */
  x: number
  y: number
  /** tamanho da fonte em px (menor = mais difícil de achar) */
  size?: number
  /** obstáculo que esconde parte do alvo */
  cover?: Cover
}

/** partículas de ambiente que sobem ou descem pela cena */
export interface Ambient {
  emoji: string
  dir: 'up' | 'down'
  count?: number
}

export interface Level {
  id: number
  title: string
  /** gradiente de fundo: [topo, base] */
  bg: [number, number]
  targets: HiddenItem[]
  /** emojis usados como "ruído" para esconder os alvos */
  decoys: string[]
  ambient?: Ambient
  /** cenário desenhado por código (veja game/scenery.ts) */
  scenery?: 'attic' | 'garden' | 'space' | 'halloween'
  /** quantidade de emojis de ruído espalhados (padrão 70) */
  decoyCount?: number
}

export const levels: Level[] = [
  {
    id: 1,
    title: 'Cidade do Halloween',
    bg: [0x120826, 0x2e1450],
    scenery: 'halloween',
    decoyCount: 110,
    decoys: ['🕸️', '🪦', '🦴', '🕯️', '🌙', '🍭', '🍫', '🐀', '🦉', '🧿', '⚰️', '🍂', '🪲', '🐍', '🔮', '⭐', '🍎', '🧟'],
    ambient: { emoji: '🍂', dir: 'down', count: 14 },
    targets: [
      {
        id: 'abobora', name: 'Abóbora', emoji: '🎃', x: 0.9, y: 0.82, size: 22,
        cover: { emoji: '🪦', size: 58, dx: -26, dy: 6 },
      },
      {
        id: 'fantasma', name: 'Fantasma', emoji: '👻', x: 0.37, y: 0.46, size: 20,
        cover: { emoji: '🕸️', size: 56, dx: 0, dy: -20 },
      },
      {
        id: 'morcego', name: 'Morcego', emoji: '🦇', x: 0.67, y: 0.07, size: 18,
        cover: { emoji: '🌙', size: 48, dx: 20, dy: 4 },
      },
      {
        id: 'bruxa', name: 'Bruxa', emoji: '🧙', x: 0.52, y: 0.6, size: 22,
        cover: { emoji: '🕸️', size: 60, dx: 14, dy: -8 },
      },
      {
        id: 'vampiro', name: 'Vampiro', emoji: '🧛', x: 0.14, y: 0.55, size: 22,
        cover: { emoji: '🦉', size: 50, dx: 22, dy: 6 },
      },
      {
        id: 'caveira', name: 'Caveira', emoji: '💀', x: 0.08, y: 0.9, size: 20,
        cover: { emoji: '⚰️', size: 58, dx: 22, dy: 8 },
      },
      {
        id: 'doce', name: 'Doce', emoji: '🍬', x: 0.74, y: 0.5, size: 16,
        cover: { emoji: '🕸️', size: 44, dx: -14, dy: -10 },
      },
      {
        id: 'gato', name: 'Gato preto', emoji: '🐈‍⬛', x: 0.31, y: 0.82, size: 20,
        cover: { emoji: '🪦', size: 52, dx: 24, dy: 4 },
      },
    ],
  },
  {
    id: 2,
    title: 'Jardim Encantado',
    bg: [0x8ecae6, 0xd8f3dc],
    scenery: 'garden',
    decoyCount: 40,
    decoys: ['🌿', '🍃', '🌱', '🪨', '🍀', '🌾', '🌷', '🍂'],
    ambient: { emoji: '🍃', dir: 'down', count: 12 },
    targets: [
      {
        id: 'borboleta', name: 'Borboleta', emoji: '🦋', x: 0.84, y: 0.18, size: 30,
        cover: { emoji: '🍃', size: 60, dx: -34, dy: 6 },
      },
      {
        id: 'abelha', name: 'Abelha', emoji: '🐝', x: 0.2, y: 0.3, size: 28,
        cover: { emoji: '🌿', size: 64, dx: 36, dy: 4 },
      },
      {
        id: 'morango', name: 'Morango', emoji: '🍓', x: 0.55, y: 0.5, size: 30,
        cover: { emoji: '🍃', size: 66, dx: 4, dy: -36 },
      },
      {
        id: 'joaninha', name: 'Joaninha', emoji: '🐞', x: 0.12, y: 0.62, size: 26,
        cover: { emoji: '🍄', size: 60, dx: 34, dy: 6 },
      },
      {
        id: 'girassol', name: 'Girassol', emoji: '🌻', x: 0.78, y: 0.74, size: 32,
        cover: { emoji: '🌿', size: 76, dx: -38, dy: 8 },
      },
      {
        id: 'sapo', name: 'Sapo', emoji: '🐸', x: 0.42, y: 0.88, size: 30,
        cover: { emoji: '🌿', size: 72, dx: 36, dy: 6 },
      },
    ],
  },
  {
    id: 3,
    title: 'Recife Submerso',
    bg: [0x00b4d8, 0x03045e],
    decoys: ['🪸', '🌿', '🐟', '🐡', '🫧', '🌊', '⭐', '🪨'],
    ambient: { emoji: '🫧', dir: 'up', count: 16 },
    targets: [
      {
        id: 'polvo', name: 'Polvo', emoji: '🐙', x: 0.18, y: 0.2, size: 30,
        cover: { emoji: '🌿', size: 78, dx: 36, dy: 6 },
      },
      {
        id: 'peixe-palhaco', name: 'Peixe-palhaço', emoji: '🐠', x: 0.8, y: 0.26, size: 28,
        cover: { emoji: '🪸', size: 74, dx: -36, dy: 8 },
      },
      {
        id: 'caranguejo', name: 'Caranguejo', emoji: '🦀', x: 0.48, y: 0.46, size: 30,
        cover: { emoji: '🪨', size: 72, dx: 4, dy: -36 },
      },
      {
        id: 'tartaruga', name: 'Tartaruga', emoji: '🐢', x: 0.12, y: 0.66, size: 32,
        cover: { emoji: '🌿', size: 80, dx: 36, dy: 4 },
      },
      {
        id: 'lula', name: 'Lula', emoji: '🦑', x: 0.84, y: 0.72, size: 30,
        cover: { emoji: '🪸', size: 76, dx: -36, dy: -10 },
      },
      {
        id: 'concha', name: 'Concha', emoji: '🐚', x: 0.52, y: 0.88, size: 26,
        cover: { emoji: '🪨', size: 70, dx: -36, dy: -8 },
      },
    ],
  },
  {
    id: 4,
    title: 'Estação Espacial',
    bg: [0x05010f, 0x1a0b3b],
    scenery: 'space',
    decoyCount: 22,
    decoys: ['⭐', '🌟', '💫', '🌑', '🪐', '🛰️', '🌌'],
    ambient: { emoji: '✨', dir: 'up', count: 10 },
    targets: [
      {
        id: 'alien', name: 'Alienígena', emoji: '👽', x: 0.16, y: 0.2, size: 30,
        cover: { emoji: '🌑', size: 70, dx: 36, dy: 4 },
      },
      {
        id: 'foguete', name: 'Foguete', emoji: '🚀', x: 0.8, y: 0.12, size: 30,
        cover: { emoji: '🪐', size: 70, dx: -36, dy: 6 },
      },
      {
        id: 'ovni', name: 'Disco voador', emoji: '🛸', x: 0.5, y: 0.36, size: 30,
        cover: { emoji: '🛰️', size: 76, dx: 4, dy: -36 },
      },
      {
        id: 'robo', name: 'Robô', emoji: '🤖', x: 0.86, y: 0.54, size: 30,
        cover: { emoji: '🛰️', size: 74, dx: -38, dy: 4 },
      },
      {
        id: 'cometa', name: 'Cometa', emoji: '☄️', x: 0.18, y: 0.6, size: 30,
        cover: { emoji: '🌑', size: 72, dx: 36, dy: 4 },
      },
      {
        id: 'telescopio', name: 'Telescópio', emoji: '🔭', x: 0.58, y: 0.84, size: 28,
        cover: { emoji: '📡', size: 66, dx: -36, dy: -4 },
      },
    ],
  },
]
