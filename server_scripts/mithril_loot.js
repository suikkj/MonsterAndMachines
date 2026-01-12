// Priority: 0
// Mithril Ore - Drop imediato quando quebrado com picareta de diamante ou melhor

// Usar evento de bloco quebrado para drop instantâneo
BlockEvents.broken(function (event) {
    var block = event.block
    var blockId = block.id

    // Verifica se é mithril ore
    if (blockId !== 'irons_spellbooks:mithril_ore' && blockId !== 'irons_spellbooks:deepslate_mithril_ore') {
        return
    }

    var player = event.player
    if (!player) return

    // Verifica a ferramenta
    var tool = player.mainHandItem
    if (!tool || tool.isEmpty()) return

    var toolId = tool.getId()

    // Aceita picareta de diamante ou netherite
    var isValidTool = toolId === 'minecraft:diamond_pickaxe' ||
        toolId === 'minecraft:netherite_pickaxe' ||
        toolId.indexOf('diamond_pickaxe') !== -1 ||
        toolId.indexOf('netherite_pickaxe') !== -1

    if (isValidTool) {
        // Dropa o minério imediatamente
        block.popItem('irons_spellbooks:raw_mithril')
    }
})

console.info('[Mithril Loot] Configured: instant drop with diamond/netherite pickaxe')
