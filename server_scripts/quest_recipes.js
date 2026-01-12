// Priority: 0
// Quest-Based Recipe Locking System - Pure KubeJS
// Bloqueia receitas até que as DEPENDÊNCIAS da quest sejam completadas
// Verifica diretamente via API FTB Quests - SEM necessidade de AStages ou SDM Recipe
// 
// IMPORTANTE: Um item é bloqueado até que as quests das quais ele depende sejam completadas
// Isso permite que o jogador crafite o item para completar a quest

// ============================================
// MAPEAMENTO: QUEST ID -> DEPENDÊNCIAS -> ITENS
// ============================================
// Formato: 'QUEST_ID': { deps: ['DEP1', 'DEP2'], items: ['item1', 'item2'] }
// Os itens são bloqueados até que TODAS as dependências sejam completadas

var QUEST_DATA = {
    // ============================================
    // ENGENHEIRO - Path de Create/IE
    // ============================================

    // 45601948B91E6CCB - Mechanical Press/Depot quest
    // Liberado após completar as quests de cogwheel e andesite casing
    '45601948B91E6CCB': {
        deps: ['73C4635E4EDC4D4E', '3E79942CE2344294'],
        items: [
            'immersiveengineering:blastbrick',
            'create:deployer',
            'create:basin',
            'create:mechanical_mixer'
        ]
    },

    // 54146588EC313FE6 - Blast Bricks quest (deps: cardboard + press/depot)
    // Libera itens de steel após completar esta quest
    '54146588EC313FE6': {
        deps: ['49B5B326035ED365', '45601948B91E6CCB'],
        items: [
            'immersiveengineering:blastbrick_reinforced',
            'immersiveengineering:slab_sheetmetal_steel',
            'immersiveengineering:light_engineering',
            'immersiveengineering:sheetmetal_steel',
            'immersiveengineering:storage_steel',
            'immersiveengineering:steel_scaffolding_standard',
            'immersiveengineering:heavy_engineering',
            'immersiveengineering:rs_engineering'
        ]
    },

    // 3F04085F680A4D2B - Hypertubes (deps: arc furnace 0AF3CECDAE5541F7)
    // Itens desbloqueados após completar 0AF3CECDAE5541F7
    '0AF3CECDAE5541F7': {
        deps: ['54146588EC313FE6'],
        items: [
            'immersiveengineering:cokebrick',
            'create_hypertube:hypertube',
            'create_hypertube:hypertube_entrance',
            'create_hypertube:hypertube_accelerator'
        ]
    },

    // 3F04085F680A4D2B - Hypertubes quest
    // Desbloqueia biplane após completar esta quest
    '3F04085F680A4D2B': {
        deps: ['0AF3CECDAE5541F7'],
        items: ['immersive_aircraft:biplane']
    },

    // 082B87D9A513747E - Biplane quest (antiga entrada - mantida vazia)
    '082B87D9A513747E': {
        deps: ['3F04085F680A4D2B'],
        items: []
    },

    // 36C10AA4DDFD07D9 - Coke Bricks (deps: arc furnace)
    // Desbloqueia cloche após completar esta quest
    '36C10AA4DDFD07D9': {
        deps: ['0AF3CECDAE5541F7'],
        items: [
            'immersiveengineering:cokebrick',
            'immersiveengineering:cloche'
        ]
    },

    // 040D0A848D045F18 - Cloche quest (deps: coke bricks)
    '040D0A848D045F18': {
        deps: ['36C10AA4DDFD07D9'],
        items: [
            'immersiveengineering:steel_fence',
            'immersive_armors:steampunk_helmet',
            'immersive_armors:steampunk_chestplate',
            'immersive_armors:steampunk_leggings',
            'immersive_armors:steampunk_boots',
            'immersiveengineering:armor_faraday_helmet',
            'immersiveengineering:armor_faraday_chestplate',
            'immersiveengineering:armor_faraday_leggings',
            'immersiveengineering:armor_faraday_boots'
        ]
    },

    // 608CB0C810B65F37 - Conveyor setup
    '608CB0C810B65F37': {
        deps: [],
        items: [
            'immersiveengineering:conveyor_basic',
            'immersiveengineering:sheetmetal_iron'
        ]
    },

    // 4E3464CD3EFBAB27 - Faraday Armor (deps: cloche)
    '4E3464CD3EFBAB27': {
        deps: ['040D0A848D045F18'],
        items: [
            'immersiveengineering:armor_faraday_helmet',
            'immersiveengineering:armor_faraday_chestplate',
            'immersiveengineering:armor_faraday_leggings',
            'immersiveengineering:armor_faraday_boots'
        ]
    },

    // 68A8F6A90B18A669 - Steampunk Armor (deps: cloche)
    '68A8F6A90B18A669': {
        deps: ['040D0A848D045F18'],
        items: [
            'immersive_armors:steampunk_helmet',
            'immersive_armors:steampunk_chestplate',
            'immersive_armors:steampunk_leggings',
            'immersive_armors:steampunk_boots'
        ]
    },

    // 522C0FA9254657C2 - HV Capacitor (deps: faraday + steampunk + assembler)
    '522C0FA9254657C2': {
        deps: ['68A8F6A90B18A669', '4E3464CD3EFBAB27', '58FECC3A89BA31BA'],
        items: [
            'immersiveengineering:capacitor_hv',
            'immersiveengineering:wooden_grip',
            'immersiveengineering:coil_mv',
            'immersiveengineering:component_electronic_adv'
        ]
    },

    // 2B8BD742CA3DB2BB - Railgun (deps: HV capacitor)
    '2B8BD742CA3DB2BB': {
        deps: ['522C0FA9254657C2'],
        items: ['immersiveengineering:railgun']
    },

    // 0E01E476CA7DB676 - Meat Shredder (deps: harbinger kill)
    '0E01E476CA7DB676': {
        deps: ['2F7CF7B635457B71'],
        items: ['cataclysm:meat_shredder']
    },

    // 7C96EAE6A84758A7 - Mechanical Fusion Anvil (deps: harbinger kill)
    '7C96EAE6A84758A7': {
        deps: ['2F7CF7B635457B71'],
        items: ['cataclysm:mechanical_fusion_anvil']
    },

    // 36A497CE8AC7EDA4 - Wither Assault Shoulder (deps: harbinger kill)
    '36A497CE8AC7EDA4': {
        deps: ['2F7CF7B635457B71'],
        items: ['cataclysm:wither_assault_shoulder_weapon']
    },

    // 7530D98895B11693 - Abyssal Sacrifice (deps: wither + shredder + fusion anvil)
    '7530D98895B11693': {
        deps: ['36A497CE8AC7EDA4', '0E01E476CA7DB676', '7C96EAE6A84758A7'],
        items: ['cataclysm:abyssal_sacrifice']
    },

    // 00F4CA6869F98FD1 - Void Assault Shoulder (deps: leviathan kill)
    '00F4CA6869F98FD1': {
        deps: ['4BE37A6503DCC381'],
        items: ['cataclysm:void_assault_shoulder_weapon']
    },

    // 4ED883B217560E28 - Speedometer/Stressometer quest (deps: goggles)
    '4ED883B217560E28': {
        deps: ['3F279A73E53871C4'],
        items: []  // itens movidos para entrada virtual abaixo
    },

    // Entrada virtual - Speedometer/Stressometer desbloqueados após completar 4ED883B217560E28
    'VIRTUAL_SPEED_STRESS': {
        deps: ['4ED883B217560E28'],
        items: ['create:speedometer', 'create:stressometer']
    },

    // 6D7D86AA100FE8C6 - Windmill setup (deps: goggles)
    '6D7D86AA100FE8C6': {
        deps: ['3F279A73E53871C4'],
        items: ['create:windmill_bearing', 'create:white_sail', 'create:super_glue']
    },

    // Entrada virtual - Contraption items (deps: deployer + windmill)
    'VIRTUAL_CONTRAPTION_ITEMS': {
        deps: ['2C1FB11A91F633BC', '6D7D86AA100FE8C6'],
        items: [
            'create:cart_assembler',
            'create:mechanical_plough',
            'create:mechanical_drill',
            'create:controller_rail'
        ]
    },

    // 7711C7D44E788C62 - Create New Age generator (deps: windmill)
    '7711C7D44E788C62': {
        deps: ['6D7D86AA100FE8C6'],
        items: [
            'create_new_age:magnetite_block',
            'create_new_age:generator_coil',
            'create_new_age:basic_motor',
            'create_new_age:carbon_brushes',
            'create_new_age:electrical_connector'
        ]
    },

    // 24424B49574D260A - Solar heating (deps: windmill + generator)
    '24424B49574D260A': {
        deps: ['6D7D86AA100FE8C6', '7711C7D44E788C62'],
        items: [
            'create_new_age:basic_solar_heating_plate',
            'create_new_age:heat_pipe',
            'create_new_age:stirling_engine'
        ]
    },

    // 5103C1B8A841F760 - Mech Eye (deps: solar)
    '5103C1B8A841F760': {
        deps: ['24424B49574D260A'],
        items: ['cataclysm:mech_eye']
    },

    // 3612BE384C17084C - Steam Engine setup (deps: solar heating)
    '3612BE384C17084C': {
        deps: ['24424B49574D260A'],
        items: [
            'create_new_age:heater',
            'create_new_age:advanced_solar_heating_plate',
            'create_new_age:heat_pump',
            'create:fluid_tank',
            'create:steam_engine'
        ]
    },

    // 0DB53E9F349454C2 - Brass Ingot (deps: mixer + steam engine)
    '0DB53E9F349454C2': {
        deps: ['341716B8A5685E10', '3612BE384C17084C'],
        items: ['create:brass_ingot']
    },

    // Brass Casing - OPÇÃO 1: após completar deployer + arc furnace
    'VIRTUAL_BRASS_CASING_1': {
        deps: ['2C1FB11A91F633BC', '0AF3CECDAE5541F7'],
        items: ['create:brass_casing']
    },

    // Brass Casing - OPÇÃO 2: após completar brass ingot quest
    'VIRTUAL_BRASS_CASING_2': {
        deps: ['0DB53E9F349454C2'],
        items: ['create:brass_casing']
    },

    // 58F344ACF982BFEC - Gyrodyne (deps: cardboard armor)
    '58F344ACF982BFEC': {
        deps: ['49B5B326035ED365'],
        items: ['immersive_aircraft:gyrodyne']
    },

    // 341716B8A5685E10 - Mixer/Basin (deps: press)
    '341716B8A5685E10': {
        deps: ['45601948B91E6CCB'],
        items: ['create:mechanical_mixer', 'create:basin']
    },

    // 4C191ADC15C1C472 - Brass Casing via alternativa (deps: brass ingot)
    '4C191ADC15C1C472': {
        deps: ['0DB53E9F349454C2'],
        items: ['create:brass_casing']
    },

    // Mechanical Crafters - OPÇÃO 1: após completar 5C9BB2FBA82B9952
    'VIRTUAL_MECH_CRAFTER_1': {
        deps: ['5C9BB2FBA82B9952'],
        items: ['create:mechanical_crafter', 'create:rotation_speed_controller']
    },

    // Mechanical Crafters - OPÇÃO 2: após completar 4C191ADC15C1C472
    'VIRTUAL_MECH_CRAFTER_2': {
        deps: ['4C191ADC15C1C472'],
        items: ['create:mechanical_crafter', 'create:rotation_speed_controller']
    },

    // 7BEDBFD13BF166F6 - Quest original (mantida para referência)
    '7BEDBFD13BF166F6': {
        deps: [],
        items: []  // itens movidos para entradas virtuais acima
    },

    // 5C9BB2FBA82B9952 - Brass Casing via principal (deps: deployer + arc furnace)
    '5C9BB2FBA82B9952': {
        deps: ['2C1FB11A91F633BC', '0AF3CECDAE5541F7'],
        items: ['create:brass_casing']
    },

    // 2FF0FB35DDCE7F97 - Create special items (deps: mechanical crafters)
    '2FF0FB35DDCE7F97': {
        deps: ['7BEDBFD13BF166F6'],
        items: [
            'create:potato_cannon',
            'create:wand_of_symmetry',
            'create:extendo_grip'
        ]
    },

    // 3E049B420B320FF7 - (mantida vazia - consolidada acima)
    '3E049B420B320FF7': {
        deps: ['7BEDBFD13BF166F6'],
        items: []
    },

    // 15406F3937F9DA86 - Wand of Symmetry (deps: mechanical crafters)
    '15406F3937F9DA86': {
        deps: ['7BEDBFD13BF166F6'],
        items: ['create:wand_of_symmetry']
    },

    // 2D5A619180803915 - Anti Radiation Armor (deps: wand + extendo + potato)
    '2D5A619180803915': {
        deps: ['15406F3937F9DA86', '3E049B420B320FF7', '2FF0FB35DDCE7F97'],
        items: [
            'createnuclear:yellow_anti_radiation_helmet',
            'createnuclear:yellow_anti_radiation_chestplate',
            'createnuclear:yellow_anti_radiation_leggings',
            'createnuclear:anti_radiation_boots'
        ]
    },

    // ============================================
    // MAGO - QUESTS DE MAGIA
    // ============================================

    // 75D26FBBF5811AFC - Novice Spell Book (deps: chronometer entry)
    '75D26FBBF5811AFC': {
        deps: ['37FAF4A9BBA5B912'],
        items: ['ars_nouveau:novice_spell_book']
    },

    // 7ADB2ED7F4D9FD84 - Dowsing Rod (deps: novice spellbook)
    '7ADB2ED7F4D9FD84': {
        deps: ['75D26FBBF5811AFC'],
        items: ['ars_nouveau:dowsing_rod']
    },

    // 4A873E74833611EC - Imbuement Chamber (deps: dowsing rod)
    '4A873E74833611EC': {
        deps: ['7ADB2ED7F4D9FD84'],
        items: ['ars_nouveau:imbuement_chamber']
    },

    // 73A8B81BCE0DB385 - Source Gem (deps: imbuement + tables)
    '73A8B81BCE0DB385': {
        deps: ['4A873E74833611EC', '3F9C9F557D11B686'],
        items: ['ars_nouveau:source_gem']
    },

    // 3F9C9F557D11B686 - Tables (deps: chronometer entry)
    '3F9C9F557D11B686': {
        deps: ['37FAF4A9BBA5B912'],
        items: ['irons_spellbooks:inscription_table', 'ars_nouveau:scribes_table']
    },

    // 5A9CE15749E5D019 - Arcane Pedestal (deps: source gem)
    '5A9CE15749E5D019': {
        deps: ['73A8B81BCE0DB385'],
        items: ['ars_nouveau:arcane_pedestal']
    },

    // 18FF047AE6550B65 - Sourcelinks (deps: arcane pedestal)
    '18FF047AE6550B65': {
        deps: ['5A9CE15749E5D019'],
        items: [
            'ars_nouveau:volcanic_sourcelink',
            'ars_nouveau:source_jar',
            'ars_nouveau:vitalic_sourcelink',
            'ars_nouveau:alchemical_sourcelink',
            'ars_nouveau:mycelial_sourcelink'
        ]
    },

    // 7A010FEF305C5109 - Enchanting Apparatus (deps: sourcelinks)
    '7A010FEF305C5109': {
        deps: ['18FF047AE6550B65'],
        items: ['ars_nouveau:enchanting_apparatus', 'ars_nouveau:arcane_core']
    },

    // 76EBCF4270FC764C - Enchanting Table (deps: enchanted books quest)
    '76EBCF4270FC764C': {
        deps: ['64F764A8FD782673'],
        items: ['minecraft:enchanting_table']
    },

    // 3900A9A2ECB1D3A2 - Magebloom (deps: enchanting apparatus)
    '3900A9A2ECB1D3A2': {
        deps: ['7A010FEF305C5109'],
        items: ['ars_nouveau:magebloom_crop', 'ars_nouveau:magebloom_fiber']
    },

    // 0C697CA67F0CE0C9 - Battlemage Armor (deps: magebloom)
    '0C697CA67F0CE0C9': {
        deps: ['3900A9A2ECB1D3A2'],
        items: [
            'ars_nouveau:battlemage_hood',
            'ars_nouveau:battlemage_robes',
            'ars_nouveau:battlemage_leggings',
            'ars_nouveau:battlemage_boots'
        ]
    },

    // 126C5E8D6D89060A - Arcanist Armor (deps: magebloom)
    '126C5E8D6D89060A': {
        deps: ['3900A9A2ECB1D3A2'],
        items: [
            'ars_nouveau:arcanist_hood',
            'ars_nouveau:arcanist_robes',
            'ars_nouveau:arcanist_leggings',
            'ars_nouveau:arcanist_boots'
        ]
    },

    // 2ED4893CA6D8DB03 - Sorcerer Armor (deps: magebloom)
    '2ED4893CA6D8DB03': {
        deps: ['3900A9A2ECB1D3A2'],
        items: [
            'ars_nouveau:sorcerer_hood',
            'ars_nouveau:sorcerer_robes',
            'ars_nouveau:sorcerer_leggings',
            'ars_nouveau:sorcerer_boots'
        ]
    },

    // 29C8DA6AB62E06A3 - Alteration Table (deps: any armor)
    '29C8DA6AB62E06A3': {
        deps: ['2ED4893CA6D8DB03', '126C5E8D6D89060A', '0C697CA67F0CE0C9'],
        items: ['ars_nouveau:alteration_table', 'ars_nouveau:blank_thread']
    },

    // 778CB703712BCCD9 - Apprentice Spell Book (deps: enchanting table + iron spellbook)
    '778CB703712BCCD9': {
        deps: ['76EBCF4270FC764C', '54FD47A201E3A42A'],
        items: ['ars_nouveau:apprentice_spell_book']
    },

    // 54FD47A201E3A42A - Iron Spell Book (deps: magebloom + archevoker kill)
    '54FD47A201E3A42A': {
        deps: ['3900A9A2ECB1D3A2', '74DEEA5D46DED547'],
        items: ['irons_spellbooks:iron_spell_book']
    },

    // 4FCE2D2F48A6C0D0 - Gold Spell Book (deps: infernal dragon kill)
    '4FCE2D2F48A6C0D0': {
        deps: ['4633843F83C846AD'],
        items: ['irons_spellbooks:gold_spell_book']
    },

    // 3CF1768AC9512C28 - Magic Cloth (deps: scroll forge)
    '3CF1768AC9512C28': {
        deps: ['3365DF943A086AD8'],
        items: ['irons_spellbooks:magic_cloth']
    },

    // 6D85AEEFCD9FAA36 - Wizard Armor (deps: magic cloth)
    '6D85AEEFCD9FAA36': {
        deps: ['3CF1768AC9512C28'],
        items: [
            'irons_spellbooks:wizard_helmet',
            'irons_spellbooks:wizard_chestplate',
            'irons_spellbooks:wizard_leggings',
            'irons_spellbooks:wizard_boots'
        ]
    },

    // 3365DF943A086AD8 - Scroll Forge (deps: tables)
    '3365DF943A086AD8': {
        deps: ['3F9C9F557D11B686'],
        items: ['irons_spellbooks:scroll_forge']
    },

    // 4B90BD3AAF1264F8 - Arcane Anvil (deps: scroll forge)
    '4B90BD3AAF1264F8': {
        deps: ['3365DF943A086AD8'],
        items: ['irons_spellbooks:arcane_anvil']
    },

    // 403D79FB769CD342 - Amethyst Rapier (deps: arcane anvil)
    '403D79FB769CD342': {
        deps: ['4B90BD3AAF1264F8'],
        items: ['irons_spellbooks:amethyst_rapier']
    },

    // 62D4B1663865E880 - Graybeard Staff (deps: arcane anvil)
    '62D4B1663865E880': {
        deps: ['4B90BD3AAF1264F8'],
        items: ['irons_spellbooks:graybeard_staff']
    },

    // 621D487DECA0B11F - Ice Staff (deps: arcane anvil)
    '621D487DECA0B11F': {
        deps: ['4B90BD3AAF1264F8'],
        items: ['irons_spellbooks:ice_staff']
    },

    // 08DB9DE2DEF13C3F - Spellbreaker (deps: arcane anvil)
    '08DB9DE2DEF13C3F': {
        deps: ['4B90BD3AAF1264F8'],
        items: ['irons_spellbooks:spellbreaker']
    },

    // 335536DADA546528 - Artificer Cane (deps: arcane anvil)
    '335536DADA546528': {
        deps: ['4B90BD3AAF1264F8'],
        items: ['irons_spellbooks:artificer_cane']
    },

    // 50BF1A70544B1660 - Twilight Gale (deps: arcane anvil)
    '50BF1A70544B1660': {
        deps: ['4B90BD3AAF1264F8'],
        items: ['irons_spellbooks:twilight_gale']
    },

    // 11C673A49A4F908E - Boreal Blade (deps: arcane anvil)
    '11C673A49A4F908E': {
        deps: ['4B90BD3AAF1264F8'],
        items: ['irons_spellbooks:boreal_blade']
    },

    // 5687C3C151B78566 - Storm Eye (deps: any weapon)
    '5687C3C151B78566': {
        deps: ['403D79FB769CD342', '335536DADA546528', '621D487DECA0B11F', '11C673A49A4F908E', '08DB9DE2DEF13C3F', '62D4B1663865E880', '50BF1A70544B1660'],
        items: ['cataclysm:storm_eye']
    },

    // 170546ED0E587671 - Abyss Eye (deps: alteration + apprentice + wizard)
    '170546ED0E587671': {
        deps: ['29C8DA6AB62E06A3', '778CB703712BCCD9', '6D85AEEFCD9FAA36'],
        items: ['cataclysm:abyss_eye']
    },

    // 133B4F2403B893EA - Alchemist Cauldron (deps: scroll forge)
    '133B4F2403B893EA': {
        deps: ['3365DF943A086AD8'],
        items: ['irons_spellbooks:alchemist_cauldron']
    },

    // 67E06C57C9751BAF - Invisibility Elixir (deps: alchemist cauldron)
    '67E06C57C9751BAF': {
        deps: ['133B4F2403B893EA'],
        items: ['irons_spellbooks:invisibility_elixir']
    },

    // 0F1EF6511A0916DF - Oakskin Elixir (deps: alchemist cauldron)
    '0F1EF6511A0916DF': {
        deps: ['133B4F2403B893EA'],
        items: ['irons_spellbooks:oakskin_elixir']
    },

    // 0D83B47ED8908D13 - Evasion Elixir (deps: alchemist cauldron)
    '0D83B47ED8908D13': {
        deps: ['133B4F2403B893EA'],
        items: ['irons_spellbooks:evasion_elixir']
    },

    // 005133BD1D8260A0 - Greater Invisibility (deps: invisibility elixir)
    '005133BD1D8260A0': {
        deps: ['67E06C57C9751BAF'],
        items: ['irons_spellbooks:greater_invisibility_elixir']
    },

    // 18D0CDE167FB82F8 - Greater Oakskin (deps: oakskin elixir)
    '18D0CDE167FB82F8': {
        deps: ['0F1EF6511A0916DF'],
        items: ['irons_spellbooks:greater_oakskin_elixir']
    },

    // 40252B07A4F1A754 - Greater Evasion (deps: evasion elixir)
    '40252B07A4F1A754': {
        deps: ['0D83B47ED8908D13'],
        items: ['irons_spellbooks:greater_evasion_elixir']
    },

    // 43C497DEBF724E46 - Ruined Book (deps: leviathan + scylla)
    '43C497DEBF724E46': {
        deps: ['119D1ABCF5E6304F', '4FE40BF371DE2599'],
        items: ['irons_spellbooks:ruined_book']
    },

    // ============================================
    // MAGO - Path de Ars Nouveau / Iron's Spellbooks
    // ============================================

    // 37FAF4A9BBA5B912 - Novice Spell Book + Scribes Table + Inscription Table
    '37FAF4A9BBA5B912': {
        deps: [],
        items: [
            'ars_nouveau:novice_spell_book',
            'irons_spellbooks:inscription_table',
            'ars_nouveau:scribes_table'
        ]
    },

    // 75D26FBBF5811AFC - Dowsing Rod
    '75D26FBBF5811AFC': {
        deps: [],
        items: ['ars_nouveau:dowsing_rod']
    },

    // 7ADB2ED7F4D9FD84 - Imbuement Chamber
    '7ADB2ED7F4D9FD84': {
        deps: [],
        items: ['ars_nouveau:imbuement_chamber']
    },

    // Source Gem - precisa de 4A873E74833611EC E 3F9C9F557D11B686
    'VIRTUAL_SOURCE_GEM': {
        deps: ['4A873E74833611EC', '3F9C9F557D11B686'],
        items: ['ars_nouveau:source_gem']
    },

    // 73A8B81BCE0DB385 - Arcane Pedestal (standalone)
    '73A8B81BCE0DB385': {
        deps: [],
        items: ['ars_nouveau:arcane_pedestal']
    },

    // 5A9CE15749E5D019 - Volcanic Sourcelink + Source Jar
    '5A9CE15749E5D019': {
        deps: [],
        items: ['ars_nouveau:volcanic_sourcelink', 'ars_nouveau:source_jar']
    },

    // 18FF047AE6550B65 - Enchanting Apparatus + Arcane Core
    '18FF047AE6550B65': {
        deps: [],
        items: [
            'ars_nouveau:enchanting_apparatus',
            'ars_nouveau:arcane_core'
        ]
    },

    // 64F764A8FD782673 - Enchanting Table
    '64F764A8FD782673': {
        deps: [],
        items: ['minecraft:enchanting_table']
    },

    // Disenchanting Table - precisa de 76EBCF4270FC764C E 4FCE2D2F48A6C0D0
    'VIRTUAL_DISENCHANT_TABLE': {
        deps: ['76EBCF4270FC764C', '4FCE2D2F48A6C0D0'],
        items: ['disenchanting_table:disenchanting_table']
    },

    // 4633843F83C846AD - Gold Spell Book
    '4633843F83C846AD': {
        deps: [],
        items: ['irons_spellbooks:gold_spell_book']
    },

    // Apprentice Spell Book - precisa de 76EBCF4270FC764C E 54FD47A201E3A42A
    'VIRTUAL_APPRENTICE_BOOK': {
        deps: ['76EBCF4270FC764C', '54FD47A201E3A42A'],
        items: ['ars_nouveau:apprentice_spell_book']
    },

    // Iron Spell Book - precisa de 3900A9A2ECB1D3A2 E 74DEEA5D46DED547
    'VIRTUAL_IRON_SPELL_BOOK': {
        deps: ['3900A9A2ECB1D3A2', '74DEEA5D46DED547'],
        items: ['irons_spellbooks:iron_spell_book']
    },

    // 7A010FEF305C5109 - Magebloom Crop
    '7A010FEF305C5109': {
        deps: [],
        items: ['ars_nouveau:magebloom_crop']
    },

    // 3900A9A2ECB1D3A2 - Battlemage, Arcanist, Sorcerer Armor
    '3900A9A2ECB1D3A2': {
        deps: [],
        items: [
            'ars_nouveau:battlemage_hood',
            'ars_nouveau:battlemage_robes',
            'ars_nouveau:battlemage_leggings',
            'ars_nouveau:battlemage_boots',
            'ars_nouveau:arcanist_hood',
            'ars_nouveau:arcanist_robes',
            'ars_nouveau:arcanist_leggings',
            'ars_nouveau:arcanist_boots',
            'ars_nouveau:sorcerer_hood',
            'ars_nouveau:sorcerer_robes',
            'ars_nouveau:sorcerer_leggings',
            'ars_nouveau:sorcerer_boots'
        ]
    },

    // Alteration Table + Blank Thread - precisa de 0C697CA67F0CE0C9 E 126C5E8D6D89060A E 2ED4893CA6D8DB03
    'VIRTUAL_ALTERATION': {
        deps: ['0C697CA67F0CE0C9', '126C5E8D6D89060A', '2ED4893CA6D8DB03'],
        items: ['ars_nouveau:alteration_table', 'ars_nouveau:blank_thread']
    },

    // 3F9C9F557D11B686 - Scroll Forge
    '3F9C9F557D11B686': {
        deps: [],
        items: ['irons_spellbooks:scroll_forge']
    },

    // 3365DF943A086AD8 - Alchemist Cauldron + Magic Cloth + Arcane Anvil
    '3365DF943A086AD8': {
        deps: [],
        items: [
            'irons_spellbooks:alchemist_cauldron',
            'irons_spellbooks:magic_cloth',
            'irons_spellbooks:arcane_anvil'
        ]
    },

    // 4B90BD3AAF1264F8 - Magic Weapons
    '4B90BD3AAF1264F8': {
        deps: [],
        items: [
            'irons_spellbooks:amethyst_rapier',
            'irons_spellbooks:graybeard_staff',
            'irons_spellbooks:spellbreaker',
            'irons_spellbooks:boreal_blade',
            'irons_spellbooks:twilight_gale',
            'irons_spellbooks:ice_staff',
            'irons_spellbooks:artificer_cane'
        ]
    },

    // Storm Eye - QUALQUER UMA das seguintes quests (OR logic)
    'VIRTUAL_STORM_EYE_1': {
        deps: ['403D79FB769CD342'],
        items: ['cataclysm:storm_eye']
    },
    'VIRTUAL_STORM_EYE_2': {
        deps: ['62D4B1663865E880'],
        items: ['cataclysm:storm_eye']
    },
    'VIRTUAL_STORM_EYE_3': {
        deps: ['621D487DECA0B11F'],
        items: ['cataclysm:storm_eye']
    },
    'VIRTUAL_STORM_EYE_4': {
        deps: ['08DB9DE2DEF13C3F'],
        items: ['cataclysm:storm_eye']
    },
    'VIRTUAL_STORM_EYE_5': {
        deps: ['335536DADA546528'],
        items: ['cataclysm:storm_eye']
    },
    'VIRTUAL_STORM_EYE_6': {
        deps: ['50BF1A70544B1660'],
        items: ['cataclysm:storm_eye']
    },
    'VIRTUAL_STORM_EYE_7': {
        deps: ['11C673A49A4F908E'],
        items: ['cataclysm:storm_eye']
    },


    // 3CF1768AC9512C28 - Wizard Armor (depende de 3365DF943A086AD8)
    '3CF1768AC9512C28': {
        deps: ['3365DF943A086AD8'],
        items: [
            'irons_spellbooks:wizard_helmet',
            'irons_spellbooks:wizard_chestplate',
            'irons_spellbooks:wizard_leggings',
            'irons_spellbooks:wizard_boots'
        ]
    },

    // 6D85AEEFCD9FAA36 - Quest para specialty armors (depende de 3CF1768AC9512C28)
    '6D85AEEFCD9FAA36': {
        deps: ['3CF1768AC9512C28'],
        items: [
            'irons_spellbooks:pyromancer_helmet',
            'irons_spellbooks:pyromancer_chestplate',
            'irons_spellbooks:pyromancer_leggings',
            'irons_spellbooks:pyromancer_boots',
            'irons_spellbooks:shadowwalker_helmet',
            'irons_spellbooks:shadowwalker_chestplate',
            'irons_spellbooks:shadowwalker_leggings',
            'irons_spellbooks:shadowwalker_boots',
            'irons_spellbooks:electromancer_helmet',
            'irons_spellbooks:electromancer_chestplate',
            'irons_spellbooks:electromancer_leggings',
            'irons_spellbooks:electromancer_boots',
            'irons_spellbooks:priest_helmet',
            'irons_spellbooks:priest_chestplate',
            'irons_spellbooks:priest_leggings',
            'irons_spellbooks:priest_boots',
            'irons_spellbooks:plagued_helmet',
            'irons_spellbooks:plagued_chestplate',
            'irons_spellbooks:plagued_leggings',
            'irons_spellbooks:plagued_boots',
            'irons_spellbooks:cryomancer_helmet',
            'irons_spellbooks:cryomancer_chestplate',
            'irons_spellbooks:cryomancer_leggings',
            'irons_spellbooks:cryomancer_boots',
            'irons_spellbooks:archevoker_helmet',
            'irons_spellbooks:archevoker_chestplate',
            'irons_spellbooks:archevoker_leggings',
            'irons_spellbooks:archevoker_boots',
            'irons_spellbooks:cultist_helmet',
            'irons_spellbooks:cultist_chestplate',
            'irons_spellbooks:cultist_leggings',
            'irons_spellbooks:cultist_boots'
        ]
    },

    // ============================================
    // GUERREIRO - Block Factory Bosses items
    // ============================================

    // 539AEA7361A1E92C - Warrior equipment
    '539AEA7361A1E92C': {
        deps: [],
        items: [
            'block_factorys_bosses:large_sword',
            'block_factorys_bosses:knight_helmet',
            'block_factorys_bosses:knight_chestplate',
            'block_factorys_bosses:knight_leggings',
            'block_factorys_bosses:knight_boots',
            'block_factorys_bosses:warrior_sword',
            'block_factorys_bosses:enhanced_shield'
        ]
    },

    // 72709FB2B59CBAFF - KnightQuest Armors
    '72709FB2B59CBAFF': {
        deps: [],
        items: [
            // Silver Armor
            'knightquest:silver_helmet',
            'knightquest:silver_chestplate',
            'knightquest:silver_leggings',
            'knightquest:silver_boots',
            // Deepslate Armor
            'knightquest:deepslate_helmet',
            'knightquest:deepslate_chestplate',
            'knightquest:deepslate_leggings',
            'knightquest:deepslate_boots',
            // Spider Armor
            'knightquest:spider_helmet',
            'knightquest:spider_chestplate',
            'knightquest:spider_leggings',
            'knightquest:spider_boots',
            // Creeper Armor
            'knightquest:creeper_helmet',
            'knightquest:creeper_chestplate',
            'knightquest:creeper_leggings',
            'knightquest:creeper_boots',
            // Shinobi Armor
            'knightquest:shinobi_helmet',
            'knightquest:shinobi_chestplate',
            'knightquest:shinobi_leggings',
            'knightquest:shinobi_boots'
        ]
    },

    // 012412CA67EE4A75 - Desert Eye
    '012412CA67EE4A75': {
        deps: [],
        items: ['cataclysm:desert_eye']
    },

    // 4CCDBF0A51B55E1F - Bone Reptile Armor
    '4CCDBF0A51B55E1F': {
        deps: [],
        items: [
            'cataclysm:bone_reptile_helmet',
            'cataclysm:bone_reptile_chestplate'
        ]
    },

    // 14DA500DFED765A1 - Ancient Spear
    '14DA500DFED765A1': {
        deps: [],
        items: ['cataclysm:ancient_spear']
    },

    // ============================================
    // CATACLYSM - Abyss Eye e Abyssal Sacrifice
    // ============================================

    // 48A4BCB3AD48A4FF - Abyss Eye
    '48A4BCB3AD48A4FF': {
        deps: [],
        items: ['cataclysm:abyss_eye']
    },

    // 24F82DEBFD24491F - Abyssal Sacrifice
    '24F82DEBFD24491F': {
        deps: [],
        items: ['cataclysm:abyssal_sacrifice']
    },

    // 6F66E95793BA0B29 - Ironclad Bow + Enhanced Shield
    '6F66E95793BA0B29': {
        deps: [],
        items: [
            'too_many_bows:ironclad_bow',
            'block_factorys_bosses:enhanced_shield'
        ]
    },

    // 1E85356ED0C79D9C - Enchanting Infuser (deps: 76EBCF4270FC764C)
    '1E85356ED0C79D9C': {
        deps: ['76EBCF4270FC764C'],
        items: ['enchantinginfuser:enchanting_infuser']
    },

    // Diamond Spell Book - precisa de 404093B4C76B5D07 E 4FCE2D2F48A6C0D0
    'VIRTUAL_DIAMOND_SPELL_BOOK': {
        deps: ['404093B4C76B5D07', '4FCE2D2F48A6C0D0'],
        items: ['irons_spellbooks:diamond_spell_book']
    }
}

