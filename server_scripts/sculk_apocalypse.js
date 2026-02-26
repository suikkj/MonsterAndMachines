// Priority: 0
// File: kubejs/server_scripts/sculk_apocalypse.js
// Sculk apocalypse mechanics: debuffs, radiation, golden boots protection
// DEBUG MODE — remove console.info lines after fixing

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

// Debuffs to apply (one random per cycle)
var SCULK_DEBUFFS_AP = [
    'minecraft:darkness',
    'ars_elemental:venom',
    'born_in_chaos_v1:stun'
]

// Grace period when stepping off sculk (in ticks, 40 = 2 seconds)
var OFF_SCULK_GRACE_PERIOD_AP = 40

// Debug log throttle - only log once every 2 seconds per player
var debugLogTimer = {}

PlayerEvents.tick(function (event) {
    var player = event.player
    if (!player) return
    if (player.isCreative() || player.isSpectator()) return

    // Check every 10 ticks (~0.5 seconds)
    if (player.age % 10 !== 0) return

    var level = player.level
    if (level.clientSide) return

    var server = event.server
    var username = player.username
    var pos = player.blockPosition()

    // === DEBUG: Log block detection ===
    var shouldLog = false
    var logKey = username
    if (!debugLogTimer[logKey] || (player.age - debugLogTimer[logKey]) >= 40) {
        shouldLog = true
        debugLogTimer[logKey] = player.age
    }

    // Check if standing on any sculk block
    var onSculk = false
    var belowId = ''
    var atId = ''
    try {
        var blockBelow = level.getBlock(pos.x, pos.y - 1, pos.z)
        var blockAt = level.getBlock(pos.x, pos.y, pos.z)

        belowId = blockBelow ? blockBelow.id : ''
        atId = blockAt ? blockAt.id : ''

        if (SCULK_BLOCKS_AP[belowId] || SCULK_BLOCKS_AP[atId]) {
            onSculk = true
        }
    } catch (e) {
        console.info('[Sculk DEBUG] ERROR reading blocks: ' + e)
        return
    }

    if (shouldLog && onSculk) {
        console.info('[Sculk DEBUG] ' + username + ' ON SCULK at ' + pos.x + ',' + pos.y + ',' + pos.z + ' | blockBelow=' + belowId + ' blockAt=' + atId)
    }

    // Check for protective boots
    var hasProtectiveBoots = false
    var bootsId = 'none'
    var bootsEmpty = true
    try {
        var bootsItem = player.feetArmorItem
        if (bootsItem) {
            bootsEmpty = bootsItem.isEmpty()
            bootsId = bootsItem.id || 'null_id'
            if (!bootsEmpty && PROTECTIVE_BOOTS_AP[bootsId]) {
                hasProtectiveBoots = true
            }
        } else {
            bootsId = 'null_item'
        }
    } catch (e) {
        console.info('[Sculk DEBUG] ERROR reading feetArmorItem: ' + e)
        bootsId = 'ERROR: ' + e
    }

    if (shouldLog && onSculk) {
        console.info('[Sculk DEBUG] ' + username + ' boots=' + bootsId + ' empty=' + bootsEmpty + ' protective=' + hasProtectiveBoots)
    }

    if (onSculk) {
        // Reset off-sculk timer
        player.persistentData.putLong('lastOffSculkTime', 0)

        if (hasProtectiveBoots) {
            // === PROTECTIVE BOOTS: No debuffs, but damage boots ===
            var bootsTimer = player.persistentData.getInt('bootsTimer') || 0
            bootsTimer++

            if (shouldLog) {
                console.info('[Sculk DEBUG] ' + username + ' BOOTS PROTECTION — bootsTimer=' + bootsTimer)
            }

            if (bootsTimer >= 2) {
                bootsTimer = 0
                // Damage boots directly
                try {
                    var boots = player.feetArmorItem
                    if (boots && !boots.isEmpty()) {
                        var currentDamage = boots.damageValue || 0
                        var maxDamage = boots.maxDamage || 91

                        console.info('[Sculk DEBUG] ' + username + ' DAMAGING BOOTS: current=' + currentDamage + ' max=' + maxDamage + ' newDamage=' + (currentDamage + 10))

                        if (currentDamage + 10 >= maxDamage) {
                            // Boots break
                            player.feetArmorItem = Item.empty
                            console.info('[Sculk DEBUG] ' + username + ' BOOTS BROKE!')
                            server.runCommandSilent('title ' + username + ' actionbar {"text":"Suas botas foram destruídas pelo sculk!","color":"red","bold":true}')
                            server.runCommandSilent('playsound minecraft:entity.item.break master ' + username + ' ~ ~ ~ 1 1')
                        } else {
                            // Damage boots by 10 durability
                            boots.damageValue = currentDamage + 10
                            console.info('[Sculk DEBUG] ' + username + ' boots.damageValue set to ' + boots.damageValue)
                        }
                    } else {
                        console.info('[Sculk DEBUG] ' + username + ' boots is null or empty when trying to damage!')
                    }
                } catch (bootErr) {
                    console.info('[Sculk DEBUG] ' + username + ' ERROR damaging boots: ' + bootErr)
                    try { player.feetArmorItem = Item.empty } catch (e3) { }
                }
            }
            player.persistentData.putInt('bootsTimer', bootsTimer)

            // Clear debuffs via API
            for (var i = 0; i < SCULK_DEBUFFS_AP.length; i++) {
                try { player.removeEffect(SCULK_DEBUFFS_AP[i]) } catch (e4) {
                    if (shouldLog) console.info('[Sculk DEBUG] ERROR removeEffect(' + SCULK_DEBUFFS_AP[i] + '): ' + e4)
                }
            }

            // Reset radiation timer
            player.persistentData.putInt('timeOnSculk', 0)

        } else {
            // === NO PROTECTIVE BOOTS: Apply Debuffs ===
            if (shouldLog) {
                console.info('[Sculk DEBUG] ' + username + ' NO BOOTS — applying debuffs')
            }

            // 1. Check if already has a debuff
            var hasAnyDebuff = false
            for (var j = 0; j < SCULK_DEBUFFS_AP.length; j++) {
                try {
                    var isActive = player.hasEffect(SCULK_DEBUFFS_AP[j])
                    if (isActive) {
                        hasAnyDebuff = true
                        if (shouldLog) console.info('[Sculk DEBUG] ' + username + ' already has effect: ' + SCULK_DEBUFFS_AP[j])
                        break
                    }
                } catch (e3) {
                    console.info('[Sculk DEBUG] ERROR hasEffect(' + SCULK_DEBUFFS_AP[j] + '): ' + e3)
                }
            }

            if (!hasAnyDebuff) {
                var randomIdx = Math.floor(Math.random() * SCULK_DEBUFFS_AP.length)
                var effectId = SCULK_DEBUFFS_AP[randomIdx]
                console.info('[Sculk DEBUG] ' + username + ' APPLYING debuff: ' + effectId)
                try {
                    player.potionEffects.add(effectId, 200, 0, false, true)
                    console.info('[Sculk DEBUG] ' + username + ' potionEffects.add SUCCESS for ' + effectId)
                } catch (e5) {
                    console.info('[Sculk DEBUG] ' + username + ' potionEffects.add FAILED: ' + e5)
                }
            }

            // 2. Radiation Timer
            var timeOnSculk = player.persistentData.getInt('timeOnSculk') || 0
            timeOnSculk++
            player.persistentData.putInt('timeOnSculk', timeOnSculk)

            if (timeOnSculk >= 360) {
                try { player.potionEffects.add('createnuclear:radiation', 200, 0, false, true) } catch (e6) {
                    console.info('[Sculk DEBUG] ERROR adding radiation: ' + e6)
                }
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
                    try { player.removeEffect(SCULK_DEBUFFS_AP[k]) } catch (e7) { }
                }
            }
        }
    }
})

console.info('[Sculk Apocalypse] Loaded WITH DEBUG — sculk debuffs and boot damage active')
