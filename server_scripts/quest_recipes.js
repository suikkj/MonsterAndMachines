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

    // Pumpjack items (deps: speedometer/stressometer + newage)
    // Requer completar 4ED883B217560E28 E 7711C7D44E788C62
    'VIRTUAL_PUMPJACK': {
        deps: ['4ED883B217560E28', '7711C7D44E788C62'],
        items: [
            'createdieselgenerators:pumpjack_hole',
            'createdieselgenerators:andesite_scaffolding',
            'createdieselgenerators:pumpjack_bearing',
            'createdieselgenerators:pumpjack_head',
            'createdieselgenerators:pumpjack_crank'
        ]
    },

    // Basin Lid (deps: quest 4DD02F4C0C3E1CAA)
    'VIRTUAL_BASIN_LID': {
        deps: ['4DD02F4C0C3E1CAA'],
        items: ['createdieselgenerators:basin_lid']
    },

    // Distillation Controller (deps: quest 2D2BB9965C366B6E)
    'VIRTUAL_DISTILLATION_CONTROLLER': {
        deps: ['2D2BB9965C366B6E'],
        items: ['createdieselgenerators:distillation_controller']
    },

    // Diesel Engine items (deps: quests 163E66E37B681240 E 6643E5FE09352F70)
    'VIRTUAL_DIESEL_ENGINE': {
        deps: ['163E66E37B681240', '6643E5FE09352F70'],
        items: [
            'createdieselgenerators:diesel_engine',
            'createdieselgenerators:engine_silencer',
            'createdieselgenerators:engine_turbocharger'
        ]
    },

    // Huge Diesel Engine (deps: quest 1D9BD27B2A4B2627)
    'VIRTUAL_HUGE_DIESEL_ENGINE': {
        deps: ['1D9BD27B2A4B2627'],
        items: ['createdieselgenerators:huge_diesel_engine']
    },

    // ============================================
    // CREATE NEW AGE - Progression Chain
    // ============================================

    // 5AC0107597A59018 - Redstone Magnet quest (deps: newage básico 7711C7D44E788C62)
    'VIRTUAL_REDSTONE_MAGNET': {
        deps: ['7711C7D44E788C62'],
        items: [
            'create_new_age:redstone_magnet',
            'create_new_age:overcharged_iron_wire'
        ]
    },

    // 3C5922FA254C1E15 - Layered Magnet quest (deps: redstone magnet 5AC0107597A59018)
    'VIRTUAL_LAYERED_MAGNET': {
        deps: ['5AC0107597A59018'],
        items: [
            'create_new_age:layered_magnet',
            'create_new_age:overcharged_golden_wire',
            'create_new_age:advanced_motor'
        ]
    },

    // 5138D010D4E37714 - Fluxuated Magnetite quest (deps: layered magnet 3C5922FA254C1E15)
    'VIRTUAL_FLUXUATED_MAGNETITE': {
        deps: ['3C5922FA254C1E15'],
        items: [
            'create_new_age:fluxuated_magnetite',
            'create_new_age:overcharged_diamond_wire',
            'create_new_age:reinforced_motor',
            'create_new_age:advanced_motor_extension'
        ]
    },

    // Pipez mod items (deps: layered magnet quest 3C5922FA254C1E15)
    'VIRTUAL_PIPEZ': {
        deps: ['3C5922FA254C1E15'],
        items: [
            'pipez:item_pipe',
            'pipez:fluid_pipe',
            'pipez:energy_pipe',
            'pipez:gas_pipe',
            'pipez:universal_pipe',
            'pipez:basic_upgrade',
            'pipez:improved_upgrade',
            'pipez:advanced_upgrade',
            'pipez:ultimate_upgrade',
            'pipez:infinity_upgrade',
            'pipez:basic_filter',
            'pipez:advanced_filter',
            'pipez:basic_fluid_filter',
            'pipez:advanced_fluid_filter',
            'pipez:basic_gas_filter',
            'pipez:advanced_gas_filter',
            'pipez:wrench'
        ]
    },

    // SecurityCraft mod items (deps: quest 36C10AA4DDFD07D9 - Coke Bricks)
    'VIRTUAL_SECURITYCRAFT': {
        deps: ['36C10AA4DDFD07D9'],
        items: [
            // Reinforced blocks
            'securitycraft:reinforced_stone',
            'securitycraft:reinforced_cobblestone',
            'securitycraft:reinforced_iron_block',
            'securitycraft:reinforced_diamond_block',
            'securitycraft:reinforced_glass',
            'securitycraft:reinforced_oak_planks',
            'securitycraft:reinforced_spruce_planks',
            'securitycraft:reinforced_birch_planks',
            'securitycraft:reinforced_jungle_planks',
            'securitycraft:reinforced_acacia_planks',
            'securitycraft:reinforced_dark_oak_planks',
            'securitycraft:reinforced_obsidian',
            // Security items
            'securitycraft:keypad',
            'securitycraft:keypad_door',
            'securitycraft:keypad_chest',
            'securitycraft:keypad_furnace',
            'securitycraft:keypad_barrel',
            'securitycraft:frame',
            'securitycraft:keycard_reader',
            'securitycraft:retinal_scanner',
            'securitycraft:laser_block',
            'securitycraft:inventory_scanner',
            'securitycraft:alarm',
            'securitycraft:cage_trap',
            'securitycraft:claymore',
            'securitycraft:ims',
            'securitycraft:bouncing_betty',
            'securitycraft:mine',
            'securitycraft:portable_radar',
            'securitycraft:motion_activated_light',
            'securitycraft:security_camera',
            'securitycraft:username_logger',
            'securitycraft:panic_button',
            'securitycraft:protecto',
            'securitycraft:sentry',
            // Tools and items
            'securitycraft:universal_block_modifier',
            'securitycraft:universal_block_remover',
            'securitycraft:universal_owner_changer',
            'securitycraft:universal_key_changer',
            'securitycraft:admin_tool',
            'securitycraft:camera_monitor',
            'securitycraft:keycard_holder',
            'securitycraft:briefcase',
            'securitycraft:taser',
            'securitycraft:sentry_remote_access_tool',
            'securitycraft:mine_remote_access_tool',
            'securitycraft:wire_cutters',
            'securitycraft:codebreaker',
            // Keycards
            'securitycraft:keycard_lv1',
            'securitycraft:keycard_lv2',
            'securitycraft:keycard_lv3',
            'securitycraft:keycard_lv4',
            'securitycraft:keycard_lv5',
            'securitycraft:limited_use_keycard'
        ]
    },

    // Create Nuclear Anti-Radiation Armor (deps: quests 2FF0FB35DDCE7F97, 15406F3937F9DA86, 3E049B420B320FF7)
    // All color variants of anti-radiation armor
    'VIRTUAL_ANTI_RADIATION_ARMOR': {
        deps: ['2FF0FB35DDCE7F97', '15406F3937F9DA86', '3E049B420B320FF7'],
        items: [
            // Boots (only one variant)
            'createnuclear:anti_radiation_boots',
            // White
            'createnuclear:white_anti_radiation_helmet',
            'createnuclear:white_anti_radiation_chestplate',
            'createnuclear:white_anti_radiation_leggings',
            // Orange
            'createnuclear:orange_anti_radiation_helmet',
            'createnuclear:orange_anti_radiation_chestplate',
            'createnuclear:orange_anti_radiation_leggings',
            // Magenta
            'createnuclear:magenta_anti_radiation_helmet',
            'createnuclear:magenta_anti_radiation_chestplate',
            'createnuclear:magenta_anti_radiation_leggings',
            // Light Blue
            'createnuclear:light_blue_anti_radiation_helmet',
            'createnuclear:light_blue_anti_radiation_chestplate',
            'createnuclear:light_blue_anti_radiation_leggings',
            // Yellow
            'createnuclear:yellow_anti_radiation_helmet',
            'createnuclear:yellow_anti_radiation_chestplate',
            'createnuclear:yellow_anti_radiation_leggings',
            // Green (Lime)
            'createnuclear:green_anti_radiation_helmet',
            'createnuclear:green_anti_radiation_chestplate',
            'createnuclear:green_anti_radiation_leggings',
            // Pink
            'createnuclear:pink_anti_radiation_helmet',
            'createnuclear:pink_anti_radiation_chestplate',
            'createnuclear:pink_anti_radiation_leggings',
            // Dark Gray
            'createnuclear:dark_gray_anti_radiation_helmet',
            'createnuclear:dark_gray_anti_radiation_chestplate',
            'createnuclear:dark_gray_anti_radiation_leggings',
            // Light Gray
            'createnuclear:light_gray_anti_radiation_helmet',
            'createnuclear:light_gray_anti_radiation_chestplate',
            'createnuclear:light_gray_anti_radiation_leggings',
            // Cyan
            'createnuclear:cyan_anti_radiation_helmet',
            'createnuclear:cyan_anti_radiation_chestplate',
            'createnuclear:cyan_anti_radiation_leggings',
            // Purple
            'createnuclear:purple_anti_radiation_helmet',
            'createnuclear:purple_anti_radiation_chestplate',
            'createnuclear:purple_anti_radiation_leggings',
            // Blue
            'createnuclear:blue_anti_radiation_helmet',
            'createnuclear:blue_anti_radiation_chestplate',
            'createnuclear:blue_anti_radiation_leggings',
            // Brown
            'createnuclear:brown_anti_radiation_helmet',
            'createnuclear:brown_anti_radiation_chestplate',
            'createnuclear:brown_anti_radiation_leggings',
            // Red
            'createnuclear:red_anti_radiation_helmet',
            'createnuclear:red_anti_radiation_chestplate',
            'createnuclear:red_anti_radiation_leggings',
            // Black
            'createnuclear:black_anti_radiation_helmet',
            'createnuclear:black_anti_radiation_chestplate',
            'createnuclear:black_anti_radiation_leggings'
        ]
    },

    // ============================================
    // CYBERSPACE - Progression Chain
    // ============================================

    // 7F7962941AE1C511 - Machine Casing Block (deps: mechanical crafters 7BEDBFD13BF166F6)
    'VIRTUAL_MACHINE_CASING': {
        deps: ['7BEDBFD13BF166F6'],
        items: ['cyberspace:machine_casing_block']
    },

    // Terminal Block (deps: machine casing quest 7F7962941AE1C511)
    'VIRTUAL_TERMINAL_BLOCK': {
        deps: ['7F7962941AE1C511'],
        items: ['cyberspace:terminal_block']
    },

    // ============================================
    // AIRCRAFT - Progression Chain
    // ============================================

    // 082B87D9A513747E - Biplane (deps: cardboard armor 49B5B326035ED365)
    'VIRTUAL_BIPLANE': {
        deps: ['49B5B326035ED365'],
        items: ['immersive_aircraft:biplane']
    },

    // Man of Many Planes mod items (deps: biplane quest 082B87D9A513747E)
    'VIRTUAL_MAN_OF_MANY_PLANES': {
        deps: ['082B87D9A513747E'],
        items: [
            'man_of_many_planes:scarlet_biplane',
            'man_of_many_planes:steel_biplane',
            'man_of_many_planes:gilded_biplane',
            'man_of_many_planes:ar2',
            'man_of_many_planes:cargo_plane',
            'man_of_many_planes:seaplane',
            'man_of_many_planes:bomber',
            'man_of_many_planes:fighter',
            'man_of_many_planes:helicopter',
            'man_of_many_planes:jet',
            'man_of_many_planes:tiltrotor'
        ]
    },

    // ============================================
    // ENCHANTING / SPELLBOOKS - Progression Chain
    // ============================================

    // 76EBCF4270FC764C - Enchanting Table (deps: enchanted books quest 64F764A8FD782673)
    'VIRTUAL_ENCHANTING_TABLE': {
        deps: ['64F764A8FD782673'],
        items: ['minecraft:enchanting_table']
    },

    // 1E85356ED0C79D9C - Enchanting Infuser (deps: enchanting table quest 76EBCF4270FC764C)
    'VIRTUAL_ENCHANTING_INFUSER': {
        deps: ['76EBCF4270FC764C'],
        items: ['enchantinginfuser:enchanting_infuser']
    },

    // 3587E56F50EF562D - Disenchanting Table (deps: enchanting table quest 76EBCF4270FC764C)
    'VIRTUAL_DISENCHANTING_TABLE': {
        deps: ['76EBCF4270FC764C'],
        items: ['disenchanting_table:disenchanting_table']
    },

    // 4FCE2D2F48A6C0D0 - Gold Spell Book (deps: infernal dragon kill 4633843F83C846AD)
    'VIRTUAL_GOLD_SPELL_BOOK': {
        deps: ['4633843F83C846AD'],
        items: ['irons_spellbooks:gold_spell_book']
    },

    // 1527F5A9BA002083 - Diamond Spell Book (deps: 404093B4C76B5D07 + gold spell book 4FCE2D2F48A6C0D0)
    'VIRTUAL_DIAMOND_SPELL_BOOK': {
        deps: ['404093B4C76B5D07', '4FCE2D2F48A6C0D0'],
        items: ['irons_spellbooks:diamond_spell_book']
    },

    // Too Many Bows - Ironclad Bow (deps: tower key tidal bow 6F66E95793BA0B29)
    'VIRTUAL_IRONCLAD_BOW': {
        deps: ['6F66E95793BA0B29'],
        items: ['too_many_bows:ironclad_bow']
    },

    // ============================================
    // IRON'S SPELLBOOKS - Crafting Stations Chain
    // ============================================

    // 7496A76268E1C945 - Inscription Table (deps: tower key obsidian claymore 3E62D4148A332755)
    'VIRTUAL_INSCRIPTION_TABLE': {
        deps: ['3E62D4148A332755'],
        items: ['irons_spellbooks:inscription_table']
    },

    // 5481D05951A5F6A7 - Arcane Anvil (deps: inscription table 7496A76268E1C945)
    'VIRTUAL_ARCANE_ANVIL': {
        deps: ['7496A76268E1C945'],
        items: ['irons_spellbooks:arcane_anvil']
    },

    // 6AB3AEA78B0C5B57 - Alchemist Cauldron (deps: inscription table 7496A76268E1C945)
    'VIRTUAL_ALCHEMIST_CAULDRON': {
        deps: ['7496A76268E1C945'],
        items: ['irons_spellbooks:alchemist_cauldron']
    },

    // 13172B7992BC01EC - Scroll Forge (deps: inscription table 7496A76268E1C945)
    'VIRTUAL_SCROLL_FORGE': {
        deps: ['7496A76268E1C945'],
        items: ['irons_spellbooks:scroll_forge']
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

    // CORREÇÃO: Removendo a inclusão da própria quest
    // Quests de craft/obtenção criam um ciclo vicioso se forem dependências para o item que pedem
    // Apenas as dependências anteriores (prerequisites) devem bloquear o craft
    /*
    if (!questId.startsWith('VIRTUAL')) {
        if (deps.indexOf(questId) === -1) {
            deps.push(questId)
        }
    }
    */

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

        // 1. Verificar override manual (persistentData)
        if (player.persistentData && player.persistentData.forced_quests) {
            var forced = player.persistentData.forced_quests
            for (var i = 0; i < forced.length; i++) {
                if (forced[i] == questIdHex) return true
            }
        }

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

        // Obter team data do jogador
        var playerUUID = player.uuid
        var teamData = null

        // Tentar obter via UUID direto (funciona para offline mode também)
        try {
            teamData = questFile.getNullableTeamData(playerUUID)
        } catch (e1) { }

        // Fallback para getTeamData se null
        if (!teamData) {
            try {
                teamData = questFile.getTeamData(playerUUID)
            } catch (e2) { }
        }

        if (!teamData) {
            // Última tentativa: iterar todos os dados
            try {
                var allData = questFile.getAllData()
                if (allData) {
                    var iterator = allData.iterator()
                    while (iterator.hasNext()) {
                        var data = iterator.next()
                        if (data && data.getPlayerId && data.getPlayerId().equals(playerUUID)) {
                            teamData = data
                            break
                        }
                    }
                }
            } catch (e3) { }
        }

        if (!teamData) {
            return false
        }

        // Verificar se a quest está completa
        var completed = false

        try {
            completed = teamData.isCompleted(quest)
        } catch (e) { }

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
        if (depsCompleted) {
            canCraft = true
            break
        }
    }

    if (!canCraft) {
        // ============================================
        // NOVO COMPORTAMENTO: Devolver ingredientes
        // ============================================

        // Captura os ingredientes da matriz de craft
        // NOTA: O evento crafted dispara APÓS consumo, então capturamos o que resta
        // e adicionamos +1 para compensar o item consumido
        var ingredientsToReturn = []
        try {
            var matrix = event.inventory
            if (matrix) {
                // Tenta obter o tamanho da matriz
                var matrixSize = 10 // Default: tenta até 10 slots (cobre 3x3 + resultado)
                try {
                    if (typeof matrix.getContainerSize === 'function') {
                        matrixSize = matrix.getContainerSize()
                    } else if (typeof matrix.size === 'function') {
                        matrixSize = matrix.size()
                    } else if (matrix.containerSize) {
                        matrixSize = matrix.containerSize
                    }
                } catch (e) { /* usa default */ }

                // Percorre slots da matriz de craft
                for (var slot = 0; slot < matrixSize; slot++) {
                    try {
                        var slotItem = null
                        // Tenta diferentes métodos para obter o item
                        if (typeof matrix.get === 'function') {
                            slotItem = matrix.get(slot)
                        } else if (typeof matrix.getItem === 'function') {
                            slotItem = matrix.getItem(slot)
                        } else if (typeof matrix.getStackInSlot === 'function') {
                            slotItem = matrix.getStackInSlot(slot)
                        }

                        if (slotItem && !slotItem.isEmpty()) {
                            // Copia o item e adiciona 1 (para compensar o consumido)
                            var itemCopy = slotItem.copy()
                            itemCopy.setCount(slotItem.getCount() + 1)
                            ingredientsToReturn.push(itemCopy)
                        }
                    } catch (slotError) {
                        // Ignora erros de slots individuais
                    }
                }
            }
        } catch (e) {
            console.warn('[Quest Recipes] Could not capture ingredients: ' + e)
        }

        // Anula o resultado
        event.item.setCount(0)

        // Remove item do cursor (mouse) se tiver pego
        var mouseItem = player.getMouseItem()
        if (mouseItem && mouseItem.getId() == itemId) {
            player.setMouseItem('air')
        }

        // Remove do inventário se tiver passado (Shift-Click exploit)
        player.inventory.clear(itemId)

        // Devolve os ingredientes ao jogador
        for (var i = 0; i < ingredientsToReturn.length; i++) {
            try {
                player.give(ingredientsToReturn[i])
            } catch (e) {
                console.warn('[Quest Recipes] Could not return ingredient: ' + e)
            }
        }

        // Fecha o menu para forçar resync
        player.closeMenu()

        // Proteção extra: agendar limpeza no próximo tick
        event.server.scheduleInTicks(1, function (c) {
            player.inventory.clear(itemId)
        })

        player.tell(Text.of('§c[Bloqueado] §fComplete as quests anteriores para desbloquear este item!'))
        player.tell(Text.of('§a[Info] §fSeus ingredientes foram devolvidos.'))

        // Mostrar quais quests faltam (apenas primeira incompleta para não poluir)
        var shownQuest = false
        for (var i = 0; i < depsList.length && !shownQuest; i++) {
            for (var j = 0; j < depsList[i].length; j++) {
                var questId = depsList[i][j]
                var completed = isQuestCompleted(player, questId)
                if (!completed) {
                    player.tell(Text.of('§7  Quest Pendente: ' + questId))
                    shownQuest = true
                    break
                }
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

    var questlockNode = Commands.literal('questlock')
        .requires(function (src) { return src.hasPermission(2) })

    // Subcomando CHECK
    var checkNode = Commands.literal('check')
        .then(Commands.argument('questId', StringArgumentType.word())
            .executes(function (ctx) {
                var player = ctx.getSource().getPlayer()
                var questId = StringArgumentType.getString(ctx, 'questId')
                if (!player) return 0
                var completed = isQuestCompleted(player, questId)
                player.tell(Text.of('§6Quest ' + questId + ': ' + (completed ? '§aCompletada' : '§cNão completada')))
                return 1
            }))

    // Subcomando FORCECOMPLETE
    var forceNode = Commands.literal('forcecomplete')
        .then(Commands.argument('questId', StringArgumentType.word())
            .executes(function (ctx) {
                var player = ctx.getSource().getPlayer()
                var rawQuestId = StringArgumentType.getString(ctx, 'questId')
                var questId = rawQuestId.replace('#', '').toUpperCase()
                if (!player) return 0

                if (!player.persistentData.forced_quests) player.persistentData.forced_quests = []

                var alreadyForced = false
                player.persistentData.forced_quests.forEach(function (id) {
                    if (id == questId) alreadyForced = true
                })

                if (!alreadyForced) {
                    player.persistentData.forced_quests.push(questId)
                    player.tell(Text.of('§a[Sucesso] Quest ' + questId + ' forçada como completa!'))
                } else {
                    player.tell(Text.of('§e[Aviso] Quest ' + questId + ' já estava na lista de forçadas.'))
                }
                return 1
            }))

    // Subcomando ITEM (debug)
    var itemNode = Commands.literal('item')
        .then(Commands.argument('itemId', StringArgumentType.greedyString())
            .executes(function (ctx) {
                var player = ctx.getSource().getPlayer()
                if (!player) return 0

                var itemId = StringArgumentType.getString(ctx, 'itemId')
                var deps = ITEM_TO_DEPS[itemId]

                if (!deps) {
                    player.tell(Text.of('§7Item ' + itemId + ' não tem restrições.'))
                    return 1
                }

                player.tell(Text.of('§6Dependências de ' + itemId + ':'))
                // deps é array de arrays (CNF)
                for (var i = 0; i < deps.length; i++) {
                    var group = deps[i]
                    player.tell(Text.of('§eGrupo ' + (i + 1) + ':'))
                    for (var j = 0; j < group.length; j++) {
                        var qId = group[j]
                        var completed = isQuestCompleted(player, qId)
                        player.tell(Text.of((completed ? '§a [x] ' : '§c [ ] ') + qId))
                    }
                }

                return 1
            }))

    // Registrar subcomandos
    questlockNode.then(checkNode)
    questlockNode.then(forceNode)
    questlockNode.then(itemNode)

    event.register(questlockNode)

    console.info('[Quest Recipes] System loaded with ' + Object.keys(QUEST_DATA).length + ' quest entries')
    console.info('[Quest Recipes] Total unique items tracked: ~' + totalItems)
})

// ============================================
// RECIPE REMOVAL - Items that cannot be crafted at all
// ============================================
// Crystal Chronicles items - only obtainable as quest rewards
ServerEvents.recipes(event => {
    // Remove all recipes from crystal_chronicles mod
    event.remove({ mod: 'crystal_chronicles' })
    console.info('[Quest Recipes] Removed all crystal_chronicles recipes - items only available as quest rewards')

    // Remove all recipes from too_many_bows mod EXCEPT ironclad_bow (which is quest-locked)
    event.remove({ mod: 'too_many_bows', not: { output: 'too_many_bows:ironclad_bow' } })
    console.info('[Quest Recipes] Removed too_many_bows recipes (except ironclad_bow) - items only available as quest rewards')

    // Remove all recipes from knightquest mod
    event.remove({ mod: 'knightquest' })
    console.info('[Quest Recipes] Removed all knightquest recipes - items only available as quest rewards')
})

// ============================================
// AUTO-UNLOCK LISTENER
// ============================================

FTBQuestsEvents.completed(function (event) {
    var player = event.player
    if (!player) return

    // Tenta obter o ID em string (Hex)
    var quest = event.quest
    var questId = quest.getCodeString()

    if (!questId) return

    questId = questId.toUpperCase()

    // Inicializa dados se necessário
    if (!player.persistentData.forced_quests) {
        player.persistentData.forced_quests = []
    }

    // Verifica se já está salvo
    var alreadySaved = false
    var forced = player.persistentData.forced_quests
    for (var i = 0; i < forced.length; i++) {
        if (forced[i] == questId) {
            alreadySaved = true
            break
        }
    }

    // Salva se não estiver
    if (!alreadySaved) {
        player.persistentData.forced_quests.push(questId)
        console.info('[Quest Recipes] Auto-cached completion for quest: ' + questId + ' (' + player.getName().getString() + ')')
        // Opcional: Avisar o player que o sistema registrou (pode ser spammy, deixarei apenas log por enquanto)
    }
})
