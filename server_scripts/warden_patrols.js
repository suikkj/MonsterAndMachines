// Priority: 0
// File: kubejs/server_scripts/warden_patrols.js
// Wardens spawn and patrol high-sculk areas, attracted to noise

// ============ CONFIGURATION ============
var WARDEN_CHECK_INTERVAL = 6000     // Every 5 minutes
var SCULK_THRESHOLD = 100            // Sculk blocks needed to spawn warden
var SCAN_RADIUS = 48                 // Radius to count sculk
var MAX_WARDENS_PER_AREA = 1         // Max wardens per zone
var NOISE_ATTRACTION_RADIUS = 64     // How far wardens hear machines

// Storage for warden spawn zones
var wardenZones = {}

// ============ HELPER FUNCTIONS ============
function countSculkBlocks(level, centerPos, radius) {
    var count = 0

    for (var x = -radius; x <= radius; x += 3) {
        for (var z = -radius; z <= radius; z += 3) {
            for (var y = -16; y <= 16; y += 3) {
                var pos = centerPos.offset(x, y, z)
                var blockId = level.getBlock(pos).id

                if (blockId === 'minecraft:sculk' ||
                    blockId === 'minecraft:sculk_vein' ||
                    blockId === 'minecraft:sculk_catalyst') {
                    count++
                }
            }
        }
    }

    return count
}

function hasWardenNearby(level, pos, radius) {
    // KubeJS doesn't have AABB.of() - use a simpler approach
    // Check for wardens by iterating loaded entities near the position
    try {
        // Use server command to check for wardens
        var result = level.server.runCommandSilent(
            'execute if entity @e[type=minecraft:warden,distance=..' + radius + ',x=' + pos.x + ',y=' + pos.y + ',z=' + pos.z + ']'
        )
        return result > 0
    } catch (e) {
        return false
    }
}

// ============ WARDEN PATROL TICK ============
ServerEvents.tick(function (event) {
    if (event.server.tickCount % WARDEN_CHECK_INTERVAL !== 0) return

    var currentTick = event.server.tickCount

    event.server.playerList.players.forEach(function (player) {
        if (player.isCreative() || player.isSpectator()) return

        var level = player.level
        var dimKey = level.dimension.toString()
        var playerPos = player.blockPosition()

        // Count sculk in area
        var sculkCount = countSculkBlocks(level, playerPos, SCAN_RADIUS)

        // Check if this is a warden-worthy zone
        if (sculkCount >= SCULK_THRESHOLD) {
            var zoneKey = dimKey + ':' + Math.floor(playerPos.x / 64) + ',' + Math.floor(playerPos.z / 64)

            // Check if warden already exists
            if (hasWardenNearby(level, playerPos, SCAN_RADIUS)) {
                return  // Already have a warden
            }

            // Check cooldown for this zone
            if (wardenZones[zoneKey] && currentTick - wardenZones[zoneKey] < 24000) {
                return  // Zone on cooldown (20 minutes)
            }

            // Check if near noisy machines (from machine_attraction.js)
            var nearMachines = false
            if (global.getMachineMultiplier) {
                nearMachines = global.getMachineMultiplier(level, playerPos) > 1.0
            }

            // Higher chance if machines are running
            var spawnChance = nearMachines ? 0.4 : 0.15

            if (Math.random() < spawnChance) {
                // Spawn warden!
                try {
                    // Find a valid spawn position
                    var spawnX = playerPos.x + (Math.random() * 32) - 16
                    var spawnZ = playerPos.z + (Math.random() * 32) - 16
                    var spawnY = playerPos.y

                    // Spawn the warden
                    level.server.runCommandSilent(
                        'summon minecraft:warden ' + spawnX + ' ' + spawnY + ' ' + spawnZ
                    )

                    // Record spawn
                    wardenZones[zoneKey] = currentTick

                    // Warn player
                    player.tell(Text.darkRed('☠ Algo antigo desperta nas profundezas do Vazio...'))
                    player.tell(Text.red('O GUARDIÃO SENTE SUA PRESENÇA.'))

                } catch (e) {
                    // Spawn failed, ignore
                }
            }
        }
    })

    // Cleanup old zones
    for (var key in wardenZones) {
        if (currentTick - wardenZones[key] > 72000) {  // 1 hour
            delete wardenZones[key]
        }
    }
})

// ============ MACHINE NOISE ATTRACTS WARDENS ============
// When machines are running, wardens in the area are drawn to them
// Note: This is a simplified version - wardens will naturally hear vibrations
// The warden spawn mechanic above is the main mechanic
