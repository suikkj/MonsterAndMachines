// Priority: 0
// File: kubejs/server_scripts/sculk_scrubber.js
// Sculk Emitter — creates a safe zone that converts sculk → gloomy_sculk
// and prevents sculk from spreading in its area (radius 5)
// Works permanently while the block exists (no conversion limit)

// ============ CONFIGURATION ============
var EMITTER_TICK_INTERVAL = 60       // Process every 3 seconds (60 ticks)
var EMITTER_RADIUS = 12              // Safe zone radius
var EMITTER_BLOCK_ID = 'sculktransporting:sculk_emitter'

// Helper: get level from player list (server.getLevel doesn't accept dimension.toString() format)
function getEmitterLevel(server, dimKey) {
    var players = server.playerList.players
    for (var i = 0; i < players.size(); i++) {
        if (players.get(i).level.dimension.toString() === dimKey) {
            return players.get(i).level
        }
    }
    return null
}

// Track active emitters: { "dim:x,y,z": { x, y, z, dim } }
var activeEmitters = {}

// ============ SCULK BLOCKS TO CLEANSE ============
var CLEANSABLE_SCULK = {
    'minecraft:sculk': 'deeperdarker:gloomy_sculk',
    'minecraft:sculk_vein': 'minecraft:air',
    'minecraft:sculk_catalyst': 'deeperdarker:gloomy_sculk',
    'minecraft:sculk_sensor': 'deeperdarker:gloomy_sculk',
    'minecraft:sculk_shrieker': 'deeperdarker:gloomy_sculk'
}

// ============ PLACEMENT EVENT ============
BlockEvents.placed(function (event) {
    var block = event.block
    if (!block || block.id !== EMITTER_BLOCK_ID) return

    var level = event.level
    var pos = block.pos
    var dimKey = level.dimension.toString()
    var key = dimKey + ':' + pos.x + ',' + pos.y + ',' + pos.z

    activeEmitters[key] = {
        x: pos.x,
        y: pos.y,
        z: pos.z,
        dim: dimKey
    }

    if (event.player) {
        event.server.runCommandSilent('title ' + event.player.username + ' actionbar {"text":"Purificador ativado — Zona Segura criada!","color":"aqua"}')
    }
})

// ============ BREAK EVENT ============
BlockEvents.broken(function (event) {
    var block = event.block
    if (!block || block.id !== EMITTER_BLOCK_ID) return

    var level = event.level
    var pos = block.pos
    var dimKey = level.dimension.toString()
    var key = dimKey + ':' + pos.x + ',' + pos.y + ',' + pos.z

    if (activeEmitters[key]) {
        delete activeEmitters[key]
    }
})

// ============ CHECK IF POSITION IS IN EMITTER ZONE ============
// This function is used by sculk_spread.js to prevent spreading
function isInEmitterZone(level, x, y, z) {
    var dimKey = level.dimension.toString()

    for (var key in activeEmitters) {
        var emitter = activeEmitters[key]
        if (emitter.dim !== dimKey) continue

        var dx = Math.abs(x - emitter.x)
        var dy = Math.abs(y - emitter.y)
        var dz = Math.abs(z - emitter.z)

        if (dx <= EMITTER_RADIUS && dy <= EMITTER_RADIUS && dz <= EMITTER_RADIUS) {
            return true
        }
    }
    return false
}

// Note: isInEmitterZone is used internally only
// Other scripts scan for emitter blocks directly

// ============ MAIN TICK EVENT — CONVERT SCULK TO GLOOMY ============
ServerEvents.tick(function (event) {
    var currentTick = event.server.tickCount
    if (currentTick % EMITTER_TICK_INTERVAL !== 0) return

    var server = event.server
    var keysToRemove = []

    for (var key in activeEmitters) {
        var emitter = activeEmitters[key]

        try {
            var level = getEmitterLevel(server, emitter.dim)
            if (!level) {
                keysToRemove.push(key)
                continue
            }

            // Verify emitter block still exists
            var emitterBlock = level.getBlock(emitter.x, emitter.y, emitter.z)
            if (!emitterBlock || emitterBlock.id !== EMITTER_BLOCK_ID) {
                keysToRemove.push(key)
                continue
            }

            // Diamond pattern: process all blocks at current ring distance
            var ring = emitter.currentRing || 1
            var converted = false

            for (var dx = -ring; dx <= ring; dx++) {
                for (var dy = -ring; dy <= ring; dy++) {
                    for (var dz = -ring; dz <= ring; dz++) {
                        // Manhattan distance = diamond shape
                        if (Math.abs(dx) + Math.abs(dy) + Math.abs(dz) !== ring) continue

                        var checkX = emitter.x + dx
                        var checkY = emitter.y + dy
                        var checkZ = emitter.z + dz

                        try {
                            var block = level.getBlock(checkX, checkY, checkZ)
                            if (!block) continue

                            var replacement = CLEANSABLE_SCULK[block.id]
                            if (replacement) {
                                block.set(replacement)
                                converted = true

                                server.runCommandSilent('execute in ' + emitter.dim + ' positioned ' + checkX + ' ' + checkY + ' ' + checkZ + ' run particle minecraft:soul ~ ~0.5 ~ 0.3 0.3 0.3 0.01 3 force')
                            }
                        } catch (ex) { }
                    }
                }
            }

            // Advance to next ring
            emitter.currentRing = (ring >= EMITTER_RADIUS) ? 1 : ring + 1

            // Ambient particles on emitter
            server.runCommandSilent('execute in ' + emitter.dim + ' positioned ' + emitter.x + ' ' + (emitter.y + 1) + ' ' + emitter.z + ' run particle minecraft:enchant ~ ~ ~ 0.3 0.5 0.3 0.5 5 force')

        } catch (e) {
            keysToRemove.push(key)
        }
    }

    // Cleanup
    for (var r = 0; r < keysToRemove.length; r++) {
        delete activeEmitters[keysToRemove[r]]
    }
})

// ============ PERIODIC CLEANUP ============
ServerEvents.tick(function (event) {
    if (event.server.tickCount % 6000 !== 0) return

    var keysToRemove = []
    for (var key in activeEmitters) {
        var emitter = activeEmitters[key]
        try {
            var level = getEmitterLevel(event.server, emitter.dim)
            if (!level) { keysToRemove.push(key); continue }
            var block = level.getBlock(emitter.x, emitter.y, emitter.z)
            if (!block || block.id !== EMITTER_BLOCK_ID) {
                keysToRemove.push(key)
            }
        } catch (e) { keysToRemove.push(key) }
    }
    for (var r = 0; r < keysToRemove.length; r++) {
        delete activeEmitters[keysToRemove[r]]
    }
})

console.info('[Sculk Emitter] Loaded — emitters create safe zones that cleanse sculk and block spread')

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

    if (isInEmitterZone(level, pos.x, pos.y, pos.z)) {
        event.server.runCommandSilent('title ' + player.username + ' actionbar {"text":"✦ Zona Segura — Purificador ativo ✦","color":"aqua","bold":true}')
    }
})
