// Priority: 0
// File: kubejs/server_scripts/creeper_sculk_spread.js
// Creepers spread sculk when they explode (including modded creepers)
// Uses LevelEvents.beforeExplosion to detect creeper explosions

// ============ CONFIGURATION ============
var SCULK_RADIUS = 5
var SCULK_CHANCE = 0.5
var VEIN_CHANCE = 0.7

// Blocks that should NOT be replaced
var PROTECTED_BLOCKS = [
    'minecraft:bedrock',
    'minecraft:air',
    'minecraft:cave_air',
    'minecraft:void_air',
    'minecraft:water',
    'minecraft:lava',
    'minecraft:sculk',
    'minecraft:sculk_vein',
    'minecraft:sculk_catalyst',
    'minecraft:sculk_sensor',
    'minecraft:sculk_shrieker'
]

// Helper function to check if block is protected
function isProtectedBlock(blockId) {
    for (var i = 0; i < PROTECTED_BLOCKS.length; i++) {
        if (blockId === PROTECTED_BLOCKS[i]) {
            return true
        }
    }
    return false
}

// Helper function to spread sculk around a position
function spreadSculkAtPosition(level, centerPos) {
    var radius = SCULK_RADIUS

    for (var x = -radius; x <= radius; x++) {
        for (var z = -radius; z <= radius; z++) {
            for (var y = -2; y <= 2; y++) {
                var checkPos = centerPos.offset(x, y, z)
                var distance = Math.sqrt(x * x + y * y + z * z)

                if (distance > radius) continue

                var block = level.getBlock(checkPos)
                var blockId = block.id

                // Skip protected blocks
                if (isProtectedBlock(blockId)) continue

                // Random chance based on distance
                var chance = Math.random()
                var distanceFactor = 1 - (distance / radius)

                // Replace ANY solid block with sculk
                if (block.block.defaultBlockState().isSolid()) {
                    if (chance < SCULK_CHANCE * distanceFactor) {
                        level.setBlock(checkPos, 'minecraft:sculk', 3)
                    }
                }
                // Place sculk vein on air blocks next to solid blocks
                else if (blockId === 'minecraft:air') {
                    var hasAdjacentSolid = false
                    var offsets = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]
                    for (var j = 0; j < offsets.length; j++) {
                        var adjacent = level.getBlock(checkPos.offset(offsets[j][0], offsets[j][1], offsets[j][2]))
                        if (adjacent.block.defaultBlockState().isSolid()) {
                            hasAdjacentSolid = true
                            break
                        }
                    }
                    if (hasAdjacentSolid && chance < VEIN_CHANCE * distanceFactor) {
                        level.setBlock(checkPos, 'minecraft:sculk_vein', 3)
                    }
                }
            }
        }
    }
}

// ============ EXPLOSION EVENT ============
// Use LevelEvents.beforeExplosion to detect creeper explosions
LevelEvents.beforeExplosion(function (event) {
    var level = event.level
    if (level.clientSide) return

    // Safely get explosion object
    var explosion = event.explosion
    if (!explosion) return

    // Safely get the source entity - different methods for different KubeJS versions
    var exploder = null
    try {
        if (explosion.directSourceEntity) {
            exploder = explosion.directSourceEntity
        } else if (explosion.getDirectSourceEntity) {
            exploder = explosion.getDirectSourceEntity()
        } else if (explosion.source) {
            exploder = explosion.source
        } else if (explosion.getSource) {
            exploder = explosion.getSource()
        }
    } catch (e) {
        // Silently ignore if we can't get the entity
        return
    }

    if (!exploder) return

    // Check if the source is any type of creeper (vanilla or modded)
    var typeString = exploder.type.toString().toLowerCase()
    if (!typeString.includes('creeper')) return

    // Get explosion position
    var pos = exploder.blockPosition()

    // Spread sculk at the explosion location
    spreadSculkAtPosition(level, pos)
})
