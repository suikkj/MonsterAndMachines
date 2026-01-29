// Priority: 0
// File: kubejs/server_scripts/loot_restrictions.js
// Apocalypse loot filtering - removes inappropriate items from chest loot
// Requires LootJS mod

// Allowed "apocalypse-appropriate" foods
const ALLOWED_FOODS = [
    'minecraft:rotten_flesh',
    'minecraft:poisonous_potato',
    'minecraft:spider_eye',
    'minecraft:fermented_spider_eye',
    'minecraft:suspicious_stew',
    'minecraft:pufferfish',
    'minecraft:dried_kelp',
    'minecraft:bone_meal' // Not food but thematic
]

// Explicitly blocked items (food-like blocks that should never appear)
const BLOCKED_ITEMS = [
    // Food blocks
    'minecraft:melon_slice',
    'minecraft:melon',
    'minecraft:pumpkin',
    'minecraft:carved_pumpkin',
    'minecraft:pumpkin_pie',
    'minecraft:hay_block',
    'minecraft:wheat',
    'minecraft:bread',
    'minecraft:apple',
    'minecraft:golden_apple',
    'minecraft:enchanted_golden_apple',
    'minecraft:carrot',
    'minecraft:golden_carrot',
    'minecraft:potato',
    'minecraft:baked_potato',
    'minecraft:beetroot',
    'minecraft:beetroot_soup',
    'minecraft:cooked_beef',
    'minecraft:cooked_porkchop',
    'minecraft:cooked_chicken',
    'minecraft:cooked_mutton',
    'minecraft:cooked_rabbit',
    'minecraft:cooked_cod',
    'minecraft:cooked_salmon',
    'minecraft:cookie',
    'minecraft:cake',
    'minecraft:mushroom_stew',
    'minecraft:rabbit_stew',
    'minecraft:sweet_berries',
    'minecraft:glow_berries',
    'minecraft:honey_bottle',

    // Ender items - blocked
    'minecraft:ender_pearl',
    'minecraft:ender_eye',
    'minecraft:end_crystal',

    // Nether items - all blocked
    'minecraft:blaze_rod',
    'minecraft:blaze_powder',
    'minecraft:nether_brick',
    'minecraft:nether_bricks',
    'minecraft:nether_wart',
    'minecraft:nether_wart_block',
    'minecraft:ghast_tear',
    'minecraft:magma_cream',
    'minecraft:magma_block',
    'minecraft:wither_skeleton_skull',
    'minecraft:netherite_ingot',
    'minecraft:netherite_scrap',
    'minecraft:ancient_debris',
    'minecraft:soul_sand',
    'minecraft:soul_soil',
    'minecraft:nether_star',
    'minecraft:glowstone',
    'minecraft:glowstone_dust',
    'minecraft:quartz',
    'minecraft:nether_quartz_ore',
    'minecraft:crimson_fungus',
    'minecraft:warped_fungus',
    'minecraft:shroomlight',
    'minecraft:crying_obsidian',
    'minecraft:respawn_anchor',
    'minecraft:lodestone',
    'minecraft:blackstone',
    'minecraft:gilded_blackstone',
    'minecraft:polished_blackstone',
    'minecraft:basalt',
    'minecraft:netherrack',
    'minecraft:crimson_stem',
    'minecraft:warped_stem',
    'minecraft:crimson_nylium',
    'minecraft:warped_nylium',
    'minecraft:nether_sprouts',
    'minecraft:weeping_vines',
    'minecraft:twisting_vines',
    'minecraft:nether_gold_ore',
    'minecraft:fire_charge',

    // Sculk-themed items - too OP
    'minecraft:echo_shard',
    'minecraft:recovery_compass',
    'minecraft:disc_fragment_5',

    // Enchanted books - blocked from loot
    'minecraft:enchanted_book'
]

