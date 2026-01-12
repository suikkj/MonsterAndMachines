// Priority: 100
// Proficiency Tooltips - Shows proficiency level on items

// ============================================
// TOOLTIPS - Using correct Text API
// ============================================

ItemEvents.modifyTooltips(function (event) {

    // ===== SIMPLE WEAPONS =====

    // Vanilla simple weapons
    event.add('minecraft:wooden_sword', Text.green('⚔ Arma Simples'))
    event.add('minecraft:wooden_axe', Text.green('⚔ Arma Simples'))
    event.add('minecraft:stone_axe', Text.green('⚔ Arma Simples'))
    event.add('minecraft:iron_axe', Text.green('⚔ Arma Simples'))
    event.add('minecraft:golden_axe', Text.green('⚔ Arma Simples'))
    event.add('minecraft:diamond_axe', Text.green('⚔ Arma Simples'))
    event.add('minecraft:netherite_axe', Text.green('⚔ Arma Simples'))
    event.add('minecraft:bow', Text.green('⚔ Arma Simples'))
    event.add('minecraft:crossbow', Text.green('⚔ Arma Simples'))

    // ===== MARTIAL WEAPONS =====

    // Vanilla martial weapons
    event.add('minecraft:stone_sword', Text.red('⚔ Arma Marcial'))
    event.add('minecraft:iron_sword', Text.red('⚔ Arma Marcial'))
    event.add('minecraft:golden_sword', Text.red('⚔ Arma Marcial'))
    event.add('minecraft:diamond_sword', Text.red('⚔ Arma Marcial'))
    event.add('minecraft:netherite_sword', Text.red('⚔ Arma Marcial'))
    event.add('minecraft:trident', Text.red('⚔ Arma Marcial'))
    event.add('minecraft:mace', Text.red('⚔ Arma Marcial'))

    // ===== SHIELDS =====
    event.add('minecraft:shield', Text.blue('🛡 Escudo'))

    // ===== LIGHT ARMOR =====
    event.add('minecraft:chainmail_helmet', Text.yellow('🛡 Armadura Leve'))
    event.add('minecraft:chainmail_chestplate', Text.yellow('🛡 Armadura Leve'))
    event.add('minecraft:chainmail_leggings', Text.yellow('🛡 Armadura Leve'))
    event.add('minecraft:chainmail_boots', Text.yellow('🛡 Armadura Leve'))
    event.add('minecraft:iron_helmet', Text.yellow('🛡 Armadura Leve'))
    event.add('minecraft:iron_chestplate', Text.yellow('🛡 Armadura Leve'))
    event.add('minecraft:iron_leggings', Text.yellow('🛡 Armadura Leve'))
    event.add('minecraft:iron_boots', Text.yellow('🛡 Armadura Leve'))
    event.add('minecraft:golden_helmet', Text.yellow('🛡 Armadura Leve'))
    event.add('minecraft:golden_chestplate', Text.yellow('🛡 Armadura Leve'))
    event.add('minecraft:golden_leggings', Text.yellow('🛡 Armadura Leve'))
    event.add('minecraft:golden_boots', Text.yellow('🛡 Armadura Leve'))
    event.add('minecraft:diamond_helmet', Text.yellow('🛡 Armadura Leve'))
    event.add('minecraft:diamond_chestplate', Text.yellow('🛡 Armadura Leve'))
    event.add('minecraft:diamond_leggings', Text.yellow('🛡 Armadura Leve'))
    event.add('minecraft:diamond_boots', Text.yellow('🛡 Armadura Leve'))

    // ===== MODDED - Using regex for safety =====

    // SimplySwords - simple weapons (cutlass, spear, sai)
    event.add(/simplyswords:.*cutlass.*/, Text.green('⚔ Arma Simples'))
    event.add(/simplyswords:.*_spear/, Text.green('⚔ Arma Simples'))
    event.add(/simplyswords:.*_sai/, Text.green('⚔ Arma Simples'))

    // SimplySwords - martial weapons
    event.add(/simplyswords:.*halberd.*/, Text.red('⚔ Arma Marcial'))
    event.add(/simplyswords:.*claymore.*/, Text.red('⚔ Arma Marcial'))
    event.add(/simplyswords:.*katana.*/, Text.red('⚔ Arma Marcial'))
    event.add(/simplyswords:.*longsword.*/, Text.red('⚔ Arma Marcial'))
    event.add(/simplyswords:.*glaive.*/, Text.red('⚔ Arma Marcial'))
    event.add(/simplyswords:.*lance.*/, Text.red('⚔ Arma Marcial'))
    event.add(/simplyswords:.*greataxe.*/, Text.red('⚔ Arma Marcial'))
    event.add(/simplyswords:.*greathammer.*/, Text.red('⚔ Arma Marcial'))
    event.add(/simplyswords:.*rapier.*/, Text.red('⚔ Arma Marcial'))
    event.add(/simplyswords:.*twinblade.*/, Text.red('⚔ Arma Marcial'))

    // SimplyMore - simple weapons
    event.add(/simplymore:.*dagger.*/, Text.green('⚔ Arma Simples'))
    event.add(/simplymore:.*pernach.*/, Text.green('⚔ Arma Simples'))
    event.add(/simplymore:.*backhand.*/, Text.green('⚔ Arma Simples'))

    // SimplyMore - martial weapons
    event.add(/simplymore:.*khopesh.*/, Text.red('⚔ Arma Marcial'))
    event.add(/simplymore:.*great_katana.*/, Text.red('⚔ Arma Marcial'))

    // Too Many Bows - all martial
    event.add(/too_many_bows:.*/, Text.red('⚔ Arma Marcial'))

    // Cataclysm weapons
    event.add(/cataclysm:.*spear.*/, Text.green('⚔ Arma Simples'))
    event.add(/cataclysm:.*sword.*/, Text.red('⚔ Arma Marcial'))
    event.add(/cataclysm:.*khopesh.*/, Text.red('⚔ Arma Marcial'))
    event.add(/cataclysm:.*bow.*/, Text.red('⚔ Arma Marcial'))
    event.add(/cataclysm:.*shield.*/, Text.blue('🛡 Escudo'))

    // Armor - Medium
    event.add(/hazennstuff:.*helmet.*/, Text.gold('🛡 Armadura Média'))
    event.add(/hazennstuff:.*chestplate.*/, Text.gold('🛡 Armadura Média'))
    event.add(/hazennstuff:.*leggings.*/, Text.gold('🛡 Armadura Média'))
    event.add(/hazennstuff:.*boots.*/, Text.gold('🛡 Armadura Média'))
    event.add(/immersive_armors:.*/, Text.gold('🛡 Armadura Média'))
    event.add(/knightquest:.*helmet.*/, Text.gold('🛡 Armadura Média'))
    event.add(/knightquest:.*chestplate.*/, Text.gold('🛡 Armadura Média'))
    event.add(/knightquest:.*leggings.*/, Text.gold('🛡 Armadura Média'))
    event.add(/knightquest:.*boots.*/, Text.gold('🛡 Armadura Média'))
    event.add(/deeperdarker:resonarium.*/, Text.gold('🛡 Armadura Média'))

    // Armor - Heavy
    event.add(/fantasy_armor:.*/, Text.darkRed('🛡 Armadura Pesada'))
    event.add(/cataclysm:.*helmet.*/, Text.darkRed('🛡 Armadura Pesada'))
    event.add(/cataclysm:.*chestplate.*/, Text.darkRed('🛡 Armadura Pesada'))
    event.add(/cataclysm:.*leggings.*/, Text.darkRed('🛡 Armadura Pesada'))
    event.add(/cataclysm:.*boots.*/, Text.darkRed('🛡 Armadura Pesada'))
})

console.info('[Proficiency Tooltips] Loaded')
