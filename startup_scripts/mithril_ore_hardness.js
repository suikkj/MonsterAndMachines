// Priority: 0
// Modifica o Mithril Ore para requerer picareta de diamante e demorar como obsidian

BlockEvents.modification(function (event) {
    event.modify('irons_spellbooks:mithril_ore', function (block) {
        block.destroySpeed = 50  // Mesma hardness que obsidian
        block.explosionResistance = 1200
        block.requiresTool = true  // Requer ferramenta correta
    })

    event.modify('irons_spellbooks:deepslate_mithril_ore', function (block) {
        block.destroySpeed = 50
        block.explosionResistance = 1200
        block.requiresTool = true
    })
})

console.info('[Mithril Ore Startup] Configured: breaks like obsidian, requires tool')
