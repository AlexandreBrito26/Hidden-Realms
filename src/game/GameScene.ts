import Phaser from 'phaser'
import { bus } from './events'
import type { Level } from '../levels/levels'
import { drawScenery } from './scenery'

export const GAME_W = 720
export const GAME_H = 900

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

    // toque que não pegou em nenhum alvo = erro
    this.input.on(
      'pointerdown',
      (pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
        if (over.length === 0) this.showMiss(pointer.x, pointer.y)
      },
    )

    bus.on('hint', this.onHint)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      bus.off('hint', this.onHint)
    })
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
    for (let i = 0; i < (this.level.decoyCount ?? 70); i++) {
      const emoji = this.level.decoys[Math.floor(rand() * this.level.decoys.length)]
      const size = 26 + rand() * 30
      this.add
        .text(rand() * GAME_W, rand() * GAME_H, emoji, { fontSize: `${size}px` })
        .setOrigin(0.5)
        .setRotation((rand() - 0.5) * 1.2)
        .setAlpha(0.85)
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
      text.on('pointerdown', () => this.markFound(target))
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
