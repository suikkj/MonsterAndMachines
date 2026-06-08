// Priority: 0
// Eldritch Ritual - Antimetal Summoning
// 9x9 circular void_prism platform with corner pillars and upper ring
// 9 arcane_pedestals with specific items trigger a 3-minute ritual
// Place eldritch_manuscript on center pedestal LAST to activate
// Drops 4 blocksyouneed_luna:antimetal on completion

// ============ CONFIGURATION ============
var ER_PROCESS_TICKS = 3600       // 3 minutes total (180 seconds)
var ER_PHASE1_TICKS = 1200        // Phase 1 ends at 1 minute (consume outer items)
var ER_PHASE2_TICKS = 2400        // Phase 2 ends at 2 minutes (consume inner items)
var ER_PEDESTAL = 'ars_nouveau:arcane_pedestal'
var ER_VOID_PRISM = 'ars_nouveau:void_prism'
var ER_PILLAR_BLOCK = 'pastel:onyx_chiseled_basalt'

var ER_RECIPES = [
    {
        name: 'Transpassagem',
        center_item: 'irons_spellbooks:eldritch_manuscript',
        outer_item: 'discerning_the_eldritch:eldritch_soul_shard',
        inner_item: 'irons_spellbooks:blood_vial',
        output_item: 'blocksyouneed_luna:antimetal_ingot',
        output_count: 4
    },
    {
        name: 'Criação',
        center_item: 'pastel:aether_vestiges',
        outer_item: 'irons_spellbooks:divine_pearl',
        inner_item: 'irons_spellbooks:dragonskin',
        output_item: 'irons_spellbooks:divine_soulshard',
        output_count: 2
    },
    {
        name: 'Profanação',
        center_item: 'discerning_the_eldritch:eldritch_soul_shard',
        outer_item: 'irons_spellbooks:ancient_knowledge_fragment',
        inner_item: 'discerning_the_eldritch:forbidden_spell_improvement',
        output_item: 'irons_spellbooks:eldritch_manuscript',
        output_count: 4
    },
    {
        name: 'Sabedoria',
        center_item: 'irons_spellbooks:ender_upgrade_orb',
        outer_item: 'create_mf:refined_radiance',
        inner_item: 'create_mf:shadow_ingot',
        output_item: 'crystal_chronicles:voidstone_shard',
        output_count: 48
    },
    {
        name: 'Cura',
        center_item: 'deeperdarker:heart_of_the_deep',
        outer_item: 'create_deep_dark:echo_ingot',
        inner_item: 'irons_spellbooks:arcane_ingot',
        output_item: 'deeperdarker:resonarium_plate',
        output_count: 24
    },
    {
        name: 'Multiplicação',
        center_item: 'irons_spellbooks:divine_soulshard',
        outer_item: 'irons_spellbooks:arcane_ingot',
        inner_item: 'irons_spellbooks:mithril_scrap',
        output_item: 'irons_spellbooks:mithril_ingot',
        output_count: 12
    }
]

// Pedestal offsets relative to center [dx, dz, role, phase]
var ER_PEDESTALS = [
    { dx: 0, dz: 0, role: 'center', phase: 3 },
    // Outer 4 (cardinal directions) - consumed at phase 1
    { dx: 0, dz: -4, role: 'outer', phase: 1 },
    { dx: 0, dz: 4, role: 'outer', phase: 1 },
    { dx: -4, dz: 0, role: 'outer', phase: 1 },
    { dx: 4, dz: 0, role: 'outer', phase: 1 },
    // Inner 4 (diagonal positions) - consumed at phase 2
    { dx: -2, dz: -2, role: 'inner', phase: 2 },
    { dx: 2, dz: -2, role: 'inner', phase: 2 },
    { dx: -2, dz: 2, role: 'inner', phase: 2 },
    { dx: 2, dz: 2, role: 'inner', phase: 2 }
]

