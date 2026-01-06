// Priority: 0
// File: kubejs/startup_scripts/sculk_block_modifications.js
// Makes sculk blocks unbreakable like bedrock
// Sculk veins have high hardness but can be broken (with golden_hoe only - enforced in server script)

// Main sculk blocks are completely unbreakable
const UNBREAKABLE_SCULK = [
    'minecraft:sculk',
    'minecraft:sculk_catalyst',
    'minecraft:sculk_shrieker',
    'minecraft:sculk_sensor',
    'deeperdarker:gloomy_sculk'
]

// Sculk veins are breakable but VERY hard (golden_hoe check is in server script)
const SCULK_VEIN = 'minecraft:sculk_vein'

BlockEvents.modification(event => {
    // Make main sculk blocks completely unbreakable
    UNBREAKABLE_SCULK.forEach(blockId => {
        event.modify(blockId, block => {
            block.destroySpeed = 1000
            block.explosionResistance = 3600000
        })
    })

    // Sculk veins are very hard but breakable
    // The server script will cancel breaking unless golden_hoe is used
    event.modify(SCULK_VEIN, block => {
        block.destroySpeed = 100  // Very slow to break
        block.explosionResistance = 3600000
    })
})

// Modify golden boots to have 5000 durability
ItemEvents.modification(event => {
    event.modify('minecraft:golden_boots', item => {
        // Try both approaches for compatibility
        try {
            item.maxDamage = 5000
        } catch (e) { }
        try {
            item.setMaxDamage(5000)
        } catch (e) { }
    })
})
