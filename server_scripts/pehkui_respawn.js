// Priority: 0
// File: kubejs/server_scripts/pehkui_respawn.js
// Restore Pehkui scale for specific players after death/respawn

// ============ PLAYER SCALE CONFIGURATION ============
// Format: "PlayerName": { height: value, width: value }
// If only one value needed, use same for both
// Add or modify players here as needed
var PLAYER_SCALES = {
    "MonoChroma9696": { height: 0.6, width: 0.6 },
    "_Myos_": { height: 1.08, width: 1.08 },
    "dupcdugamer": { height: 1.12, width: 1.12 },
    "Undy55": { height: 0.95, width: 0.95 },
    "cactian0": { height: 1.25, width: 1.1 }
}

// ============ RESPAWN EVENT ============
PlayerEvents.respawned(function (event) {
    var player = event.player
    if (!player) return

    var playerName = player.name.string

    // Check if this player has a custom scale
    if (PLAYER_SCALES.hasOwnProperty(playerName)) {
        var scales = PLAYER_SCALES[playerName]

        // Run the Pehkui scale commands
        // We need a small delay to ensure the player is fully respawned
        event.server.scheduleInTicks(5, function () {
            try {
                // Set height and width separately
                event.server.runCommandSilent('scale set pehkui:height ' + scales.height + ' ' + playerName)
                event.server.runCommandSilent('scale set pehkui:width ' + scales.width + ' ' + playerName)
            } catch (e) {
                // Silently fail if command doesn't work
            }
        })
    }
})

// ============ PLAYER LOGIN EVENT ============
// Also restore scale when player logs in (in case server restarted)
PlayerEvents.loggedIn(function (event) {
    var player = event.player
    if (!player) return

    var playerName = player.name.string

    // Check if this player has a custom scale
    if (PLAYER_SCALES.hasOwnProperty(playerName)) {
        var scales = PLAYER_SCALES[playerName]

        // Small delay to ensure player is fully loaded
        event.server.scheduleInTicks(20, function () {
            try {
                event.server.runCommandSilent('scale set pehkui:height ' + scales.height + ' ' + playerName)
                event.server.runCommandSilent('scale set pehkui:width ' + scales.width + ' ' + playerName)
            } catch (e) {
                // Silently fail if command doesn't work
            }
        })
    }
})