// Floor pattern: 9x9 grid, 1 = void_prism required, 0 = air
// Indexed as FLOOR[dz+4][dx+4] (rows = dz from -4 to +4, cols = dx from -4 to +4)
// Standard Minecraft circle diameter 9 = 69 blocks
var ER_FLOOR = [
    [0, 0, 1, 1, 1, 1, 1, 0, 0],  // dz=-4
    [0, 1, 1, 1, 1, 1, 1, 1, 0],  // dz=-3
    [1, 1, 1, 1, 1, 1, 1, 1, 1],  // dz=-2
    [1, 1, 1, 1, 1, 1, 1, 1, 1],  // dz=-1
    [1, 1, 1, 1, 1, 1, 1, 1, 1],  // dz=0
    [1, 1, 1, 1, 1, 1, 1, 1, 1],  // dz=1
    [1, 1, 1, 1, 1, 1, 1, 1, 1],  // dz=2
    [0, 1, 1, 1, 1, 1, 1, 1, 0],  // dz=3
    [0, 0, 1, 1, 1, 1, 1, 0, 0]   // dz=4
]

// Corner pillar positions [dx, dz] - each has 3 blocks at Y+1, Y+2, Y+3
var ER_PILLARS = [
    { dx: -3, dz: -3 },
    { dx: 3, dz: -3 },
    { dx: -3, dz: 3 },
    { dx: 3, dz: 3 }
]

// Upper ring at Y+4 (hollow circle outline, 0 at pillar positions)
var ER_UPPER_RING = [
    [0, 0, 1, 1, 1, 1, 1, 0, 0],  // dz=-4
    [0, 0, 1, 0, 0, 0, 1, 0, 0],  // dz=-3 (dx=±3 are pillars, not void_prism)
    [1, 1, 0, 0, 0, 0, 0, 1, 1],  // dz=-2
    [1, 0, 0, 0, 0, 0, 0, 0, 1],  // dz=-1
    [1, 0, 0, 0, 0, 0, 0, 0, 1],  // dz=0
    [1, 0, 0, 0, 0, 0, 0, 0, 1],  // dz=1
    [1, 1, 0, 0, 0, 0, 0, 1, 1],  // dz=2
    [0, 0, 1, 0, 0, 0, 1, 0, 0],  // dz=3 (dx=±3 are pillars, not void_prism)
    [0, 0, 1, 1, 1, 1, 1, 0, 0]   // dz=4
]

// ============ STATE ============
var erProcessing = {} // "x,y,z,dim" -> { startTick, centerPos, dim, consumedPhase1, consumedPhase2 }

// ============ HELPERS ============

function erGetPedestalItemId(level, x, y, z) {
    try {
        var block = level.getBlock(x, y, z)
        if (!block || block.id !== ER_PEDESTAL) return null
        var inv = block.inventory
        if (!inv) return null
        var stack = inv.getStackInSlot(0)
        if (!stack || stack.isEmpty()) return null
        return stack.id
    } catch (e) { return null }
}

function erClearPedestal(level, x, y, z) {
    try {
        var block = level.getBlock(x, y, z)
        if (!block) return
        var inv = block.inventory
        if (inv) inv.extractItem(0, 64, false)
        if (block.entity) block.entity.setChanged()
    } catch (e) { }
}

function erCheckGrid(level, cx, cy, cz, grid, dy, blockId) {
    for (var dz = -4; dz <= 4; dz++) {
        for (var dx = -4; dx <= 4; dx++) {
            if (grid[dz + 4][dx + 4] === 1) {
                try {
                    var bid = level.getBlock(cx + dx, cy + dy, cz + dz).id
                    if (bid !== blockId) {
                        console.info('[Eldritch Ritual] Grid mismatch at offset (' + dx + ',' + dy + ',' + dz + ') pos=(' + (cx + dx) + ',' + (cy + dy) + ',' + (cz + dz) + ') expected=' + blockId + ' found=' + bid)
                        return false
                    }
                } catch (e) { return false }
            }
        }
    }
    return true
}

