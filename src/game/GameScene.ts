import Phaser from 'phaser'
import { bus } from './events'
import type { Level } from '../levels/levels'
import { drawScenery } from './scenery'

export const GAME_W = 720
export const GAME_H = 900

const MIN_ZOOM = 1
const MAX_ZOOM = 3
const TAP_MAX_MOVE = 12 // px: acima disso o toque vira arrasto, não clique

interface TargetObj {
  id: string
  text: Phaser.GameObjects.Text
  found: boolean
}

// Gerador pseudo-aleatório com semente: a mesma fase sempre sai igual
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export default class GameScene extends Phaser.Scene {
  private level!: Level
  private targets: TargetObj[] = []
  private onHint = () => this.showHint()
  private lastPinch: { dist: number; mx: number; my: number } | null = null
  private gestureMoved = false // houve pinça/arrasto neste gesto (não é um toque)

  constructor() {
    super('Game')
  }

  init(data: { level: Level }) {
    this.level = data.level
    this.targets = []
  }

  create() {
    this.drawBackground()
    this.scatterDecoys()
    this.spawnAmbient()
    this.placeTargets()

    this.setupZoom()

    // toque que não pegou em nenhum alvo = erro (arrastos e pinças não contam)
    this.input.on(
      'pointerup',
      (pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
        if (over.length === 0 && this.isTap(pointer)) {
          this.showMiss(pointer.worldX, pointer.worldY)
        }
        if (!this.input.manager.pointers.some((p) => p.isDown)) {
          this.gestureMoved = false
          this.lastPinch = null
        }
      },
    )

    bus.on('hint', this.onHint)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      bus.off('hint', this.onHint)
    })
  }

  private isTap(pointer: Phaser.Input.Pointer) {
    return !this.gestureMoved && pointer.getDistance() < TAP_MAX_MOVE
  }

  // Zoom: pinça com dois dedos, arrastar com um dedo (quando ampliado) e
  // roda do mouse no desktop.
  private setupZoom() {
    const cam = this.cameras.main
    cam.setBounds(0, 0, GAME_W, GAME_H)
    this.input.addPointer(1) // habilita o segundo dedo

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const { pointer1: p1, pointer2: p2 } = this.input

      if (p1.isDown && p2.isDown) {
        const dist = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y)
        const mx = (p1.x + p2.x) / 2
        const my = (p1.y + p2.y) / 2
        const prev = this.lastPinch
        this.lastPinch = { dist, mx, my }
        this.gestureMoved = true
        if (prev && prev.dist > 0) {
          this.zoomAround(prev.mx, prev.my, mx, my, cam.zoom * (dist / prev.dist))
        }
        return
      }

      // um dedo/mouse arrastando a imagem ampliada
      if (!pointer.isDown || cam.zoom <= MIN_ZOOM || this.lastPinch) return
      if (!this.gestureMoved && pointer.getDistance() < TAP_MAX_MOVE) return
      this.gestureMoved = true
      cam.scrollX -= (pointer.x - pointer.prevPosition.x) / cam.zoom
      cam.scrollY -= (pointer.y - pointer.prevPosition.y) / cam.zoom
    })

    this.input.on(
      'wheel',
      (pointer: Phaser.Input.Pointer, _o: unknown, _dx: number, dy: number) => {
        this.zoomAround(pointer.x, pointer.y, pointer.x, pointer.y, cam.zoom * (dy > 0 ? 0.9 : 1.1))
      },
    )
  }

  // aplica o zoom mantendo o ponto do mundo sob (prevX, prevY) em (newX, newY)
  private zoomAround(prevX: number, prevY: number, newX: number, newY: number, zoom: number) {
    const cam = this.cameras.main
    const cx = GAME_W / 2
    const cy = GAME_H / 2
    const wx = cam.scrollX + cx + (prevX - cx) / cam.zoom
    const wy = cam.scrollY + cy + (prevY - cy) / cam.zoom
    const z = Phaser.Math.Clamp(zoom, MIN_ZOOM, MAX_ZOOM)
    cam.setZoom(z)
    cam.setScroll(wx - cx - (newX - cx) / z, wy - cy - (newY - cy) / z)
  }

  private drawBackground() {
    const [top, bottom] = this.level.bg
    const g = this.add.graphics()
    g.fillGradientStyle(top, top, bottom, bottom, 1)
    g.fillRect(0, 0, GAME_W, GAME_H)
    if (this.level.scenery) drawScenery(this, this.level.scenery)
  }

  private scatterDecoys() {
    const rand = mulberry32(this.level.id * 9973)
    const [minSize, maxSize] = this.level.decoySize ?? [26, 56]
    const alpha = this.level.decoyAlpha ?? 0.85
    const zones = this.level.decoyZones ?? [{ x0: 0, y0: 0, x1: 1, y1: 1 }]
    const MIN_DIST_TO_TARGET = 30 // px: distrator não nasce em cima de um alvo

    for (let i = 0; i < (this.level.decoyCount ?? 70); i++) {
      const emoji = this.level.decoys[Math.floor(rand() * this.level.decoys.length)]
      const size = minSize + rand() * (maxSize - minSize)
      const zone = zones[Math.floor(rand() * zones.length)]
      const x = (zone.x0 + rand() * (zone.x1 - zone.x0)) * GAME_W
      const y = (zone.y0 + rand() * (zone.y1 - zone.y0)) * GAME_H

      const nearTarget = this.level.targets.some(
        (t) => Phaser.Math.Distance.Between(x, y, t.x * GAME_W, t.y * GAME_H) < MIN_DIST_TO_TARGET,
      )
      if (nearTarget) continue

      this.add
        .text(x, y, emoji, { fontSize: `${size}px` })
        .setOrigin(0.5)
        .setRotation((rand() - 0.5) * 1.2)
        .setAlpha(alpha)
        .setDepth(1)
    }
  }

  // partículas decorativas (bolhas, folhas, brilhos) que atravessam a cena em loop
  private spawnAmbient() {
    const ambient = this.level.ambient
    if (!ambient) return
    const rand = mulberry32(this.level.id * 7919)
    const count = ambient.count ?? 12
    for (let i = 0; i < count; i++) {
      const size = 14 + rand() * 18
      const x = rand() * GAME_W
      const fromY = ambient.dir === 'up' ? GAME_H + 30 : -30
      const toY = ambient.dir === 'up' ? -30 : GAME_H + 30
      const p = this.add
        .text(x, fromY, ambient.emoji, { fontSize: `${size}px` })
        .setOrigin(0.5)
        .setAlpha(0.4)
        .setDepth(5)
      this.tweens.add({
        targets: p,
        y: toY,
        x: x + (rand() - 0.5) * 80,
        duration: 7000 + rand() * 7000,
        delay: rand() * 6000,
        repeat: -1,
      })
    }
  }

  private placeTargets() {
    const rand = mulberry32(this.level.id * 31)
    for (const item of this.level.targets) {
      const text = this.add
        .text(item.x * GAME_W, item.y * GAME_H, item.emoji, {
          fontSize: `${item.size ?? 32}px`,
        })
        .setOrigin(0.5)
        .setPadding(14) // aumenta a área de toque
        .setRotation((rand() - 0.5) * 0.8)
        .setDepth(10)
        .setInteractive({ useHandCursor: true })

      // obstáculo na frente do alvo: cobre só uma parte, o resto fica visível.
      // não é interativo, então o toque passa direto para o alvo por trás.
      if (item.cover) {
        const c = item.cover
        this.add
          .text(text.x + c.dx, text.y + c.dy, c.emoji, { fontSize: `${c.size}px` })
          .setOrigin(0.5)
          .setRotation((rand() - 0.5) * 0.5)
          .setDepth(15)
      }

      const target: TargetObj = { id: item.id, text, found: false }
      text.on('pointerup', (pointer: Phaser.Input.Pointer) => {
        if (this.isTap(pointer)) this.markFound(target)
      })
      this.targets.push(target)
    }
  }

  private markFound(target: TargetObj) {
    if (target.found) return
    target.found = true
    target.text.disableInteractive()

    const { x, y } = target.text
    const ring = this.add.circle(x, y, 26).setStrokeStyle(4, 0xffd54a).setDepth(20)
    this.tweens.add({
      targets: ring,
      scale: 2.2,
      alpha: 0,
      duration: 500,
      onComplete: () => ring.destroy(),
    })
    this.tweens.add({
      targets: target.text,
      scale: 1.7,
      duration: 220,
      yoyo: true,
      onComplete: () => target.text.setAlpha(0.45),
    })

    bus.emit('found', target.id)
  }

  private showMiss(x: number, y: number) {
    const mark = this.add
      .text(x, y, '✖', { fontSize: '28px', color: '#ff5252' })
      .setOrigin(0.5)
      .setDepth(30)
    this.tweens.add({
      targets: mark,
      y: y - 24,
      alpha: 0,
      duration: 450,
      onComplete: () => mark.destroy(),
    })
    bus.emit('miss')
  }

  private showHint() {
    const target = this.targets.find((t) => !t.found)
    if (!target) return
    const ring = this.add
      .circle(target.text.x, target.text.y, 46)
      .setStrokeStyle(5, 0x7cf5ff)
      .setDepth(25)
    this.tweens.add({
      targets: ring,
      scale: 0.6,
      alpha: 0.2,
      duration: 450,
      yoyo: true,
      repeat: 3,
      onComplete: () => ring.destroy(),
    })
  }
}
