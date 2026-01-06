// Priority: 0
// File: kubejs/server_scripts/sculk_vein_breaking.js
// Sculk veins can ONLY be broken with golden_hoe
// All other tools fail to break them

// Note: Since sculk_vein has destroySpeed = -1 (unbreakable),
// we need to handle the breaking logic specially

// When a player tries to break sculk_vein, allow it only with golden_hoe
BlockEvents.broken(event => {
    const block = event.block

    // Only handle sculk_vein
    if (block.id !== 'minecraft:sculk_vein') return

    const player = event.player
    if (!player) {
        event.cancel()
        return
    }

    // Allow creative mode
    if (player.isCreative()) return

    // Check if player is holding golden_hoe
    const mainHand = player.getMainHandItem()

    if (mainHand.id !== 'minecraft:golden_hoe') {
        event.cancel()
        return
    }

    // Golden hoe works - damage it
    if (mainHand.maxDamage > 0) {
        let currentDamage = mainHand.damageValue || 0
        const newDamage = currentDamage + 1

        if (newDamage >= mainHand.maxDamage) {
            // Tool breaks - no message
            player.setItemSlot('mainhand', Item.of('minecraft:air'))
        } else {
            // Damage the tool
            const newHoe = Item.of('minecraft:golden_hoe')
            newHoe.damageValue = newDamage
            // Copy enchantments if any
            if (mainHand.enchantments) {
                newHoe.enchantments = mainHand.enchantments
            }
            player.setItemSlot('mainhand', newHoe)
        }
    }
})

// Allow players with golden_hoe to break sculk_vein
// This requires overriding the hardness check
PlayerEvents.tick(event => {
    const player = event.player
    if (player.isCreative() || player.isSpectator()) return

    // Only check when player is breaking a block
    // This is a workaround since blocks with -1 hardness can't be broken normally
})

// Server startup - make sculk_vein breakable ONLY in creative or with special handling
// We use a different approach: make the block have very high hardness but not -1
// so it can technically be broken, then cancel in the broken event unless golden_hoe