function erValidateStructure(level, cx, cy, cz) {
    // cy = Y of the center pedestal, floor is at cy-1

    // Check floor (Y = cy - 1)
    if (!erCheckGrid(level, cx, cy - 1, cz, ER_FLOOR, 0, ER_VOID_PRISM)) {
        console.info('[Eldritch Ritual] FAIL: Floor check failed at center ' + cx + ',' + cy + ',' + cz)
        return false
    }

    // Check upper ring (Y = cy + 3, which is 4 above floor)
    if (!erCheckGrid(level, cx, cy - 1, cz, ER_UPPER_RING, 4, ER_VOID_PRISM)) {
        console.info('[Eldritch Ritual] FAIL: Upper ring check failed at center ' + cx + ',' + cy + ',' + cz)
        return false
    }

    // Check corner pillars (Y+1, Y+2, Y+3 above floor = cy, cy+1, cy+2)
    for (var i = 0; i < ER_PILLARS.length; i++) {
        var p = ER_PILLARS[i]
        for (var dy = 0; dy <= 2; dy++) {
            try {
                var bid = level.getBlock(cx + p.dx, cy + dy, cz + p.dz).id
                if (bid !== ER_PILLAR_BLOCK) {
                    console.info('[Eldritch Ritual] FAIL: Pillar check at offset (' + p.dx + ',' + dy + ',' + p.dz + ') expected ' + ER_PILLAR_BLOCK + ' but got ' + bid)
                    return false
                }
            } catch (e) { return false }
        }
    }

    // Check all 9 pedestals exist at Y = cy (on top of floor)
    for (var i = 0; i < ER_PEDESTALS.length; i++) {
        var ped = ER_PEDESTALS[i]
        try {
            var bid = level.getBlock(cx + ped.dx, cy, cz + ped.dz).id
            if (bid !== ER_PEDESTAL) {
                console.info('[Eldritch Ritual] FAIL: Pedestal check at offset (' + ped.dx + ',0,' + ped.dz + ') expected ' + ER_PEDESTAL + ' but got ' + bid)
                return false
            }
        } catch (e) { return false }
    }

    console.info('[Eldritch Ritual] Structure VALID at ' + cx + ',' + cy + ',' + cz)
    return true
}

function erCheckPedestalItems(level, cx, cy, cz, recipe) {
    for (var i = 0; i < ER_PEDESTALS.length; i++) {
        var ped = ER_PEDESTALS[i]
        var itemId = erGetPedestalItemId(level, cx + ped.dx, cy, cz + ped.dz)
        var expected = (ped.role === 'center') ? recipe.center_item : ((ped.role === 'outer') ? recipe.outer_item : recipe.inner_item)
        if (itemId !== expected) {
            console.info('[Eldritch Ritual] FAIL: Pedestal item at offset (' + ped.dx + ',0,' + ped.dz + ') expected ' + expected + ' but got ' + itemId)
            return false
        }
    }
    console.info('[Eldritch Ritual] All pedestal items VALID')
    return true
}

function erRunCmd(server, dim, x, y, z, cmd) {
    server.runCommandSilent('execute in ' + dim + ' positioned ' + x + ' ' + y + ' ' + z + ' run ' + cmd)
}

function erPlaySound(server, dim, x, y, z, sound, volume, pitch) {
    erRunCmd(server, dim, x, y, z, 'playsound ' + sound + ' master @a[distance=..48] ~ ~ ~ ' + volume + ' ' + pitch)
}

function erParticle(server, dim, x, y, z, particle, dx, dy, dz, speed, count) {
    erRunCmd(server, dim, x, y, z, 'particle ' + particle + ' ~ ~ ~ ' + dx + ' ' + dy + ' ' + dz + ' ' + speed + ' ' + count + ' force')
}

function erConsumePedestals(level, cx, cy, cz, phase) {
    for (var i = 0; i < ER_PEDESTALS.length; i++) {
        var ped = ER_PEDESTALS[i]
        if (ped.phase === phase) {
            erClearPedestal(level, cx + ped.dx, cy, cz + ped.dz)
        }
    }
}

function erCheckRemainingItems(level, cx, cy, cz, currentPhase, recipe) {
    // Check only unconsumed pedestal items
    for (var i = 0; i < ER_PEDESTALS.length; i++) {
        var ped = ER_PEDESTALS[i]
        if (ped.phase > currentPhase) {
            var itemId = erGetPedestalItemId(level, cx + ped.dx, cy, cz + ped.dz)
            var expected = (ped.role === 'center') ? recipe.center_item : ((ped.role === 'outer') ? recipe.outer_item : recipe.inner_item)
            if (itemId !== expected) return false
        }
    }
    return true
}

