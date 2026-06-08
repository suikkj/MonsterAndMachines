// Heinrich's Lab — Atmosphere Script
// Handles: darkness effect, ambient sounds, anti-light rules
// Target dimension: mmdimensions:heinrichlab

const HEINRICH_DIM = 'cyberspace:darknet_dimension'

// ============================================================
// TICK — darkness + heartbeat sounds while inside the lab
// ============================================================
PlayerEvents.tick(event => {
    const player = event.player

    // PERFORMANCE: Check every 20 ticks (1/s) instead of every tick
    // The dimension string comparison was running 20×/s per player unnecessarily
    const tick = event.server.tickCount
    if (tick % 20 !== 0) return

    if (player.level.dimension.toString() !== HEINRICH_DIM) return

    // Apply Darkness effect every 5 seconds (keeps it permanent without particles)
    if (tick % 100 === 0) {
        player.potionEffects.add('minecraft:darkness', 140, 0, false, false)
    }

    // Low-frequency ambient sculk click sounds (every 12 seconds)
    if (tick % 240 === 0) {
        const r = Math.random()
        if (r < 0.4) {
            event.server.runCommandSilent(
                `playsound minecraft:block.sculk_sensor.clicking player ${player.username} ${player.x} ${player.y} ${player.z} 0.5 ${(0.5 + Math.random() * 0.5).toFixed(2)}`
            )
        } else if (r < 0.65) {
            event.server.runCommandSilent(
                `playsound minecraft:entity.warden.heartbeat player ${player.username} ${player.x} ${player.y} ${player.z} 0.3 ${(0.8 + Math.random() * 0.3).toFixed(2)}`
            )
        } else if (r < 0.75) {
            // Very rare — the Warden's distant roar
            event.server.runCommandSilent(
                `playsound minecraft:entity.warden.roar player ${player.username} ${player.x} ${player.y} ${player.z} 0.15 0.6`
            )
        }
    }

    // Actionbar reminder when first entering (first 10 seconds)
    if (player.persistentData.getInt('hl_entry_ticks') < 200) {
        const entryTicks = player.persistentData.getInt('hl_entry_ticks') + 20
        player.persistentData.putInt('hl_entry_ticks', entryTicks)
        if (entryTicks <= 200) {
            event.server.runCommandSilent(
                `title ${player.username} actionbar {"text":"Fique em silêncio.","color":"dark_red","italic":true}`
            )
        }
    }
})

// ============================================================
// DIMENSION ENTER — reset counter
// ============================================================
PlayerEvents.loggedIn(event => {
    event.player.persistentData.putInt('hl_entry_ticks', 0)
})

PlayerEvents.respawned(event => {
    if (event.player.level.dimension.toString() === HEINRICH_DIM) {
        event.player.persistentData.putInt('hl_entry_ticks', 0)
    }
})

// ============================================================
// BLOCK PLACEMENT RESTRICTION (OPTIONAL)
// Prevent placing light sources inside the lab
// Toggle: set HL_RESTRICT_LIGHT to true to enable
// ============================================================
const HL_RESTRICT_LIGHT = false

if (HL_RESTRICT_LIGHT) {
    BlockEvents.placed(event => {
        if (!event.player) return
        if (event.player.level.dimension.toString() !== HEINRICH_DIM) return

        const lightBlocks = [
            'minecraft:torch', 'minecraft:wall_torch',
            'minecraft:soul_torch', 'minecraft:soul_wall_torch',
            'minecraft:lantern', 'minecraft:glowstone',
            'minecraft:sea_lantern', 'minecraft:shroomlight',
            'minecraft:jack_o_lantern', 'minecraft:campfire',
            'minecraft:soul_campfire'
        ]
        if (lightBlocks.includes(event.block.id)) {
            event.server.runCommandSilent(
                `setblock ${event.block.x} ${event.block.y} ${event.block.z} minecraft:air`
            )
            event.server.runCommandSilent(
                `title ${event.player.username} actionbar {"text":"A luz não é permitida aqui. ","color":"dark_gray","italic":true}`
            )
        }
    })
}
