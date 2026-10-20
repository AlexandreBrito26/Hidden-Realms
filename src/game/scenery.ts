import Phaser from 'phaser'

// Cenários desenhados com formas do Phaser (sem imagens externas).
// A cena tem 720x900 (veja GAME_W/GAME_H em GameScene).
const W = 720
const H = 900

export type SceneryKey = 'attic' | 'garden' | 'space'

export function drawScenery(scene: Phaser.Scene, key: SceneryKey) {
  if (key === 'attic') drawAttic(scene)
  else if (key === 'garden') drawGarden(scene)
  else drawSpace(scene)
}

// gerador pseudo-aleatório simples: o cenário sai sempre igual
function rng(seed: number) {
  let a = seed
  return () => {
    a = (Math.imul(a, 1664525) + 1013904223) >>> 0
    return a / 4294967296
  }
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

function drawGarden(scene: Phaser.Scene) {
  const g = scene.add.graphics()
  const rand = rng(11)

  // sol com brilho
  g.fillStyle(0xfff3b0, 0.25)
  g.fillCircle(110, 95, 92)
  g.fillStyle(0xfff3b0, 0.4)
  g.fillCircle(110, 95, 66)
  g.fillStyle(0xffe066, 1)
  g.fillCircle(110, 95, 44)

  // nuvens
  g.fillStyle(0xffffff, 0.85)
  for (const [cx, cy, k] of [[340, 90, 1], [540, 215, 0.8], [260, 235, 0.6]]) {
    g.fillEllipse(cx, cy, 120 * k, 40 * k)
    g.fillEllipse(cx - 30 * k, cy + 6 * k, 70 * k, 34 * k)
    g.fillEllipse(cx + 32 * k, cy + 8 * k, 80 * k, 32 * k)
  }

  // colinas ao fundo
  g.fillStyle(0x5aa469, 1)
  g.fillEllipse(170, 475, 520, 160)
  g.fillEllipse(570, 485, 580, 180)
  g.fillStyle(0x4a8f5a, 1)
  g.fillEllipse(360, 510, 760, 120)

  // gramado
  g.fillGradientStyle(0x6bbf59, 0x6bbf59, 0x3e8e41, 0x3e8e41, 1)
  g.fillRect(0, 485, W, H - 485)

  // cerca de madeira
  g.fillStyle(0xe6dcc3, 1)
  g.fillRect(0, 450, W, 9)
  g.fillRect(0, 480, W, 9)
  g.fillStyle(0xf5efe0, 1)
  for (let x = 8; x < W; x += 44) {
    g.fillRect(x, 432, 28, 72)
    g.fillTriangle(x, 432, x + 14, 414, x + 28, 432)
  }
  g.fillStyle(0x000000, 0.12)
  g.fillRect(0, 504, W, 8)

  // árvore à esquerda
  g.fillStyle(0x7a4e2a, 1)
  g.fillRect(58, 300, 40, 215)
  g.fillStyle(0x2f7d46, 1)
  for (const [cx, cy, r] of [[78, 262, 80], [28, 304, 58], [132, 296, 62], [78, 200, 62]]) g.fillCircle(cx, cy, r)
  g.fillStyle(0x3f9a58, 1)
  for (const [cx, cy, r] of [[60, 240, 34], [112, 280, 30], [84, 190, 28]]) g.fillCircle(cx, cy, r)

  // lagoa com vitórias-régias
  g.fillStyle(0x2c7fb8, 1)
  g.fillEllipse(300, 808, 270, 100)
  g.fillStyle(0x4aa3d9, 1)
  g.fillEllipse(300, 803, 235, 82)
  g.fillStyle(0xffffff, 0.35)
  g.fillEllipse(260, 790, 60, 10)
  g.fillStyle(0x3fae5a, 1)
  for (const [cx, cy, r] of [[232, 815, 16], [348, 798, 14], [372, 824, 12], [290, 828, 11]]) g.fillCircle(cx, cy, r)
  g.fillStyle(0xff8fab, 1)
  g.fillCircle(348, 794, 5)

  // pedras do caminho
  g.fillStyle(0xb9b2a0, 1)
  g.lineStyle(3, 0x8a846f, 1)
  for (const [cx, cy, w, h] of [[420, 545, 62, 26], [470, 595, 66, 28], [430, 648, 72, 30], [385, 705, 72, 30]]) {
    g.fillEllipse(cx, cy, w, h)
    g.strokeEllipse(cx, cy, w, h)
  }

  // tufos de grama
  g.lineStyle(2, 0x2f7d34, 0.75)
  for (let i = 0; i < 140; i++) {
    const x = rand() * W
    const y = 510 + rand() * 390
    g.lineBetween(x, y, x + (rand() - 0.5) * 8, y - 8 - rand() * 9)
  }

  // canteiro de flores ao longo da cerca
  const flowers = ['🌷', '🌼', '🌸', '🌺']
  for (let i = 0; i < 15; i++) {
    prop(scene, 24 + i * 48 + rand() * 10, 528 + rand() * 22, flowers[i % 4], 34 + rand() * 10, 0.95)
  }
  prop(scene, 650, 770, '🍄', 40, 0.95)
  prop(scene, 80, 740, '🪨', 46, 0.9)
}

function drawSpace(scene: Phaser.Scene) {
  const g = scene.add.graphics()
  const rand = rng(5)

  // nebulosas (camadas translúcidas)
  for (const [x, y, r, c] of [
    [160, 200, 200, 0x6a2c91],
    [570, 150, 170, 0x1d4e89],
    [420, 440, 230, 0x8e2a6a],
    [110, 520, 160, 0x2a4d9b],
  ]) {
    for (let k = 4; k >= 1; k--) {
      g.fillStyle(c, 0.06)
      g.fillCircle(x, y, (r * k) / 4)
    }
  }

  // estrelas
  for (let i = 0; i < 230; i++) {
    g.fillStyle(0xffffff, 0.35 + rand() * 0.65)
    g.fillCircle(rand() * W, rand() * 620, rand() < 0.1 ? 2 : 1)
  }

  // planeta com anel: metade de trás do anel, planeta, metade da frente
  const px = 530
  const py = 410
  const ring = (from: number, to: number) => {
    const pts: Phaser.Types.Math.Vector2Like[] = []
    for (let t = from; t <= to; t += 0.08) pts.push({ x: px + 175 * Math.cos(t), y: py + 36 * Math.sin(t) })
    return pts
  }
  g.lineStyle(9, 0xf2cc8f, 0.8)
  g.strokePoints(ring(Math.PI, Math.PI * 2), false)

  g.fillStyle(0xe07a5f, 1)
  g.fillCircle(px, py, 108)
  const bands = scene.add.graphics()
  const maskG = scene.make.graphics({}, false)
  maskG.fillStyle(0xffffff, 1)
  maskG.fillCircle(px, py, 108)
  bands.setMask(maskG.createGeometryMask())
  for (const [dy, h, c] of [[-70, 26, 0xf4a261], [-20, 20, 0xc9563b], [24, 30, 0xf2cc8f], [72, 24, 0xb5442e]]) {
    bands.fillStyle(c, 0.9)
    bands.fillRect(px - 110, py + dy, 220, h)
  }
  bands.fillStyle(0x000000, 0.35) // sombra do lado oposto à luz
  bands.fillCircle(px + 60, py + 20, 108)

  g.lineStyle(9, 0xf2cc8f, 0.85)
  g.strokePoints(ring(0, Math.PI), false)

  // luazinha
  g.fillStyle(0xcfd2d6, 1)
  g.fillCircle(150, 380, 26)
  g.fillStyle(0x9aa0a8, 1)
  g.fillCircle(142, 372, 6)
  g.fillCircle(158, 392, 5)

  // moldura da estação: a vista é uma janela grande
  g.fillStyle(0x1b2233, 1)
  g.fillRect(0, 0, W, 60)
  g.fillRect(0, 0, 40, 640)
  g.fillRect(W - 40, 0, 40, 640)
  g.lineStyle(6, 0x5c6b8a, 1)
  g.strokeRect(40, 60, W - 80, 560)
  g.lineStyle(14, 0x2a3350, 1)
  g.lineBetween(240, 60, 240, 620)
  g.lineBetween(480, 60, 480, 620)
  g.fillStyle(0x8a97b8, 1)
  for (const x of [20, W - 20]) for (let y = 40; y < 620; y += 90) g.fillCircle(x, y, 4)
  for (let x = 40; x < W; x += 90) g.fillCircle(x, 30, 4)

  // painel de controle
  g.fillGradientStyle(0x2a3350, 0x2a3350, 0x10141f, 0x10141f, 1)
  g.fillRect(0, 620, W, H - 620)
  g.fillStyle(0x5c6b8a, 1)
  g.fillRect(0, 616, W, 10)
  g.fillStyle(0x39ff88, 0.18)
  g.fillRect(50, 690, 190, 110)
  g.fillStyle(0x4ac3ff, 0.18)
  g.fillRect(490, 690, 190, 110)
  g.lineStyle(4, 0x5c6b8a, 1)
  g.strokeRect(50, 690, 190, 110)
  g.strokeRect(490, 690, 190, 110)
  g.lineStyle(2, 0x39ff88, 0.5)
  for (let i = 0; i < 6; i++) g.lineBetween(62, 706 + i * 16, 62 + 40 + rand() * 120, 706 + i * 16)
  g.lineStyle(2, 0x4ac3ff, 0.5)
  g.lineBetween(500, 780, 540, 740)
  g.lineBetween(540, 740, 580, 765)
  g.lineBetween(580, 765, 620, 715)
  g.lineBetween(620, 715, 668, 735)

  // botões piscando
  const colors = [0xff5252, 0xffd54a, 0x39ff88, 0x4ac3ff]
  for (let i = 0; i < 16; i++) {
    const bx = 70 + i * 40
    const by = 645 + (i % 2) * 22
    g.fillStyle(0x0a0d14, 1)
    g.fillCircle(bx, by, 9)
    const led = scene.add.circle(bx, by, 6, colors[i % 4], 1)
    scene.tweens.add({
      targets: led,
      alpha: 0.25,
      duration: 700 + rand() * 1200,
      delay: rand() * 800,
      yoyo: true,
      repeat: -1,
    })
  }
}