// ============ MAIN TICK ============
ServerEvents.tick(function (event) {
    var tick = event.server.tickCount
    var server = event.server

    // --- Process active rituals every second ---
    if (tick % 20 === 0) {
        var keys = Object.keys(erProcessing)
        for (var k = 0; k < keys.length; k++) {
            var key = keys[k]
            var m = erProcessing[key]
            var elapsed = tick - m.startTick
            var dim = m.dim
            var cx = m.centerPos[0], cy = m.centerPos[1], cz = m.centerPos[2]

            // Get level
            var level = null
            var players = server.playerList.players
            for (var p = 0; p < players.size(); p++) {
                if (players.get(p).level.dimension.toString() === dim) {
                    level = players.get(p).level
                    break
                }
            }
            if (!level) continue

            // Determine current phase (which items have been consumed)
            var currentPhase = m.consumedPhase || 0
            var recipe = m.recipe

            // Verify remaining pedestal items are still present
            if (!erCheckRemainingItems(level, cx, cy, cz, currentPhase, recipe)) {
                delete erProcessing[key]
                erPlaySound(server, dim, cx, cy, cz, 'minecraft:block.beacon.deactivate', 1.0, 0.5)
                erPlaySound(server, dim, cx, cy, cz, 'minecraft:entity.warden.angry', 0.8, 0.5)
                erParticle(server, dim, cx, cy, cz, 'minecraft:large_smoke', 2, 1, 2, 0.05, 40)
                continue
            }

            // === PHASE 1 COMPLETION (1 minute) - consume eldritch_soul_shard ===
            if (elapsed >= ER_PHASE1_TICKS && currentPhase < 1) {
                erConsumePedestals(level, cx, cy, cz, 1)
                m.consumedPhase = 1
                erPlaySound(server, dim, cx, cy, cz, 'minecraft:entity.warden.roar', 0.7, 0.3)
                erParticle(server, dim, cx, cy, cz, 'minecraft:sculk_soul', 3, 1, 3, 0.05, 30)
                // Flash at each consumed pedestal position
                for (var i = 0; i < ER_PEDESTALS.length; i++) {
                    var ped = ER_PEDESTALS[i]
                    if (ped.phase === 1) {
                        erParticle(server, dim, cx + ped.dx, cy + 1, cz + ped.dz, 'minecraft:flash', 0, 0, 0, 0, 1)
                    }
                }
            }

            // === PHASE 2 COMPLETION (2 minutes) - consume soul_orb_vampire ===
            if (elapsed >= ER_PHASE2_TICKS && currentPhase < 2) {
                erConsumePedestals(level, cx, cy, cz, 2)
                m.consumedPhase = 2
                erPlaySound(server, dim, cx, cy, cz, 'minecraft:entity.warden.roar', 1.0, 0.2)
                erPlaySound(server, dim, cx, cy, cz, 'minecraft:entity.elder_guardian.curse', 0.6, 0.5)
                erParticle(server, dim, cx, cy, cz, 'minecraft:sculk_soul', 4, 2, 4, 0.08, 50)
                for (var i = 0; i < ER_PEDESTALS.length; i++) {
                    var ped = ER_PEDESTALS[i]
                    if (ped.phase === 2) {
                        erParticle(server, dim, cx + ped.dx, cy + 1, cz + ped.dz, 'minecraft:flash', 0, 0, 0, 0, 1)
                    }
                }
            }

            // === PHASE 3 COMPLETION (3 minutes) - final, drop antimetal ===
            if (elapsed >= ER_PROCESS_TICKS) {
                erConsumePedestals(level, cx, cy, cz, 3)
                // Spawn output at center
                for (var j = 0; j < recipe.output_count; j++) {
                    server.runCommandSilent('execute in ' + dim + ' positioned ' + cx + ' ' + (cy + 1) + ' ' + cz + ' run summon minecraft:item ~ ~ ~ {Item:{id:"' + recipe.output_item + '",count:1},PickupDelay:40}')
                }
                // Completion effects
                erPlaySound(server, dim, cx, cy, cz, 'minecraft:ui.toast.challenge_complete', 1.0, 1.0)
                erPlaySound(server, dim, cx, cy, cz, 'minecraft:entity.warden.death', 0.8, 0.3)
                erParticle(server, dim, cx, cy, cz, 'minecraft:flash', 0, 0, 0, 0, 1)
                erParticle(server, dim, cx, cy + 1, cz, 'minecraft:end_rod', 2, 2, 2, 0.1, 80)
                erParticle(server, dim, cx, cy, cz, 'minecraft:sculk_soul', 3, 2, 3, 0.1, 60)
                erParticle(server, dim, cx, cy, cz, 'minecraft:portal', 3, 3, 3, 1.0, 200)
                delete erProcessing[key]
                continue
            }

            // === ONGOING EFFECTS (every tick check, runs every second) ===
            var progress = elapsed / ER_PROCESS_TICKS // 0.0 to 1.0
            var intensity = 1 + Math.floor(progress * 3) // 1, 2, or 3

            // Particles from pedestals that still have items
            for (var i = 0; i < ER_PEDESTALS.length; i++) {
                var ped = ER_PEDESTALS[i]
                if (ped.phase > currentPhase) {
                    var px = cx + ped.dx, pz = cz + ped.dz
                    erParticle(server, dim, px, cy + 1, pz, 'minecraft:enchant', 0.2, 0.5, 0.2, 0.1, intensity * 2)
                    if (intensity >= 2) {
                        erParticle(server, dim, px, cy + 1, pz, 'minecraft:sculk_charge_pop', 0.3, 0.3, 0.3, 0.02, intensity)
                    }
                }
            }

            // Center particles
            erParticle(server, dim, cx, cy + 1, cz, 'minecraft:portal', 1.5, 1.5, 1.5, 0.5, intensity * 5)
            erParticle(server, dim, cx, cy, cz, 'minecraft:witch', 2, 0.5, 2, 0.05, intensity * 3)

            // Sculk particles around the platform
            if (intensity >= 2) {
                erParticle(server, dim, cx, cy, cz, 'minecraft:sculk_soul', 4, 0.5, 4, 0.02, intensity * 2)
            }

            // Ambient sounds at intervals
            if (elapsed % 80 === 0) {
                erPlaySound(server, dim, cx, cy, cz, 'minecraft:ambient.soul_sand_valley.mood', 0.6, 0.3)
            }
            if (elapsed % 120 === 0) {
                erPlaySound(server, dim, cx, cy, cz, 'minecraft:entity.warden.heartbeat', 0.5, 0.5)
            }
            if (elapsed % 200 === 0) {
                erPlaySound(server, dim, cx, cy, cz, 'minecraft:block.sculk_shrieker.shriek', 0.4, 0.3)
            }
            if (elapsed % 160 === 0 && intensity >= 2) {
                erPlaySound(server, dim, cx, cy, cz, 'minecraft:entity.warden.ambient', 0.5, 0.4)
            }
            if (elapsed % 100 === 0 && intensity >= 3) {
                erPlaySound(server, dim, cx, cy, cz, 'minecraft:entity.warden.nearby_closest', 0.6, 0.3)
            }

            // Progress actionbar message to nearby players
            var minutesLeft = Math.ceil((ER_PROCESS_TICKS - elapsed) / 1200)
            var pct = Math.floor(progress * 100)
            if (elapsed % 60 === 0) {
                server.runCommandSilent('execute in ' + dim + ' positioned ' + cx + ' ' + cy + ' ' + cz + ' run immersivemessages sendcustom @a[distance=..32] {anchor:"BOTTOM_CENTER",color:"#AA00AA",size:0.9,y:-30.0,italic:1} 3 \u2726 Ritual da ' + recipe.name + ': ' + pct + '% (' + minutesLeft + ' min) \u2726')
            }
        }
    }
})

