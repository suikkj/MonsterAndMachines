// Priority: 0
// File: kubejs/server_scripts/sculk_apocalypse.js
// Sculk apocalypse mechanics: debuffs, radiation, golden boots protection

// Debuffs list
var SCULK_DEBUFFS = [
    'minecraft:darkness',
    'ars_elemental:venom',
    'born_in_chaos_v1:stun'
]

// All sculk-type blocks that trigger the mechanics
var SCULK_BLOCKS = [
    'minecraft:sculk',
    'minecraft:sculk_vein',
    'minecraft:sculk_catalyst'
]

// Grace period when stepping off sculk (in ticks, 40 = 2 seconds)
var OFF_SCULK_GRACE_PERIOD = 40

PlayerEvents.tick(function (event) {
    var player = event.player
    if (player.isCreative() || player.isSpectator()) return

    // 10% chance each tick (equivalent to running every ~10 ticks on average)
    if (Math.random() > 0.1) return

    var level = player.level
    var pos = player.blockPosition()
    var blockBelow = level.getBlock(pos.below())
    var blockAt = level.getBlock(pos)

    // Check if standing on any sculk block
    var onSculk = SCULK_BLOCKS.indexOf(blockBelow.id) !== -1 || SCULK_BLOCKS.indexOf(blockAt.id) !== -1

    // Check for protective boots (Golden Boots, Anti-Radiation Boots, Steampunk Boots)
    var hasProtectiveBoots = false
    var feetSlotItem = null

    // List of boots that protect from sculk
    var PROTECTIVE_BOOTS = [
        'minecraft:golden_boots',
        'createnuclear:anti_radiation_boots',
        'immersive_armors:steampunk_boots'
    ]

    // Check armor slot specifically
    var armorSlots = player.inventory.armor
    if (armorSlots && armorSlots.get(0)) {
        feetSlotItem = armorSlots.get(0)
        for (var b = 0; b < PROTECTIVE_BOOTS.length; b++) {
            if (feetSlotItem.id === PROTECTIVE_BOOTS[b]) {
                hasProtectiveBoots = true
                break
            }
        }
    }

    if (onSculk) {
        // Reset the off-sculk timer since we're on sculk
        player.persistentData.putLong('lastOffSculkTime', 0)

        if (hasProtectiveBoots && feetSlotItem) {
            // Golden Boots Logic: No debuffs, but damage boots
            // Damage boots every 1 second (20 ticks at 10-tick intervals = 2 checks)
            var bootsTimer = player.persistentData.getInt('bootsTimer') || 0
            bootsTimer++

            if (bootsTimer >= 2) {
                bootsTimer = 0
                // Damage boots by increasing the damage value
                var currentDamage = feetSlotItem.damageValue || 0
                var maxDamage = feetSlotItem.maxDamage || 91

                if (currentDamage < maxDamage - 1) {
                    // Create new boots with increased damage and set back to slot
                    var newBoots = feetSlotItem.copy()
                    newBoots.damageValue = currentDamage + 1
                    player.setItemSlot('feet', newBoots)
                } else {
                    // Boots are broken - remove them
                    player.setItemSlot('feet', 'minecraft:air')
                }
            }
            player.persistentData.putInt('bootsTimer', bootsTimer)

            // Clear random debuffs if they exist
            for (var i = 0; i < SCULK_DEBUFFS.length; i++) {
                var effectId = SCULK_DEBUFFS[i]
                if (player.potionEffects.isActive(effectId)) {
                    player.removeEffect(effectId)
                }
            }

            // Reset radiation timer - golden boots protect
            player.persistentData.putInt('timeOnSculk', 0)

        } else {
            // No Golden Boots: Apply Debuffs

            // 1. Immediate Random Debuff
            var hasDebuff = false
            for (var j = 0; j < SCULK_DEBUFFS.length; j++) {
                if (player.potionEffects.isActive(SCULK_DEBUFFS[j])) {
                    hasDebuff = true
                    break
                }
            }

            if (!hasDebuff) {
                var randomEffect = SCULK_DEBUFFS[Math.floor(Math.random() * SCULK_DEBUFFS.length)]
                // Duration: 10 seconds (200 ticks), amplifier 0, no particles, no icon
                player.potionEffects.add(randomEffect, 200, 0, false, false)
            }

            // 2. Radiation Timer (3 minutes = 3600 ticks, at 10-tick intervals = 360 checks)
            var timeOnSculk = player.persistentData.getInt('timeOnSculk') || 0
            timeOnSculk++
            player.persistentData.putInt('timeOnSculk', timeOnSculk)

            if (timeOnSculk >= 360) {
                // Apply radiation from Create Nuclear
                player.potionEffects.add('createnuclear:radiation', 200, 0, false, false)
            }

            // Reset boots timer
            player.persistentData.putInt('bootsTimer', 0)
        }
    } else {
        // Not on Sculk - Check grace period before resetting
        var lastOffTime = player.persistentData.getLong('lastOffSculkTime')

        if (lastOffTime === 0) {
            // Just stepped off sculk - record the time
            player.persistentData.putLong('lastOffSculkTime', event.server.tickCount)
        } else {
            // Check if we've been off sculk for more than grace period
            var ticksOffSculk = event.server.tickCount - lastOffTime

            if (ticksOffSculk > OFF_SCULK_GRACE_PERIOD) {
                // Clear timers only after grace period expires
                if (player.persistentData.getInt('timeOnSculk') > 0) {
                    player.persistentData.putInt('timeOnSculk', 0)
                }
                if (player.persistentData.getInt('bootsTimer') > 0) {
                    player.persistentData.putInt('bootsTimer', 0)
                }

                // Clear debuffs after grace period
                for (var k = 0; k < SCULK_DEBUFFS.length; k++) {
                    var eff = SCULK_DEBUFFS[k]
                    if (player.potionEffects.isActive(eff)) {
                        player.removeEffect(eff)
                    }
                }
            }
            // If within grace period, do nothing - keep timers and debuffs active
        }
    }
})
