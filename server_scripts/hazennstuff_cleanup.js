// Priority: 1000
// File: kubejs/server_scripts/hazennstuff_cleanup.js
// Replaces missing hazennstuff blocks with air when chunks are loaded
// Uses ServerEvents.tick to scan loaded chunks progressively

// Track cleaned chunks to avoid repeated scanning
var cleanedChunks = {}
var chunksToScan = []
var isScanning = false

// Scan chunks around spawn and players progressively
ServerEvents.tick(function (event) {
    var server = event.server
    var currentTick = server.tickCount

    // Every 20 ticks (1 second), queue new chunks to scan
    if (currentTick % 20 === 0) {
        server.playerList.players.forEach(function (player) {
            var level = player.level
            var pos = player.blockPosition()
            var playerChunkX = Math.floor(pos.x / 16)
            var playerChunkZ = Math.floor(pos.z / 16)
            var dimKey = level.dimension.toString()

            // Queue chunks in a 5x5 area around player
            for (var dx = -2; dx <= 2; dx++) {
                for (var dz = -2; dz <= 2; dz++) {
                    var chunkX = playerChunkX + dx
                    var chunkZ = playerChunkZ + dz
                    var chunkKey = dimKey + ':' + chunkX + ',' + chunkZ

                    if (!cleanedChunks[chunkKey]) {
                        chunksToScan.push({
                            level: level,
                            chunkX: chunkX,
                            chunkZ: chunkZ,
                            key: chunkKey
                        })
                        cleanedChunks[chunkKey] = true
                    }
                }
            }
        })
    }

    // Process 1 chunk per tick to spread load
    if (chunksToScan.length > 0) {
        var chunkData = chunksToScan.shift()
        scanAndCleanChunk(chunkData.level, chunkData.chunkX, chunkData.chunkZ)
    }

    // Cleanup cache every 10 minutes
    if (currentTick % 12000 === 0) {
        var keyCount = Object.keys(cleanedChunks).length
        if (keyCount > 2000) {
            cleanedChunks = {}
            console.info('[Hazennstuff Cleanup] Cache cleared (' + keyCount + ' entries)')
        }
    }
})

function scanAndCleanChunk(level, chunkX, chunkZ) {
    var startX = chunkX * 16
    var startZ = chunkZ * 16
    var blocksReplaced = 0

    // Get Y bounds
    var minY = -64
    var maxY = 320

    try {
        minY = level.minBuildHeight
        maxY = level.maxBuildHeight
    } catch (e) {
        // Use defaults
    }

    // Scan the chunk - step by 2 to reduce load while still catching most blocks
    for (var x = 0; x < 16; x += 2) {
        for (var z = 0; z < 16; z += 2) {
            for (var y = minY; y < maxY; y += 2) {
                try {
                    var block = level.getBlock(startX + x, y, startZ + z)
                    if (!block) continue

                    var blockId = block.id

                    // Check if it's a hazennstuff block
                    if (blockId && blockId.indexOf('hazennstuff:') === 0) {
                        block.set('minecraft:air')
                        blocksReplaced++

                        // Also check adjacent blocks (since we're stepping by 2)
                        for (var ax = -1; ax <= 1; ax++) {
                            for (var az = -1; az <= 1; az++) {
                                for (var ay = -1; ay <= 1; ay++) {
                                    try {
                                        var adjBlock = level.getBlock(startX + x + ax, y + ay, startZ + z + az)
                                        if (adjBlock && adjBlock.id && adjBlock.id.indexOf('hazennstuff:') === 0) {
                                            adjBlock.set('minecraft:air')
                                            blocksReplaced++
                                        }
                                    } catch (e2) { }
                                }
                            }
                        }
                    }
                } catch (e) {
                    // Ignore errors from unloaded areas
                }
            }
        }
    }

    if (blocksReplaced > 0) {
        console.info('[Hazennstuff Cleanup] Replaced ' + blocksReplaced + ' blocks in chunk ' + chunkX + ',' + chunkZ)
    }
}

console.info('[Hazennstuff Cleanup] Active - scanning chunks around players for hazennstuff blocks')
