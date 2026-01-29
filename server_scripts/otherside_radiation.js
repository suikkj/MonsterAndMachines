// Priority: 0
// File: kubejs/server_scripts/otherside_radiation.js
// Otherside Dimension Radiation System
// Players without anti-radiation protection get radiation after 3 minutes
// Anti-radiation armor loses 1 durability every 5 minutes

// ============ CONFIGURATION ============
var OTHERSIDE_DIMENSION = 'deeperandarker:otherside'
var RADIATION_EFFECT = 'createnuclear:radiation'
var EXPOSURE_THRESHOLD_TICKS = 3600      // 3 minutes = 3600 ticks
var ARMOR_DAMAGE_INTERVAL_TICKS = 6000   // 5 minutes = 6000 ticks
var PLAYER_CHECK_INTERVAL = 20           // Check every 20 ticks (1 second) for efficiency

// ============ ARMOR DEFINITIONS ============
// All valid colors for anti-radiation armor
var ARMOR_COLORS = [
    'white', 'orange', 'magenta', 'light_blue', 'yellow', 'green', 'pink',
    'dark_gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'red', 'black'
]

// Build lists of valid armor pieces
var VALID_HELMETS = []
var VALID_CHESTPLATES = []
var VALID_LEGGINGS = []
var VALID_BOOTS = ['createnuclear:anti_radiation_boots']

// Generate all color variants
for (var i = 0; i < ARMOR_COLORS.length; i++) {
    var color = ARMOR_COLORS[i]
    VALID_HELMETS.push('createnuclear:' + color + '_anti_radiation_helmet')
    VALID_CHESTPLATES.push('createnuclear:' + color + '_anti_radiation_chestplate')
    VALID_LEGGINGS.push('createnuclear:' + color + '_anti_radiation_leggings')
}

// ============ PLAYER TRACKING ============
var playerRadiationData = {}
// Structure: { "uuid": { exposureTicks: number, armorDamageTicks: number } }

// ============ HELPER FUNCTIONS ============

function isValidHelmet(itemId) {
    if (!itemId) return false
    for (var i = 0; i < VALID_HELMETS.length; i++) {
        if (itemId === VALID_HELMETS[i]) return true
    }
    return false
}

function isValidChestplate(itemId) {
    if (!itemId) return false
    for (var i = 0; i < VALID_CHESTPLATES.length; i++) {
        if (itemId === VALID_CHESTPLATES[i]) return true
    }
    return false
}

function isValidLeggings(itemId) {
    if (!itemId) return false
    for (var i = 0; i < VALID_LEGGINGS.length; i++) {
        if (itemId === VALID_LEGGINGS[i]) return true
    }
    return false
}

function isValidBoots(itemId) {
    if (!itemId) return false
    for (var i = 0; i < VALID_BOOTS.length; i++) {
        if (itemId === VALID_BOOTS[i]) return true
    }
    return false
}

function hasFullAntiRadiationArmor(player) {
    try {
        var helmet = player.headArmorItem
        var chestplate = player.chestArmorItem
        var leggings = player.legsArmorItem
        var boots = player.feetArmorItem

        var helmetId = helmet && !helmet.isEmpty() ? helmet.id : null
        var chestplateId = chestplate && !chestplate.isEmpty() ? chestplate.id : null
        var leggingsId = leggings && !leggings.isEmpty() ? leggings.id : null
        var bootsId = boots && !boots.isEmpty() ? boots.id : null

        return isValidHelmet(helmetId) &&
            isValidChestplate(chestplateId) &&
            isValidLeggings(leggingsId) &&
            isValidBoots(bootsId)
    } catch (e) {
        return false
    }
}

function damageArmorPiece(player, slot) {
    try {
        var item = null
        if (slot === 'head') item = player.headArmorItem
        else if (slot === 'chest') item = player.chestArmorItem
        else if (slot === 'legs') item = player.legsArmorItem
        else if (slot === 'feet') item = player.feetArmorItem

        if (item && !item.isEmpty()) {
            // Damage the item by 1
            item.damageValue = item.damageValue + 1

            // Check if item should break
            if (item.damageValue >= item.maxDamage) {
                // Item breaks - set to empty
                if (slot === 'head') player.headArmorItem = Item.empty
                else if (slot === 'chest') player.chestArmorItem = Item.empty
                else if (slot === 'legs') player.legsArmorItem = Item.empty
                else if (slot === 'feet') player.feetArmorItem = Item.empty
            }
        }
    } catch (e) {
        // Silently fail if we can't damage the item
    }
}

