import Phaser from 'phaser'

// Ponte de comunicação entre o React (UI) e o Phaser (cena).
// Eventos: 'found' (id do item), 'miss', 'hint'
export const bus = new Phaser.Events.EventEmitter()
