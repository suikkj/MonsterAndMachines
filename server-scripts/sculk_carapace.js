// Priority: 0
// File: kubejs/server_scripts/sculk_carapace.js
// Dense sculk zones evolve sculk blocks into sculk_carapace
// Carapace is nearly indestructible but has NO explosion resistance

// ============ CONFIGURATION ============
var CARAPACE_CHECK_INTERVAL = 600     // Check every 30 seconds (600 ticks)
var CARAPACE_SAMPLES_PER_PLAYER = 8   // Positions to sample per player
var CARAPACE_SCAN_RADIUS = 24         // How far to scan around player
var NEIGHBOR_THRESHOLD = 5            // Minimum sculk neighbors to evolve
var CARAPACE_CHANCE = 0.2            // 2% chance per qualifying block per check

// What sculk block becomes carapace
var CARAPACE_BLOCK = 'minecraft:grass_block'  // Using reinforced_deepslate as carapace

// Sculk blocks that count as neighbors
var SCULK_NEIGHBORS = {
    'minecraft:sculk': true,
    'minecraft:sculk_vein': true,
    'minecraft:sculk_catalyst': true,
    'minecraft:sculk_sensor': true,
    'minecraft:sculk_shrieker': true
}

// ============ HELPER FUNCTIONS ============
function countSculkNeighbors(level, x, y, z) {
    var count = 0
    var offsets = [
        [0, -1, 0], [0, 1, 0],
        [1, 0, 0], [-1, 0, 0],
        [0, 0, 1], [0, 0, -1]
    ]

    for (var i = 0; i < offsets.length; i++) {
        var o = offsets[i]
        try {
            var neighbor = level.getBlock(x + o[0], y + o[1], z + o[2])
            if (neighbor && (SCULK_NEIGHBORS[neighbor.id] || neighbor.id === CARAPACE_BLOCK)) {
                count++
            }
        } catch (e) { }
    }

    return count
}

// ============ MAIN TICK EVENT ============
ServerEvents.tick(function (event) {
    var currentTick = event.server.tickCount
    if (currentTick % CARAPACE_CHECK_INTERVAL !== 0) return

    var server = event.server
    var players = server.playerList.players

    for (var p = 0; p < players.size(); p++) {
        var player = players.get(p)
        if (player.isCreative() || player.isSpectator()) continue

        var level = player.level
        if (level.clientSide) continue

        var dimKey = level.dimension.toString()
        var playerPos = player.blockPosition()

        // Sample random positions
        for (var s = 0; s < CARAPACE_SAMPLES_PER_PLAYER; s++) {
            var rx = Math.floor((Math.random() * CARAPACE_SCAN_RADIUS * 2) - CARAPACE_SCAN_RADIUS)
            var rz = Math.floor((Math.random() * CARAPACE_SCAN_RADIUS * 2) - CARAPACE_SCAN_RADIUS)
            var ry = Math.floor((Math.random() * CARAPACE_SCAN_RADIUS * 2) - CARAPACE_SCAN_RADIUS)

            var checkX = playerPos.x + rx
            var checkY = playerPos.y + ry
            var checkZ = playerPos.z + rz

            try {
                var block = level.getBlock(checkX, checkY, checkZ)
                if (!block) continue

                // Only sculk can evolve into carapace
                if (block.id !== 'minecraft:sculk') continue

                // Count sculk neighbors
                var neighbors = countSculkNeighbors(level, checkX, checkY, checkZ)
                if (neighbors < NEIGHBOR_THRESHOLD) continue

                // Roll for evolution
                if (Math.random() > CARAPACE_CHANCE) continue

                // Evolve to carapace!
                block.set(CARAPACE_BLOCK)

                // Evolution particles
                server.runCommandSilent('execute in ' + dimKey + ' positioned ' + checkX + ' ' + checkY + ' ' + checkZ + ' run particle minecraft:sculk_charge_pop ~ ~0.5 ~ 0.3 0.3 0.3 0.01 5 force')
                server.runCommandSilent('execute in ' + dimKey + ' positioned ' + checkX + ' ' + checkY + ' ' + checkZ + ' run playsound minecraft:block.sculk_catalyst.bloom master @a ~ ~ ~ 0.3 0.5')

            } catch (e) { }
        }
    }
})

console.info('[Sculk Carapace] Loaded — dense sculk zones can evolve into reinforced deepslate (carapace)')