// ============================================
// CONSTRUIR MAPA INVERTIDO: ITEM -> DEPENDÊNCIAS (suporta OR)
// ============================================
// Se um item aparece em múltiplas entradas, QUALQUER conjunto de deps
// sendo cumprido desbloqueia o item (lógica OR entre entradas)

var ITEM_TO_DEPS_LIST = {}  // item -> array de arrays de deps

var questIds = Object.keys(QUEST_DATA)
for (var i = 0; i < questIds.length; i++) {
    var questId = questIds[i]
    var data = QUEST_DATA[questId]
    var items = data.items
    var deps = data.deps.slice()  // Copia o array de deps

    // CORREÇÃO: Se não é uma entrada VIRTUAL, inclui o próprio questId nos deps
    // Isso garante que a quest precisa estar completa para os itens serem craftáveis
    if (!questId.startsWith('VIRTUAL')) {
        if (deps.indexOf(questId) === -1) {
            deps.push(questId)
        }
    }

    for (var j = 0; j < items.length; j++) {
        var itemId = items[j]
        if (!ITEM_TO_DEPS_LIST[itemId]) {
            ITEM_TO_DEPS_LIST[itemId] = []
        }
        ITEM_TO_DEPS_LIST[itemId].push(deps)
    }
}

// Mapa simplificado para compatibilidade (usa primeira entrada)
var ITEM_TO_DEPS = {}
var itemIds = Object.keys(ITEM_TO_DEPS_LIST)
for (var i = 0; i < itemIds.length; i++) {
    var itemId = itemIds[i]
    ITEM_TO_DEPS[itemId] = ITEM_TO_DEPS_LIST[itemId][0]
}

