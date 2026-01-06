// Priority: 0
// File: kubejs/server_scripts/sculk_tendril_damage.js
// Sculk tendrils deal thorn damage like cactus

// Sculk tendril blocks that deal damage
var TENDRIL_BLOCKS = [
    'deeperdarker:sculk_tendrils'
]

// Damage amount (0.5 hearts = 1 damage)
var TENDRIL_DAMAGE = 1.0

// Check interval in ticks (10 ticks = 0.5 seconds)
var CHECK_INTERVAL = 10

PlayerEvents.tick(function (event) {
    var player = event.player
    if (player.isCreative() || player.isSpectator()) return

    // Only check every CHECK_INTERVAL ticks
    if (event.server.tickCount % CHECK_INTERVAL !== 0) return

    var level = player.level
    var pos = player.blockPosition()

    // Check block at feet and below
    var blockAt = level.getBlock(pos)
    var blockBelow = level.getBlock(pos.below())

    var inTendril = false
    for (var i = 0; i < TENDRIL_BLOCKS.length; i++) {
        if (blockAt.id === TENDRIL_BLOCKS[i] || blockBelow.id === TENDRIL_BLOCKS[i]) {
            inTendril = true
            break
        }
    }

    if (inTendril) {
        // Check for golden boots protection
        var armorSlots = player.inventory.armor
        if (armorSlots && armorSlots.get(0)) {
            var boots = armorSlots.get(0)
            if (boots.id === 'minecraft:golden_boots') {
                return // Protected by golden boots
            }
        }

        // Deal damage using server command - most reliable method
        event.server.runCommandSilent('damage ' + player.username + ' ' + TENDRIL_DAMAGE + ' minecraft:cactus')
    }
})
