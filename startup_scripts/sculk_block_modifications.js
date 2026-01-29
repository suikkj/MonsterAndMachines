// Priority: 0
// File: kubejs/startup_scripts/sculk_block_modifications.js
// Makes sculk blocks unbreakable like bedrock
// Sculk veins have high hardness but can be broken (with golden_hoe only - enforced in server script)

// Main sculk blocks are completely unbreakable
const UNBREAKABLE_SCULK = [
    'minecraft:sculk',
    'minecraft:sculk_catalyst',
    'minecraft:sculk_shrieker',
    'minecraft:sculk_sensor'
]

// Blocks that can be broken with golden_hoe (checked in server script)
const GLOOMY_SCULK_BLOCKS = [
    'deeperdarker:gloomy_sculk',
    'deeperdarker:gloomy_cactus',
    'deeperdarker:gloomy_grass'
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

    // Gloomy sculk blocks are hard but breakable with golden_hoe
    // Server script enforces the golden_hoe requirement
    GLOOMY_SCULK_BLOCKS.forEach(blockId => {
        event.modify(blockId, block => {
            block.destroySpeed = 5  // Breakable with golden_hoe in reasonable time
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
    console.info('[GoldenBoots] Starting durability modification...')

    event.modify('minecraft:golden_boots', item => {
        console.info('[GoldenBoots] Found item, current maxDamage: ' + item.maxDamage)

        // In KubeJS 1.21, maxDamage should be directly settable
        item.maxDamage = 5000

        console.info('[GoldenBoots] After setting, maxDamage is now: ' + item.maxDamage)

        // Log all available properties for debugging
        console.info('[GoldenBoots] Item properties: ' + Object.keys(item).join(', '))
    })

    console.info('[GoldenBoots] Modification complete!')
})

// Alternative approach using ItemEvents.toolTierRegistry if modification doesn't work
// This creates a log to verify the script is loading
StartupEvents.postInit(() => {
    console.info('[GoldenBoots] Startup script loaded successfully')
    console.info('[GoldenBoots] If you see "current maxDamage: 91" and "maxDamage is now: 91", the modification is not sticking')
    console.info('[GoldenBoots] This might require a data-driven approach with a datapack instead')
})