// ============================================
// VERIFICAÇÃO DIRETA VIA FTB QUESTS API
// ============================================

// Cache para evitar chamadas repetidas da API
var questCompletionCache = {}
var cacheTTL = 60000 // 1 minuto em ms
var lastCacheClean = Date.now()

function cleanExpiredCache() {
    var now = Date.now()
    if (now - lastCacheClean > cacheTTL) {
        questCompletionCache = {}
        lastCacheClean = now
    }
}

function isQuestCompleted(player, questIdHex) {
    try {
        cleanExpiredCache()

        var playerName = player.getName().getString()
        var cacheKey = playerName + '_' + questIdHex

        // Verificar cache
        if (questCompletionCache[cacheKey] !== undefined) {
            return questCompletionCache[cacheKey]
        }

        // Acessar API do FTB Quests
        var FTBQuestsAPI = Java.loadClass('dev.ftb.mods.ftbquests.api.FTBQuestsAPI')
        var api = FTBQuestsAPI.api()
        var questFile = api.getQuestFile(false) // false = server side

        if (!questFile) {
            return false
        }

        // Converter hex para long
        var questIdLong = Long.parseUnsignedLong(questIdHex, 16)

        // Encontrar a quest
        var quest = questFile.getQuest(questIdLong)
        if (!quest) {
            return false
        }

        // Obter team data do jogador - tentar vários métodos
        var playerUUID = player.uuid
        var teamData = null
        var mcPlayer = player.minecraftPlayer ? player.minecraftPlayer : player

        // Primeiro tentar via FTB Teams para obter o time correto
        try {
            var FTBTeamsAPI = Java.loadClass('dev.ftb.mods.ftbteams.api.FTBTeamsAPI')
            var teamsApi = FTBTeamsAPI.api()
            var teamManager = teamsApi.getManager()
            var playerTeam = teamManager.getTeamForPlayer(playerUUID)
            if (playerTeam.isPresent()) {
                var team = playerTeam.get()
                var teamId = team.getId()
                console.info('[Quest DEBUG] FTB Teams found team: ' + team.getName() + ' ID: ' + teamId)
                // Usar o ID do time para obter o TeamData
                teamData = questFile.getNullableTeamData(teamId)
                if (teamData) {
                    console.info('[Quest DEBUG] Got TeamData via FTB Teams!')
                }
            }
        } catch (eTeams) {
            console.info('[Quest DEBUG] FTB Teams lookup failed: ' + eTeams)
        }

        // Fallback: Método original com playerUUID
        if (!teamData) {
            try {
                teamData = questFile.getNullableTeamData(playerUUID)
                if (teamData) {
                    console.info('[Quest DEBUG] getNullableTeamData(playerUUID) worked!')
                }
            } catch (e1) { }

            // Método 2: getTeamData
            if (!teamData) {
                try {
                    teamData = questFile.getTeamData(playerUUID)
                    if (teamData) {
                        console.info('[Quest DEBUG] getTeamData worked!')
                    }
                } catch (e2) { }
            }

            // Método 3: Iterar todos os dados
            if (!teamData) {
                try {
                    var allData = questFile.getAllData()
                    if (allData) {
                        var iterator = allData.iterator()
                        while (iterator.hasNext()) {
                            var data = iterator.next()
                            // Verificar se este data pertence ao jogador
                            if (data && data.getPlayerId && data.getPlayerId().equals(playerUUID)) {
                                teamData = data
                                console.info('[Quest DEBUG] Found via getAllData!')
                                break
                            }
                        }
                    }
                } catch (e3) {
                    console.warn('[Quest DEBUG] getAllData failed: ' + e3)
                }
            }

            if (!teamData) {
                console.warn('[Quest DEBUG] No teamData found for: ' + player.getName().getString())
                return false
            }

            // Debug: mostrar qual team foi encontrado
            try {
                var teamId = teamData.getTeamId ? teamData.getTeamId() : 'unknown'
                var teamName = teamData.getName ? teamData.getName() : 'unknown'
                console.info('[Quest DEBUG] TeamData found - ID: ' + teamId + ' | Name: ' + teamName + ' | Player UUID: ' + playerUUID)

                // Tentar obter contagem de quests completas
                if (teamData.getCompletedQuests) {
                    var completed = teamData.getCompletedQuests()
                    console.info('[Quest DEBUG] Completed quests method exists, count: ' + (completed ? completed.size() : 'null'))
                }
                if (teamData.isCompleted) {
                    console.info('[Quest DEBUG] isCompleted method exists')
                }
            } catch (eDebug) {
                console.info('[Quest DEBUG] Error in debug: ' + eDebug)
            }

            // Verificar se a quest está completa
            var completed = false

            // Tentar isCompleted com quest object
            try {
                completed = teamData.isCompleted(quest)
                console.info('[Quest DEBUG] isCompleted(quest) = ' + completed + ' for quest ' + questIdHex)
            } catch (e1) {
                console.warn('[Quest DEBUG] isCompleted(quest) failed: ' + e1)
            }

            // Se falhou ou retornou false, tentar com quest ID long
            if (!completed) {
                try {
                    completed = teamData.isCompleted(questIdLong)
                    console.info('[Quest DEBUG] isCompleted(long) = ' + completed)
                } catch (e2) {
                    // Ignorar
                }
            }

            // Se ainda false, tentar getProgress
            if (!completed) {
                try {
                    var progress = teamData.getProgress(quest)
                    var maxProgress = quest.getMaxProgressHex ? quest.getMaxProgressHex() : 1
                    console.info('[Quest DEBUG] Progress: ' + progress + ' / ' + maxProgress)
                    completed = progress >= maxProgress
                } catch (e3) {
                    // Ignorar
                }
            }

            // Cachear resultado
            questCompletionCache[cacheKey] = completed

            return completed
        } catch (e) {
            console.error('[Quest Recipes] Error checking quest: ' + e)
            return false
        }
    }

// Carregar Long para conversão hex
var Long = Java.loadClass('java.lang.Long')

    function areAllDepsCompleted(player, deps) {
        if (!deps || deps.length === 0) return true

        for (var i = 0; i < deps.length; i++) {
            if (!isQuestCompleted(player, deps[i])) {
                return false
            }
        }
        return true
    }

    // ============================================
    // BLOQUEIO DE CRAFT
    // ============================================

    ItemEvents.crafted(function (event) {
        var player = event.player
        if (!player) return

        var item = event.item
        if (!item || item.isEmpty()) return

        var itemId = item.getId()
        var depsList = ITEM_TO_DEPS_LIST[itemId]

        if (!depsList || depsList.length === 0) return // Item não está bloqueado

        // Lógica OR: se QUALQUER conjunto de deps foi completado, permite craft
        var canCraft = false
        for (var i = 0; i < depsList.length; i++) {
            var depsCompleted = areAllDepsCompleted(player, depsList[i])
            console.info('[Quest Recipes DEBUG] Item: ' + itemId + ' | Deps set ' + i + ': ' + JSON.stringify(depsList[i]) + ' | Completed: ' + depsCompleted)
            if (depsCompleted) {
                canCraft = true
                break
            }
        }

        if (!canCraft) {
            event.item.setCount(0)
            player.tell(Text.of('§c[Bloqueado] §fComplete as quests anteriores para desbloquear este item!'))
            // Debug: mostrar quais quests faltam
            for (var i = 0; i < depsList.length; i++) {
                for (var j = 0; j < depsList[i].length; j++) {
                    var questId = depsList[i][j]
                    var completed = isQuestCompleted(player, questId)
                    player.tell(Text.of('§7  Quest ' + questId + ': ' + (completed ? '§a✓' : '§c✗')))
                }
            }
        }
    })

    // ============================================
    // COMANDO DE DEBUG
    // ============================================

    ServerEvents.commandRegistry(function (event) {
        var Commands = event.commands
        var StringArgumentType = Java.loadClass('com.mojang.brigadier.arguments.StringArgumentType')

        event.register(
            Commands.literal('questlock')
                .requires(function (src) { return src.hasPermission(2) })

                .then(Commands.literal('check')
                    .then(Commands.argument('questId', StringArgumentType.word())
                        .executes(function (ctx) {
                            var source = ctx.getSource()
                            var player = source.getPlayer()
                            var questId = StringArgumentType.getString(ctx, 'questId')

                            if (!player) return 0

                            var completed = isQuestCompleted(player, questId)
                            player.tell(Text.of('§6Quest ' + questId + ': ' + (completed ? '§aCompletada' : '§cNão completada')))

                            return 1
                        })
                    )
                )

                .then(Commands.literal('item')
                    .then(Commands.argument('itemId', StringArgumentType.greedyString())
                        .executes(function (ctx) {
                            var source = ctx.getSource()
                            var player = source.getPlayer()
                            var itemId = StringArgumentType.getString(ctx, 'itemId')

                            if (!player) return 0

                            var deps = ITEM_TO_DEPS[itemId]
                            if (!deps) {
                                player.tell(Text.of('§7Item não tem restrições de quest'))
                                return 1
                            }

                            player.tell(Text.of('§6Dependências para §e' + itemId + '§6:'))
                            for (var i = 0; i < deps.length; i++) {
                                var completed = isQuestCompleted(player, deps[i])
                                var status = completed ? '§a✓' : '§c✗'
                                player.tell(Text.of('  ' + status + ' §7' + deps[i]))
                            }

                            var canCraft = areAllDepsCompleted(player, deps)
                            player.tell(Text.of(canCraft ? '§aPode craftar!' : '§cBloqueado'))

                            return 1
                        })
                    )
                )

                .then(Commands.literal('list')
                    .executes(function (ctx) {
                        var source = ctx.getSource()
                        var player = source.getPlayer()

                        if (!player) return 0

                        player.tell(Text.of('§6Total de itens bloqueados: §e' + Object.keys(ITEM_TO_DEPS).length))
                        return 1
                    })
                )
        )

        console.info('[Quest Recipes] Commands registered')
    })

    console.info('[Quest Recipes] Dependency-based system loaded with ' + Object.keys(ITEM_TO_DEPS).length + ' items')
