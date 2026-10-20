import Phaser from 'phaser'

// Cenários desenhados com formas do Phaser (sem imagens externas).
// A cena tem 720x900 (veja GAME_W/GAME_H em GameScene).
const W = 720
const H = 900

export type SceneryKey = 'attic'

export function drawScenery(scene: Phaser.Scene, key: SceneryKey) {
  if (key === 'attic') drawAttic(scene)
}

function cobweb(g: Phaser.GameObjects.Graphics, x: number, y: number, sx: number, sy: number, r: number) {
  const rays = 5
  const ring = (rad: number) =>
    Array.from({ length: rays }, (_, i) => {
      const a = (i / (rays - 1)) * (Math.PI / 2)
      return { x: x + sx * Math.cos(a) * rad, y: y + sy * Math.sin(a) * rad }
    })
  g.lineStyle(1.5, 0xffffff, 0.28)
  for (const p of ring(r)) g.lineBetween(x, y, p.x, p.y)
  for (const k of [0.35, 0.65, 1]) {
    const q = ring(r * k)
    for (let i = 0; i < q.length - 1; i++) g.lineBetween(q[i].x, q[i].y, q[i + 1].x, q[i + 1].y)
  }
}

function prop(scene: Phaser.Scene, x: number, y: number, emoji: string, size: number, alpha = 0.9, rot = 0) {
  scene.add.text(x, y, emoji, { fontSize: `${size}px` }).setOrigin(0.5).setAlpha(alpha).setRotation(rot)
}

function drawAttic(scene: Phaser.Scene) {
  const g = scene.add.graphics()

  // parede do fundo: tábuas verticais
  g.lineStyle(2, 0x000000, 0.18)
  for (let x = 0; x <= W; x += 48) g.lineBetween(x, 0, x, 700)

  // telhado em águas: duas áreas escuras acima das vigas inclinadas
  g.fillStyle(0x140a20, 1)
  g.fillPoints([{ x: 0, y: 0 }, { x: 360, y: 0 }, { x: 360, y: 40 }, { x: 0, y: 300 }], true)
  g.fillPoints([{ x: 360, y: 0 }, { x: W, y: 0 }, { x: W, y: 300 }, { x: 360, y: 40 }], true)

  // vigas: duas inclinadas, uma horizontal (travessa) e o poste central
  g.lineStyle(18, 0x3a2616, 1)
  g.lineBetween(0, 300, 360, 40)
  g.lineBetween(W, 300, 360, 40)
  g.lineStyle(14, 0x2f1e11, 1)
  g.lineBetween(140, 199, 580, 199)
  g.lineBetween(360, 40, 360, 199)
  // veios das vigas
  g.lineStyle(2, 0x000000, 0.25)
  g.lineBetween(0, 292, 360, 32)
  g.lineBetween(W, 292, 360, 32)

  // janela redonda com lua e luz entrando
  const wx = 580
  const wy = 340
  g.fillStyle(0x0b1330, 1)
  g.fillCircle(wx, wy, 62)
  g.fillStyle(0xfff3c4, 1)
  g.fillCircle(wx + 12, wy - 12, 24)
  g.fillStyle(0x0b1330, 1)
  g.fillCircle(wx + 24, wy - 20, 22)
  g.fillStyle(0xffffff, 0.9)
  for (const [sx, sy] of [[-30, -28], [-12, 22], [30, 26], [-34, 8]]) g.fillCircle(wx + sx, wy + sy, 1.8)
  g.lineStyle(8, 0x4a2f1a, 1)
  g.strokeCircle(wx, wy, 62)
  g.lineStyle(5, 0x4a2f1a, 1)
  g.lineBetween(wx - 62, wy, wx + 62, wy)
  g.lineBetween(wx, wy - 62, wx, wy + 62)

  const beam = scene.add.graphics()
  beam.fillStyle(0xcfd8ff, 0.1)
  beam.fillPoints(
    [{ x: 535, y: 392 }, { x: 625, y: 392 }, { x: 540, y: 900 }, { x: 330, y: 900 }],
    true,
  )
  scene.tweens.add({ targets: beam, alpha: 0.55, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

  // estante na parede esquerda
  g.lineStyle(10, 0x4a2f1a, 1)
  g.lineBetween(30, 258, 200, 258)
  g.lineBetween(30, 398, 200, 398)
  g.lineStyle(8, 0x3a2616, 1)
  g.lineBetween(36, 258, 36, 420)
  g.lineBetween(194, 258, 194, 420)

  // assoalho
  g.fillStyle(0x2a1a0e, 1)
  g.fillRect(0, 700, W, H - 700)
  g.fillStyle(0x4a2f1a, 1)
  g.fillRect(0, 696, W, 8) // rodapé
  g.lineStyle(2, 0x120a05, 0.9)
  for (const y of [740, 785, 835]) g.lineBetween(0, y, W, y)
  const seams = [
    [120, 700, 740], [430, 700, 740], [610, 700, 740],
    [260, 740, 785], [540, 740, 785], [60, 740, 785],
    [180, 785, 835], [380, 785, 835], [660, 785, 835],
    [90, 835, 900], [300, 835, 900], [500, 835, 900], [690, 835, 900],
  ]
  for (const [x, y1, y2] of seams) g.lineBetween(x, y1, x, y2)

  // caixotes empilhados à direita
  const crate = (x: number, y: number, w: number, h: number) => {
    g.fillStyle(0x5a3a1e, 1)
    g.fillRect(x, y, w, h)
    g.lineStyle(4, 0x2f1e11, 1)
    g.strokeRect(x, y, w, h)
    g.lineBetween(x, y, x + w, y + h)
    g.lineBetween(x + w, y, x, y + h)
  }
  crate(555, 565, 130, 135)
  crate(450, 640, 90, 60)

  // teias nos cantos
  cobweb(g, 0, 0, 1, 1, 120)
  cobweb(g, W, 0, -1, 1, 120)
  cobweb(g, 0, 696, 1, -1, 100)
  cobweb(g, W, 696, -1, -1, 100)

  // lampião pendurado
  g.lineStyle(3, 0x1a1008, 1)
  g.lineBetween(250, 70, 250, 150)

  // objetos de cenário (não interativos)
  prop(scene, 250, 168, '🏮', 40, 0.9)
  prop(scene, 300, 330, '🖼️', 64, 0.75, -0.08)
  prop(scene, 78, 232, '📚', 38, 0.9)
  prop(scene, 150, 372, '📚', 34, 0.9)
  prop(scene, 270, 652, '🪑', 84, 0.9)
  prop(scene, 70, 784, '🧸', 44, 0.9, -0.3)
}