// Mods whose items are completely blocked from loot
const BLOCKED_MODS = [
    // Relics and Artifacts mods
    'relics',
    'artifacts',
    'relics_artifacts_compat',
    'rarcompat',
    'more_relics',
    'morerelics',

    // Simply Swords mods
    'simplyswords',
    'simply_swords',
    'simplymore',
    'simply_more',

    // Ars Nouveau and addons
    'ars_nouveau',
    'ars_elemental',
    'ars_technica',
    'arsdelight',

    // Iron's Spellbooks and addons (except allowed inks)
    'irons_spellbooks',
    'hazennstuff',
    'gtbcs_geomancy_plus',

    // Create mod and all addons
    'create',
    'create_connected',
    'create_jetpack',
    'createaddition',
    'create_central_kitchen',
    'create_new_age',
    'create_dragons_plus',
    'create_deep_dark',
    'create_hypertube',
    'create_ltab',
    'createnuclear',
    'create_structures_arise',
    'create_ultimate_factory',
    'create_better_villagers',
    'interiors',
    'copycats',
    'createbetterfps',
    'createcontraptionterminals',

    // Food mods - blocked from loot
    'croptopia',
    'farmersdelight',
    'farmers_delight',
    'farmers_croptopia',

    // Let's Do food/drink mods
    'bakery',
    'beachparty',
    'brewery',
    'candlelight',
    'farm_and_charm',
    'herbalbrews',
    'meadow',
    'vinery',
    'wildernature',
    'letsdocompat',

    // Delight addon mods
    'dungeonsdelight',
    'endersdelight',
    'oceansdelight',
    'twilightdelight',
    'lendersdelight',
    'vanilladelight',
    'moredelight',

    // Other food mods
    'jmc'  // Just More Cakes
]

// Allowed ores (raw and ore blocks)
const ALLOWED_ORES = [
    // Raw ores
    'minecraft:raw_iron',
    'minecraft:raw_gold',
    'minecraft:raw_copper',
    // Ore blocks
    'minecraft:iron_ore',
    'minecraft:deepslate_iron_ore',
    'minecraft:gold_ore',
    'minecraft:deepslate_gold_ore',
    'minecraft:nether_gold_ore',
    'minecraft:copper_ore',
    'minecraft:deepslate_copper_ore',
    // Ingots/nuggets are allowed
    'minecraft:iron_ingot',
    'minecraft:iron_nugget',
    'minecraft:gold_ingot',
    'minecraft:gold_nugget',
    'minecraft:copper_ingot'
]

// Keywords that indicate a weapon
const WEAPON_KEYWORDS = [
    'sword', 'bow', 'crossbow', 'axe', 'mace', 'spear', 'dagger', 'blade',
    'staff', 'wand', 'scythe', 'halberd', 'hammer', 'club', 'scepter',
    'katana', 'rapier', 'claymore', 'glaive', 'trident', 'cutlass', 'saber',
    'gun', 'pistol', 'rifle', 'musket', 'lance', 'javelin', 'throwing_knife'
]

// Keywords that indicate armor
const ARMOR_KEYWORDS = [
    'helmet', 'chestplate', 'leggings', 'boots', 'armor', 'cap', 'tunic',
    'pants', 'cuirass', 'greaves', 'gauntlet', 'pauldron', 'coif', 'hood',
    'vest', 'robe', 'cowl', 'mask', 'crown', 'circlet', 'headgear'
]

// Keywords that indicate ores we want to block
const BLOCKED_ORE_KEYWORDS = [
    'diamond', 'emerald', 'netherite', 'lapis', 'redstone', 'quartz',
    'ancient_debris', 'amethyst'
]

// Keywords for nether items (catch-all)
const NETHER_KEYWORDS = [
    'nether', 'blaze', 'ghast', 'wither', 'magma', 'soul', 'crimson',
    'warped', 'basalt', 'blackstone', 'netherite', 'piglin', 'hoglin',
    'strider', 'respawn_anchor', 'lodestone', 'shroomlight', 'ancient_debris'
]

// Keywords for sculk items
const SCULK_KEYWORDS = [
    'sculk', 'echo', 'recovery_compass', 'disc_fragment'
]

