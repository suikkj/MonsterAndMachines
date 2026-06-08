// Priority: 0
// File: kubejs/server_scripts/machine_attraction.js
// Create machines and noisy blocks accelerate sculk spread nearby

// ============ CONFIGURATION ============
var MACHINE_CHECK_INTERVAL = 400     // Check every 20 seconds
var MACHINE_DETECTION_RADIUS = 32    // Radius to check for machines (all axes)
var SPREAD_ACCELERATION = 1.5        // 50% faster spread near machines

// Blocks that are considered "noisy" and attract sculk (hashmap for O(1) lookup)
var NOISY_BLOCKS = {
    // Create machines
    'create:mechanical_mixer': true,
    'create:mechanical_press': true,
    'create:mechanical_saw': true,
    'create:mechanical_drill': true,
    'create:mechanical_harvester': true,
    'create:deployer': true,
    'create:crushing_wheel': true,
    'create:millstone': true,
    'create:encased_fan': true,
    'create:steam_engine': true,
    'create:steam_whistle': true,
    // Create Nuclear
    'createnuclear:reactor_core': true,
    'createnuclear:fuel_rod': true,
    // Immersive Engineering
    'immersiveengineering:crusher': true,
    'immersiveengineering:metal_press': true,
    'immersiveengineering:excavator': true,
    'immersiveengineering:diesel_generator': true,
    // Vanilla noisy blocks
    'minecraft:furnace': true,
    'minecraft:blast_furnace': true,
    'minecraft:smoker': true,
    'minecraft:dispenser': true,
    'minecraft:dropper': true,
    'minecraft:piston': true,
    'minecraft:sticky_piston': true,
    'minecraft:bell': true,
    'minecraft:jukebox': true,
    'minecraft:note_block': true,
    'minecraft:tnt': true
}

// Nuclear blocks have MASSIVE attraction (hashmap for O(1) lookup)
var NUCLEAR_BLOCKS = {
    'createnuclear:reactor_core': true,
    'createnuclear:fuel_rod': true,
    'createnuclear:enriched_fuel_rod': true
}

// Storage for machine locations that are active
// Use a local object - will reset on script reload but avoids unmodifiable map issues
var activeMachineZones = {}

// ============ HELPER FUNCTIONS ============
function isNoisyBlock(blockId) {
    if (!blockId) return false
    if (NOISY_BLOCKS[blockId]) return true
    // Check for Create kinetic blocks
    var id = blockId.toLowerCase()
    return id.indexOf('create:') !== -1 &&
        (id.indexOf('mechanical') !== -1 ||
            id.indexOf('motor') !== -1 ||
            id.indexOf('engine') !== -1 ||
            id.indexOf('crusher') !== -1 ||
            id.indexOf('mill') !== -1)
}

function isNuclearBlock(blockId) {
    if (!blockId) return false
    if (NUCLEAR_BLOCKS[blockId]) return true
    return blockId.indexOf('nuclear') !== -1
}

// ============ TICK EVENT - DETECT MACHINES ============
ServerEvents.tick(function (event) {
    var currentTick = event.server.tickCount

    // For each online player, check for nearby machines
    event.server.playerList.players.forEach(function (player) {
        if (player.isCreative() || player.isSpectator()) return

        // Distribute load using player ID offset
        var playerId = Math.abs(player.uuid.hashCode()) % MACHINE_CHECK_INTERVAL
        if ((currentTick + playerId) % MACHINE_CHECK_INTERVAL !== 0) return

        var level = player.level
        var dimKey = level.dimension.toString()
        var playerPos = player.blockPosition()

        var machinesFound = 0
        var nuclearFound = false

        // Scan for noisy blocks
        // Optimized: step increased from 4 to 8 for better performance
        for (var x = -MACHINE_DETECTION_RADIUS; x <= MACHINE_DETECTION_RADIUS && machinesFound < 10; x += 8) {
            for (var z = -MACHINE_DETECTION_RADIUS; z <= MACHINE_DETECTION_RADIUS && machinesFound < 10; z += 8) {
                for (var y = -MACHINE_DETECTION_RADIUS; y <= MACHINE_DETECTION_RADIUS && machinesFound < 10; y += 8) {
                    var checkPos = playerPos.offset(x, y, z)
                    var blockId = level.getBlock(checkPos).id

                    if (isNuclearBlock(blockId)) {
                        nuclearFound = true
                        machinesFound += 3  // Nuclear counts as 3 machines
                    } else if (isNoisyBlock(blockId)) {
                        machinesFound++
                    }
                }
            }
        }

        // Store machine density for this area
        var zoneKey = dimKey + ':' + Math.floor(playerPos.x / 64) + ',' + Math.floor(playerPos.z / 64)

        if (machinesFound > 0) {
            activeMachineZones[zoneKey] = {
                tick: currentTick,
                machines: machinesFound,
                nuclear: nuclearFound,
                x: playerPos.x,
                z: playerPos.z,
                dim: dimKey
            }
            // Silent operation - no warning messages
        }
    })

    // Cleanup old zones
    for (var key in activeMachineZones) {
        if (currentTick - activeMachineZones[key].tick > 6000) {
            delete activeMachineZones[key]
        }
    }
})

// getMachineMultiplier function - kept local due to global object restrictions
// If sculk_spread.js needs this, it should implement its own machine detection
function getMachineMultiplier(level, pos) {
    var dimKey = level.dimension.toString()
    var zoneKey = dimKey + ':' + Math.floor(pos.x / 64) + ',' + Math.floor(pos.z / 64)

    var zone = activeMachineZones[zoneKey]
    if (!zone) return 1.0

    if (zone.nuclear) {
        return 3.0  // Nuclear = 3x speed
    } else if (zone.machines >= 5) {
        return 2.0  // Many machines = 2x speed
    } else if (zone.machines >= 1) {
        return SPREAD_ACCELERATION  // Some machines = 1.5x speed
    }

    return 1.0
}
