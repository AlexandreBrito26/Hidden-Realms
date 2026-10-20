import { useEffect, useState } from 'react'
import PhaserGame from './game/PhaserGame'
import { bus } from './game/events'
import { levels } from './levels/levels'

export default function App() {
  const [levelIdx, setLevelIdx] = useState(0)
  const [found, setFound] = useState<string[]>([])
  const [hints, setHints] = useState(3)
  const [misses, setMisses] = useState(0)

  const level = levels[levelIdx]
  const done = found.length === level.targets.length

  useEffect(() => {
    const onFound = (id: string) =>
      setFound((f) => (f.includes(id) ? f : [...f, id]))
    const onMiss = () => setMisses((m) => m + 1)
    bus.on('found', onFound)
    bus.on('miss', onMiss)
    return () => {
      bus.off('found', onFound)
      bus.off('miss', onMiss)
    }
  }, [])

  const goTo = (i: number) => {
    setLevelIdx(i)
    setFound([])
    setMisses(0)
  }

  const useHint = () => {
    if (hints <= 0 || done) return
    setHints((h) => h - 1)
    bus.emit('hint')
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <small>Fase {level.id}</small>
          <h1>{level.title}</h1>
        </div>
        <div className="counter">
          {found.length}/{level.targets.length}
        </div>
      </header>

      <main className="stage">
        <PhaserGame level={level} />
        {done && (
          <div className="overlay">
            <div className="card">
              <h2>Fase completa! 🎉</h2>
              <p>Erros: {misses}</p>
              <button onClick={() => goTo((levelIdx + 1) % levels.length)}>
                {levelIdx + 1 < levels.length ? 'Próxima fase' : 'Jogar de novo'}
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="tray">
        <ul>
          {level.targets.map((t) => (
            <li key={t.id} className={found.includes(t.id) ? 'done' : ''}>
              <span>{t.emoji}</span>
              <em>{t.name}</em>
            </li>
          ))}
        </ul>
        <button className="hint" onClick={useHint} disabled={hints <= 0 || done}>
          💡 Dica ({hints})
        </button>
      </footer>
    </div>
  )
}
