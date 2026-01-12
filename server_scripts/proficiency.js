// Priority: 100
// Proficiency System - D&D style proficiency for weapons, armor, and shields
// 
// SISTEMA DE PROFICIÊNCIA POR NOME DE JOGADOR (offline-mode: true)
// - Armas: simples, marciais, e tipos específicos (adagas, foices, etc)
// - Armaduras: leve, média, pesada
// - Escudos: proficiência geral
//
// PENALIDADES:
// - Arma sem proficiência: Weakness máximo
// - Armadura sem proficiência: Remove automaticamente
// - Escudo sem proficiência: Slowness + Mining Fatigue enquanto equipado

// ============================================
// PROFICIÊNCIAS POR JOGADOR (por nickname)
// ============================================
// Adicione as proficiências de cada jogador aqui
// Armas gerais: 'simples', 'marcial'
// Armas específicas: 'adaga', 'foice', 'machado', 'espada', 'espadao', 'katana', 'lanca', 'alabarda', 'glaive', 'rapier', 'maca', 'arco', 'besta'
// Armaduras gerais: 'leve', 'media', 'pesada'
// Escudo: 'escudo'

var PLAYER_PROFICIENCIES = {
    // ==============================
    // JOGADORES - EDITE AQUI
    // ==============================

    'cactian0': {
        armas: [],
        armaduras: [],
        escudo: false
    },

    'Cineraria_': {
        armas: [],
        armaduras: [],
        escudo: false
    },

    'adrielg1': {
        armas: [],
        armaduras: [],
        escudo: false
    },

    'Grixzs': {
        armas: [],
        armaduras: [],
        escudo: false
    },

    'MonoChroma9696': {
        armas: [],
        armaduras: [],
        escudo: false
    },

    'JoooVi_': {
        armas: [],
        armaduras: [],
        escudo: false
    },

    'Merida': {
        armas: [],
        armaduras: [],
        escudo: false
    },

    'Ma4tsu': {
        armas: [],
        armaduras: [],
        escudo: false
    },

    'suikkj': {
        armas: [],
        armaduras: [],
        escudo: false
    },

    'Undy55': {
        armas: ['adaga', 'besta'],
        armaduras: ['leve'],
        escudo: false
    },

    '_Myos_': {
        armas: ['simples', 'rapier', 'besta'],
        armaduras: ['leve', 'media'],
        escudo: true
    },

    'Rafafinha_': {
        armas: [],
        armaduras: [],
        escudo: false
    },

    'LukGojo': {
        armas: [],
        armaduras: [],
        escudo: false
    },

    'Yuna_Lyn': {
        armas: [],
        armaduras: [],
        escudo: false
    },

    'dupcdugamer': {
        armas: [],
        armaduras: [],
        escudo: false
    }
}

// ============================================
// CATEGORIAS DE ARMAS ESPECÍFICAS
// ============================================

