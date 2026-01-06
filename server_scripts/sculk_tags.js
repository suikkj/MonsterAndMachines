// Priority: 0
// File: kubejs/server_scripts/sculk_tags.js
// Create a custom tag with ONLY the blocks we want sculk to replace
// Excludes sand, terracotta, and other unwanted blocks

ServerEvents.tags('block', event => {
    // Custom tag for sculk replacement - much more restrictive than vanilla
    event.add('kubejs:sculk_can_replace', [
        // Grass and dirt variants
        'minecraft:grass_block',
        'minecraft:dirt',
        'minecraft:coarse_dirt',
        'minecraft:podzol',
        'minecraft:mycelium',
        'minecraft:rooted_dirt',
        'minecraft:mud',
        'minecraft:muddy_mangrove_roots',
        'minecraft:moss_block',

        // Stone and variations (for caves and structures)
        'minecraft:stone',
        'minecraft:granite',
        'minecraft:diorite',
        'minecraft:andesite',
        'minecraft:cobblestone',
        'minecraft:mossy_cobblestone',
        'minecraft:smooth_stone',
        'minecraft:stone_bricks',
        'minecraft:mossy_stone_bricks',
        'minecraft:cracked_stone_bricks',
        'minecraft:chiseled_stone_bricks',
        'minecraft:infested_stone',
        'minecraft:infested_cobblestone',
        'minecraft:infested_stone_bricks',
        'minecraft:infested_mossy_stone_bricks',
        'minecraft:infested_cracked_stone_bricks',
        'minecraft:infested_chiseled_stone_bricks',
        'minecraft:infested_deepslate',

        // Deepslate variants
        'minecraft:deepslate',
        'minecraft:cobbled_deepslate',
        'minecraft:polished_deepslate',
        'minecraft:deepslate_bricks',
        'minecraft:deepslate_tiles',
        'minecraft:cracked_deepslate_bricks',
        'minecraft:cracked_deepslate_tiles',
        'minecraft:chiseled_deepslate',

        // Tuff variants
        'minecraft:tuff',
        'minecraft:polished_tuff',
        'minecraft:tuff_bricks',
        'minecraft:chiseled_tuff',
        'minecraft:chiseled_tuff_bricks',

        // Other stone types
        'minecraft:calcite',
        'minecraft:dripstone_block',

        // Nether stone variants
        'minecraft:netherrack',
        'minecraft:basalt',
        'minecraft:smooth_basalt',
        'minecraft:blackstone',
        'minecraft:polished_blackstone',
        'minecraft:polished_blackstone_bricks',
        'minecraft:cracked_polished_blackstone_bricks',
        'minecraft:chiseled_polished_blackstone',
        'minecraft:gilded_blackstone',
        'minecraft:nether_bricks',
        'minecraft:cracked_nether_bricks',
        'minecraft:chiseled_nether_bricks',
        'minecraft:red_nether_bricks',

        // End stone variants
        'minecraft:end_stone',
        'minecraft:end_stone_bricks',
        'minecraft:purpur_block',
        'minecraft:purpur_pillar',

        // Bricks (structures)
        'minecraft:bricks',
        'minecraft:prismarine',
        'minecraft:prismarine_bricks',
        'minecraft:dark_prismarine',

        // Small wood blocks (saplings, dead bushes - NOT full logs/planks)
        '#minecraft:saplings',
        'minecraft:dead_bush',

        // Snow and ice
        'minecraft:snow',
        'minecraft:snow_block',
        'minecraft:ice',
        'minecraft:packed_ice',
        'minecraft:blue_ice',

        // Crimson/Warped nylium (nether grass equivalents)
        'minecraft:crimson_nylium',
        'minecraft:warped_nylium'
    ]);
});
