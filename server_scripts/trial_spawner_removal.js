// Priority: 1000
// Disable Trial Spawners and Vaults - Prevents MobControl crash
// Must detect spawners BEFORE player gets within activation range (~8 blocks)

// Remove on placement
BlockEvents.placed(event => {
    var blockId = event.block.id
    if (blockId === 'minecraft:trial_spawner' || blockId === 'minecraft:vault') {
        event.block.set('minecraft:air')
    }
})

// Progressive scan - checks different slices each tick to cover full area
// This spreads the work across multiple ticks instead of all at once
PlayerEvents.tick(event => {
    var player = event.player
    var pos = player.blockPosition()

    // Trial Chambers generate between Y -40 and 30
    if (pos.y > 30) return

    // 50% chance each tick (equivalent to every ~2 ticks on average)
    if (Math.random() > 0.5) return
    var tickCount = event.server.tickCount

    var level = player.level
    var range = 16  // Reduced range - spawners activate at ~8 blocks, so 16 gives buffer
    var sliceIndex = (tickCount / 2) % (range * 2 + 1)
    var x = sliceIndex - range

    // Step by 3 on Z and 2 on Y to reduce checks while still catching spawners (they're 1x2x1)
    for (var z = -range; z <= range; z += 3) {
        for (var y = -5; y <= 5; y += 2) {
            var checkPos = pos.offset(x, y, z)
            var blockId = level.getBlock(checkPos).id

            if (blockId === 'minecraft:trial_spawner' || blockId === 'minecraft:vault') {
                level.getBlock(checkPos).set('minecraft:air')
            }
        }
    }
})