var WEAPON_CATEGORIES = {
    // Adagas / Daggers
    'adaga': [
        'block_factorys_bosses:dagger',
        'born_in_chaos_v1:dark_ritual_dagger',
        'born_in_chaos_v1:intoxicating_dagger',
        'simplymore:iron_dagger',
        'simplymore:gold_dagger',
        'simplymore:diamond_dagger',
        'simplymore:netherite_dagger',
        'simplymore:runic_dagger',
        'hazennstuff:frostburn_dagger',
        'eternalnether:cutlass',
        'simplyswords:iron_cutlass',
        'simplyswords:gold_cutlass',
        'simplyswords:diamond_cutlass',
        'simplyswords:netherite_cutlass',
        'simplyswords:runic_cutlass',
        'simplyswords:iron_sai',
        'simplyswords:gold_sai',
        'simplyswords:diamond_sai',
        'simplyswords:netherite_sai',
        'simplyswords:runic_sai'
    ],

    // Foices / Scythes
    'foice': [
        'doggytalents:sussy_sickle',
        'simplyswords:iron_scythe',
        'simplyswords:gold_scythe',
        'simplyswords:diamond_scythe',
        'simplyswords:netherite_scythe',
        'simplyswords:runic_scythe',
        'born_in_chaos_v1:death_scythe',
        'cataclysm:void_scatter_arrow',
        'simplymore:iron_scythe',
        'simplymore:gold_scythe',
        'simplymore:diamond_scythe',
        'simplymore:netherite_scythe',
        'simplymore:runic_scythe'
    ],

    // Machados / Axes
    'machado': [
        'minecraft:wooden_axe',
        'minecraft:stone_axe',
        'minecraft:iron_axe',
        'minecraft:golden_axe',
        'minecraft:diamond_axe',
        'minecraft:netherite_axe',
        'cataclysm:black_steel_axe',
        'knightquest:steel_axe',
        'simplyswords:iron_greataxe',
        'simplyswords:gold_greataxe',
        'simplyswords:diamond_greataxe',
        'simplyswords:netherite_greataxe',
        'simplyswords:runic_greataxe'
    ],

    // Espadas / Swords
    'espada': [
        'minecraft:wooden_sword',
        'minecraft:stone_sword',
        'minecraft:iron_sword',
        'minecraft:golden_sword',
        'minecraft:diamond_sword',
        'minecraft:netherite_sword',
        'ars_nouveau:enchanters_sword',
        'born_in_chaos_v1:sharpened_dark_metal_sword',
        'born_in_chaos_v1:sweet_sword',
        'born_in_chaos_v1:carrot_sword',
        'block_factorys_bosses:warrior_sword',
        'deeperdarker:resonarium_sword',
        'deeperdarker:warden_sword',
        'immersiveengineering:sword_steel',
        'knightquest:paladin_sword',
        'knightquest:steel_sword',
        'cataclysm:black_steel_sword',
        'create:cardboard_sword'
    ],

    // Espadas Grandes / Greatswords
    'espadao': [
        'simplyswords:iron_claymore',
        'simplyswords:gold_claymore',
        'simplyswords:diamond_claymore',
        'simplyswords:netherite_claymore',
        'simplyswords:runic_claymore',
        'simplyswords:iron_grandsword',
        'simplyswords:gold_grandsword',
        'simplyswords:diamond_grandsword',
        'simplyswords:netherite_grandsword',
        'simplyswords:runic_grandsword',
        'simplyswords:iron_twinblade',
        'simplyswords:gold_twinblade',
        'simplyswords:diamond_twinblade',
        'simplyswords:netherite_twinblade',
        'simplyswords:runic_twinblade',
        'simplymore:iron_great_katana',
        'simplymore:gold_great_katana',
        'simplymore:diamond_great_katana',
        'simplymore:netherite_great_katana',
        'simplymore:runic_great_katana'
    ],

    // Katanas
    'katana': [
        'simplyswords:iron_katana',
        'simplyswords:gold_katana',
        'simplyswords:diamond_katana',
        'simplyswords:netherite_katana',
        'simplyswords:runic_katana',
        'simplymore:iron_great_katana',
        'simplymore:gold_great_katana',
        'simplymore:diamond_great_katana',
        'simplymore:netherite_great_katana',
        'simplymore:runic_great_katana'
    ],

    // Lanças / Spears
    'lanca': [
        'cataclysm:coral_spear',
        'cataclysm:ancient_spear',
        'cataclysm:astrape',
        'mowziesmobs:spear',
        'simplyswords:magispear',
        'simplyswords:iron_spear',
        'simplyswords:gold_spear',
        'simplyswords:diamond_spear',
        'simplyswords:netherite_spear',
        'simplyswords:runic_spear'
    ],

    // Alabardas / Halberds
    'alabarda': [
        'simplyswords:iron_halberd',
        'simplyswords:gold_halberd',
        'simplyswords:diamond_halberd',
        'simplyswords:netherite_halberd',
        'simplyswords:runic_halberd',
        'cataclysm:soul_render'
    ],

    // Glaives
    'glaive': [
        'simplyswords:iron_glaive',
        'simplyswords:gold_glaive',
        'simplyswords:diamond_glaive',
        'simplyswords:netherite_glaive',
        'simplyswords:runic_glaive'
    ],

    // Rapiers
    'rapier': [
        'simplyswords:iron_rapier',
        'simplyswords:gold_rapier',
        'simplyswords:diamond_rapier',
        'simplyswords:netherite_rapier',
        'simplyswords:runic_rapier'
    ],

    // Maças / Maces
    'maca': [
        'simplymore:iron_pernach',
        'simplymore:gold_pernach',
        'simplymore:diamond_pernach',
        'simplymore:netherite_pernach',
        'simplymore:runic_pernach',
        'born_in_chaos_v1:nut_hammer',
        'minecraft:mace'
    ],

    // Arcos / Bows
    'arco': [
        'minecraft:bow',
        'too_many_bows:ironclad_bow',
        'cataclysm:void_bow'
    ],

    // Bestas / Crossbows
    'besta': [
        'minecraft:crossbow',
        'irons_spellbooks:autoloader_crossbow'
    ]
}