function damageAllAntiRadiationArmor(player) {
    try {
        // Check each slot and damage if it's anti-radiation armor
        var helmet = player.headArmorItem
        var chestplate = player.chestArmorItem
        var leggings = player.legsArmorItem
        var boots = player.feetArmorItem

        if (helmet && !helmet.isEmpty() && isValidHelmet(helmet.id)) {
            damageArmorPiece(player, 'head')
        }
        if (chestplate && !chestplate.isEmpty() && isValidChestplate(chestplate.id)) {
            damageArmorPiece(player, 'chest')
        }
        if (leggings && !leggings.isEmpty() && isValidLeggings(leggings.id)) {
            damageArmorPiece(player, 'legs')
        }
        if (boots && !boots.isEmpty() && isValidBoots(boots.id)) {
            damageArmorPiece(player, 'feet')
        }
    } catch (e) {
        // Silently fail
    }
}

function applyRadiation(player) {
    try {
        // Apply radiation effect - duration 600 ticks (30 seconds), amplifier 0
        player.potionEffects.add(RADIATION_EFFECT, 600, 0, false, true)
    } catch (e) {
        // Silently fail if effect doesn't exist
    }
}

function isInOtherside(player) {
    try {
        var dimKey = player.level.dimension.toString()
        return dimKey === OTHERSIDE_DIMENSION
    } catch (e) {
        return false
    }
}

function getPlayerUUID(player) {
    try {
        return player.uuid.toString()
    } catch (e) {
        return null
    }
}

// ============ MAIN TICK EVENT ============
ServerEvents.tick(function (event) {
    var currentTick = event.server.tickCount

    // Only do the full player check every PLAYER_CHECK_INTERVAL ticks
    // But accumulate ticks continuously
    if (currentTick % PLAYER_CHECK_INTERVAL !== 0) return

    var server = event.server
    var players = server.playerList.players
    var activePlayerUUIDs = {}

    for (var p = 0; p < players.size(); p++) {
        var player = players.get(p)
        var uuid = getPlayerUUID(player)
        if (!uuid) continue

        activePlayerUUIDs[uuid] = true

        // Check if player is in the Otherside dimension
        if (!isInOtherside(player)) {
            // Player is not in Otherside - reset their data
            if (playerRadiationData[uuid]) {
                delete playerRadiationData[uuid]
            }
            continue
        }

        // Player IS in Otherside
        // Initialize tracking data if needed
        if (!playerRadiationData[uuid]) {
            playerRadiationData[uuid] = {
                exposureTicks: 0,
                armorDamageTicks: 0
            }
        }

        var data = playerRadiationData[uuid]
        var hasProtection = hasFullAntiRadiationArmor(player)

        if (hasProtection) {
            // Player has full protection - reset exposure, but accumulate armor damage time
            data.exposureTicks = 0
            data.armorDamageTicks += PLAYER_CHECK_INTERVAL  // Add ticks since last check

            // Check if armor should take damage (every 5 minutes)
            if (data.armorDamageTicks >= ARMOR_DAMAGE_INTERVAL_TICKS) {
                damageAllAntiRadiationArmor(player)
                data.armorDamageTicks = 0
            }
        } else {
            // Player does NOT have full protection - accumulate exposure time
            data.exposureTicks += PLAYER_CHECK_INTERVAL  // Add ticks since last check
            // Reset armor damage counter since not wearing full set
            data.armorDamageTicks = 0

            // Check if player has been exposed long enough for radiation
            if (data.exposureTicks >= EXPOSURE_THRESHOLD_TICKS) {
                applyRadiation(player)
                // Keep applying radiation every check while unprotected
            }
        }
    }

    // Cleanup data for players who are no longer online
    var uuidsToRemove = []
    for (var trackedUUID in playerRadiationData) {
        if (!activePlayerUUIDs[trackedUUID]) {
            uuidsToRemove.push(trackedUUID)
        }
    }
    for (var r = 0; r < uuidsToRemove.length; r++) {
        delete playerRadiationData[uuidsToRemove[r]]
    }
})

// ============ PLAYER LOGIN EVENT ============
// Reset data when player joins (in case of stale data)
PlayerEvents.loggedIn(function (event) {
    var player = event.player
    var uuid = getPlayerUUID(player)
    if (uuid && playerRadiationData[uuid]) {
        delete playerRadiationData[uuid]
    }
})

// ============ DIMENSION CHANGE EVENT ============
// Reset exposure when player leaves Otherside
PlayerEvents.tick(function (event) {
    // This runs every tick per player - we use it for more responsive dimension detection
    // But only do the heavy lifting every second
    var player = event.player
    if (!player) return

    var currentTick = event.server.tickCount
    if (currentTick % 20 !== 0) return

    var uuid = getPlayerUUID(player)
    if (!uuid) return

    // If player just left Otherside, their data will be cleaned up in the main tick
    // No additional handling needed here
})
