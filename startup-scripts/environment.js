BlockEvents.modification(event => {
	event.modify('minecraft:spawner', block => {
		block.explosionResistance = 10000.0
		block.destroySpeed = 5.0
	})
})