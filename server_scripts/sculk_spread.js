// Priority: 0
// File: kubejs/server_scripts/sculk_spread.js
// Sculk contamination system - CHAIN REACTION: blocks adjacent to sculk get consumed
// OPTIMIZED: Uses load spreading to prevent lag spikes

// ============ CONFIGURATION ============
var BASE_CONVERSION_TIME = 3600           // 3 minutes (3600 ticks = 180 seconds)
var GLOOMY_SCULK_CONVERSION_TIME = 36000  // 30 minutes for gloomy_sculk specifically
var SPREAD_CHECK_RADIUS = 48
var MIN_Y = -64
var MAX_Y = 320
var SAFE_ZONE_Y = 0  // Sculk cannot spread below this Y level (underground is safe!)

// LOAD SPREADING CONFIG - Process blocks gradually to prevent lag spikes
var BLOCKS_PER_TICK = 10                   // Max blocks to process per tick
var PLAYER_SCAN_CHANCE = 0.05              // 5% chance each tick (~20 ticks average)
var SAMPLES_PER_PLAYER = 15                // Random positions to sample per player

// ============ BLOCK LISTS ============

var IMMUNE_BLOCKS = [
    'minecraft:bedrock',
    'minecraft:barrier',
    'minecraft:command_block',
    'minecraft:chain_command_block',
    'minecraft:repeating_command_block',
    'minecraft:structure_block',
    'minecraft:structure_void',
    'minecraft:jigsaw',
    'minecraft:end_portal_frame',
    'minecraft:end_portal',
    'minecraft:nether_portal',
    'minecraft:spawner',
    'minecraft:sculk',
    'minecraft:sculk_vein',
    'minecraft:sculk_catalyst',
    'minecraft:sculk_sensor',
    'minecraft:sculk_shrieker',
    'minecraft:gold_block',
    'minecraft:gold_ore',
    'minecraft:deepslate_gold_ore',
    'minecraft:raw_gold_block',
    'minecraft:gilded_blackstone',
    'deeperdarker:gloomy_sculk'
]

var SKIP_BLOCKS = [
    'minecraft:air',
    'minecraft:cave_air',
    'minecraft:void_air',
    'minecraft:water',
    'minecraft:lava'
]

// Containers are now IMMUNE to sculk (not just dropping contents)
var IMMUNE_CONTAINER_KEYWORDS = [
    'chest', 'barrel', 'shulker', 'hopper', 'crate',
    'backpack', 'sophisticatedstorage', 'sophisticatedbackpacks'
]

// ============ HELPER FUNCTIONS ============

function getConversionTime(level) {
    // Always 3 minutes, day or night
    return BASE_CONVERSION_TIME
}

function isImmune(blockId) {
    if (!blockId) return true
    for (var i = 0; i < IMMUNE_BLOCKS.length; i++) {
        if (blockId === IMMUNE_BLOCKS[i]) return true
    }
    if (blockId.toLowerCase().indexOf('gold') !== -1) return true
    return false
}

function shouldSkip(blockId) {
    if (!blockId) return true
    for (var i = 0; i < SKIP_BLOCKS.length; i++) {
        if (blockId === SKIP_BLOCKS[i]) return true
    }
    return false
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

function dropContainerContents(level, pos, block) {
    try {
        var blockEntity = level.getBlockEntity(pos)
        if (blockEntity && blockEntity.inventory) {
            var inv = blockEntity.inventory
            for (var i = 0; i < inv.size(); i++) {
                var stack = inv.getStackInSlot(i)
                if (!stack.isEmpty()) {
                    block.popItem(stack)
                }
            }
        }
    } catch (e) { }
}

// ============ SPREADING BLOCKS STORAGE ============
var spreadingBlocks = {}

// ============ QUEUE ADJACENT BLOCKS FOR CONVERSION ============
// This is the KEY function - when a block becomes sculk, 
// we check ALL neighbors and queue them for conversion too!
function queueAdjacentBlocks(level, x, y, z, currentTick, dimKey) {
    var offsets = [
        [0, -1, 0], [0, 1, 0],   // Below, Above
        [1, 0, 0], [-1, 0, 0],   // East, West
        [0, 0, 1], [0, 0, -1]    // South, North
    ]

    var conversionTime = getConversionTime(level)

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

    // === PART 1: Process pending block conversions (runs EVERY tick) ===
    // Instead of processing ALL blocks every 20 ticks, process a small batch every tick
    var keysToRemove = []
    var blocksConverted = []
    var blocksProcessed = 0

    // Get all keys and sort by start time (oldest first)
    var allKeys = Object.keys(spreadingBlocks)

    for (var i = 0; i < allKeys.length && blocksProcessed < BLOCKS_PER_TICK; i++) {
        var posKey = allKeys[i]
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
                        if (!shouldSkip(blockId) && !isSculk(blockId) && !isImmune(blockId) && !isImmuneContainer(blockId)) {
                            block.set('minecraft:sculk')

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

    // === PART 2: Scan for existing sculk (probabilistic check) ===
    if (Math.random() < PLAYER_SCAN_CHANCE) {
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
        var conversionTime = getConversionTime(level)
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