// ============ ACTIVATION TRIGGER ============
// Place center item on center pedestal LAST to activate the ritual
BlockEvents.rightClicked('ars_nouveau:arcane_pedestal', function (event) {
    try {
        var player = event.entity
        var server = event.server
        var level = event.level
        if (level.clientSide) return

        // Only trigger when player is holding a valid center item
        if (!event.item) return
        var heldId = event.item.id
        var matchedRecipe = null
        for (var i = 0; i < ER_RECIPES.length; i++) {
            if (ER_RECIPES[i].center_item === heldId) {
                matchedRecipe = ER_RECIPES[i]
                break
            }
        }
        if (!matchedRecipe) return

        var bx = event.block.x
        var by = event.block.y
        var bz = event.block.z
        var dim = level.dimension.toString()

        // Check if this pedestal is already part of an active ritual
        var ritualKey = bx + ',' + by + ',' + bz + ',' + dim
        if (erProcessing[ritualKey]) return

        // Schedule validation 2 ticks later to let the item be placed on the pedestal
        // Capture server/level in closure (KubeJS scheduled callback has no .server)
        var capturedServer = server
        var capturedLevel = level
        server.scheduleInTicks(2, function () {
            try {
                var tick = capturedServer.tickCount

                // Find recipe again based on placed item
                var centerItemPlaced = erGetPedestalItemId(capturedLevel, bx, by, bz)
                var recipe = null
                for (var i = 0; i < ER_RECIPES.length; i++) {
                    if (ER_RECIPES[i].center_item === centerItemPlaced) {
                        recipe = ER_RECIPES[i]
                        break
                    }
                }
                if (!recipe) return

                // Re-check not already processing
                if (erProcessing[ritualKey]) return

                // Validate full structure
                if (!erValidateStructure(capturedLevel, bx, by, bz)) return

                // Check all pedestal items (outer + inner must already be placed)
                if (!erCheckPedestalItems(capturedLevel, bx, by, bz, recipe)) return

                // Start ritual!
                erProcessing[ritualKey] = {
                    startTick: tick,
                    centerPos: [bx, by, bz],
                    dim: dim,
                    consumedPhase: 0,
                    recipe: recipe
                }

                // Activation effects
                erPlaySound(capturedServer, dim, bx, by, bz, 'minecraft:block.beacon.activate', 1.0, 0.5)
                erPlaySound(capturedServer, dim, bx, by, bz, 'minecraft:block.end_portal.spawn', 0.6, 0.3)
                erPlaySound(capturedServer, dim, bx, by, bz, 'minecraft:entity.warden.emerge', 0.8, 0.3)
                erParticle(capturedServer, dim, bx, by, bz, 'minecraft:enchant', 3, 2, 3, 0.5, 100)
                erParticle(capturedServer, dim, bx, by, bz, 'minecraft:sculk_soul', 3, 1, 3, 0.05, 30)
                erParticle(capturedServer, dim, bx, by, bz, 'minecraft:portal', 3, 3, 3, 1.0, 100)

                capturedServer.runCommandSilent('execute in ' + dim + ' positioned ' + bx + ' ' + by + ' ' + bz + ' run immersivemessages sendcustom @a[distance=..32] {anchor:"CENTER_CENTER",color:"#5500AA",size:1.6,bold:1,shake:1,typewriter:1,sound:1,slideup:1,slideoutdown:1,background:1,borderTop:"#AA00AA",borderBottom:"#220044"} 6 \u2726 Ritual da ' + recipe.name + ' \u2726')
                capturedServer.runCommandSilent('execute in ' + dim + ' positioned ' + bx + ' ' + by + ' ' + bz + ' run immersivemessages sendcustom @a[distance=..32] {anchor:"CENTER_CENTER",color:"#777777",size:1.0,italic:1,typewriter:1,sound:1,y:18.0,slideup:1,slideoutdown:1} 6 O véu entre os mundos rasga diante de seus olhos...')
            } catch (e) {
                console.error('[Eldritch Ritual] Error in scheduled activation: ' + e)
            }
        })
    } catch (e) { }
})

console.info('[Eldritch Ritual] Loaded - Place a valid center item on center pedestal to activate')
