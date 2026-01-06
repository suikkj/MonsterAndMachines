// Priority: 0
// File: kubejs/server_scripts/mob_enhanced_hearing.js
// Mobs have enhanced hearing range - they can detect players and machines from further away

// ============ CONFIGURATION ============
var ENHANCED_FOLLOW_RANGE = 64      // Default is ~32, doubled to 64
var HOSTILE_FOLLOW_RANGE = 80       // Hostile mobs get even more range

// Entities that should NOT get enhanced hearing
var EXCLUDED_ENTITIES = [
    'minecraft:villager',
    'minecraft:wandering_trader',
    'minecraft:iron_golem',
    'minecraft:snow_golem',
    'minecraft:cat',
    'minecraft:wolf',
    'minecraft:horse',
    'minecraft:donkey',
    'minecraft:mule',
    'minecraft:llama',
    'minecraft:trader_llama',
    'minecraft:parrot',
    'minecraft:pig',
    'minecraft:cow',
    'minecraft:sheep',
    'minecraft:chicken',
    'minecraft:rabbit',
    'minecraft:fox',
    'minecraft:bee',
    'minecraft:allay',
    'minecraft:axolotl',
    'minecraft:frog',
    'minecraft:tadpole',
    'minecraft:bat',
    'minecraft:squid',
    'minecraft:glow_squid',
    'minecraft:dolphin',
    'minecraft:cod',
    'minecraft:salmon',
    'minecraft:tropical_fish',
    'minecraft:pufferfish',
    'minecraft:turtle',
    'minecraft:sniffer',
    'minecraft:camel',
    'minecraft:armor_stand',
    'minecraft:item_frame',
    'minecraft:painting'
]

// Hostile mobs that get extra range
var HOSTILE_MOBS = [
    'minecraft:zombie',
    'minecraft:skeleton',
    'minecraft:creeper',
    'minecraft:spider',
    'minecraft:cave_spider',
    'minecraft:enderman',
    'minecraft:witch',
    'minecraft:pillager',
    'minecraft:vindicator',
    'minecraft:evoker',
    'minecraft:ravager',
    'minecraft:phantom',
    'minecraft:drowned',
    'minecraft:husk',
    'minecraft:stray',
    'minecraft:wither_skeleton',
    'minecraft:blaze',
    'minecraft:ghast',
    'minecraft:magma_cube',
    'minecraft:slime',
    'minecraft:piglin',
    'minecraft:piglin_brute',
    'minecraft:hoglin',
    'minecraft:zoglin',
    'minecraft:zombified_piglin',
    'minecraft:warden'
]

function isExcluded(entityType) {
    return EXCLUDED_ENTITIES.indexOf(entityType) !== -1
}

function isHostile(entityType) {
    if (HOSTILE_MOBS.indexOf(entityType) !== -1) return true
    // Check for common hostile mod mob patterns
    var type = entityType.toLowerCase()
    return type.indexOf('zombie') !== -1 ||
        type.indexOf('skeleton') !== -1 ||
        type.indexOf('creeper') !== -1 ||
        type.indexOf('spider') !== -1 ||
        type.indexOf('monster') !== -1 ||
        type.indexOf('demon') !== -1 ||
        type.indexOf('horror') !== -1 ||
        type.indexOf('beast') !== -1 ||
        type.indexOf('mutant') !== -1
}

// ============ ENTITY SPAWN EVENT ============
EntityEvents.spawned(function (event) {
    var entity = event.entity
    var entityType = entity.type

    // Skip excluded entities
    if (isExcluded(entityType)) return

    // Skip non-living entities
    if (!entity.living) return

    // Skip players
    if (entity.player) return

    // Try to modify follow range attribute
    try {
        var range = isHostile(entityType) ? HOSTILE_FOLLOW_RANGE : ENHANCED_FOLLOW_RANGE

        // getAttribute returns the attribute instance
        var followRange = entity.getAttribute('minecraft:generic.follow_range')
        if (followRange) {
            followRange.setBaseValue(range)
        }
    } catch (e) {
        // Entity may not have this attribute, ignore
    }
})