// ============================================
// ARMAS SIMPLES vs MARCIAIS (categorias gerais)
// ============================================

var SIMPLE_WEAPON_CATEGORIES = ['adaga', 'machado', 'maca', 'lanca', 'arco', 'besta']
var MARTIAL_WEAPON_CATEGORIES = ['espada', 'espadao', 'katana', 'foice', 'alabarda', 'glaive', 'rapier']

// ============================================
// CATEGORIAS DE ARMADURAS
// ============================================

var ARMOR_CATEGORIES = {
    // Armadura Leve
    'leve': [
        'minecraft:leather_helmet',
        'minecraft:leather_chestplate',
        'minecraft:leather_leggings',
        'minecraft:leather_boots',
        'irons_spellbooks:wizard_helmet',
        'irons_spellbooks:wizard_chestplate',
        'irons_spellbooks:wizard_leggings',
        'irons_spellbooks:wizard_boots',
        'ars_nouveau:arcanist_hood',
        'ars_nouveau:arcanist_robes',
        'ars_nouveau:arcanist_leggings',
        'ars_nouveau:arcanist_boots',
        'ars_nouveau:battlemage_hood',
        'ars_nouveau:battlemage_robes',
        'ars_nouveau:battlemage_leggings',
        'ars_nouveau:battlemage_boots',
        'ars_nouveau:sorcerer_hood',
        'ars_nouveau:sorcerer_robes',
        'ars_nouveau:sorcerer_leggings',
        'ars_nouveau:sorcerer_boots'
    ],

    // Armadura Média
    'media': [
        'minecraft:chainmail_helmet',
        'minecraft:chainmail_chestplate',
        'minecraft:chainmail_leggings',
        'minecraft:chainmail_boots',
        'minecraft:iron_helmet',
        'minecraft:iron_chestplate',
        'minecraft:iron_leggings',
        'minecraft:iron_boots'
    ],

    // Armadura Pesada
    'pesada': [
        'minecraft:diamond_helmet',
        'minecraft:diamond_chestplate',
        'minecraft:diamond_leggings',
        'minecraft:diamond_boots',
        'minecraft:netherite_helmet',
        'minecraft:netherite_chestplate',
        'minecraft:netherite_leggings',
        'minecraft:netherite_boots',
        'knightquest:silver_helmet',
        'knightquest:silver_chestplate',
        'knightquest:silver_leggings',
        'knightquest:silver_boots',
        'knightquest:deepslate_helmet',
        'knightquest:deepslate_chestplate',
        'knightquest:deepslate_leggings',
        'knightquest:deepslate_boots',
        'block_factorys_bosses:knight_helmet',
        'block_factorys_bosses:knight_chestplate',
        'block_factorys_bosses:knight_leggings',
        'block_factorys_bosses:knight_boots'
    ]
}

// ============================================
// ESCUDOS
// ============================================

var SHIELDS = [
    'minecraft:shield',
    'supplementaries:timber_frame',
    'cataclysm:bulwark_of_the_flame',
    'cataclysm:void_shield'
]

// ============================================
// FUNÇÕES DE DETECÇÃO
// ============================================

// Retorna a categoria específica da arma (adaga, foice, espada, etc)
function getWeaponCategory(itemId) {
    var categories = Object.keys(WEAPON_CATEGORIES)
    for (var i = 0; i < categories.length; i++) {
        var category = categories[i]
        if (WEAPON_CATEGORIES[category].indexOf(itemId) !== -1) {
            return category
        }
    }
    return null
}

