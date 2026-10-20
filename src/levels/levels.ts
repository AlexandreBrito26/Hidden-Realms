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
}

export const levels: Level[] = [
  {
    id: 1,
    title: 'Sótão Assombrado',
    bg: [0x2b1055, 0x7597de],
    decoys: ['🍂', '🍄', '🪵', '🕸️', '🧪', '📜', '🌙', '⭐', '🪶'],
    ambient: { emoji: '✨', dir: 'up', count: 12 },
    targets: [
      { id: 'chave', name: 'Chave', emoji: '🔑', x: 0.16, y: 0.22, size: 30 },
      { id: 'vela', name: 'Vela', emoji: '🕯️', x: 0.78, y: 0.14, size: 32 },
      { id: 'morcego', name: 'Morcego', emoji: '🦇', x: 0.5, y: 0.42, size: 30 },
      { id: 'abobora', name: 'Abóbora', emoji: '🎃', x: 0.86, y: 0.6, size: 34 },
      { id: 'fantasma', name: 'Fantasma', emoji: '👻', x: 0.22, y: 0.7, size: 32 },
      { id: 'aranha', name: 'Aranha', emoji: '🕷️', x: 0.62, y: 0.86, size: 28 },
    ],
  },
  {
    id: 2,
    title: 'Jardim Encantado',
    bg: [0x134e5e, 0x71b280],
    decoys: ['🌿', '🍃', '🌱', '🪨', '🍀', '🌾', '🌷', '🍂'],
    ambient: { emoji: '🍃', dir: 'down', count: 12 },
    targets: [
      { id: 'borboleta', name: 'Borboleta', emoji: '🦋', x: 0.84, y: 0.18, size: 30 },
      { id: 'abelha', name: 'Abelha', emoji: '🐝', x: 0.2, y: 0.3, size: 28 },
      { id: 'morango', name: 'Morango', emoji: '🍓', x: 0.55, y: 0.5, size: 30 },
      { id: 'joaninha', name: 'Joaninha', emoji: '🐞', x: 0.12, y: 0.62, size: 26 },
      { id: 'girassol', name: 'Girassol', emoji: '🌻', x: 0.78, y: 0.74, size: 32 },
      { id: 'sapo', name: 'Sapo', emoji: '🐸', x: 0.42, y: 0.88, size: 30 },
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
]