// Iron's Spells blocked items
const IRONS_SPELLS_BLOCKED = [
    'irons_spellbooks:arcane_essence',
    'irons_spellbooks:divine_pearl',
    'irons_spellbooks:upgrade_orb',
    'irons_spellbooks:fire_upgrade_orb',
    'irons_spellbooks:ice_upgrade_orb',
    'irons_spellbooks:lightning_upgrade_orb',
    'irons_spellbooks:holy_upgrade_orb',
    'irons_spellbooks:ender_upgrade_orb',
    'irons_spellbooks:blood_upgrade_orb',
    'irons_spellbooks:evocation_upgrade_orb',
    'irons_spellbooks:nature_upgrade_orb',
    'irons_spellbooks:eldritch_upgrade_orb',
    'irons_spellbooks:mana_upgrade_orb',
    'irons_spellbooks:magic_cloth',
    'irons_spellbooks:evasion_elixir',
    'irons_spellbooks:invisibility_elixir',
    // Epic and Legendary scrolls - blocked
    'irons_spellbooks:scroll', // Base scroll check happens in function

    // Spellbooks - all blocked from loot
    'irons_spellbooks:cursed_doll_spell_book',
    'irons_spellbooks:villager_spell_book',
    'irons_spellbooks:druidic_spell_book',
    'irons_spellbooks:ice_spell_book',
    'irons_spellbooks:blaze_spell_book',
    'irons_spellbooks:dragonskin_spell_book',
    'irons_spellbooks:rotten_spell_book',
    'irons_spellbooks:netherite_spell_book',
    'irons_spellbooks:diamond_spell_book',
    'irons_spellbooks:gold_spell_book',
    'irons_spellbooks:iron_spell_book',
    'irons_spellbooks:copper_spell_book',
    'irons_spellbooks:evoker_spell_book',
    'irons_spellbooks:necronomicon_spell_book',

    // HazenNStuff spellbooks
    'hazennstuff:golden_shower_spellbook',
    'hazennstuff:energized_core_spellbook',

    // GTBCS Geomancy spellbooks
    'gtbcs_geomancy_plus:codex_of_shattered_horizons',
    'gtbcs_geomancy_plus:bluff_instruction_manual'
]

// Iron's Spells rarity keywords - block epic and legendary
const IRONS_BLOCKED_RARITIES = ['epic', 'legendary']

// ALLOWED items from otherwise blocked mods (exceptions)
const ALLOWED_EXCEPTIONS = [
    'irons_spellbooks:common_ink',
    'irons_spellbooks:uncommon_ink',
    'irons_spellbooks:rare_ink'
]

// Function to check if item is a weapon
function isWeapon(itemId) {
    if (!itemId) return false
    const id = itemId.toLowerCase()
    return WEAPON_KEYWORDS.some(keyword => id.includes(keyword))
}

// Function to check if item is armor
function isArmor(itemId) {
    if (!itemId) return false
    const id = itemId.toLowerCase()
    return ARMOR_KEYWORDS.some(keyword => id.includes(keyword))
}

// Function to check if item is a blocked ore
function isBlockedOre(itemId) {
    if (!itemId) return false
    const id = itemId.toLowerCase()
    // Must contain ore keywords AND not be in allowed list
    if (ALLOWED_ORES.includes(itemId)) return false
    return BLOCKED_ORE_KEYWORDS.some(keyword => id.includes(keyword)) ||
        id.includes('_ore') || id.includes('raw_')
}

// Function to check if item is sculk-themed
function isSculkItem(itemId) {
    if (!itemId) return false
    const id = itemId.toLowerCase()
    return SCULK_KEYWORDS.some(keyword => id.includes(keyword))
}

// Function to check if item is from a blocked mod
function isFromBlockedMod(item) {
    if (!item) return false
    try {
        // Method 1: Check via getMod()
        let modId = null
        try {
            modId = item.getMod()
            if (modId && BLOCKED_MODS.includes(modId)) return true
        } catch (e) {
            // getMod() failed, continue to fallback
        }

        // Method 2: Check via item ID namespace (more reliable)
        let itemId = null
        try {
            itemId = item.id
            if (!itemId) itemId = item.getId()
            if (!itemId) itemId = String(item)
        } catch (e) {
            return false
        }

        if (itemId && itemId.includes(':')) {
            let namespace = itemId.split(':')[0]
            if (BLOCKED_MODS.includes(namespace)) return true
        }

        return false
    } catch (e) {
        return false
    }
}

// Function to check if item is nether-related
function isNetherItem(itemId) {
    if (!itemId) return false
    const id = itemId.toLowerCase()
    return NETHER_KEYWORDS.some(keyword => id.includes(keyword))
}