// Retorna o tipo geral da arma (simples ou marcial)
function getWeaponType(itemId) {
    var category = getWeaponCategory(itemId)
    if (!category) return null

    if (SIMPLE_WEAPON_CATEGORIES.indexOf(category) !== -1) return 'simples'
    if (MARTIAL_WEAPON_CATEGORIES.indexOf(category) !== -1) return 'marcial'
    return null
}

// Retorna a categoria da armadura (leve, media, pesada)
function getArmorCategory(itemId) {
    var categories = Object.keys(ARMOR_CATEGORIES)
    for (var i = 0; i < categories.length; i++) {
        var category = categories[i]
        if (ARMOR_CATEGORIES[category].indexOf(itemId) !== -1) {
            return category
        }
    }
    return null
}

function isShield(itemId) {
    return SHIELDS.indexOf(itemId) !== -1
}

// ============================================
// VERIFICAÇÃO DE PROFICIÊNCIA (por nome do jogador)
// ============================================

function getPlayerData(playerName) {
    // Tenta encontrar o jogador exatamente
    if (PLAYER_PROFICIENCIES[playerName]) {
        return PLAYER_PROFICIENCIES[playerName]
    }
    // Retorna dados vazios se jogador não encontrado
    return { armas: [], armaduras: [], escudo: false }
}

function hasWeaponProficiency(playerName, itemId) {
    var playerData = getPlayerData(playerName)
    var armas = playerData.armas || []

    // Verifica proficiência específica primeiro (ex: adaga, foice)
    var category = getWeaponCategory(itemId)
    if (category && armas.indexOf(category) !== -1) {
        return true
    }

    // Verifica proficiência geral (marcial inclui simples)
    var weaponType = getWeaponType(itemId)
    if (weaponType === 'simples' && (armas.indexOf('simples') !== -1 || armas.indexOf('marcial') !== -1)) {
        return true
    }
    if (weaponType === 'marcial' && armas.indexOf('marcial') !== -1) {
        return true
    }

    return false
}

function hasArmorProficiency(playerName, itemId) {
    var playerData = getPlayerData(playerName)
    var armaduras = playerData.armaduras || []

    var armorType = getArmorCategory(itemId)
    if (!armorType) return true // Armadura não registrada, permite

    // Hierarquia: pesada > media > leve
    if (armorType === 'leve') {
        return armaduras.indexOf('leve') !== -1 || armaduras.indexOf('media') !== -1 || armaduras.indexOf('pesada') !== -1
    }
    if (armorType === 'media') {
        return armaduras.indexOf('media') !== -1 || armaduras.indexOf('pesada') !== -1
    }
    if (armorType === 'pesada') {
        return armaduras.indexOf('pesada') !== -1
    }

    return false
}

function hasShieldProficiency(playerName) {
    var playerData = getPlayerData(playerName)
    return playerData.escudo === true
}

// ============================================
// COMANDOS ADMINISTRATIVOS
// ============================================

ServerEvents.commandRegistry(function (event) {
    var Commands = event.commands
    var EntityArgument = Java.loadClass('net.minecraft.commands.arguments.EntityArgument')

    event.register(
        Commands.literal('proficiencia')
            .requires(function (src) { return src.hasPermission(2) })

            // LIST - Listar proficiências de um jogador
            .then(Commands.literal('list')
                .then(Commands.argument('player', EntityArgument.player())
                    .executes(function (ctx) {
                        var target = EntityArgument.getPlayer(ctx, 'player')
                        var playerName = target.getName().getString()
                        var playerData = getPlayerData(playerName)
                        var source = ctx.getSource().getPlayer()

                        if (source) {
                            source.tell(Text.of('§e[Proficiência] §fProficiências de ' + playerName + ':'))

                            // Armas
                            if (playerData.armas && playerData.armas.length > 0) {
                                source.tell(Text.of('§a  Armas: §f' + playerData.armas.join(', ')))
                            } else {
                                source.tell(Text.of('§7  Armas: Nenhuma'))
                            }

                            // Armaduras
                            if (playerData.armaduras && playerData.armaduras.length > 0) {
                                source.tell(Text.of('§a  Armaduras: §f' + playerData.armaduras.join(', ')))
                            } else {
                                source.tell(Text.of('§7  Armaduras: Nenhuma'))
                            }

                            // Escudo
                            if (playerData.escudo) {
                                source.tell(Text.of('§a  Escudo: §fSim'))
                            } else {
                                source.tell(Text.of('§7  Escudo: Não'))
                            }
                        }
                        return 1
                    })
                )
            )

            // RELOAD - Avisa para editar o arquivo
            .then(Commands.literal('reload')
                .executes(function (ctx) {
                    var source = ctx.getSource().getPlayer()
                    if (source) {
                        source.tell(Text.of('§e[Proficiência] §fPara alterar proficiências, edite o arquivo:'))
                        source.tell(Text.of('§7kubejs/server_scripts/proficiency.js'))
                        source.tell(Text.of('§7Modifique a variável PLAYER_PROFICIENCIES'))
                        source.tell(Text.of('§cDepois use /reload para aplicar as mudanças'))
                    }
                    return 1
                })
            )
    )

    console.info('[Proficiency] Commands registered')
})

