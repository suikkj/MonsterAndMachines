// Priority: 0
// File: kubejs/server_scripts/sculk_machine_disruption.js
// Sculk disrupts nearby machines — machines on or adjacent to sculk are converted to sculk
// This makes sculk a real threat to automation infrastructure

// ============ CONFIGURATION ============
var DISRUPTION_CHECK_INTERVAL = 400    // Check every 20 seconds (400 ticks)
var DISRUPTION_SCAN_RADIUS = 32        // Radius to check around players
var DISRUPTION_PROXIMITY = 2           // How close sculk needs to be to a machine to disrupt it
var DISRUPTION_CHANCE = 0.15           // 15% chance per check to disrupt a vulnerable machine

// Machines that can be disrupted by sculk
var VULNERABLE_MACHINES = {
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
    'create:mechanical_piston': true,
    'create:mechanical_bearing': true,
    'create:mechanical_crafter': true,
    'create:basin': true,
    'create:blaze_burner': true,
    // Create Nuclear
    'createnuclear:reactor_core': true,
    'createnuclear:fuel_rod': true,
    // Immersive Engineering
    'immersiveengineering:crusher': true,
    'immersiveengineering:metal_press': true,
    'immersiveengineering:excavator': true,
    'immersiveengineering:diesel_generator': true,
    'immersiveengineering:garden_cloche': true,
    // Vanilla redstone
    'minecraft:furnace': true,
    'minecraft:blast_furnace': true,
    'minecraft:smoker': true,
    'minecraft:dispenser': true,
    'minecraft:dropper': true,
    'minecraft:hopper': true,
    'minecraft:piston': true,
    'minecraft:sticky_piston': true
}

// Sculk blocks that cause disruption
var SCULK_BLOCKS = {
    'minecraft:sculk': true,
    'minecraft:sculk_vein': true,
    'minecraft:sculk_catalyst': true,
    'minecraft:sculk_sensor': true,
    'minecraft:sculk_shrieker': true
}

// Gold blocks protect machines within this radius
var GOLD_PROTECTION_RADIUS = 3
var GOLD_PROTECTORS = {
    'minecraft:gold_block': true,
    'minecraft:raw_gold_block': true,
    'minecraft:gilded_blackstone': true
}

// ============ HELPER FUNCTIONS ============
function hasSculkNearby(level, x, y, z, radius) {
    for (var dx = -radius; dx <= radius; dx++) {
        for (var dy = -radius; dy <= radius; dy++) {
            for (var dz = -radius; dz <= radius; dz++) {
                var dist = Math.abs(dx) + Math.abs(dy) + Math.abs(dz)
                if (dist > radius) continue

                try {
                    var block = level.getBlock(x + dx, y + dy, z + dz)
                    if (block && SCULK_BLOCKS[block.id]) {
                        return true
                    }
                } catch (e) { }
            }
        }
    }
    return false
}

function hasGoldProtection(level, x, y, z) {
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
    if (currentTick % DISRUPTION_CHECK_INTERVAL !== 0) return

    var server = event.server
    var players = server.playerList.players

    for (var p = 0; p < players.size(); p++) {
        var player = players.get(p)
        if (player.isCreative() || player.isSpectator()) continue

        var level = player.level
        if (level.clientSide) continue

        var dimKey = level.dimension.toString()
        var playerPos = player.blockPosition()

        // Sample random positions to find machines near sculk
        var maxSamples = 30
        var machinesDisrupted = 0

        for (var s = 0; s < maxSamples && machinesDisrupted < 3; s++) {
            var rx = Math.floor((Math.random() * DISRUPTION_SCAN_RADIUS * 2) - DISRUPTION_SCAN_RADIUS)
            var rz = Math.floor((Math.random() * DISRUPTION_SCAN_RADIUS * 2) - DISRUPTION_SCAN_RADIUS)
            var ry = Math.floor((Math.random() * 16) - 8)

            var checkX = playerPos.x + rx
            var checkY = playerPos.y + ry
            var checkZ = playerPos.z + rz

            try {
                var block = level.getBlock(checkX, checkY, checkZ)
                if (!block) continue

                var blockId = block.id

                // Check if it's a vulnerable machine
                if (!VULNERABLE_MACHINES[blockId]) continue

                // Check if sculk is nearby
                if (!hasSculkNearby(level, checkX, checkY, checkZ, DISRUPTION_PROXIMITY)) continue

                // Check if protected by gold
                if (hasGoldProtection(level, checkX, checkY, checkZ)) continue

                // Roll for disruption
                if (Math.random() > DISRUPTION_CHANCE) continue

                // DISRUPT: Convert the machine to sculk!
                block.set('minecraft:sculk')
                machinesDisrupted++

                // Effects
                server.runCommandSilent('execute in ' + dimKey + ' positioned ' + checkX + ' ' + checkY + ' ' + checkZ + ' run particle minecraft:sculk_charge_pop ~ ~0.5 ~ 0.5 0.5 0.5 0.02 15 force')
                server.runCommandSilent('execute in ' + dimKey + ' positioned ' + checkX + ' ' + checkY + ' ' + checkZ + ' run playsound minecraft:block.sculk.spread master @a ~ ~ ~ 1 0.3')

                // Warn nearby players
                server.runCommandSilent('execute in ' + dimKey + ' positioned ' + checkX + ' ' + checkY + ' ' + checkZ + ' run title @a[distance=..32] actionbar {"text":"O sculk consumiu uma máquina próxima!","color":"dark_purple"}')

            } catch (e) { }
        }
    }
})

console.info('[Sculk Machine Disruption] Loaded — sculk will consume machines that are too close')
