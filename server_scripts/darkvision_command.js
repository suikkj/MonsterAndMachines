// Priority: 0
// D&D-style Darkvision toggle using chat commands
// Usage: Type "!darkvision" in chat to toggle

// Store which players have darkvision active
var darkvisionPlayers = {}

// Listen for chat messages to toggle darkvision
PlayerEvents.chat(event => {
    var player = event.player
    var message = event.message.trim().toLowerCase()

    if (message === '!darkvision' || message === '!nightvision' || message === '!dv') {
        event.cancel()
        toggleDarkvision(player)
    }

    if (message === '!darkvision help' || message === '!dv help') {
        event.cancel()
        player.tell('§6[M&M SMP] §fComandos disponíveis:')
        player.tell('§7  !darkvision §f- Ativa/desativa Visão no Escuro')
        player.tell('§7  !dv §f- Atalho para darkvision')
    }
})

// Toggle darkvision for a player
function toggleDarkvision(player) {
    if (!player) return

    var playerId = player.uuid.toString()

    if (darkvisionPlayers[playerId]) {
        // Disable darkvision
        darkvisionPlayers[playerId] = false
        player.removeEffect('minecraft:night_vision')
        player.tell('§6[M&M SMP] §cVisão no Escuro desativada.')
    } else {
        // Enable darkvision
        darkvisionPlayers[playerId] = true
        // Apply night vision with very long duration (effectively permanent until toggled off)
        player.potionEffects.add('minecraft:night_vision', 999999 * 20, 0, false, false)
        player.tell('§6[M&M SMP] §aVisão no Escuro ativada!')
        player.tell('§7Você pode ver na escuridão. Digite !darkvision novamente para desativar.')
    }
}

// Re-apply darkvision on player respawn (it gets removed on death)
PlayerEvents.respawned(event => {
    var player = event.player
    var playerId = player.uuid.toString()

    if (darkvisionPlayers[playerId]) {
        // Re-apply after a short delay to ensure respawn is complete
        player.server.scheduleInTicks(20, () => {
            if (darkvisionPlayers[playerId]) {
                player.potionEffects.add('minecraft:night_vision', 999999 * 20, 0, false, false)
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
    if (player.persistentData.getBoolean('darkvision_command_active')) {
        darkvisionPlayers[playerId] = true
        player.potionEffects.add('minecraft:night_vision', 999999 * 20, 0, false, false)
        player.tell('§6[M&M SMP] §aVisão no Escuro re-ativada.')
    }
})

// Save darkvision state when player logs out
PlayerEvents.loggedOut(event => {
    var player = event.player
    var playerId = player.uuid.toString()

    if (darkvisionPlayers[playerId]) {
        player.persistentData.putBoolean('darkvision_command_active', true)
    } else {
        player.persistentData.putBoolean('darkvision_command_active', false)
    }
})

console.log('[Darkvision] D&D-style darkvision command registered: !darkvision')
