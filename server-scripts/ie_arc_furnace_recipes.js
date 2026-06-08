// ============================================
// Immersive Engineering - Arc Furnace Custom Recipes
// ============================================

ServerEvents.recipes(event => {
    // ============================================
    // Resonarium Plate - Deeper and Darker
    // Input: Echo Ingot (create_deep_dark)
    // Additive: Resonarium (deeperdarker)
    // Output: Resonarium Plate
    //
    // Config modifiers (immersiveengineering-server.toml):
    //   energyModifier = 0.25  (multiplies recipe energy by 0.25)
    //   timeModifier   = 0.5   (multiplies recipe time by 0.5)
    //
    // Desired final values:
    //   Energy: 3,686,400 IF total (20,480 IF/s = 1,024 IF/tick)
    //   Time:   3,600 ticks (3 minutes / 180 seconds)
    //
    // Compensated values (divided by modifier):
    //   Energy: 3,686,400 / 0.25 = 14,745,600 IF in recipe
    //   Time:   3,600 / 0.5      = 7,200 ticks in recipe
    // ============================================

    event.custom({
        type: 'immersiveengineering:arc_furnace',
        input: { item: 'create_deep_dark:echo_ingot' },
        additives: [
            { item: 'deeperdarker:resonarium' }
        ],
        results: [
            { item: 'deeperdarker:resonarium_plate' }
        ],
        slag: { item: 'discerning_the_eldritch:shard_of_malice' },
        time: 7200,
        energy: 14745600
    }).id('kubejs:resonarium_plate_arc_furnace');

    // ============================================
    // Aether Vestiges - Pastel
    // Input: Antimetal (blocksyouneed_luna)
    // Additive: Resonarium Plate (deeperdarker)
    // Output: Aether Vestiges
    // Slag: Pure Echo
    // ============================================

    event.custom({
        type: 'immersiveengineering:arc_furnace',
        input: { item: 'blocksyouneed_luna:antimetal_ingot' },
        additives: [
            { item: 'deeperdarker:resonarium_plate' }
        ],
        results: [
            { item: 'pastel:aether_vestiges' }
        ],
        slag: { item: 'pastel:pure_echo' },
        time: 144000,
        energy: 294912000
    }).id('kubejs:aether_vestiges_arc_furnace');

    // ============================================
    // Shadow Ingot - Create M&F
    // Input: Refined Radiance (create_mf)
    // Additive: Legendary Ink (irons_spellbooks)
    // Output: Shadow Ingot
    // Slag: Common Ink
    // ============================================

    event.custom({
        type: 'immersiveengineering:arc_furnace',
        input: { item: 'create_mf:refined_radiance' },
        additives: [
            { item: 'irons_spellbooks:legendary_ink' }
        ],
        results: [
            { item: 'create_mf:shadow_ingot' }
        ],
        slag: { item: 'irons_spellbooks:common_ink' },
        time: 7200,
        energy: 14745600
    }).id('kubejs:shadow_ingot_arc_furnace');
});
