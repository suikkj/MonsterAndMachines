// Priority: 0
// File: kubejs/server_scripts/mob_enhanced_hearing.js
// Mobs have enhanced hearing range - they can detect players and machines from further away

// ============ CONFIGURATION ============
var ENHANCED_FOLLOW_RANGE = 64      // Default is ~32, doubled to 64
var HOSTILE_FOLLOW_RANGE = 80       // Hostile mobs get even more range

// Entities that should NOT get enhanced hearing (hashmap for O(1) lookup)
var EXCLUDED_ENTITIES = {
    'minecraft:villager': true,
    'minecraft:wandering_trader': true,
    'minecraft:iron_golem': true,
    'minecraft:snow_golem': true,
    'minecraft:cat': true,
    'minecraft:wolf': true,
    'minecraft:horse': true,
    'minecraft:donkey': true,
    'minecraft:mule': true,
    'minecraft:llama': true,
    'minecraft:trader_llama': true,
    'minecraft:parrot': true,
    'minecraft:pig': true,
    'minecraft:cow': true,
    'minecraft:sheep': true,
    'minecraft:chicken': true,
    'minecraft:rabbit': true,
    'minecraft:fox': true,
    'minecraft:bee': true,
    'minecraft:allay': true,
    'minecraft:axolotl': true,
    'minecraft:frog': true,
    'minecraft:tadpole': true,
    'minecraft:bat': true,
    'minecraft:squid': true,
    'minecraft:glow_squid': true,
    'minecraft:dolphin': true,
    'minecraft:cod': true,
    'minecraft:salmon': true,
    'minecraft:tropical_fish': true,
    'minecraft:pufferfish': true,
    'minecraft:turtle': true,
    'minecraft:sniffer': true,
    'minecraft:camel': true,
    'minecraft:armor_stand': true,
    'minecraft:item_frame': true,
    'minecraft:painting': true
}

// Hostile mobs that get extra range (hashmap for O(1) lookup)
var HOSTILE_MOBS = {
    'minecraft:zombie': true,
    'minecraft:skeleton': true,
    'minecraft:creeper': true,
    'minecraft:spider': true,
    'minecraft:cave_spider': true,
    'minecraft:enderman': true,
    'minecraft:witch': true,
    'minecraft:pillager': true,
    'minecraft:vindicator': true,
    'minecraft:evoker': true,
    'minecraft:ravager': true,
    'minecraft:phantom': true,
    'minecraft:drowned': true,
    'minecraft:husk': true,
    'minecraft:stray': true,
    'minecraft:wither_skeleton': true,
    'minecraft:blaze': true,
    'minecraft:ghast': true,
    'minecraft:magma_cube': true,
    'minecraft:slime': true,
    'minecraft:piglin': true,
    'minecraft:piglin_brute': true,
    'minecraft:hoglin': true,
    'minecraft:zoglin': true,
    'minecraft:zombified_piglin': true,
    'minecraft:warden': true
}

function isExcluded(entityType) {
    return !!EXCLUDED_ENTITIES[entityType]
}

function isHostile(entityType) {
    if (HOSTILE_MOBS[entityType]) return true
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
