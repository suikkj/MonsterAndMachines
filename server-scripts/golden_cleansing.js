// Priority: 0
// File: kubejs/server_scripts/golden_cleansing.js
// Golden blocks cleanse sculk - block is CONSUMED and cleanses diamond-shaped area
// Sculk is replaced with gloomy_sculk from Deeper and Darker

// ============ CONFIGURATION ============
var CLEANSE_RADIUS = 3            // Diamond shape radius

// Golden blocks that can cleanse
var GOLDEN_BLOCKS = [
    'minecraft:gold_block',
    'minecraft:raw_gold_block',
    'minecraft:gilded_blackstone'
]

function isGoldenBlock(blockId) {
    if (!blockId) return false
    for (var i = 0; i < GOLDEN_BLOCKS.length; i++) {
        if (blockId === GOLDEN_BLOCKS[i]) return true
    }
    return false
}

// Cleanse sculk in a DIAMOND (losangular) shaped area
// Diamond shape: Manhattan distance <= radius
function cleanseSculkAreaDiamond(level, centerX, centerY, centerZ, radius) {
    var blocksCleansed = 0

    for (var x = -radius; x <= radius; x++) {
        for (var y = -radius; y <= radius; y++) {
            for (var z = -radius; z <= radius; z++) {
                // Diamond shape: sum of absolute values <= radius
                var manhattanDist = Math.abs(x) + Math.abs(y) + Math.abs(z)
                if (manhattanDist > radius) continue

                // Don't process center
                if (x === 0 && y === 0 && z === 0) continue

                var block = level.getBlock(centerX + x, centerY + y, centerZ + z)
                if (!block) continue
                var blockId = block.id

                // Cleanse sculk blocks - replace with gloomy_sculk
                if (blockId === 'minecraft:sculk') {
                    block.set('deeperdarker:gloomy_sculk')
                    blocksCleansed++
                } else if (blockId === 'minecraft:sculk_vein') {
                    // Just remove veins
                    block.set('minecraft:air')
                    blocksCleansed++
                } else if (blockId === 'minecraft:sculk_catalyst' ||
                    blockId === 'minecraft:sculk_sensor' ||
                    blockId === 'minecraft:sculk_shrieker') {
                    // Remove dangerous sculk blocks - replace with gloomy_sculk
                    block.set('deeperdarker:gloomy_sculk')
                    blocksCleansed++
                }
            }
        }
    }

    return blocksCleansed
}

// ============ BLOCK PLACEMENT EVENT ============
BlockEvents.placed(function (event) {
    var block = event.block
    var blockId = block.id

    // Only process golden blocks
    if (!isGoldenBlock(blockId)) return

    var level = event.level
    var pos = block.pos

    // Check if placed on top of sculk
    var blockBelow = level.getBlock(pos.x, pos.y - 1, pos.z)
    var isOnSculk = blockBelow && blockBelow.id === 'minecraft:sculk'

    // Cleanse the diamond-shaped area
    cleanseSculkAreaDiamond(level, pos.x, pos.y, pos.z, CLEANSE_RADIUS)

    // CONSUME the gold block ONLY if placed on sculk - replace with gloomy_sculk
    if (isOnSculk) {
        block.set('deeperdarker:gloomy_sculk')
    }
})
