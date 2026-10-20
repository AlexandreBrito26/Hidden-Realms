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
    [160, 200, 210, 0x6a2c91],
    [590, 140, 180, 0x1d4e89],
    [420, 450, 240, 0x8e2a6a],
    [110, 520, 170, 0x2a4d9b],
    [330, 90, 150, 0x3b1d6e],
  ]) {
    for (let k = 6; k >= 1; k--) {
      g.fillStyle(c, 0.045)
      g.fillCircle(x, y, (r * k) / 6)
    }
  }

  // estrelas fixas, algumas com cruz de brilho
  for (let i = 0; i < 230; i++) {
    const sx = rand() * W
    const sy = rand() * 620
    const big = rand() < 0.08
    g.fillStyle(0xffffff, 0.35 + rand() * 0.65)
    g.fillCircle(sx, sy, big ? 2 : 1)
    if (big) {
      g.lineStyle(1, 0xffffff, 0.35)
      g.lineBetween(sx - 6, sy, sx + 6, sy)
      g.lineBetween(sx, sy - 6, sx, sy + 6)
    }
  }
  // estrelas que piscam
  for (let i = 0; i < 26; i++) {
    const star = scene.add.circle(40 + rand() * (W - 80), 60 + rand() * 540, 1.6 + rand() * 1.2, 0xffffff, 0.9)
    scene.tweens.add({
      targets: star,
      alpha: 0.1,
      duration: 600 + rand() * 1600,
      delay: rand() * 1500,
      yoyo: true,
      repeat: -1,
    })
  }

  // Terra distante com halo
  g.fillStyle(0x4aa3d9, 0.1)
  g.fillCircle(330, 140, 52)
  g.fillStyle(0x4aa3d9, 0.14)
  g.fillCircle(330, 140, 38)
  prop(scene, 330, 140, '🌍', 52, 0.95)

  // planeta com atmosfera e anel: metade de trás do anel, planeta, metade da frente
  const px = 530
  const py = 410
  const ring = (rx: number, ry: number, from: number, to: number) => {
    const pts: Phaser.Types.Math.Vector2Like[] = []
    for (let t = from; t <= to; t += 0.08) pts.push({ x: px + rx * Math.cos(t), y: py + ry * Math.sin(t) })
    return pts
  }
  for (const [r, a] of [[160, 0.05], [138, 0.08], [122, 0.12]]) {
    g.fillStyle(0xffb18a, a)
    g.fillCircle(px, py, r)
  }
  g.lineStyle(9, 0xf2cc8f, 0.8)
  g.strokePoints(ring(175, 36, Math.PI, Math.PI * 2), false)
  g.lineStyle(3, 0xd9a86c, 0.7)
  g.strokePoints(ring(192, 42, Math.PI, Math.PI * 2), false)

  g.fillStyle(0xe07a5f, 1)
  g.fillCircle(px, py, 108)
  const bands = scene.add.graphics()
  const maskG = scene.make.graphics({}, false)
  maskG.fillStyle(0xffffff, 1)
  maskG.fillCircle(px, py, 108)
  bands.setMask(maskG.createGeometryMask())
  for (const [dy, h, c] of [[-80, 18, 0xf4a261], [-60, 30, 0xc9563b], [-18, 22, 0xf2cc8f], [20, 34, 0xb5442e], [66, 22, 0xf4a261], [92, 20, 0xc9563b]]) {
    bands.fillStyle(c, 0.9)
    bands.fillRect(px - 110, py + dy, 220, h)
  }
  // tempestade (olho do planeta)
  bands.fillStyle(0xfff0d6, 0.55)
  bands.fillEllipse(px - 38, py + 38, 40, 22)
  bands.fillStyle(0xb5442e, 0.8)
  bands.fillEllipse(px - 38, py + 38, 20, 11)
  // sombra do lado oposto à luz + brilho do lado iluminado
  bands.fillStyle(0x000000, 0.38)
  bands.fillCircle(px + 62, py + 22, 108)
  bands.fillStyle(0xffffff, 0.08)
  bands.fillCircle(px - 54, py - 50, 52)

  g.lineStyle(9, 0xf2cc8f, 0.88)
  g.strokePoints(ring(175, 36, 0, Math.PI), false)
  g.lineStyle(3, 0xd9a86c, 0.75)
  g.strokePoints(ring(192, 42, 0, Math.PI), false)

  // luazinha
  g.fillStyle(0xcfd2d6, 1)
  g.fillCircle(150, 390, 26)
  g.fillStyle(0x9aa0a8, 1)
  g.fillCircle(142, 382, 6)
  g.fillCircle(158, 402, 5)
  g.fillCircle(160, 380, 3)
  g.fillStyle(0x000000, 0.25)
  g.fillCircle(160, 398, 26)

  // treliça da estação e painel solar na parte de baixo da janela
  g.lineStyle(4, 0x6b7a99, 1)
  g.lineBetween(40, 586, 470, 586)
  g.lineBetween(40, 614, 470, 614)
  g.lineStyle(2, 0x56637f, 1)
  for (let x = 40; x < 470; x += 28) {
    g.lineBetween(x, 614, x + 14, 586)
    g.lineBetween(x + 14, 586, x + 28, 614)
  }
  g.lineStyle(4, 0x6b7a99, 1)
  g.lineBetween(470, 600, 490, 600)
  g.fillStyle(0x1d3a78, 1)
  g.fillRect(490, 566, 190, 48)
  g.lineStyle(1, 0x7fb2ff, 0.5)
  for (let x = 490; x <= 680; x += 24) g.lineBetween(x, 566, x, 614)
  for (let y = 566; y <= 614; y += 16) g.lineBetween(490, y, 680, y)
  g.lineStyle(3, 0x9fb3d9, 1)
  g.strokeRect(490, 566, 190, 48)
  g.fillStyle(0xffffff, 0.12)
  g.fillPoints([{ x: 520, y: 566 }, { x: 560, y: 566 }, { x: 530, y: 614 }, { x: 490, y: 614 }], true)

  // ---- moldura da estação (criada depois, por cima do que fica visível na janela)
  const f = scene.add.graphics()

  // vinheta e reflexos do vidro
  f.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.55, 0.55, 0, 0)
  f.fillRect(40, 60, W - 80, 120)
  f.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.5, 0.5)
  f.fillRect(40, 520, W - 80, 100)
  f.fillStyle(0xffffff, 0.035)
  f.fillPoints([{ x: 300, y: 60 }, { x: 360, y: 60 }, { x: 220, y: 620 }, { x: 160, y: 620 }], true)
  f.fillPoints([{ x: 385, y: 60 }, { x: 405, y: 60 }, { x: 325, y: 620 }, { x: 305, y: 620 }], true)

  // barras e pilares
  f.fillStyle(0x1b2233, 1)
  f.fillRect(0, 0, W, 60)
  f.fillRect(0, 0, 40, 640)
  f.fillRect(W - 40, 0, 40, 640)
  f.lineStyle(6, 0x5c6b8a, 1)
  f.strokeRect(40, 60, W - 80, 560)
  f.lineStyle(14, 0x2a3350, 1)
  f.lineBetween(240, 60, 240, 620)
  f.lineBetween(480, 60, 480, 620)
  f.lineStyle(2, 0x6b7a99, 0.8)
  f.lineBetween(236, 60, 236, 620)
  f.lineBetween(476, 60, 476, 620)

  // teto: tubulações, suportes e faixa de alerta
  f.fillStyle(0x3a4666, 1)
  f.fillRect(0, 8, W, 10)
  f.fillStyle(0x56637f, 1)
  f.fillRect(0, 9, W, 3)
  f.fillStyle(0x2f3a58, 1)
  f.fillRect(0, 28, W, 8)
  f.fillStyle(0x151a28, 1)
  for (let x = 30; x < W; x += 120) f.fillRect(x, 4, 10, 36)
  f.fillStyle(0x151a28, 1)
  f.fillRect(0, 48, W, 12)
  f.fillStyle(0xf2c14e, 0.9)
  for (let x = 0; x < W; x += 24) {
    f.fillPoints([{ x, y: 60 }, { x: x + 12, y: 60 }, { x: x + 24, y: 48 }, { x: x + 12, y: 48 }], true)
  }

  // pilares laterais: placas, rebites e aberturas de ventilação
  f.lineStyle(2, 0x2f3a58, 1)
  for (const x0 of [0, W - 40]) {
    for (let y = 60; y < 620; y += 70) f.strokeRect(x0 + 4, y + 4, 32, 62)
    for (let k = 0; k < 4; k++) f.lineBetween(x0 + 10, 470 + k * 8, x0 + 30, 470 + k * 8)
  }
  f.fillStyle(0x8a97b8, 1)
  for (const x of [20, W - 20]) for (let y = 40; y < 620; y += 90) f.fillCircle(x, y, 4)
  for (let x = 40; x < W; x += 90) f.fillCircle(x, 30, 4)

  // cabos pendurados
  f.lineStyle(4, 0x0d1018, 1)
  for (const x0 of [120, 300, 640]) {
    const pts: Phaser.Types.Math.Vector2Like[] = []
    for (let t = 0; t <= 1.001; t += 0.1) pts.push({ x: x0 + t * 36, y: 60 + Math.sin(t * Math.PI) * 38 + t * 10 })
    f.strokePoints(pts, false)
    f.fillStyle(0x6b7a99, 1)
    f.fillRect(x0 + 32, 104, 10, 12)
  }

  // luz de alerta piscando no teto
  const beaconGlow = scene.add.circle(W / 2, 30, 30, 0xff3b30, 0.2)
  scene.add.circle(W / 2, 30, 8, 0xff3b30, 1)
  scene.tweens.add({ targets: beaconGlow, alpha: 0.03, scale: 1.6, duration: 900, yoyo: true, repeat: -1 })

  // painel de controle
  f.fillGradientStyle(0x2a3350, 0x2a3350, 0x10141f, 0x10141f, 1)
  f.fillRect(0, 620, W, H - 620)
  f.fillStyle(0x5c6b8a, 1)
  f.fillRect(0, 616, W, 10)
  const strip = scene.add.rectangle(W / 2, 632, W, 4, 0x4ac3ff, 0.7)
  scene.tweens.add({ targets: strip, alpha: 0.2, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

  // telas laterais com barras animadas
  f.fillStyle(0x39ff88, 0.16)
  f.fillRect(50, 690, 190, 110)
  f.fillStyle(0x4ac3ff, 0.16)
  f.fillRect(490, 690, 190, 110)
  f.lineStyle(4, 0x5c6b8a, 1)
  f.strokeRect(50, 690, 190, 110)
  f.strokeRect(490, 690, 190, 110)
  f.lineStyle(1, 0x000000, 0.18)
  for (let y = 692; y < 800; y += 6) {
    f.lineBetween(52, y, 238, y)
    f.lineBetween(492, y, 678, y)
  }
  for (let i = 0; i < 6; i++) {
    const bar = scene.add.rectangle(62, 706 + i * 16, 40 + rand() * 120, 5, 0x39ff88, 0.7).setOrigin(0, 0.5)
    scene.tweens.add({
      targets: bar,
      scaleX: 0.3 + rand() * 0.3,
      duration: 800 + rand() * 1400,
      delay: rand() * 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }
  f.lineStyle(2, 0x4ac3ff, 0.6)
  f.lineBetween(500, 780, 540, 740)
  f.lineBetween(540, 740, 580, 765)
  f.lineBetween(580, 765, 620, 715)
  f.lineBetween(620, 715, 668, 735)
  const blip = scene.add.circle(668, 735, 4, 0xffffff, 1)
  scene.tweens.add({ targets: blip, alpha: 0.1, scale: 2, duration: 700, yoyo: true, repeat: -1 })

  // bancada central inclinada com teclado, alavanca e controle deslizante
  f.fillStyle(0x1c2438, 1)
  f.fillPoints([{ x: 170, y: 680 }, { x: 550, y: 680 }, { x: 610, y: 872 }, { x: 110, y: 872 }], true)
  f.lineStyle(3, 0x5c6b8a, 1)
  f.strokePoints([{ x: 170, y: 680 }, { x: 550, y: 680 }, { x: 610, y: 872 }, { x: 110, y: 872 }], true)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 14; c++) {
      const lit = rand() < 0.16
      f.fillStyle(lit ? [0x39ff88, 0x4ac3ff, 0xffd54a][Math.floor(rand() * 3)] : 0x2b3550, lit ? 0.85 : 1)
      f.fillRect(178 + c * 26 + r * 2, 808 + r * 18, 22, 13)
    }
  }
  f.fillStyle(0x0a0d14, 1)
  f.fillCircle(206, 742, 17)
  f.fillStyle(0x8a97b8, 1)
  f.fillRect(202, 708, 8, 34)
  f.fillStyle(0xff5252, 1)
  f.fillCircle(206, 706, 10)
  f.fillStyle(0x0a0d14, 1)
  f.fillRect(500, 736, 70, 8)
  f.fillStyle(0xffd54a, 1)
  f.fillRect(528, 728, 14, 24)

  // encostos das poltronas em primeiro plano
  f.fillStyle(0x080a11, 1)
  f.fillRoundedRect(30, 828, 130, 110, 28)
  f.fillRoundedRect(560, 828, 130, 110, 28)
  f.lineStyle(3, 0x2a3350, 1)
  f.strokeRoundedRect(30, 828, 130, 110, 28)
  f.strokeRoundedRect(560, 828, 130, 110, 28)

  // botões piscando
  const colors = [0xff5252, 0xffd54a, 0x39ff88, 0x4ac3ff]
  for (let i = 0; i < 16; i++) {
    const bx = 70 + i * 40
    const by = 650 + (i % 2) * 20
    f.fillStyle(0x0a0d14, 1)
    f.fillCircle(bx, by, 9)
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

  // estrela cadente de tempos em tempos, só dentro da janela
  const m = scene.make.graphics({}, false)
  m.fillStyle(0xffffff, 1)
  m.fillRect(40, 60, W - 80, 560)
  const winMask = m.createGeometryMask()
  scene.time.addEvent({
    delay: 3600,
    loop: true,
    callback: () => {
      const x0 = 70 + Math.random() * 320
      const y0 = 90 + Math.random() * 170
      const streak = scene.add.line(0, 0, 0, 0, -70, -26, 0xffffff, 0.95).setOrigin(0, 0).setLineWidth(2)
      streak.setPosition(x0, y0).setMask(winMask)
      scene.tweens.add({
        targets: streak,
        x: x0 + 280,
        y: y0 + 100,
        alpha: 0,
        duration: 700,
        ease: 'Quad.easeIn',
        onComplete: () => streak.destroy(),
      })
    },
  })
}
