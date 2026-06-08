// ============================================
// Create Mod - Custom Recipes
// ============================================

ServerEvents.recipes(event => {

    // ============================================
    // Alchemist Cauldron - Ink Upgrade Recipes
    // Remove os inputs originais (copper, iron, gold, amethyst)
    // Substitui pelos mesmos itens usados nas receitas do Create
    // Mantém o byproduct de 50% de scroll da mesma raridade
    // ============================================

    // Remove as receitas originais de upgrade de tinta por input item
    event.remove({ type: 'irons_spellbooks:alchemist_cauldron_brew', input: 'minecraft:copper_ingot' });
    event.remove({ type: 'irons_spellbooks:alchemist_cauldron_brew', input: 'minecraft:iron_ingot' });
    event.remove({ type: 'irons_spellbooks:alchemist_cauldron_brew', input: 'minecraft:gold_ingot' });
    event.remove({ type: 'irons_spellbooks:alchemist_cauldron_brew', input: 'minecraft:amethyst_shard' });

    // Common Ink → Uncommon Ink (input: Arcane Ingot)
    event.custom({
        type: 'irons_spellbooks:alchemist_cauldron_brew',
        base_fluid: {
            id: 'irons_spellbooks:common_ink',
            amount: 1000
        },
        input: {
            item: 'irons_spellbooks:arcane_ingot'
        },
        results: [
            {
                id: 'irons_spellbooks:uncommon_ink',
                amount: 1000
            }
        ]
    }).id('kubejs:alchemist_cauldron/uncommon_ink');

    // Uncommon Ink → Rare Ink (input: Mana Upgrade Orb)
    event.custom({
        type: 'irons_spellbooks:alchemist_cauldron_brew',
        base_fluid: {
            id: 'irons_spellbooks:uncommon_ink',
            amount: 1000
        },
        input: {
            item: 'irons_spellbooks:mana_upgrade_orb'
        },
        results: [
            {
                id: 'irons_spellbooks:rare_ink',
                amount: 1000
            }
        ]
    }).id('kubejs:alchemist_cauldron/rare_ink');

    // Rare Ink → Epic Ink (input: Divine Pearl)
    event.custom({
        type: 'irons_spellbooks:alchemist_cauldron_brew',
        base_fluid: {
            id: 'irons_spellbooks:rare_ink',
            amount: 1000
        },
        input: {
            item: 'irons_spellbooks:divine_pearl'
        },
        results: [
            {
                id: 'irons_spellbooks:epic_ink',
                amount: 1000
            }
        ]
    }).id('kubejs:alchemist_cauldron/epic_ink');

    // Epic Ink → Legendary Ink (input: Divine Pearl)
    // Nota: O cauldron só aceita 1 item de input, então usa divine_pearl
    event.custom({
        type: 'irons_spellbooks:alchemist_cauldron_brew',
        base_fluid: {
            id: 'irons_spellbooks:epic_ink',
            amount: 1000
        },
        input: {
            item: 'minecraft:blaze_powder'
        },
        results: [
            {
                id: 'irons_spellbooks:legendary_ink',
                amount: 1000
            }
        ]
    }).id('kubejs:alchemist_cauldron/legendary_ink');

    // ============================================
    // Create Mod - Custom Mixing Recipes
    // ============================================

    // Mistura de Common Ink usando Mechanical Mixer
    // Requisitos: Superheated (Blaze Burner Super Aquecido)
    // Ingredientes: 1000mB de Água (1 balde), 1 Ink Sac, 1 Arcane Essence
    // Resultado: 1 Common Ink

    event.custom({
        type: 'create:mixing',
        ingredients: [
            { item: 'minecraft:ink_sac' },
            { item: 'irons_spellbooks:arcane_essence' },
            { type: 'neoforge:single', fluid: 'minecraft:water', amount: 1000 } // 1000mB = 1 balde
        ],
        results: [
            { id: 'irons_spellbooks:common_ink', amount: 200 }
        ],
        heatRequirement: 'superheated'
    }).id('kubejs:mixing/common_ink');

    event.custom({
        type: 'create:mixing',
        ingredients: [
            { item: 'irons_spellbooks:arcane_ingot', count: 4 },
            { type: 'neoforge:single', fluid: 'irons_spellbooks:common_ink', amount: 1000 }
        ],
        results: [
            { id: 'irons_spellbooks:uncommon_ink', amount: 200 }
        ],
        heatRequirement: 'superheated'
    }).id('kubejs:mixing/uncommon_ink');

    event.custom({
        type: 'create:mixing',
        ingredients: [
            { item: 'irons_spellbooks:mana_upgrade_orb', count: 4 },
            { type: 'neoforge:single', fluid: 'irons_spellbooks:uncommon_ink', amount: 1000 }
        ],
        results: [
            { id: 'irons_spellbooks:rare_ink', amount: 200 }
        ],
        heatRequirement: 'superheated'
    }).id('kubejs:mixing/rare_ink');

    event.custom({
        type: 'create:mixing',
        ingredients: [
            { item: 'irons_spellbooks:divine_pearl', count: 4 },
            { type: 'neoforge:single', fluid: 'irons_spellbooks:rare_ink', amount: 1000 }
        ],
        results: [
            { id: 'irons_spellbooks:epic_ink', amount: 200 }
        ],
        heatRequirement: 'superheated'
    }).id('kubejs:mixing/epic_ink');

    event.custom({
        type: 'create:mixing',
        ingredients: [
            { item: 'minecraft:blaze_powder', count: 4 },
            { type: 'neoforge:single', fluid: 'irons_spellbooks:epic_ink', amount: 1000 }
        ],
        results: [
            { id: 'irons_spellbooks:legendary_ink', amount: 200 }
        ],
        heatRequirement: 'superheated'
    }).id('kubejs:mixing/legendary_ink');

    // ============================================
    // Cinder Essence via Bulk Haunting (Encased Fan + Soul Campfire)
    // Input: Divine Pearl → Output: Cinder Essence
    // ============================================
    event.custom({
        type: 'create:haunting',
        ingredients: [
            { item: 'irons_spellbooks:divine_pearl' }
        ],
        results: [
            { id: 'irons_spellbooks:cinder_essence', count: 1 }
        ]
    }).id('kubejs:haunting/cinder_essence');

    // ============================================
    // Raw Mithril via Mechanical Mixer (Superheated)
    // Input: 8 Arcane Ingot + 500mB Rare Ink
    // Output: 2 Raw Mithril
    // ============================================
    event.custom({
        type: 'create:mixing',
        ingredients: [
            { item: 'irons_spellbooks:arcane_ingot', count: 8 },
            { type: 'neoforge:single', fluid: 'irons_spellbooks:rare_ink', amount: 500 }
        ],
        results: [
            { id: 'irons_spellbooks:raw_mithril', count: 2 }
        ],
        heatRequirement: 'superheated'
    }).id('kubejs:mixing/raw_mithril');

    // ============================================
    // End Stone Crushing → Ender Pearl (12% chance)
    // Tritura End Stone com chance de dropar Ender Pearl
    // ============================================
    event.custom({
        type: 'create:crushing',
        ingredients: [
            { item: 'minecraft:end_stone' }
        ],
        results: [
            { id: 'minecraft:end_stone', count: 1 },
            { id: 'minecraft:ender_pearl', count: 1, chance: 0.12 }
        ],
        processingTime: 250
    }).id('kubejs:crushing/end_stone_ender_pearl');

});