// Function to check if item should be removed (common filter)
function shouldRemoveItem(item) {
    if (!item || item.isEmpty()) return false
    let id = item.id
    if (!id) {
        try { id = item.getId() } catch (e) { }
    }
    if (!id) return false

    // 0. Check allowed exceptions FIRST (before blocking)
    if (ALLOWED_EXCEPTIONS.includes(id)) return false

    // 1. Direct namespace check (most reliable for catching mod items)
    for (let blockedMod of BLOCKED_MODS) {
        if (id.startsWith(blockedMod + ':')) return true
    }

    // 1. Remove items from blocked mods (fallback method)
    if (isFromBlockedMod(item)) return true

    // 2. Remove explicitly blocked items (including ender/nether)
    if (BLOCKED_ITEMS.includes(id)) return true

    // 3. Remove all weapons
    if (isWeapon(id)) return true

    // 4. Remove all armor
    if (isArmor(id)) return true

    // 5. Remove nether-related items by keyword
    if (isNetherItem(id)) return true

    // 6. Remove sculk-themed items
    if (isSculkItem(id)) return true

    // 7. Remove non-apocalyptic foods (check if edible)
    try {
        if (item.isEdible && item.isEdible()) {
            if (!ALLOWED_FOODS.includes(id)) return true
        }
    } catch (e) {
        // Ignore edible check errors
    }

    // 8. Remove blocked ores
    if (isBlockedOre(id)) return true

    // 9. Check Iron's Spells specific items
    if (id.startsWith('irons_spellbooks:')) {
        // Block specific items
        if (IRONS_SPELLS_BLOCKED.includes(id)) return true

        // Block any upgrade orb
        if (id.includes('upgrade_orb')) return true

        // For scrolls and ink, check rarity in item name/nbt
        // Block epic and legendary variants
        if (id.includes('scroll') || id.includes('ink')) {
            let ironsIdLower = id.toLowerCase()
            // Check if it's an epic or legendary variant
            if (ironsIdLower.includes('epic') || ironsIdLower.includes('legendary')) {
                return true
            }
        }
    }

    // 10. Check HazenNStuff items
    if (id.startsWith('hazennstuff:')) {
        if (IRONS_SPELLS_BLOCKED.includes(id)) return true
    }

    // 11. Check GTBCS Geomancy items
    if (id.startsWith('gtbcs_geomancy_plus:')) {
        if (IRONS_SPELLS_BLOCKED.includes(id)) return true
    }

    return false
}

// LootJS loot modification
LootJS.modifiers(event => {
    // Target ALL loot tables for maximum coverage
    event.addTableModifier(LootType.CHEST)
        .removeLoot(ItemFilter.custom(shouldRemoveItem))

    // Village loot specifically
    event.addTableModifier(/.*village.*/)
        .removeLoot(ItemFilter.custom(shouldRemoveItem))

    // Structure loot
    event.addTableModifier(/.*archaeology.*/)
        .removeLoot(ItemFilter.custom(shouldRemoveItem))

    event.addTableModifier(/.*shipwreck.*/)
        .removeLoot(ItemFilter.custom(shouldRemoveItem))

    event.addTableModifier(/.*stronghold.*/)
        .removeLoot(ItemFilter.custom(shouldRemoveItem))

    event.addTableModifier(/.*bastion.*/)
        .removeLoot(ItemFilter.custom(shouldRemoveItem))

    event.addTableModifier(/.*fortress.*/)
        .removeLoot(ItemFilter.custom(shouldRemoveItem))

    event.addTableModifier(/.*end_city.*/)
        .removeLoot(ItemFilter.custom(shouldRemoveItem))

    event.addTableModifier(/.*buried_treasure.*/)
        .removeLoot(ItemFilter.custom(shouldRemoveItem))

    event.addTableModifier(/.*dungeon.*/)
        .removeLoot(ItemFilter.custom(shouldRemoveItem))

    event.addTableModifier(/.*temple.*/)
        .removeLoot(ItemFilter.custom(shouldRemoveItem))

    event.addTableModifier(/.*mansion.*/)
        .removeLoot(ItemFilter.custom(shouldRemoveItem))

    event.addTableModifier(/.*mineshaft.*/)
        .removeLoot(ItemFilter.custom(shouldRemoveItem))

    event.addTableModifier(/.*igloo.*/)
        .removeLoot(ItemFilter.custom(shouldRemoveItem))

    event.addTableModifier(/.*outpost.*/)
        .removeLoot(ItemFilter.custom(shouldRemoveItem))

    event.addTableModifier(/.*ruined_portal.*/)
        .removeLoot(ItemFilter.custom(shouldRemoveItem))

    event.addTableModifier(/.*ancient_city.*/)
        .removeLoot(ItemFilter.custom(shouldRemoveItem))

    event.addTableModifier(/.*trail_ruins.*/)
        .removeLoot(ItemFilter.custom(shouldRemoveItem))

    event.addTableModifier(/.*trial_chambers.*/)
        .removeLoot(ItemFilter.custom(shouldRemoveItem))
})
