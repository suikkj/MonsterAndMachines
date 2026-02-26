// Priority: 0
// File: kubejs/server_scripts/sculk_spread.js
// Sculk contamination system - CHAIN REACTION: blocks adjacent to sculk get consumed
// OPTIMIZED: Uses load spreading and hashmap lookups to prevent lag

// ============ CONFIGURATION ============
var BASE_CONVERSION_TIME = 3600           // 3 minutes (3600 ticks = 180 seconds)
var GLOOMY_SCULK_CONVERSION_TIME = 36000  // 30 minutes for gloomy_sculk specifically
var SPREAD_CHECK_RADIUS = 48
var MIN_Y = -64
var MAX_Y = 320
var SAFE_ZONE_Y = -12  // Sculk cannot spread below this Y level (underground is safe!)

// LOAD SPREADING CONFIG - Process blocks gradually to prevent lag spikes
var BLOCKS_PER_TICK = 10                   // Max blocks to process per tick
var PLAYER_SCAN_INTERVAL = 20              // Scan every 20 ticks (deterministic)
var SAMPLES_PER_PLAYER = 15                // Random positions to sample per player

// ============ BLOCK LISTS (HASHMAP for O(1) lookup) ============
// Converted from arrays to objects for instant lookup instead of linear search

var IMMUNE_BLOCKS = {
    'minecraft:bedrock': true,
    'minecraft:barrier': true,
    'minecraft:command_block': true,
    'minecraft:chain_command_block': true,
    'minecraft:repeating_command_block': true,
    'minecraft:structure_block': true,
    'minecraft:structure_void': true,
    'minecraft:jigsaw': true,
    'minecraft:end_portal_frame': true,
    'minecraft:end_portal': true,
    'minecraft:nether_portal': true,
    'minecraft:spawner': true,
    'minecraft:sculk': true,
    'minecraft:sculk_vein': true,
    'minecraft:sculk_catalyst': true,
    'minecraft:sculk_sensor': true,
    'minecraft:sculk_shrieker': true,
    'minecraft:gold_block': true,
    'minecraft:gold_ore': true,
    'minecraft:deepslate_gold_ore': true,
    'minecraft:raw_gold_block': true,
    'minecraft:gilded_blackstone': true,
    'deeperdarker:gloomy_sculk': true,
    'mem_sculkapocalypse:void_cleaner': true,
    'mem_sculkapocalypse:void_amplifier': true
}

var SKIP_BLOCKS = {
    'minecraft:air': true,
    'minecraft:cave_air': true,
    'minecraft:void_air': true,
    'minecraft:water': true,
    'minecraft:lava': true
}

// Keywords for container immunity (still needs string search)
var IMMUNE_CONTAINER_KEYWORDS = [
    'chest', 'barrel', 'shulker', 'hopper', 'crate',
    'backpack', 'sophisticatedstorage', 'sophisticatedbackpacks'
]

function isImmune(blockId) {
    if (!blockId) return true
    if (IMMUNE_BLOCKS[blockId]) return true
    // Check for gold in the name (covers modded gold blocks)
    if (blockId.indexOf('gold') !== -1) return true
    return false
}

function shouldSkip(blockId) {
    if (!blockId) return true
    return !!SKIP_BLOCKS[blockId]
}

function isImmuneContainer(blockId) {
    if (!blockId) return false
    var id = blockId.toLowerCase()
    for (var i = 0; i < IMMUNE_CONTAINER_KEYWORDS.length; i++) {
        if (id.indexOf(IMMUNE_CONTAINER_KEYWORDS[i]) !== -1) return true
    }
    return false
}

function isSculk(blockId) {
    return blockId === 'minecraft:sculk' ||
        blockId === 'minecraft:sculk_vein' ||
        blockId === 'minecraft:sculk_catalyst'
}

function isChunkLoaded(level, x, z) {
    try {
        var chunkX = Math.floor(x / 16)
        var chunkZ = Math.floor(z / 16)
        return level.hasChunk(chunkX, chunkZ)
    } catch (e) {
        return false
    }
}

function getBlockSafe(level, x, y, z) {
    if (!isChunkLoaded(level, x, z)) return null
    try {
        return level.getBlock(x, y, z)
    } catch (e) {
        return null
    }
}

// dropContainerContents removed - containers are now immune to sculk

// ============ EMITTER ZONE CHECK ============
// Checks if a sculk_emitter is within radius 12 of a position (blocks spread)
var EMITTER_CHECK_ID = 'mem_sculkapocalypse:void_cleaner'
var EMITTER_CHECK_RADIUS = 12

