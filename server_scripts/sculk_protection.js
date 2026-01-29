// Priority: 1000
// Sculk Protection - Prevents ALL sculk block destruction
// Works against spells, explosions, and any other destruction method

// List of protected sculk blocks
var PROTECTED_SCULK_BLOCKS = [
    'minecraft:sculk',
    'minecraft:sculk_vein',
    'minecraft:sculk_catalyst',
    'minecraft:sculk_sensor',
    'minecraft:sculk_shrieker',
    'deeperdarker:sculk_stone',
    'deeperdarker:sculk_stone_slab',
    'deeperdarker:sculk_stone_stairs',
    'deeperdarker:sculk_stone_wall',
    'deeperdarker:cobbled_sculk_stone',
    'deeperdarker:cobbled_sculk_stone_slab',
    'deeperdarker:cobbled_sculk_stone_stairs',
    'deeperdarker:cobbled_sculk_stone_wall',
    'deeperdarker:polished_sculk_stone',
    'deeperdarker:polished_sculk_stone_slab',
    'deeperdarker:polished_sculk_stone_stairs',
    'deeperdarker:polished_sculk_stone_wall',
    'deeperdarker:sculk_stone_bricks',
    'deeperdarker:sculk_stone_brick_slab',
    'deeperdarker:sculk_stone_brick_stairs',
    'deeperdarker:sculk_stone_brick_wall',
    'deeperdarker:blooming_sculk_stone',
    'deeperdarker:sculk_gleam',
    'deeperdarker:sculk_jaw',
    'deeperdarker:infested_sculk',
    'deeperdarker:sculk_tendrils'
]

function isSculkBlock(blockId) {
    // Exclude gloomy blocks - they are handled separately
    if (blockId.indexOf('gloomy') !== -1) {
        return false
    }
    // Check exact match
    if (PROTECTED_SCULK_BLOCKS.indexOf(blockId) !== -1) {
        return true
    }
    // Check if it contains 'sculk' in the name (catch-all)
    if (blockId.indexOf('sculk') !== -1) {
        return true
    }
    return false
}

// Blocks that can be broken with golden hoe
var GLOOMY_SCULK_BLOCKS = [
    'deeperdarker:gloomy_sculk',
    'deeperdarker:gloomy_cactus',
    'deeperdarker:gloomy_grass'
]

function isGloomySculk(blockId) {
    return GLOOMY_SCULK_BLOCKS.indexOf(blockId) !== -1 || blockId.indexOf('gloomy') !== -1
}

// Cancel block breaking by players (with exceptions for creative mode and golden hoe)
BlockEvents.broken(event => {
    var player = event.player

    // Allow creative mode players to break anything
    if (player && player.isCreative()) {
        return
    }

    var blockId = event.block.id

    // Check if it's a gloomy sculk block
    if (isGloomySculk(blockId)) {
        // Allow breaking with golden hoe
        if (player) {
            var mainHand = player.getMainHandItem()
            if (mainHand && mainHand.id === 'minecraft:golden_hoe') {
                return // Allow breaking
            }
        }
        event.cancel()
        return
    }

    // For other sculk blocks, always cancel (survival mode)
    if (isSculkBlock(blockId)) {
        event.cancel()
    }
})

console.info('[Sculk Protection] Sculk blocks are now protected from destruction')
