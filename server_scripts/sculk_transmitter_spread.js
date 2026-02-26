// Priority: 0
// File: kubejs/server_scripts/sculk_transmitter_spread.js
// Sculk Transmitter accelerates sculk spread in a 5x5 area around it
// When placed, it actively converts nearby blocks to sculk much faster than natural spread

// ============ CONFIGURATION ============
var TRANSMITTER_TICK_INTERVAL = 40     // Process every 2 seconds (40 ticks)
var TRANSMITTER_RADIUS = 12            // Spread zone radius
var TRANSMITTER_BLOCK_ID = 'mem_sculkapocalypse:void_amplifier'
var CONVERSIONS_PER_TICK = 2           // Convert up to 2 blocks per cycle

// Blocks immune to transmitter conversion
var IMMUNE_BLOCKS = {
    'minecraft:bedrock': true,
    'minecraft:barrier': true,
    'minecraft:air': true,
    'minecraft:cave_air': true,
    'minecraft:void_air': true,
    'minecraft:water': true,
    'minecraft:lava': true,
    'minecraft:sculk': true,
    'minecraft:sculk_vein': true,
    'minecraft:sculk_catalyst': true,
    'minecraft:sculk_sensor': true,
    'minecraft:sculk_shrieker': true,
    'minecraft:gold_block': true,
    'minecraft:raw_gold_block': true,
    'minecraft:gilded_blackstone': true,
    'minecraft:reinforced_deepslate': true,
    'deeperdarker:gloomy_sculk': true
}

function isImmuneToTransmitter(blockId) {
    if (!blockId) return true
    if (IMMUNE_BLOCKS[blockId]) return true
    if (blockId.indexOf('gold') !== -1) return true
    // Don't convert other transmitters or emitters
    if (blockId.indexOf('sculktransporting') !== -1) return true
    if (blockId.indexOf('mem_sculkapocalypse') !== -1) return true
    return false
}

// Track active transmitters: { "dim:x,y,z": { x, y, z, dim } }
var activeTransmitters = {}

// ============ PLACEMENT EVENT ============
BlockEvents.placed(function (event) {
    var block = event.block
    if (!block || block.id !== TRANSMITTER_BLOCK_ID) return

    var level = event.level
    var pos = block.pos
    var dimKey = level.dimension.toString()
    var key = dimKey + ':' + pos.x + ',' + pos.y + ',' + pos.z

    activeTransmitters[key] = {
        x: pos.x,
        y: pos.y,
        z: pos.z,
        dim: dimKey
    }

    if (event.player) {
        event.server.runCommandSilent('title ' + event.player.username + ' actionbar {"text":"Nebulizador ativado — Espalhando VALID-71 rapidamente!","color":"dark_purple"}')
    }
})

// ============ BREAK EVENT ============
BlockEvents.broken(function (event) {
    var block = event.block
    if (!block || block.id !== TRANSMITTER_BLOCK_ID) return

    var level = event.level
    var pos = block.pos
    var dimKey = level.dimension.toString()
    var key = dimKey + ':' + pos.x + ',' + pos.y + ',' + pos.z

    if (activeTransmitters[key]) {
        delete activeTransmitters[key]
    }
})

// ============ MAIN TICK EVENT — ACCELERATED SPREAD ============
ServerEvents.tick(function (event) {
    var currentTick = event.server.tickCount
    if (currentTick % TRANSMITTER_TICK_INTERVAL !== 0) return

    var server = event.server
    var keysToRemove = []

    for (var key in activeTransmitters) {
        var transmitter = activeTransmitters[key]

        try {
            var level = server.getLevel(transmitter.dim)
            if (!level) {
                keysToRemove.push(key)
                continue
            }

            // Verify transmitter still exists
            var tBlock = level.getBlock(transmitter.x, transmitter.y, transmitter.z)
            if (!tBlock || tBlock.id !== TRANSMITTER_BLOCK_ID) {
                keysToRemove.push(key)
                continue
            }

            // Diamond pattern: process all blocks at current ring distance
            var ring = transmitter.currentRing || 1

            for (var dx = -ring; dx <= ring; dx++) {
                for (var dy = -ring; dy <= ring; dy++) {
                    for (var dz = -ring; dz <= ring; dz++) {
                        // Manhattan distance = diamond shape
                        if (Math.abs(dx) + Math.abs(dy) + Math.abs(dz) !== ring) continue

                        // Don't convert center
                        if (dx === 0 && dy === 0 && dz === 0) continue

                        var checkX = transmitter.x + dx
                        var checkY = transmitter.y + dy
                        var checkZ = transmitter.z + dz

                        try {
                            var block = level.getBlock(checkX, checkY, checkZ)
                            if (!block) continue

                            var blockId = block.id
                            if (isImmuneToTransmitter(blockId)) continue

                            block.set('minecraft:sculk')

                            server.runCommandSilent('execute in ' + transmitter.dim + ' positioned ' + checkX + ' ' + checkY + ' ' + checkZ + ' run particle minecraft:sculk_charge_pop ~ ~0.5 ~ 0.2 0.2 0.2 0.01 3 force')
                        } catch (ex) { }
                    }
                }
            }

            // Advance to next ring
            transmitter.currentRing = (ring >= TRANSMITTER_RADIUS) ? 1 : ring + 1

            // Ambient effect on transmitter
            if (currentTick % 80 === 0) {
                server.runCommandSilent('execute in ' + transmitter.dim + ' positioned ' + transmitter.x + ' ' + (transmitter.y + 1) + ' ' + transmitter.z + ' run particle minecraft:sculk_soul ~ ~ ~ 0.3 0.5 0.3 0.01 3 force')
            }

        } catch (e) {
            keysToRemove.push(key)
        }
    }

    // Cleanup
    for (var r = 0; r < keysToRemove.length; r++) {
        delete activeTransmitters[keysToRemove[r]]
    }
})