function isBlockedByEmitter(level, x, y, z) {
    // Scan for emitter blocks in a quick pattern (not full cube scan for performance)
    // Check at several random positions within the radius
    for (var s = 0; s < 12; s++) {
        var rx = Math.floor((Math.random() * EMITTER_CHECK_RADIUS * 2 + 1) - EMITTER_CHECK_RADIUS)
        var ry = Math.floor((Math.random() * EMITTER_CHECK_RADIUS * 2 + 1) - EMITTER_CHECK_RADIUS)
        var rz = Math.floor((Math.random() * EMITTER_CHECK_RADIUS * 2 + 1) - EMITTER_CHECK_RADIUS)
        try {
            var block = level.getBlock(x + rx, y + ry, z + rz)
            if (block && block.id === EMITTER_CHECK_ID) return true
        } catch (e) { }
    }
    return false
}

// ============ SPREADING BLOCKS STORAGE ============
var spreadingBlocks = {}
var spreadDebugStats = { queued: 0, converted: 0, scanned: 0, lastLogTick: 0 }

// ============ QUEUE ADJACENT BLOCKS FOR CONVERSION ============
// This is the KEY function - when a block becomes sculk, 
// we check ALL neighbors and queue them for conversion too!
function queueAdjacentBlocks(level, x, y, z, currentTick, dimKey) {
    var offsets = [
        [0, -1, 0], [0, 1, 0],   // Below, Above
        [1, 0, 0], [-1, 0, 0],   // East, West
        [0, 0, 1], [0, 0, -1]    // South, North
    ]

    var conversionTime = BASE_CONVERSION_TIME

    for (var i = 0; i < offsets.length; i++) {
        var o = offsets[i]
        var nx = x + o[0]
        var ny = y + o[1]
        var nz = z + o[2]

        if (ny < MIN_Y || ny > MAX_Y) continue

        // SAFE ZONE: Sculk cannot spread below Y=24 (underground sanctuary)
        if (ny < SAFE_ZONE_Y) continue

        var block = getBlockSafe(level, nx, ny, nz)
        if (!block) continue

        var blockId = block.id

        // Skip if air, fluid, immune, or already sculk
        if (shouldSkip(blockId)) continue
        if (isImmune(blockId)) continue
        if (isSculk(blockId)) continue
        if (isImmuneContainer(blockId)) continue  // Chests, barrels, backpacks are immune

        // EMITTER ZONE: Don't spread into emitter safe zones
        if (isBlockedByEmitter(level, nx, ny, nz)) continue

        var posKey = dimKey + ':' + nx + ',' + ny + ',' + nz

        // Only add if not already tracking
        if (!spreadingBlocks[posKey]) {
            // Gloomy sculk takes 30 minutes to convert, other blocks 3 minutes
            var blockConversionTime = conversionTime
            if (blockId === 'deeperdarker:gloomy_sculk') {
                blockConversionTime = GLOOMY_SCULK_CONVERSION_TIME
            }

            spreadingBlocks[posKey] = {
                startTick: currentTick,
                conversionTime: blockConversionTime,
                x: nx,
                y: ny,
                z: nz,
                dim: dimKey
            }
        }
    }
}

