// Priority: 1000
// Disable Trial Spawners to prevent MobControl crash
// Must remove the blocks because MobControl has a bug with null mobExRule

BlockEvents.placed(event => {
    if (event.block.id === 'minecraft:trial_spawner') {
        event.block.set('minecraft:air')
        console.info('[Trial Spawner Disable] Removed placed trial spawner at ' + event.block.pos)
    }
})

// Remove existing trial spawners when players get close
PlayerEvents.tick(event => {
    // Only check every 40 ticks (2 seconds) - needs to be fast to prevent crash
    if (event.server.tickCount % 40 !== 0) return

    var player = event.player
    var level = player.level
    var pos = player.blockPosition()

    // Search for trial spawners in a 48 block radius (larger range to catch before crash)
    var range = 48
    var step = 2 // Check every 2 blocks for speed

    for (var x = -range; x <= range; x += step) {
        for (var y = -range; y <= range; y += step) {
            for (var z = -range; z <= range; z += step) {
                try {
                    var checkPos = pos.offset(x, y, z)
                    var block = level.getBlock(checkPos)
                    if (block && block.id === 'minecraft:trial_spawner') {
                        block.set('minecraft:air')
                        console.info('[Trial Spawner Disable] Removed trial spawner at ' + checkPos)
                    }
                } catch (e) {
                    // Ignore errors
                }
            }
        }
    }
})

console.info('[Trial Spawner Disable] Loaded - Trial spawners will be removed to prevent MobControl crash')
