// Priority: 0
// File: kubejs/server_scripts/sculk_apocalypse.js
// Sculk apocalypse mechanics: debuffs, radiation, golden boots protection
// Uses commands for effects and damage (direct API fails in this KubeJS version)

// All sculk-type blocks that trigger the mechanics (hashmap for fast lookup)
var SCULK_BLOCKS_AP = {
    'minecraft:sculk': true,
    'minecraft:sculk_vein': true,
    'minecraft:sculk_catalyst': true,
    'minecraft:sculk_sensor': true,
    'minecraft:sculk_shrieker': true
}

// Boots that protect from sculk effects
var PROTECTIVE_BOOTS_AP = {
    'minecraft:golden_boots': true,
    'createnuclear:anti_radiation_boots': true,
    'immersive_armors:steampunk_boots': true
}

// Debuffs to apply (one random per cycle) — using /effect command
var SCULK_DEBUFFS_AP = [
    'minecraft:darkness',
    'minecraft:wither',
    'minecraft:slowness'
]

// Grace period when stepping off sculk (in ticks, 40 = 2 seconds)
var OFF_SCULK_GRACE_PERIOD_AP = 40

// Boot damage per cycle (how many durability points)
var BOOT_DAMAGE_PER_CYCLE = 1

// How often boots take damage (every N successful ticks on sculk)
// 60 cycles × 10 ticks = 600 ticks = 30 seconds
var BOOT_DAMAGE_FREQUENCY = 60

PlayerEvents.tick(function (event) {
    var player = event.player
    if (!player) return
    if (player.isCreative() || player.isSpectator()) return

    // Check every 10 ticks (~0.5 seconds)
    if (player.tickCount % 10 !== 0) return

    var username = player.username

    // Players who are immune to sculk apocalypse penalties
    var IGNORED_PLAYERS = {
        "suikkj": true,
        "_Myos_": true
    }

    if (IGNORED_PLAYERS[username]) return

    var level = player.level
    if (level.clientSide) return

    var server = event.server
    var pos = player.blockPosition()

    // Check if standing on any sculk block
    var onSculk = false
    try {
        var blockBelow = level.getBlock(pos.x, pos.y - 1, pos.z)
        var blockAt = level.getBlock(pos.x, pos.y, pos.z)

        var belowId = blockBelow ? blockBelow.id : ''
        var atId = blockAt ? blockAt.id : ''

        if (SCULK_BLOCKS_AP[belowId] || SCULK_BLOCKS_AP[atId]) {
            onSculk = true
        }
    } catch (e) {
        console.error("[Sculk Apocalypse] Error checking blocks: " + e);
        return
    }

    // Check for protective boots
    var hasProtectiveBoots = false
    try {
        var bootsItem = player.feetArmorItem
        if (bootsItem && !bootsItem.isEmpty()) {
            var bootsId = bootsItem.id || ''
            if (PROTECTIVE_BOOTS_AP[bootsId]) {
                hasProtectiveBoots = true
            }
        }
    } catch (e) {
        console.error("[Sculk Apocalypse] Error checking boots: " + e);
    }

    if (onSculk) {
        // Reset off-sculk timer
        player.persistentData.putLong('lastOffSculkTime', 0)

        if (hasProtectiveBoots) {
            // === PROTECTIVE BOOTS: No debuffs, but damage boots via command ===
            var bootsTimer = player.persistentData.getInt('bootsTimer') || 0
            bootsTimer++

            if (bootsTimer >= BOOT_DAMAGE_FREQUENCY) {
                bootsTimer = 0
                try {
                    var boots = player.feetArmorItem
                    if (boots && !boots.isEmpty()) {
                        boots.damageValue = boots.damageValue + BOOT_DAMAGE_PER_CYCLE
                        if (boots.damageValue >= boots.maxDamage) {
                            // Boots break!
                            player.feetArmorItem = Item.empty
                            server.runCommandSilent('title ' + username + ' actionbar {"text":"Suas botas foram destruídas pelo sculk!","color":"red","bold":true}')
                            server.runCommandSilent('playsound minecraft:entity.item.break master ' + username + ' ~ ~ ~ 1 1')
                        }
                    }
                } catch (bootErr) {
                    console.error("[Sculk Apocalypse] Error modifying item durability: " + bootErr);
                }
            }
            player.persistentData.putInt('bootsTimer', bootsTimer)

            // Clear debuffs via command
            for (var i = 0; i < SCULK_DEBUFFS_AP.length; i++) {
                server.runCommandSilent('effect clear ' + username + ' ' + SCULK_DEBUFFS_AP[i])
            }

            // Reset radiation timer
            player.persistentData.putInt('timeOnSculk', 0)

        } else {
            // === NO PROTECTIVE BOOTS: Apply Debuffs via /effect command ===

            // Check if player already has any sculk debuff active
            var hasAnyDebuff = false
            for (var j = 0; j < SCULK_DEBUFFS_AP.length; j++) {
                try {
                    if (player.hasEffect(SCULK_DEBUFFS_AP[j])) {
                        hasAnyDebuff = true
                        break
                    }
                } catch (e3) {
                    console.error("[Sculk Apocalypse] Error checking player effect: " + e3);
                }
            }

            if (!hasAnyDebuff) {
                // Apply random debuff via command (more reliable than API)
                var randomIdx = Math.floor(Math.random() * SCULK_DEBUFFS_AP.length)
                var effectId = SCULK_DEBUFFS_AP[randomIdx]
                server.runCommandSilent('effect give ' + username + ' ' + effectId + ' 10 0 true')
            }

            // Radiation Timer
            var timeOnSculk = player.persistentData.getInt('timeOnSculk') || 0
            timeOnSculk++
            player.persistentData.putInt('timeOnSculk', timeOnSculk)

            if (timeOnSculk >= 360) {
                server.runCommandSilent('effect give ' + username + ' createnuclear:radiation 10 0 true')
            }

            // Reset boots timer
            player.persistentData.putInt('bootsTimer', 0)
        }
    } else {
        // Not on Sculk - Check grace period before resetting
        var lastOffTime = player.persistentData.getLong('lastOffSculkTime')

        if (lastOffTime === 0) {
            player.persistentData.putLong('lastOffSculkTime', server.tickCount)
        } else {
            var ticksOffSculk = server.tickCount - lastOffTime

            if (ticksOffSculk > OFF_SCULK_GRACE_PERIOD_AP) {
                player.persistentData.putInt('timeOnSculk', 0)
                player.persistentData.putInt('bootsTimer', 0)

                for (var k = 0; k < SCULK_DEBUFFS_AP.length; k++) {
                    server.runCommandSilent('effect clear ' + username + ' ' + SCULK_DEBUFFS_AP[k])
                }
            }
        }
    }
})

console.info('[Sculk Apocalypse] Loaded — sculk debuffs (via /effect) and boot damage active')
