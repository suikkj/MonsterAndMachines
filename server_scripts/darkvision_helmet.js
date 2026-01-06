// Priority: 0
// Darkvision Helmet - D&D style darkvision mechanic
// When wearing a helmet named "Darkvision Helmet", player gets Night Vision
// The resource pack shader will detect Night Vision and apply grayscale effect

// Track players with darkvision helmet for effect refresh
var darkvisionHelmetPlayers = {}

// Check every second for players wearing the darkvision helmet
PlayerEvents.tick(event => {
    var player = event.player

    // Only check every 20 ticks (1 second) for performance
    if (event.server.tickCount % 20 !== 0) return

    var playerId = player.uuid.toString()
    var helmet = player.headArmorItem

    // Check if player is wearing the Darkvision Helmet
    var hasDarkvisionHelmet = false

    if (helmet && !helmet.isEmpty()) {
        // Check by custom name
        var itemName = helmet.hoverName.string
        if (itemName && itemName.includes('Darkvision')) {
            hasDarkvisionHelmet = true
        }
    }

    if (hasDarkvisionHelmet) {
        // Apply Night Vision effect (short duration, will be refreshed)
        // Using 5 seconds (100 ticks) so it refreshes smoothly
        if (!player.hasEffect('minecraft:night_vision') || player.getEffect('minecraft:night_vision').duration < 60) {
            player.potionEffects.add('minecraft:night_vision', 100, 0, false, false)
        }

        if (!darkvisionHelmetPlayers[playerId]) {
            darkvisionHelmetPlayers[playerId] = true
            player.tell('§7[Darkvision] §fSua visão se ajusta à escuridão...')
        }
    } else {
        // Remove night vision when helmet is removed
        if (darkvisionHelmetPlayers[playerId]) {
            darkvisionHelmetPlayers[playerId] = false
            player.removeEffect('minecraft:night_vision')
            player.tell('§7[Darkvision] §fSua visão volta ao normal.')
        }
    }
})

// Re-apply darkvision on player respawn (it gets removed on death)
PlayerEvents.respawned(event => {
    var player = event.player
    var playerId = player.uuid.toString()

    if (darkvisionHelmetPlayers[playerId]) {
        // Re-apply after a short delay to ensure respawn is complete
        player.server.scheduleInTicks(20, () => {
            if (darkvisionHelmetPlayers[playerId]) {
                player.potionEffects.add('minecraft:night_vision', 100, 0, false, false)
                player.tell('§6[M&M SMP] §aVisão no Escuro re-aplicada após respawn.')
            }
        })
    }
})

// Persist darkvision state when player logs in
PlayerEvents.loggedIn(event => {
    var player = event.player
    var playerId = player.uuid.toString()

    // Check if player had darkvision (using persistent data)
    if (player.persistentData.getBoolean('darkvision_active')) {
        darkvisionHelmetPlayers[playerId] = true
        player.potionEffects.add('minecraft:night_vision', 100, 0, false, false)
        player.tell('§6[M&M SMP] §aVisão no Escuro re-ativada.')
    }
})

// Save darkvision state when player logs out
PlayerEvents.loggedOut(event => {
    var player = event.player
    var playerId = player.uuid.toString()

    if (darkvisionHelmetPlayers[playerId]) {
        player.persistentData.putBoolean('darkvision_active', true)
    } else {
        player.persistentData.putBoolean('darkvision_active', false)
    }
})

console.log('[Darkvision Helmet] Registered darkvision helmet mechanics')
