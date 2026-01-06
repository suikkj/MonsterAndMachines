// Priority: 0
// File: kubejs/server_scripts/tech_tier_loot.js
// Structure-based tech tier loot system
// Higher tier = more dangerous areas = better loot

// ============ TECH TIER DEFINITIONS ============
// Tier 0: Basic survival (villages, surface)
// Tier 1: Simple machinery (desert temples, outposts)
// Tier 2: Advanced machinery (mineshafts, ocean monuments)
// Tier 3: High-tech (ancient cities, end cities)
// Tier 4: Legendary (Cataclysm bosses, custom)

// ============ LOOT TABLE MAPPINGS ============
var TIER_0_PATTERNS = [
    /.*village.*/,
    /.*igloo.*/,
    /.*ruined_portal.*/
]

var TIER_1_PATTERNS = [
    /.*desert_pyramid.*/,
    /.*jungle_temple.*/,
    /.*pillager_outpost.*/,
    /.*shipwreck.*/,
    /.*underwater_ruin.*/
]

var TIER_2_PATTERNS = [
    /.*abandoned_mineshaft.*/,
    /.*ocean_monument.*/,
    /.*woodland_mansion.*/,
    /.*stronghold.*/,
    /.*nether_bridge.*/,
    /.*bastion.*/
]

var TIER_3_PATTERNS = [
    /.*ancient_city.*/,
    /.*end_city.*/,
    /.*yung.*better.*/
]

// ============ TECH ITEMS BY TIER ============
// These items represent ancient technology found in ruins

LootJS.modifiers(function (event) {

    // ============ TIER 0: BASIC SURVIVAL ============
    event.addTableModifier(TIER_0_PATTERNS)
        .randomChance(0.3)
        .addLoot(
            LootEntry.of('minecraft:gold_ingot').setCount([1, 3]),
            LootEntry.of('minecraft:raw_gold').setCount([1, 2]),
            LootEntry.of('farmersdelight:canvas').setCount([1, 4])
        )

    // ============ TIER 1: SIMPLE MACHINERY ============
    event.addTableModifier(TIER_1_PATTERNS)
        .randomChance(0.25)
        .addLoot(
            // Create basics
            LootEntry.of('create:andesite_alloy').setCount([2, 6]),
            LootEntry.of('create:cogwheel').setCount([1, 4]),
            LootEntry.of('create:shaft').setCount([2, 6]),
            LootEntry.of('create:wrench'),
            // Immersive Engineering basics
            LootEntry.of('immersiveengineering:component_iron').setCount([1, 3]),
            LootEntry.of('immersiveengineering:wirecoil_copper').setCount([1, 4])
        )

    // Gold for protection
    event.addTableModifier(TIER_1_PATTERNS)
        .randomChance(0.2)
        .addLoot(
            LootEntry.of('minecraft:gold_ingot').setCount([2, 5]),
            LootEntry.of('minecraft:golden_sword'),
            LootEntry.of('minecraft:golden_boots')
        )

    // ============ TIER 2: ADVANCED MACHINERY ============
    event.addTableModifier(TIER_2_PATTERNS)
        .randomChance(0.3)
        .addLoot(
            // Create advanced
            LootEntry.of('create:brass_ingot').setCount([2, 8]),
            LootEntry.of('create:precision_mechanism'),
            LootEntry.of('create:electron_tube').setCount([1, 4]),
            LootEntry.of('create:mechanical_pump'),
            LootEntry.of('create:portable_storage_interface'),
            // Immersive Engineering
            LootEntry.of('immersiveengineering:component_steel').setCount([1, 3]),
            LootEntry.of('immersiveengineering:toolbox'),
            // Blueprint without NBT - use simple item
            LootEntry.of('immersiveengineering:blueprint')
        )

    // Better gold items
    event.addTableModifier(TIER_2_PATTERNS)
        .randomChance(0.15)
        .addLoot(
            LootEntry.of('minecraft:gold_block'),
            LootEntry.of('minecraft:enchanted_golden_apple'),
            LootEntry.of('minecraft:golden_axe').enchantWithLevels([10, 20])
        )

    // ============ TIER 3: HIGH-TECH ============
    event.addTableModifier(TIER_3_PATTERNS)
        .randomChance(0.35)
        .addLoot(
            // Create endgame
            LootEntry.of('create:brass_casing').setCount([2, 6]),
            LootEntry.of('create:railway_casing').setCount([1, 3]),
            LootEntry.of('create:track').setCount([4, 16]),
            LootEntry.of('create:sturdy_sheet').setCount([1, 3]),
            LootEntry.of('create:creative_motor'),  // Very rare working motor
            // Additional Create endgame items
            LootEntry.of('create:experience_nugget').setCount([4, 12]),
            // More rare Create items
            LootEntry.of('create:refined_radiance'),
            LootEntry.of('create:shadow_steel')
        )

    // Legendary gold gear
    event.addTableModifier(TIER_3_PATTERNS)
        .randomChance(0.2)
        .addLoot(
            LootEntry.of('minecraft:gold_block').setCount([2, 4]),
            LootEntry.of('minecraft:golden_sword').enchantWithLevels([25, 40]),
            LootEntry.of('minecraft:golden_boots').enchantWithLevels([25, 40])
        )

    // ============ CATACLYSM BOSS DROPS ============
    // These drop from L_Ender's Cataclysm bosses - the "Ancient War Machines"

    // Ender Guardian drops
    event.addTableModifier(/.*cataclysm.*ender_guardian.*/)
        .randomChance(0.5)
        .addLoot(
            LootEntry.of('create:creative_motor'),
            LootEntry.of('create:sturdy_sheet').setCount([4, 8]),
            LootEntry.of('create:refined_radiance').setCount([2, 4])
        )

    // Netherite Monstrosity drops
    event.addTableModifier(/.*cataclysm.*netherite_monstrosity.*/)
        .randomChance(0.5)
        .addLoot(
            LootEntry.of('create:shadow_steel').setCount([2, 4]),
            LootEntry.of('create:sturdy_sheet').setCount([4, 8]),
            LootEntry.of('minecraft:netherite_ingot').setCount([2, 4])
        )

    // Leviathan drops
    event.addTableModifier(/.*cataclysm.*leviathan.*/)
        .randomChance(0.5)
        .addLoot(
            LootEntry.of('create:creative_blaze_cake').setCount([8, 16]),
            LootEntry.of('create:chromatic_compound').setCount([2, 4]),
            LootEntry.of('create:brass_block').setCount([2, 4])
        )

    // Ancient Remnant / Ignited Revenant drops
    event.addTableModifier(/.*cataclysm.*(remnant|revenant).*/)
        .randomChance(0.5)
        .addLoot(
            LootEntry.of('minecraft:gold_block').setCount([4, 8]),
            LootEntry.of('create:brass_block').setCount([4, 8]),
            // Blueprint without NBT
            LootEntry.of('immersiveengineering:blueprint')
        )
})
