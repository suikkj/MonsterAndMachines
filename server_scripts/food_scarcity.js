// Priority: 0
// File: kubejs/server_scripts/food_scarcity.js
// Crops near sculk grow slower or die

// ============ CONFIGURATION ============
var CROP_CHECK_CHANCE = 0.00167      // ~0.17% chance each tick (~600 ticks average)
var SCULK_DETECTION_RADIUS = 8       // How close sculk affects crops
var ADJACENT_KILL_CHANCE = 0.5       // 50% chance to kill adjacent crops per check

// Crop blocks that are affected
var CROP_BLOCKS = [
    // Vanilla
    'minecraft:wheat',
    'minecraft:carrots',
    'minecraft:potatoes',
    'minecraft:beetroots',
    'minecraft:melon_stem',
    'minecraft:pumpkin_stem',
    'minecraft:sweet_berry_bush',
    'minecraft:cocoa',
    // Farmer's Delight
    'farmersdelight:cabbages',
    'farmersdelight:tomatoes',
    'farmersdelight:onions',
    'farmersdelight:rice',
    'farmersdelight:budding_tomatoes',
    // Croptopia
    'croptopia:artichoke_crop',
    'croptopia:asparagus_crop',
    'croptopia:barley_crop',
    'croptopia:basil_crop',
    'croptopia:bellpepper_crop',
    'croptopia:blackbean_crop',
    'croptopia:broccoli_crop',
    'croptopia:cabbage_crop',
    'croptopia:cantaloupe_crop',
    'croptopia:cauliflower_crop',
    'croptopia:celery_crop',
    'croptopia:coffee_crop',
    'croptopia:corn_crop',
    'croptopia:cranberry_crop',
    'croptopia:cucumber_crop',
    'croptopia:eggplant_crop',
    'croptopia:garlic_crop',
    'croptopia:ginger_crop',
    'croptopia:grape_crop',
    'croptopia:greenbean_crop',
    'croptopia:greenonion_crop',
    'croptopia:honeydew_crop',
    'croptopia:hops_crop',
    'croptopia:kale_crop',
    'croptopia:kiwi_crop',
    'croptopia:leek_crop',
    'croptopia:lettuce_crop',
    'croptopia:mustard_crop',
    'croptopia:oat_crop',
    'croptopia:olive_crop',
    'croptopia:onion_crop',
    'croptopia:peanut_crop',
    'croptopia:pepper_crop',
    'croptopia:pineapple_crop',
    'croptopia:radish_crop',
    'croptopia:raspberry_crop',
    'croptopia:rhubarb_crop',
    'croptopia:rice_crop',
    'croptopia:rutabaga_crop',
    'croptopia:saguaro_crop',
    'croptopia:soybean_crop',
    'croptopia:spinach_crop',
    'croptopia:squash_crop',
    'croptopia:strawberry_crop',
    'croptopia:sweetpotato_crop',
    'croptopia:tea_crop',
    'croptopia:tomatillo_crop',
    'croptopia:tomato_crop',
    'croptopia:turmeric_crop',
    'croptopia:turnip_crop',
    'croptopia:yam_crop',
    'croptopia:zucchini_crop'
]

// ============ HELPER FUNCTIONS ============
function isCrop(blockId) {
    if (!blockId) return false
    if (CROP_BLOCKS.indexOf(blockId) !== -1) return true
    // Check for common crop patterns
    var id = blockId.toLowerCase()
    return id.indexOf('crop') !== -1 ||
        id.indexOf('_seeds') !== -1 ||
        id.indexOf('_stem') !== -1 ||
        id.indexOf('berry') !== -1
}

function isSculkNearby(level, pos, radius) {
    for (var x = -radius; x <= radius; x++) {
        for (var y = -2; y <= 2; y++) {
            for (var z = -radius; z <= radius; z++) {
                var checkPos = pos.offset(x, y, z)
                var blockId = level.getBlock(checkPos).id
                if (blockId === 'minecraft:sculk' || blockId === 'minecraft:sculk_vein') {
                    // Return distance
                    return Math.abs(x) + Math.abs(z)
                }
            }
        }
    }
    return -1  // No sculk nearby
}

// ============ CROP GROWTH/DEATH TICK ============
ServerEvents.tick(function (event) {
    // Probabilistic check instead of fixed interval
    if (Math.random() > CROP_CHECK_CHANCE) return

    event.server.playerList.players.forEach(function (player) {
        if (player.isCreative() || player.isSpectator()) return

        var level = player.level
        var playerPos = player.blockPosition()

        // Scan for crops near player
        for (var x = -32; x <= 32; x += 2) {
            for (var z = -32; z <= 32; z += 2) {
                for (var y = -4; y <= 4; y++) {
                    var checkPos = playerPos.offset(x, y, z)
                    var block = level.getBlock(checkPos)
                    var blockId = block.id

                    if (!isCrop(blockId)) continue

                    var sculkDistance = isSculkNearby(level, checkPos, SCULK_DETECTION_RADIUS)

                    if (sculkDistance === -1) continue  // No sculk nearby

                    if (sculkDistance <= 1) {
                        // ADJACENT to sculk - chance to die
                        if (Math.random() < ADJACENT_KILL_CHANCE) {
                            level.setBlockAndUpdate(checkPos, Block.getBlock('minecraft:dead_bush').defaultBlockState())
                        }
                    } else if (sculkDistance <= 4) {
                        // CLOSE to sculk - small chance crops wither
                        // Simplified: just a small chance to kill instead of complex age manipulation
                        if (Math.random() < 0.1) {
                            level.setBlockAndUpdate(checkPos, Block.getBlock('minecraft:dead_bush').defaultBlockState())
                        }
                    }
                    // sculkDistance 5-8 = normal growth (no effect)
                }
            }
        }
    })
})

// Block placement warnings removed - silent operation
