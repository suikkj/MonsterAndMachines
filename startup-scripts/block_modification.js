BlockEvents.modification(event => {

	event.modify('supplementaries:book_pile', block => {
		block.destroySpeed = 0.0
	})

	event.modify('supplementaries:book_pile_horizontal', block => {
		block.destroySpeed = 0.0
	})

	event.modify('immersiveengineering:fluid_placer', block => {
		block.explosionResistance = 10000.0
		block.destroySpeed = -1.0
	})

	event.modify('blockofsky:sky_block', block => {
		block.explosionResistance = 10000.0
		block.destroySpeed = -1.0
	})

	event.modify('antiblocksrechiseled:bright_black', block => {
		block.explosionResistance = 10000.0
		block.destroySpeed = -1.0
	})

	event.modify('antiblocksrechiseled:bright_white', block => {
		block.explosionResistance = 10000.0
		block.destroySpeed = -1.0
	})

	event.modify('antiblocksrechiseled:bright_cyan', block => {
		block.explosionResistance = 10000.0
		block.destroySpeed = -1.0
	})

})

// dustrial_decor items were removed.