// Priority: 0
// File: kubejs/server_scripts/gloomy_sculk_protection.js
// Gloomy Sculk can only be broken with a Golden Hoe

BlockEvents.broken(function (event) {
    var block = event.block
    if (!block) return

    // Only affect gloomy_sculk
    if (block.id !== 'deeperdarker:gloomy_sculk') return

    var player = event.player
    if (!player) return

    // Allow breaking in creative mode
    if (player.isCreative()) return

    // In survival, require golden hoe
    var mainHand = player.mainHandItem
    var isGoldenHoe = mainHand && mainHand.id === 'minecraft:golden_hoe'

    if (!isGoldenHoe) {
        // Cancel the block break
        event.cancel()
    }
})