// ============ MAIN TICK EVENT (LOAD SPREADING) ============
ServerEvents.tick(function (event) {
    var currentTick = event.server.tickCount
    var server = event.server

    // === DEBUG LOG every 5 seconds (100 ticks) ===
    if (currentTick - spreadDebugStats.lastLogTick >= 100) {
        var queueSize = 0
        for (var k in spreadingBlocks) queueSize++
        console.info('[SculkSpread-KJS] Tick=' + currentTick + ' | QueueSize=' + queueSize + ' | Queued=' + spreadDebugStats.queued + ' | Converted=' + spreadDebugStats.converted + ' | Scanned=' + spreadDebugStats.scanned)
        spreadDebugStats.queued = 0
        spreadDebugStats.converted = 0
        spreadDebugStats.scanned = 0
        spreadDebugStats.lastLogTick = currentTick
    }


    // === PART 1: Process pending block conversions (runs EVERY tick) ===
    // Process a small batch every tick to spread the load
    var keysToRemove = []
    var blocksConverted = []
    var blocksProcessed = 0

    // Use for-in instead of Object.keys() to avoid creating a new array every tick
    for (var posKey in spreadingBlocks) {
        if (blocksProcessed >= BLOCKS_PER_TICK) break
        var trackData = spreadingBlocks[posKey]

        if (!trackData) continue

        var elapsed = currentTick - trackData.startTick

        // Only process blocks that have reached their conversion time
        if (elapsed >= trackData.conversionTime) {
            blocksProcessed++

            try {
                var targetLevel = server.getLevel(trackData.dim)
                if (targetLevel) {
                    if (!isChunkLoaded(targetLevel, trackData.x, trackData.z)) {
                        keysToRemove.push(posKey)
                        continue
                    }

                    var block = getBlockSafe(targetLevel, trackData.x, trackData.y, trackData.z)
                    if (block) {
                        var blockId = block.id
                        if (!shouldSkip(blockId) && !isSculk(blockId) && !isImmune(blockId) && !isImmuneContainer(blockId) && !isBlockedByEmitter(targetLevel, trackData.x, trackData.y, trackData.z)) {
                            block.set('minecraft:sculk')
                            spreadDebugStats.converted++

                            // CHAIN REACTION: Queue neighbors for conversion!
                            blocksConverted.push({
                                level: targetLevel,
                                x: trackData.x,
                                y: trackData.y,
                                z: trackData.z,
                                dim: trackData.dim
                            })
                        }
                    }
                }
            } catch (e) { }
            keysToRemove.push(posKey)
        }
    }

    // Remove processed entries
    for (var r = 0; r < keysToRemove.length; r++) {
        delete spreadingBlocks[keysToRemove[r]]
    }

    // CHAIN REACTION: For each block that was converted, queue its neighbors!
    for (var c = 0; c < blocksConverted.length; c++) {
        var conv = blocksConverted[c]
        queueAdjacentBlocks(conv.level, conv.x, conv.y, conv.z, currentTick, conv.dim)
    }

    // === PART 2: Scan for existing sculk (deterministic interval) ===
    if (currentTick % PLAYER_SCAN_INTERVAL === 0) {
        var players = server.playerList.players
        for (var p = 0; p < players.size(); p++) {
            var player = players.get(p)
            var level = player.level
            var dimKey = level.dimension.toString()
            var playerPos = player.blockPosition()

            // Sample random positions around the player
            for (var s = 0; s < SAMPLES_PER_PLAYER; s++) {
                var rx = Math.floor((Math.random() * SPREAD_CHECK_RADIUS * 2) - SPREAD_CHECK_RADIUS)
                var rz = Math.floor((Math.random() * SPREAD_CHECK_RADIUS * 2) - SPREAD_CHECK_RADIUS)
                var ry = Math.floor((Math.random() * 40) - 20)

                var checkX = playerPos.x + rx
                var checkY = playerPos.y + ry
                var checkZ = playerPos.z + rz

                if (checkY < MIN_Y || checkY > MAX_Y) continue
                if (!isChunkLoaded(level, checkX, checkZ)) continue

                // First check if this position has sculk
                var centerBlock = getBlockSafe(level, checkX, checkY, checkZ)
                if (!centerBlock || centerBlock.id !== 'minecraft:sculk') continue

                // Found a sculk block! Queue all its non-sculk neighbors
                spreadDebugStats.scanned++
                queueAdjacentBlocks(level, checkX, checkY, checkZ, currentTick, dimKey)
            }
        }
    }

    // === PART 3: Cleanup stale entries (every 5 minutes) ===
    if (currentTick % 6000 === 0) {
        var staleKeys = []
        for (var staleKey in spreadingBlocks) {
            var staleData = spreadingBlocks[staleKey]
            if (currentTick - staleData.startTick > 36000) {
                staleKeys.push(staleKey)
            }
        }
        for (var sk = 0; sk < staleKeys.length; sk++) {
            delete spreadingBlocks[staleKeys[sk]]
        }
    }
})

// ============ BLOCK PLACEMENT EVENT ============
BlockEvents.placed(function (event) {
    var level = event.level
    if (!level) return

    var pos = event.block.pos
    var placedBlock = event.block
    var placedId = placedBlock.id

    if (shouldSkip(placedId) || isSculk(placedId) || isImmune(placedId)) return
    if (isImmuneContainer(placedId)) return  // Containers are immune to sculk

    // SAFE ZONE: Blocks placed below Y=24 are safe from sculk
    if (pos.y < SAFE_ZONE_Y) return

    // Check if placed adjacent to sculk
    var offsets = [
        [0, -1, 0], [0, 1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]
    ]

    var adjacentToSculk = false
    for (var i = 0; i < offsets.length; i++) {
        var o = offsets[i]
        var checkBlock = getBlockSafe(level, pos.x + o[0], pos.y + o[1], pos.z + o[2])
        if (checkBlock && checkBlock.id === 'minecraft:sculk') {
            adjacentToSculk = true
            break
        }
    }

    if (!adjacentToSculk) return

    var dimKey = level.dimension.toString()
    var posKey = dimKey + ':' + pos.x + ',' + pos.y + ',' + pos.z

    if (!spreadingBlocks[posKey]) {
        var conversionTime = BASE_CONVERSION_TIME
        var currentTick = level.server.tickCount
        spreadingBlocks[posKey] = {
            startTick: currentTick,
            conversionTime: conversionTime,
            x: pos.x,
            y: pos.y,
            z: pos.z,
            dim: dimKey
        }
    }
})

console.info('[SculkSpread-KJS] Script loaded successfully — spread system active')