// ============ PERIODIC CLEANUP ============
ServerEvents.tick(function (event) {
    if (event.server.tickCount % 6000 !== 0) return

    var keysToRemove = []
    for (var key in activeTransmitters) {
        var t = activeTransmitters[key]
        try {
            var level = event.server.getLevel(t.dim)
            if (!level) { keysToRemove.push(key); continue }
            var block = level.getBlock(t.x, t.y, t.z)
            if (!block || block.id !== TRANSMITTER_BLOCK_ID) {
                keysToRemove.push(key)
            }
        } catch (e) { keysToRemove.push(key) }
    }
    for (var r = 0; r < keysToRemove.length; r++) {
        delete activeTransmitters[keysToRemove[r]]
    }
})

// ============ BLOCK PLACEMENT IN TRANSMITTER ZONE ============
// Any block placed in a transmitter zone is immediately converted to sculk
BlockEvents.placed(function (event) {
    var block = event.block
    if (!block) return

    var blockId = block.id

    // Don't convert sculk, air, transmitters, emitters, or gold
    if (isImmuneToTransmitter(blockId)) return
    if (blockId === TRANSMITTER_BLOCK_ID) return

    var level = event.level
    var pos = block.pos
    var dimKey = level.dimension.toString()

    // Check if this position is within any active transmitter's zone
    var inTransmitterZone = false
    for (var key in activeTransmitters) {
        var t = activeTransmitters[key]
        if (t.dim !== dimKey) continue

        var dx = Math.abs(pos.x - t.x)
        var dy = Math.abs(pos.y - t.y)
        var dz = Math.abs(pos.z - t.z)

        if (dx <= TRANSMITTER_RADIUS && dy <= TRANSMITTER_RADIUS && dz <= TRANSMITTER_RADIUS) {
            inTransmitterZone = true
            break
        }
    }

    if (!inTransmitterZone) return

    // Convert placed block to sculk!
    block.set('minecraft:sculk')

    // Particles
    if (event.server) {
        event.server.runCommandSilent('execute in ' + dimKey + ' positioned ' + pos.x + ' ' + pos.y + ' ' + pos.z + ' run particle minecraft:sculk_charge_pop ~ ~0.5 ~ 0.2 0.2 0.2 0.01 5 force')
    }

    // Warn player
    if (event.player) {
        event.server.runCommandSilent('title ' + event.player.username + ' actionbar {"text":"O VALID-71 consumiu o bloco que você colocou!","color":"dark_purple"}')
    }
})

console.info('[Nebulizador] Loaded — transmitters accelerate void spread and consume placed blocks')

// ============ BLINKING ZONE WARNING FOR PLAYERS ============
PlayerEvents.tick(function (event) {
    var player = event.player
    if (!player || player.isCreative() || player.isSpectator()) return

    var currentTick = event.server.tickCount
    // Show text every 40 ticks (2 seconds), hide for 20 ticks = blink effect
    if (currentTick % 60 >= 40) return

    if (currentTick % 20 !== 0) return

    var pos = player.blockPosition()
    var level = player.level
    if (level.clientSide) return
    var dimKey = level.dimension.toString()

    for (var key in activeTransmitters) {
        var t = activeTransmitters[key]
        if (t.dim !== dimKey) continue

        var dx = Math.abs(pos.x - t.x)
        var dy = Math.abs(pos.y - t.y)
        var dz = Math.abs(pos.z - t.z)

        if (dx <= TRANSMITTER_RADIUS && dy <= TRANSMITTER_RADIUS && dz <= TRANSMITTER_RADIUS) {
            event.server.runCommandSilent('title ' + player.username + ' actionbar {"text":"⚠ Zona de Perigo — Nebulizador ativo ⚠","color":"dark_purple","bold":true}')
            return
        }
    }
})
