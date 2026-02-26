// Priority: 0
// File: kubejs/server_scripts/sculk_item_contamination.js
// Items dropped on sculk get contaminated over time
// 60 seconds = Curse of Vanishing added
// 3 minutes = item is destroyed

// ============ CONFIGURATION ============
var CONTAMINATION_CHECK_INTERVAL = 100    // Check every 5 seconds (100 ticks)
var CURSE_THRESHOLD_TICKS = 1200          // 60 seconds (1200 ticks)
var DESTROY_THRESHOLD_TICKS = 3600        // 3 minutes (3600 ticks)
var CONTAMINATION_RADIUS = 48             // Scan radius around players

// Blocks that contaminate
var CONTAMINATING_BLOCKS = {
    'minecraft:sculk': true,
    'minecraft:sculk_vein': true,
    'minecraft:sculk_catalyst': true,
    'minecraft:sculk_sensor': true,
    'minecraft:sculk_shrieker': true
}

// Items immune to contamination (tools, important items)
var IMMUNE_ITEMS = {
    'minecraft:golden_hoe': true,
    'minecraft:golden_boots': true,
    'minecraft:gold_block': true,
    'minecraft:raw_gold_block': true,
    'minecraft:gold_ingot': true,
    'minecraft:gold_nugget': true
}

// ============ TRACKING ============
// Track contamination time: { entityUUID: startTick }
var contaminationTracker = {}

// ============ MAIN TICK EVENT ============
ServerEvents.tick(function (event) {
    var currentTick = event.server.tickCount
    if (currentTick % CONTAMINATION_CHECK_INTERVAL !== 0) return

    var server = event.server
    var players = server.playerList.players

    for (var p = 0; p < players.size(); p++) {
        var player = players.get(p)
        var level = player.level
        if (level.clientSide) continue

        var dimKey = level.dimension.toString()
        var playerPos = player.blockPosition()

        // Get all item entities near the player
        try {
            var entities = level.getEntitiesWithin(
                AABB.of(
                    playerPos.x - CONTAMINATION_RADIUS,
                    playerPos.y - 10,
                    playerPos.z - CONTAMINATION_RADIUS,
                    playerPos.x + CONTAMINATION_RADIUS,
                    playerPos.y + 10,
                    playerPos.z + CONTAMINATION_RADIUS
                )
            )

            for (var e = 0; e < entities.size(); e++) {
                var entity = entities.get(e)

                // Only process item entities
                if (entity.type.toString() !== 'minecraft:item') continue

                var itemPos = entity.blockPosition()
                var entityId = entity.uuid.toString()

                // Check block below the item
                var blockBelow = level.getBlock(itemPos.x, itemPos.y - 1, itemPos.z)
                var blockAt = level.getBlock(itemPos.x, itemPos.y, itemPos.z)

                var onSculk = false
                if (blockBelow && CONTAMINATING_BLOCKS[blockBelow.id]) onSculk = true
                if (blockAt && CONTAMINATING_BLOCKS[blockAt.id]) onSculk = true

                if (!onSculk) {
                    // Not on sculk — remove from tracking
                    if (contaminationTracker[entityId]) {
                        delete contaminationTracker[entityId]
                    }
                    continue
                }

                // Check if item is immune (gold items)
                try {
                    var itemStack = entity.item
                    if (itemStack && IMMUNE_ITEMS[itemStack.id]) continue
                    // Also skip items that already have gold in the name
                    if (itemStack && itemStack.id.indexOf('gold') !== -1) continue
                } catch (ex) { }

                // Start tracking if not already
                if (!contaminationTracker[entityId]) {
                    contaminationTracker[entityId] = currentTick
                }

                var timeOnSculk = currentTick - contaminationTracker[entityId]

                // Stage 2: Destroy after 3 minutes
                if (timeOnSculk >= DESTROY_THRESHOLD_TICKS) {
                    try {
                        entity.kill()
                        // Destruction particles
                        server.runCommandSilent('execute in ' + dimKey + ' positioned ' + itemPos.x + ' ' + itemPos.y + ' ' + itemPos.z + ' run particle minecraft:sculk_soul ~ ~0.3 ~ 0.2 0.2 0.2 0.01 5 force')
                        server.runCommandSilent('execute in ' + dimKey + ' positioned ' + itemPos.x + ' ' + itemPos.y + ' ' + itemPos.z + ' run playsound minecraft:block.sculk.break master @a ~ ~ ~ 0.5 0.5')
                    } catch (ex) { }
                    delete contaminationTracker[entityId]
                    continue
                }

                // Stage 1: Warning particles (sculk rising)
                if (timeOnSculk >= CURSE_THRESHOLD_TICKS / 2) {
                    try {
                        server.runCommandSilent('execute in ' + dimKey + ' positioned ' + itemPos.x + ' ' + itemPos.y + ' ' + itemPos.z + ' run particle minecraft:sculk_charge_pop ~ ~0.3 ~ 0.1 0.2 0.1 0.005 2 force')
                    } catch (ex) { }
                }
            }
        } catch (e) { }
    }

    // Cleanup stale entries every 5 minutes
    if (currentTick % 6000 === 0) {
        var staleKeys = []
        for (var id in contaminationTracker) {
            if (currentTick - contaminationTracker[id] > DESTROY_THRESHOLD_TICKS + 1200) {
                staleKeys.push(id)
            }
        }
        for (var s = 0; s < staleKeys.length; s++) {
            delete contaminationTracker[staleKeys[s]]
        }
    }
})

console.info('[Sculk Item Contamination] Loaded — items on sculk will be consumed over time')
