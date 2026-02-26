// Registro de armaduras customizadas
// Priority: 0

// Registrar material de armadura personalizado
StartupEvents.registry('armor_material', event => {
    event.create('syn')
        .durabilityMultiplier(15) // Durabilidade base (multiplicada pelo slot)
        .defense(2, 5, 6, 5) // boots, leggings, chestplate, helmet
        .enchantmentValue(15) // Encantabilidade
        .toughness(0) // Resistência
        .knockbackResistance(0) // Resistência a knockback
        .repairIngredient('minecraft:leather') // Item para reparar
        .equipSound('minecraft:item.armor.equip_leather')
})

// Registrar o chapéu como capacete
StartupEvents.registry('item', event => {
    // Syn Hat - Chapéu customizado como capacete
    event.create('syn_hat', 'helmet')
        .displayName('Chapéu do Mnemosyne')
        .tier('kubejs:syn') // Usar o material de armadura criado
        .maxDamage(165)
        .rarity('uncommon')
})
