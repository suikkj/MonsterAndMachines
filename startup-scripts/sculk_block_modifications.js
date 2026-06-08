// Priority: 0
// File: kubejs/startup_scripts/sculk_block_modifications.js
// Makes sculk blocks extremely hard to break via high destroySpeed
// Protection is purely hardness-based — no server-side BlockEvents.broken cancellation

// ============ SCULK BLOCK HARDNESS ============

// Main sculk blocks — nearly unbreakable (destroySpeed 1000 ≈ minutes to break)
const UNBREAKABLE_SCULK = [
    'minecraft:sculk',
    'minecraft:sculk_catalyst',
    'minecraft:sculk_shrieker',
    'minecraft:sculk_sensor'
]

// High durability sculk blocks (destroySpeed 500 — very hard)
const HIGH_DURABILITY_SCULK = [
    'deeperdarker:sculk_stone_bricks',
    'deeperdarker:sculk_stone_brick_stairs',
    'deeperdarker:sculk_stone_brick_slab'
]

// Gloomy sculk — breakable with good tools but slow
const GLOOMY_SCULK_BLOCKS = [
    'deeperdarker:gloomy_sculk',
    'deeperdarker:gloomy_cactus',
    'deeperdarker:gloomy_grass'
]

// Sculk veins — hard but breakable
const SCULK_VEIN = 'minecraft:sculk_vein'

// Sculk Transporting mod blocks — high durability, no drops
const SCULK_TRANSPORTING_BLOCKS = [
    'sculktransporting:sculk_transmitter',
    'sculktransporting:sculk_emitter',
    'mem_sculkapocalypse:void_cleaner',
    'mem_sculkapocalypse:void_amplifier'
]

BlockEvents.modification(event => {
    // Main sculk: practically unbreakable
    UNBREAKABLE_SCULK.forEach(blockId => {
        event.modify(blockId, block => {
            block.destroySpeed = 1000
            block.explosionResistance = 3600000
        })
    })

    // High durability sculk variants
    HIGH_DURABILITY_SCULK.forEach(blockId => {
        event.modify(blockId, block => {
            block.destroySpeed = 500
            block.explosionResistance = 3600000
        })
    })

    // Gloomy sculk: slow but feasible (destroySpeed 50 — harder than before)
    GLOOMY_SCULK_BLOCKS.forEach(blockId => {
        event.modify(blockId, block => {
            block.destroySpeed = 500
            block.explosionResistance = 3600000
        })
    })

    // Sculk veins: hard
    event.modify(SCULK_VEIN, block => {
        block.destroySpeed = 500
        block.explosionResistance = 3600000
    })

    // Sculk Transporting blocks: high durability
    SCULK_TRANSPORTING_BLOCKS.forEach(blockId => {
        event.modify(blockId, block => {
            block.destroySpeed = 500
            block.explosionResistance = 3600000
        })
    })
})

// ============ GOLDEN BOOTS DURABILITY ============
// NOTE: item.maxDamage is undefined in ItemEvents.modification on this KubeJS version.
// Golden boots durability must be changed via data pack override or attribute modifiers.
// See: kubejs/data/kubejs/item_modifiers/ for data-driven approach.

StartupEvents.postInit(() => {
    console.info('[SculkBlocks] Startup script loaded — sculk protection is hardness-based only')
})