// ============================================
// PENALIDADE DE ARMA - WEAKNESS QUANDO SEGURA ARMA SEM PROFICIÊNCIA
// ============================================

PlayerEvents.tick(function (event) {
    var player = event.player

    // Verifica a cada segundo (20 ticks)
    if (player.age % 20 !== 0) return

    var mainHand = player.getMainHandItem()
    if (!mainHand || mainHand.isEmpty()) return

    var itemId = mainHand.getId()
    var weaponCategory = getWeaponCategory(itemId)

    if (!weaponCategory) return // Não é uma arma registrada

    var playerName = player.getName().getString()
    var hasProficiency = hasWeaponProficiency(playerName, itemId)

    if (!hasProficiency) {
        // Aplica Weakness 255 por 3 segundos (60 ticks)
        player.potionEffects.add('minecraft:weakness', 60, 255, false, false)
    }
})

// ============================================
// PENALIDADE DE ARMADURA - REMOVE SE NÃO TEM PROFICIÊNCIA
// ============================================

PlayerEvents.tick(function (event) {
    var player = event.player

    // Verifica a cada segundo (20 ticks)
    if (player.age % 20 !== 0) return

    var playerName = player.getName().getString()
    var EquipmentSlot = Java.loadClass('net.minecraft.world.entity.EquipmentSlot')

    var slots = [
        { slot: EquipmentSlot.HEAD, name: 'head' },
        { slot: EquipmentSlot.CHEST, name: 'chest' },
        { slot: EquipmentSlot.LEGS, name: 'legs' },
        { slot: EquipmentSlot.FEET, name: 'feet' }
    ]

    for (var i = 0; i < slots.length; i++) {
        var slotInfo = slots[i]
        var armor = player.getItemBySlot(slotInfo.slot)

        if (!armor || armor.isEmpty()) continue

        var itemId = armor.getId()
        var armorCategory = getArmorCategory(itemId)

        if (!armorCategory) continue // Não é uma armadura registrada

        var hasProficiency = hasArmorProficiency(playerName, itemId)

        if (!hasProficiency) {
            console.info('[Proficiency] Removing armor ' + itemId + ' from ' + playerName)
            player.tell(Text.of('§c[Proficiência] §fVocê não tem proficiência para usar esta armadura!'))
            player.give(armor.copy())
            player.setItemSlot(slotInfo.slot, Item.of('minecraft:air'))
        }
    }
})

// ============================================
// PENALIDADE DE ESCUDO - SLOWNESS + MINING FATIGUE QUANDO EQUIPADO SEM PROFICIÊNCIA
// ============================================

PlayerEvents.tick(function (event) {
    var player = event.player

    // Verifica a cada segundo (20 ticks)
    if (player.age % 20 !== 0) return

    // Verifica offhand (onde escudos normalmente ficam)
    var offhand = player.getOffHandItem()
    if (!offhand || offhand.isEmpty()) return

    var itemId = offhand.getId()
    if (!isShield(itemId)) return

    var playerName = player.getName().getString()
    var hasProficiency = hasShieldProficiency(playerName)

    if (!hasProficiency) {
        // Aplica Slowness e Mining Fatigue enquanto segura o escudo
        player.potionEffects.add('minecraft:slowness', 60, 2, false, false)
        player.potionEffects.add('minecraft:mining_fatigue', 60, 2, false, false)
    }
})

console.info('[Proficiency] System loaded - Using player names for proficiency lookup')
