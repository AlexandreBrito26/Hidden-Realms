import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import GameScene, { GAME_H, GAME_W } from './GameScene'
import type { Level } from '../levels/levels'

export default function PhaserGame({ level }: { level: Level }) {
  const parentRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)

  // cria o jogo uma única vez
  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: parentRef.current!,
      width: GAME_W,
      height: GAME_H,
      transparent: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [],
    })
    game.scene.add('Game', GameScene, false)
    gameRef.current = game
    return () => {
      game.destroy(true)
      gameRef.current = null
    }
  }, [])

  // (re)inicia a cena sempre que a fase muda
  useEffect(() => {
    gameRef.current?.scene.start('Game', { level })
  }, [level])

  return <div ref={parentRef} className="game-canvas" />
}
