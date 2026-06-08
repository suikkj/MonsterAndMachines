// Priority: 0
// File: kubejs/server_scripts/mob_sculk_death.js
// When mobs die near sculk without golden weapon, spread sculk in 5x5 diamond

// ============ CONFIGURATION ============
var SCULK_DETECTION_RADIUS = 5   // How close to sculk the mob needs to be
var SPREAD_RADIUS = 2            // 5x5 diamond = radius of 2

// ============ GOLDEN WEAPONS (hashmap for O(1) lookup) ============
// Weapons that prevent sculk spread on kill
var GOLDEN_WEAPONS = {
    'minecraft:golden_sword': true,
    'minecraft:golden_axe': true,
    'minecraft:golden_pickaxe': true,
    'minecraft:golden_shovel': true,
    'minecraft:golden_hoe': true
}

function isGoldenWeapon(itemId) {
    if (!itemId) return false
    if (GOLDEN_WEAPONS[itemId]) return true
    // Check for golden in name (modded weapons)
    return itemId.indexOf('gold') !== -1
}

// Check if position is near sculk (random sampling — 15 samples instead of full cube scan)
function isNearSculk(level, pos, radius) {
    for (var s = 0; s < 15; s++) {
        var x = Math.floor(Math.random() * (radius * 2 + 1)) - radius
        var y = Math.floor(Math.random() * (radius * 2 + 1)) - radius
        var z = Math.floor(Math.random() * (radius * 2 + 1)) - radius
        try {
            var checkPos = pos.offset(x, y, z)
            var blockId = level.getBlock(checkPos).id
            if (blockId === 'minecraft:sculk' || blockId === 'minecraft:sculk_vein') {
                return true
            }
        } catch (e) { }
    }
    return false
}

// Spread sculk in a circle pattern (sculk blocks only, no veins)
function spreadSculkCircle(level, centerPos, radius) {
    var blocksPlaced = 0

    for (var x = -radius; x <= radius; x++) {
        for (var z = -radius; z <= radius; z++) {
            // Circle shape: x² + z² <= radius²
            var distSquared = x * x + z * z
            if (distSquared > radius * radius) continue

            var pos = centerPos.offset(x, 0, z)
            var block = level.getBlock(pos)
            var blockId = block.id

            // Skip certain blocks
            if (blockId === 'minecraft:air' ||
                blockId === 'minecraft:cave_air' ||
                blockId === 'minecraft:bedrock' ||
                blockId === 'minecraft:sculk' ||
                blockId === 'minecraft:water' ||
                blockId === 'minecraft:lava' ||
                blockId.indexOf('gold') !== -1) {
                continue
            }

            // Only place sculk blocks (no veins)
            if (Math.random() < 0.8) {
                block.set('minecraft:sculk')
                blocksPlaced++
            }
        }
    }

    return blocksPlaced
}

// ============ MOB DEATH EVENT ============
EntityEvents.death(function (event) {
    var entity = event.entity
    var level = entity.level

    // Skip players and non-living
    if (entity.player) return
    if (!entity.living) return

    // Server side only
    if (level.clientSide) return

    // Get death position
    var pos = entity.blockPosition()

    // Check if near sculk
    if (!isNearSculk(level, pos, SCULK_DETECTION_RADIUS)) return

    // Check if killed by player with golden weapon
    var source = event.source
    if (source) {
        var attacker = source.actual
        if (attacker && attacker.player) {
            var mainHand = attacker.mainHandItem
            if (mainHand && isGoldenWeapon(mainHand.id)) {
                // Golden weapon - no sculk spread
                return
            }
        }
    }

    // Spread sculk in circle pattern!
    var spread = spreadSculkCircle(level, pos, SPREAD_RADIUS)
})
