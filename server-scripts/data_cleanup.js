// Priority: 1000
// Cleanup corrupted persistent data with null values
// This script runs early to fix any null values before they cause crashes

ServerEvents.loaded(function (event) {
    var server = event.server
    var data = server.persistentData

    console.info('[Data Cleanup] Checking for null values in persistentData...')

    // Clean essentialItems data
    if (data.essentialItems) {
        var essentialItems = data.essentialItems
        var cleaned = 0

        // Get all player names - iterate through the object
        try {
            var keys = Object.keys(essentialItems)
            for (var i = 0; i < keys.length; i++) {
                var playerName = keys[i]
                var playerData = essentialItems[playerName]

                if (playerData) {
                    // Fix null deathPos
                    if (playerData.deathPos === null || playerData.deathPos === undefined) {
                        playerData.deathPos = {}
                        cleaned++
                    }
                    // Fix null deathDimension
                    if (playerData.deathDimension === null || playerData.deathDimension === undefined) {
                        playerData.deathDimension = ''
                        cleaned++
                    }
                    // Fix null items array
                    if (!playerData.items) {
                        playerData.items = []
                        cleaned++
                    }
                    // Clean items with null nbtString
                    if (playerData.items && playerData.items.length > 0) {
                        for (var j = 0; j < playerData.items.length; j++) {
                            if (playerData.items[j] && playerData.items[j].nbtString === null) {
                                playerData.items[j].nbtString = ''
                                cleaned++
                            }
                        }
                    }
                    // Fix null temporaryItemIds
                    if (!playerData.temporaryItemIds) {
                        playerData.temporaryItemIds = []
                        cleaned++
                    }
                }
            }
        } catch (e) {
            console.warn('[Data Cleanup] Error iterating essentialItems: ' + e)
        }

        if (cleaned > 0) {
            console.info('[Data Cleanup] Fixed ' + cleaned + ' null values in essentialItems')
        }
    }

    // Clean blindfoldedPlayers data - these are just booleans, should be safe
    if (data.blindfoldedPlayers) {
        console.info('[Data Cleanup] blindfoldedPlayers data exists - should be safe')
    }

    console.info('[Data Cleanup] Persistent data check complete')
})
