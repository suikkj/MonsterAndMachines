// Priority: 0
// File: kubejs/server_scripts/sculk_mob_spawning.js
// Dense sculk zones spawn hostile mobs near players
// More sculk = higher spawn chance. Extended exposure can spawn a Warden.

// ============ CONFIGURATION ============
var MOB_SCAN_INTERVAL = 100          // Check every 10 seconds (200 ticks)
var MOB_SCAN_RADIUS = 8              // Radius to count sculk blocks
var SCULK_DENSITY_THRESHOLD = 30     // Minimum sculk blocks to trigger spawning
var BASE_SPAWN_CHANCE = 0.05         // 5% chance per check when threshold met
var WARDEN_TIME_THRESHOLD = 12000    // 10 minutes (12000 ticks) for Warden spawn chance
var WARDEN_SPAWN_CHANCE = 0.02       // 2% chance per check after threshold
var GOLD_BOOTS_REDUCTION = 0.5       // 50% reduction with golden boots

// Mobs that can spawn in sculk zones
var SCULK_MOBS = [
    { id: 'minecraft:silverfish', weight: 40 },
    { id: 'minecraft:endermite', weight: 30 },
    { id: 'minecraft:phantom', weight: 20 },
    { id: 'minecraft:cave_spider', weight: 10 },
    { id: 'deeperdarker:shattered', weight: 10 },
    { id: 'minecraft:warden', weight: 1 }
]

// Calculate total weight for weighted random selection
var TOTAL_WEIGHT = 0
for (var w = 0; w < SCULK_MOBS.length; w++) {
    TOTAL_WEIGHT += SCULK_MOBS[w].weight
}

// ============ HELPER FUNCTIONS ============
function getRandomMob() {
    var roll = Math.random() * TOTAL_WEIGHT
    var cumulative = 0
    for (var i = 0; i < SCULK_MOBS.length; i++) {
        cumulative += SCULK_MOBS[i].weight
        if (roll <= cumulative) {
            return SCULK_MOBS[i].id
        }
    }
    return SCULK_MOBS[0].id
}

function countSculkBlocks(level, centerX, centerY, centerZ, radius) {
    var count = 0
    // Sample random positions instead of full scan for performance
    var samples = 50

    for (var s = 0; s < samples; s++) {
        var rx = Math.floor((Math.random() * MOB_SCAN_RADIUS * 2) - MOB_SCAN_RADIUS)
        var ry = Math.floor((Math.random() * MOB_SCAN_RADIUS * 2) - MOB_SCAN_RADIUS)
        var rz = Math.floor((Math.random() * MOB_SCAN_RADIUS * 2) - MOB_SCAN_RADIUS)

        try {
            var block = level.getBlock(centerX + rx, centerY + ry, centerZ + rz)
            if (block && (block.id === 'minecraft:sculk' || block.id === 'minecraft:sculk_vein')) {
                count++
            }
        } catch (e) { }
    }

    // Extrapolate from samples to estimated total
    var totalBlocks = (radius * 2 + 1) * (radius * 2 + 1) * 7 // approximate volume
    return Math.floor((count / samples) * totalBlocks)
}

function hasGoldenBoots(player) {
    try {
        var armorSlots = player.inventory.armor
        if (armorSlots && armorSlots.get(0)) {
            var boots = armorSlots.get(0)
            if (boots.id === 'minecraft:golden_boots' ||
                boots.id === 'createnuclear:anti_radiation_boots' ||
                boots.id === 'immersive_armors:steampunk_boots') {
                return true
            }
        }
    } catch (e) { }
    return false
}

// ============ MAIN TICK EVENT ============
ServerEvents.tick(function (event) {
    var currentTick = event.server.tickCount
    if (currentTick % MOB_SCAN_INTERVAL !== 0) return

    var server = event.server
    var players = server.playerList.players

    for (var p = 0; p < players.size(); p++) {
        var player = players.get(p)
        if (player.isCreative() || player.isSpectator()) continue

        var level = player.level
        if (level.clientSide) continue

        var pos = player.blockPosition()
        var dimKey = level.dimension.toString()

        // Count sculk density around player
        var density = countSculkBlocks(level, pos.x, pos.y, pos.z, MOB_SCAN_RADIUS)

        if (density < SCULK_DENSITY_THRESHOLD) {
            // Not dense enough — reset time tracker
            player.persistentData.putInt('sculkZoneTime', 0)
            continue
        }

        // Track time in sculk zone
        var timeInZone = player.persistentData.getInt('sculkZoneTime') || 0
        timeInZone += MOB_SCAN_INTERVAL
        player.persistentData.putInt('sculkZoneTime', timeInZone)

        // Calculate spawn chance
        var spawnChance = BASE_SPAWN_CHANCE
        if (hasGoldenBoots(player)) {
            spawnChance *= GOLD_BOOTS_REDUCTION
        }

        // Higher density = higher chance
        var densityMultiplier = Math.min(density / SCULK_DENSITY_THRESHOLD, 3.0)
        spawnChance *= densityMultiplier

        // Roll for regular mob spawn
        if (Math.random() < spawnChance) {
            var mobId = getRandomMob()

            // Spawn at random nearby position
            var spawnX = pos.x + Math.floor((Math.random() * 10) - 5)
            var spawnZ = pos.z + Math.floor((Math.random() * 10) - 5)
            var spawnY = pos.y

            // Find valid spawn position (surface)
            try {
                for (var sy = spawnY + 3; sy >= spawnY - 3; sy--) {
                    var groundBlock = level.getBlock(spawnX, sy, spawnZ)
                    var aboveBlock = level.getBlock(spawnX, sy + 1, spawnZ)
                    if (groundBlock && groundBlock.id !== 'minecraft:air' &&
                        aboveBlock && aboveBlock.id === 'minecraft:air') {
                        spawnY = sy + 1
                        break
                    }
                }

                server.runCommandSilent('execute in ' + dimKey + ' run summon ' + mobId + ' ' + spawnX + ' ' + spawnY + ' ' + spawnZ)

                // Sculk particles at spawn
                server.runCommandSilent('execute in ' + dimKey + ' positioned ' + spawnX + ' ' + spawnY + ' ' + spawnZ + ' run particle minecraft:sculk_charge_pop ~ ~ ~ 0.5 0.5 0.5 0.01 10 force')
            } catch (e) { }
        }

        // Check for Warden spawn (only after extended time)
        if (timeInZone >= WARDEN_TIME_THRESHOLD) {
            var wardenChance = WARDEN_SPAWN_CHANCE
            if (hasGoldenBoots(player)) {
                wardenChance *= GOLD_BOOTS_REDUCTION
            }

            if (Math.random() < wardenChance) {
                var wardenX = pos.x + Math.floor((Math.random() * 16) - 8)
                var wardenZ = pos.z + Math.floor((Math.random() * 16) - 8)

                try {
                    server.runCommandSilent('execute in ' + dimKey + ' run summon minecraft:warden ' + wardenX + ' ' + pos.y + ' ' + wardenZ)
                    server.runCommandSilent('title ' + player.username + ' actionbar {"text":"Você chama a criatura da Profanidade.","color":"dark_red","bold":true}')

                    // Reset timer after Warden spawn
                    player.persistentData.putInt('sculkZoneTime', 0)
                } catch (e) { }
            }
        }
    }
})

console.info('[Sculk Mob Spawning] Loaded — dense sculk zones will spawn hostile mobs')
