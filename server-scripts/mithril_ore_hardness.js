// Priority: 0
// Adds mithril ore to netherite tool tier (ou diamante se o mod permitir)

ServerEvents.tags('block', function (event) {
    // Remove de todos os tiers
    event.remove('minecraft:needs_stone_tool', 'irons_spellbooks:mithril_ore')
    event.remove('minecraft:needs_iron_tool', 'irons_spellbooks:mithril_ore')
    event.remove('minecraft:needs_diamond_tool', 'irons_spellbooks:mithril_ore')
    event.remove('minecraft:needs_stone_tool', 'irons_spellbooks:deepslate_mithril_ore')
    event.remove('minecraft:needs_iron_tool', 'irons_spellbooks:deepslate_mithril_ore')
    event.remove('minecraft:needs_diamond_tool', 'irons_spellbooks:deepslate_mithril_ore')

    // NeoForge tier tags - remove de netherite se estiver
    event.remove('neoforge:needs_netherite_tool', 'irons_spellbooks:mithril_ore')
    event.remove('neoforge:needs_netherite_tool', 'irons_spellbooks:deepslate_mithril_ore')

    // Adiciona ao tier de diamante (vanilla)
    event.add('minecraft:needs_diamond_tool', 'irons_spellbooks:mithril_ore')
    event.add('minecraft:needs_diamond_tool', 'irons_spellbooks:deepslate_mithril_ore')

    // Garante que é minerável com picareta
    event.add('minecraft:mineable/pickaxe', 'irons_spellbooks:mithril_ore')
    event.add('minecraft:mineable/pickaxe', 'irons_spellbooks:deepslate_mithril_ore')
})

console.info('[Mithril Ore] Tags configured: needs diamond pickaxe')
