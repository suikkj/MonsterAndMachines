// Priority: 0
// File: kubejs/server_scripts/sculk_gloomy_regen.js
// Gloomy sculk regenerates back to regular sculk over time
// Golden blocks within radius 3 prevent regeneration (safe zone)

// ============ CONFIGURATION ============
var GLOOMY_SCAN_INTERVAL = 100    // Scan every 5 seconds (100 ticks)
var SAMPLES_PER_PLAYER = 10       // Random positions to sample per player
var GLOOMY_SCAN_RADIUS = 32       // How far to scan around player
var REGEN_CHANCE = 0.01            // 1% chance per scan per block
var GOLD_PROTECTION_RADIUS = 3    // Gold blocks within this radius prevent regen

// Blocks that count as gold protection
var GOLD_PROTECTORS = {
    'minecraft:gold_block': true,
    'minecraft:raw_gold_block': true,
    'minecraft:gilded_blackstone': true
}

// ============ HELPER FUNCTIONS ============
function hasGoldNearby(level, x, y, z) {
    for (var dx = -GOLD_PROTECTION_RADIUS; dx <= GOLD_PROTECTION_RADIUS; dx++) {
        for (var dy = -GOLD_PROTECTION_RADIUS; dy <= GOLD_PROTECTION_RADIUS; dy++) {
            for (var dz = -GOLD_PROTECTION_RADIUS; dz <= GOLD_PROTECTION_RADIUS; dz++) {
                var dist = Math.abs(dx) + Math.abs(dy) + Math.abs(dz)
                if (dist > GOLD_PROTECTION_RADIUS) continue

                try {
                    var block = level.getBlock(x + dx, y + dy, z + dz)
                    if (block && GOLD_PROTECTORS[block.id]) {
                        return true
                    }
                } catch (e) { }
            }
        }
    }
    return false
}

// ============ MAIN TICK EVENT ============
ServerEvents.tick(function (event) {
    var currentTick = event.server.tickCount
    if (currentTick % GLOOMY_SCAN_INTERVAL !== 0) return

    var server = event.server
    var players = server.playerList.players

    for (var p = 0; p < players.size(); p++) {
        var player = players.get(p)
        if (player.isCreative() || player.isSpectator()) continue

        var level = player.level
        var playerPos = player.blockPosition()

        // Sample random positions around the player
        for (var s = 0; s < SAMPLES_PER_PLAYER; s++) {
            var rx = Math.floor((Math.random() * GLOOMY_SCAN_RADIUS * 2) - GLOOMY_SCAN_RADIUS)
            var rz = Math.floor((Math.random() * GLOOMY_SCAN_RADIUS * 2) - GLOOMY_SCAN_RADIUS)
            var ry = Math.floor((Math.random() * 20) - 10)

            var checkX = playerPos.x + rx
            var checkY = playerPos.y + ry
            var checkZ = playerPos.z + rz

            try {
                var block = level.getBlock(checkX, checkY, checkZ)
                if (!block) continue

                // Check if it's gloomy sculk
                if (block.id !== 'deeperdarker:gloomy_sculk') continue

                // Roll regen chance
                if (Math.random() > REGEN_CHANCE) continue

                // Check for gold protection
                if (hasGoldNearby(level, checkX, checkY, checkZ)) continue

                // Check for emitter safe zone (scan for nearby emitter block)
                var emitterFound = false
                for (var es = 0; es < 8; es++) {
                    var erx = Math.floor((Math.random() * 24 + 1) - 12)
                    var ery = Math.floor((Math.random() * 24 + 1) - 12)
                    var erz = Math.floor((Math.random() * 24 + 1) - 12)
                    try {
                        var eBlock = level.getBlock(checkX + erx, checkY + ery, checkZ + erz)
                        if (eBlock && eBlock.id === 'mem_sculkapocalypse:void_cleaner') { emitterFound = true; break }
                    } catch (e) { }
                }
                if (emitterFound) continue

                // Regenerate! Gloomy sculk → sculk
                block.set('minecraft:sculk')

            } catch (e) { }
        }
    }
})

console.info('[Sculk Gloomy Regen] Loaded — gloomy sculk will regenerate to sculk unless gold is nearby')
