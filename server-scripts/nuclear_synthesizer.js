// Priority: 0
// Nuclear Synthesizer — Multiblock Crafting Machine
// 13x13x13 cube: reactor_casing frame, reinforced_glass faces, 3x3x3 onyx_chiseled_basalt center
// 4 input stations (chest + preservation_controller + onyx_chiseled_calcite) on N/S/E/W walls
// Right-click the onyx_chiseled_calcite to activate the synthesizer

// ============ CONFIGURATION ============
var NS_PROCESS_TICKS = 14400      // 12 minutes (720 seconds)

var NS_CORE_BLOCK = 'pastel:onyx_chiseled_basalt'
var NS_CASING = 'createnuclear:reactor_casing'
var NS_GLASS = 'createnuclear:reinforced_glass'
var NS_CHEST = 'minecraft:chest'
var NS_CONTROLLER = 'pastel:preservation_controller'
var NS_ACTIVATOR = 'pastel:onyx_chiseled_calcite'

// Recipes: array of { code, output, outputCount, items: [{item, count}...] }
// Items can go in ANY of the 4 chests (N/S/E/W) — no specific order required
var NS_RECIPES = [
    {
        code: 'Cura1',
        output: 'marbledsfirstaid:antidote',
        outputCount: 1,
        time: 14400, // 12 minutes
        items: [
            { item: 'deeperdarker:resonarium', count: 12 },
            { item: 'minecraft:gold_ingot', count: 48 },
            { item: 'createnuclear:uranium_rod', count: 16 },
            { item: 'create_deep_dark:echo_ingot', count: 12 }
        ]
    }
]

// Station positions relative to core center (dx, dy, dz)
// Controller against wall, chest one block inward, activator on top of controller
var NS_STATIONS = {
    north: { controller: [0, -5, -5], chest: [0, -5, -4], activator: [0, -4, -5] },
    south: { controller: [0, -5, 5], chest: [0, -5, 4], activator: [0, -4, 5] },
    east: { controller: [5, -5, 0], chest: [4, -5, 0], activator: [5, -4, 0] },
    west: { controller: [-5, -5, 0], chest: [-4, -5, 0], activator: [-5, -4, 0] }
}

// ============ STATE ============
var nsProcessing = {} // "x,y,z,dim" -> { startTick, centerPos, dim, recipe, processTime }

// ============ HELPERS ============

function nsGetLevel(server, dimKey) {
    var players = server.playerList.players
    for (var i = 0; i < players.size(); i++) {
        if (players.get(i).level.dimension.toString() === dimKey) {
            return players.get(i).level
        }
    }
    return null
}

function nsCheckBlock(level, cx, cy, cz, dx, dy, dz, expectedId) {
    try {
        var bid = level.getBlock(cx + dx, cy + dy, cz + dz).id
        return bid === expectedId
    } catch (e) { return false }
}

function nsCountItemInChest(level, x, y, z, itemId) {
    try {
        var block = level.getBlock(x, y, z)
        if (!block || block.id !== NS_CHEST) return -1
        var inv = block.inventory
        if (!inv) return -1
        var total = 0
        for (var slot = 0; slot < inv.size; slot++) {
            var stack = inv.getStackInSlot(slot)
            if (stack && !stack.isEmpty() && stack.id === itemId) {
                total += stack.count
            }
        }
        return total
    } catch (e) { return -1 }
}

function nsRemoveItemsFromChest(level, x, y, z, itemId, amount) {
    try {
        var block = level.getBlock(x, y, z)
        if (!block) return
        var inv = block.inventory
        if (!inv) return
        var remaining = amount
        for (var slot = 0; slot < inv.size && remaining > 0; slot++) {
            var stack = inv.getStackInSlot(slot)
            if (stack && !stack.isEmpty() && stack.id === itemId) {
                var take = Math.min(remaining, stack.count)
                inv.extractItem(slot, take, false)
                remaining -= take
            }
        }
        if (block.entity) block.entity.setChanged()
    } catch (e) { }
}

function nsValidateStructure(level, cx, cy, cz) {
    // Check 3x3x3 reactor_core
    for (var dx = -1; dx <= 1; dx++) {
        for (var dy = -1; dy <= 1; dy++) {
            for (var dz = -1; dz <= 1; dz++) {
                if (!nsCheckBlock(level, cx, cy, cz, dx, dy, dz, NS_CORE_BLOCK)) return false
            }
        }
    }

    // Check 8 corners of the 13x13x13 frame (reactor_casing)
    var corners = [
        [-6, -6, -6], [6, -6, -6], [-6, 6, -6], [6, 6, -6],
        [-6, -6, 6], [6, -6, 6], [-6, 6, 6], [6, 6, 6]
    ]
    for (var i = 0; i < corners.length; i++) {
        var c = corners[i]
        if (!nsCheckBlock(level, cx, cy, cz, c[0], c[1], c[2], NS_CASING)) return false
    }

    // Check 12 edge midpoints (reactor_casing)
    var edgeMids = [
        [0, -6, -6], [0, 6, -6], [0, -6, 6], [0, 6, 6],   // X-axis edges
        [-6, 0, -6], [6, 0, -6], [-6, 0, 6], [6, 0, 6],    // Y-axis edges
        [-6, -6, 0], [6, -6, 0], [-6, 6, 0], [6, 6, 0]     // Z-axis edges
    ]
    for (var i = 0; i < edgeMids.length; i++) {
        var e = edgeMids[i]
        if (!nsCheckBlock(level, cx, cy, cz, e[0], e[1], e[2], NS_CASING)) return false
    }

    // Check 6 face centers (reinforced_glass)
    var faceCenters = [
        [0, 0, -6], [0, 0, 6], [-6, 0, 0], [6, 0, 0], [0, -6, 0], [0, 6, 0]
    ]
    for (var i = 0; i < faceCenters.length; i++) {
        var f = faceCenters[i]
        if (!nsCheckBlock(level, cx, cy, cz, f[0], f[1], f[2], NS_GLASS)) return false
    }

    // Check additional glass spots on each face for more thorough validation
    var glassSpots = [
        [0, 2, -6], [0, -2, -6], [2, 0, -6], [-2, 0, -6],   // North face
        [0, 2, 6], [0, -2, 6], [2, 0, 6], [-2, 0, 6],     // South face
        [-6, 2, 0], [-6, -2, 0], [-6, 0, 2], [-6, 0, -2],     // West face
        [6, 2, 0], [6, -2, 0], [6, 0, 2], [6, 0, -2],      // East face
        [2, -6, 0], [-2, -6, 0], [0, -6, 2], [0, -6, -2],     // Bottom face
        [2, 6, 0], [-2, 6, 0], [0, 6, 2], [0, 6, -2]       // Top face
    ]
    for (var i = 0; i < glassSpots.length; i++) {
        var g = glassSpots[i]
        if (!nsCheckBlock(level, cx, cy, cz, g[0], g[1], g[2], NS_GLASS)) return false
    }

    // Check 4 stations (controller + chest + computer)
    var sides = ['north', 'south', 'east', 'west']
    for (var s = 0; s < sides.length; s++) {
        var station = NS_STATIONS[sides[s]]
        var ctrl = station.controller
        var ch = station.chest
        var act = station.activator
        if (!nsCheckBlock(level, cx, cy, cz, ctrl[0], ctrl[1], ctrl[2], NS_CONTROLLER)) return false
        if (!nsCheckBlock(level, cx, cy, cz, ch[0], ch[1], ch[2], NS_CHEST)) return false
        if (!nsCheckBlock(level, cx, cy, cz, act[0], act[1], act[2], NS_ACTIVATOR)) return false
    }

    return true
}

function nsCheckRecipe(level, cx, cy, cz) {
    // Collect all items from all 4 chests into a combined inventory
    var allSides = ['north', 'south', 'east', 'west']
    var totalItems = {} // itemId -> total count across all chests

    for (var s = 0; s < allSides.length; s++) {
        var chestPos = NS_STATIONS[allSides[s]].chest
        try {
            var block = level.getBlock(cx + chestPos[0], cy + chestPos[1], cz + chestPos[2])
            if (!block || block.id !== NS_CHEST) continue
            var inv = block.inventory
            if (!inv) continue
            for (var slot = 0; slot < inv.size; slot++) {
                var stack = inv.getStackInSlot(slot)
                if (stack && !stack.isEmpty()) {
                    if (!totalItems[stack.id]) totalItems[stack.id] = 0
                    totalItems[stack.id] += stack.count
                }
            }
        } catch (e) { }
    }

    // Check each recipe against the combined inventory
    for (var r = 0; r < NS_RECIPES.length; r++) {
        var recipe = NS_RECIPES[r]
        var valid = true
        for (var i = 0; i < recipe.items.length; i++) {
            var req = recipe.items[i]
            if (!totalItems[req.item] || totalItems[req.item] < req.count) {
                valid = false
                break
            }
        }
        if (valid) return recipe
    }
    return null
}

function nsConsumeRecipeItems(level, cx, cy, cz, recipe) {
    // For each required item, consume from any chests that have it
    var allSides = ['north', 'south', 'east', 'west']
    for (var i = 0; i < recipe.items.length; i++) {
        var req = recipe.items[i]
        var remaining = req.count
        for (var s = 0; s < allSides.length && remaining > 0; s++) {
            var chestPos = NS_STATIONS[allSides[s]].chest
            var beforeCount = nsCountItemInChest(level, cx + chestPos[0], cy + chestPos[1], cz + chestPos[2], req.item)
            if (beforeCount <= 0) continue
            var toRemove = Math.min(remaining, beforeCount)
            nsRemoveItemsFromChest(level, cx + chestPos[0], cy + chestPos[1], cz + chestPos[2], req.item, toRemove)
            remaining -= toRemove
        }
    }
}

function nsRunCmd(server, dim, x, y, z, cmd) {
    server.runCommandSilent('execute in ' + dim + ' positioned ' + x + ' ' + y + ' ' + z + ' run ' + cmd)
}

function nsPlaySound(server, dim, x, y, z, sound, volume, pitch) {
    nsRunCmd(server, dim, x, y, z, 'playsound ' + sound + ' master @a[distance=..48] ~ ~ ~ ' + volume + ' ' + pitch)
}

function nsParticle(server, dim, x, y, z, particle, dx, dy, dz, speed, count) {
    nsRunCmd(server, dim, x, y, z, 'particle ' + particle + ' ~ ~ ~ ' + dx + ' ' + dy + ' ' + dz + ' ' + speed + ' ' + count + ' force')
}

// ============ MAIN TICK ============
ServerEvents.tick(function (event) {
    var tick = event.server.tickCount
    var server = event.server

    // --- Process active synthesizers every second ---
    if (tick % 20 === 0) {
        var keys = Object.keys(nsProcessing)
        for (var k = 0; k < keys.length; k++) {
            var key = keys[k]
            var m = nsProcessing[key]
            var elapsed = tick - m.startTick
            var dim = m.dim
            var cx = m.centerPos[0], cy = m.centerPos[1], cz = m.centerPos[2]

            var level = nsGetLevel(server, dim)
            if (!level) continue

            // Verify core still exists
            if (!nsCheckBlock(level, cx, cy, cz, 0, 0, 0, NS_CORE_BLOCK)) {
                delete nsProcessing[key]
                nsPlaySound(server, dim, cx, cy, cz, 'minecraft:block.beacon.deactivate', 1.0, 0.5)
                continue
            }

            // === COMPLETE ===
            if (elapsed >= m.processTime) {
                // Consume items from chests
                nsConsumeRecipeItems(level, cx, cy, cz, m.recipe)

                // Spawn output at core center
                for (var j = 0; j < m.recipe.outputCount; j++) {
                    server.runCommandSilent('execute in ' + dim + ' positioned ' + cx + ' ' + (cy - 1) + ' ' + cz + ' run summon minecraft:item ~ ~ ~ {Item:{id:"' + m.recipe.output + '",count:1},PickupDelay:40}')
                }

                // Completion effects
                nsPlaySound(server, dim, cx, cy, cz, 'minecraft:ui.toast.challenge_complete', 1.0, 1.0)
                nsPlaySound(server, dim, cx, cy, cz, 'minecraft:block.beacon.power_select', 1.0, 1.5)
                nsParticle(server, dim, cx, cy, cz, 'minecraft:flash', 0, 0, 0, 0, 1)
                nsParticle(server, dim, cx, cy, cz, 'minecraft:end_rod', 3, 3, 3, 0.1, 80)
                nsParticle(server, dim, cx, cy, cz, 'minecraft:totem_of_undying', 2, 2, 2, 0.5, 100)

                server.runCommandSilent('execute in ' + dim + ' positioned ' + cx + ' ' + cy + ' ' + cz + ' run immersivemessages sendcustom @a[distance=..32] {anchor:"CENTER_CENTER",color:"#55FF55",size:1.5,bold:1,typewriter:1,sound:1,slideup:1,slideoutdown:1,background:1,borderTop:"#55FF55",borderBottom:"#00AA00",rainbow:1} 6 \u2726 Sintese Completa \u2726')
                server.runCommandSilent('execute in ' + dim + ' positioned ' + cx + ' ' + cy + ' ' + cz + ' run immersivemessages sendcustom @a[distance=..32] {anchor:"CENTER_CENTER",color:"#AAAAAA",size:1.0,italic:1,typewriter:1,sound:1,y:18.0,slideup:1,slideoutdown:1} 6 ' + m.recipe.code + ' finalizado com sucesso')

                delete nsProcessing[key]
                continue
            }

            // === ONGOING EFFECTS ===
            var progress = elapsed / m.processTime
            var pct = Math.floor(progress * 100)

            // ---- PHASE 1 (0-33%): Startup / Warm-up ----
            if (progress <= 0.33) {
                if (elapsed % 60 === 0) {
                    nsPlaySound(server, dim, cx, cy, cz, 'minecraft:block.furnace.fire_crackle', 0.5, 0.8)
                }
                if (elapsed % 100 === 0) {
                    nsPlaySound(server, dim, cx, cy, cz, 'minecraft:block.conduit.ambient', 0.3, 1.0)
                }
                if (elapsed % 200 === 0) {
                    nsPlaySound(server, dim, cx, cy, cz, 'create:mechanical_press', 0.4, 0.6)
                }
                if (elapsed % 300 === 0) {
                    nsPlaySound(server, dim, cx, cy, cz, 'minecraft:block.piston.extend', 0.3, 0.7)
                }
            }

            // ---- PHASE 2 (33-66%): Active Processing ----
            if (progress > 0.33 && progress <= 0.66) {
                if (elapsed % 40 === 0) {
                    nsPlaySound(server, dim, cx, cy, cz, 'create:mechanical_mixer', 0.5, 1.0)
                }
                if (elapsed % 80 === 0) {
                    nsPlaySound(server, dim, cx, cy, cz, 'minecraft:block.furnace.fire_crackle', 0.6, 1.0)
                }
                if (elapsed % 120 === 0) {
                    nsPlaySound(server, dim, cx, cy, cz, 'minecraft:entity.iron_golem.repair', 0.5, 0.5)
                }
                if (elapsed % 200 === 0) {
                    nsPlaySound(server, dim, cx, cy, cz, 'immersiveengineering:crusher', 0.3, 1.2)
                }
                if (elapsed % 240 === 0) {
                    nsPlaySound(server, dim, cx, cy, cz, 'create:deployer', 0.4, 0.8)
                }
            }

            // ---- PHASE 3 (66-100%): Critical / Intensifying ----
            if (progress > 0.66) {
                if (elapsed % 40 === 0) {
                    nsPlaySound(server, dim, cx, cy, cz, 'create:mechanical_press', 0.6, 1.2)
                }
                if (elapsed % 60 === 0) {
                    nsPlaySound(server, dim, cx, cy, cz, 'minecraft:block.furnace.fire_crackle', 0.7, 1.2)
                }
                if (elapsed % 80 === 0) {
                    nsPlaySound(server, dim, cx, cy, cz, 'immersiveengineering:arc_furnace', 0.5, 0.8)
                }
                if (elapsed % 100 === 0) {
                    nsPlaySound(server, dim, cx, cy, cz, 'create:mechanical_mixer', 0.6, 1.3)
                }
                if (elapsed % 160 === 0) {
                    nsPlaySound(server, dim, cx, cy, cz, 'createnuclear:geiger_counter', 0.4, 1.0)
                }
                if (elapsed % 200 === 0) {
                    nsPlaySound(server, dim, cx, cy, cz, 'alexscaves:nuclear_siren', 0.3, 1.5)
                }
            }

            // Persistent ambient hum (all phases)
            if (elapsed % 400 === 0) {
                nsPlaySound(server, dim, cx, cy, cz, 'minecraft:block.beacon.ambient', 0.3, 1.5)
            }
            if (elapsed % 500 === 0) {
                nsPlaySound(server, dim, cx, cy, cz, 'minecraft:block.conduit.ambient', 0.2, 0.6)
            }

            // Particles around the core (intensity scales with progress)
            nsParticle(server, dim, cx, cy, cz, 'minecraft:enchant', 1.5, 1.5, 1.5, 0.5, 5)
            nsParticle(server, dim, cx, cy, cz, 'minecraft:portal', 1, 1, 1, 0.3, 3)

            // Particles from chests toward core (every 3 seconds)
            if (elapsed % 60 === 0) {
                var sides = ['north', 'south', 'east', 'west']
                for (var s = 0; s < sides.length; s++) {
                    var chPos = NS_STATIONS[sides[s]].chest
                    nsParticle(server, dim, cx + chPos[0], cy + chPos[1] + 1, cz + chPos[2], 'minecraft:enchant', 0.3, 0.5, 0.3, 0.2, 5)
                }
            }

            // Intensifying effects based on progress
            if (progress > 0.33) {
                nsParticle(server, dim, cx, cy, cz, 'minecraft:smoke', 1, 1, 1, 0.02, 2)
            }
            if (progress > 0.5) {
                nsParticle(server, dim, cx, cy, cz, 'minecraft:end_rod', 1, 1, 1, 0.02, 2)
                nsParticle(server, dim, cx, cy, cz, 'minecraft:flame', 0.5, 0.5, 0.5, 0.01, 1)
            }
            if (progress > 0.75) {
                nsParticle(server, dim, cx, cy, cz, 'minecraft:glow', 1.5, 1.5, 1.5, 0.01, 3)
                nsParticle(server, dim, cx, cy, cz, 'minecraft:soul_fire_flame', 0.8, 0.8, 0.8, 0.02, 2)
            }
            if (progress > 0.9) {
                nsParticle(server, dim, cx, cy, cz, 'minecraft:flash', 0, 0, 0, 0, 1)
            }

            // Progress bar with visual bar
            if (elapsed % 40 === 0) {
                var minutesLeft = Math.ceil((m.processTime - elapsed) / 1200)
                var barLength = 20
                var filled = Math.floor(pct / 100 * barLength)
                var bar = ''
                for (var b = 0; b < barLength; b++) {
                    bar += b < filled ? '\u2593' : '\u2591'
                }
                server.runCommandSilent('execute in ' + dim + ' positioned ' + cx + ' ' + cy + ' ' + cz + ' run immersivemessages sendcustom @a[distance=..32] {anchor:"BOTTOM_CENTER",color:"#FFAA00",size:0.9,y:-30.0} 3 \u2699 ' + bar + ' ' + pct + '% (' + minutesLeft + ' min) \u2699')
            }
        }
    }

})

// ============ ACTIVATION TRIGGER ============
// Right-click the onyx_chiseled_calcite activator block to start the synthesizer
BlockEvents.rightClicked(NS_ACTIVATOR, function (event) {
    try {
        var player = event.entity
        var server = event.server
        var level = event.level
        if (level.clientSide) return

        var bx = event.block.x
        var by = event.block.y
        var bz = event.block.z
        var dim = level.dimension.toString()
        var tick = server.tickCount

        // Try each station to reverse-calculate the core center from this activator position
        var sides = ['north', 'south', 'east', 'west']
        for (var s = 0; s < sides.length; s++) {
            var station = NS_STATIONS[sides[s]]
            var act = station.activator
            // If this activator is at station's activator offset from the core center,
            // then core center = activator_pos - activator_offset
            var coreX = bx - act[0]
            var coreY = by - act[1]
            var coreZ = bz - act[2]

            // Quick check: is there actually a core block at the calculated center?
            try {
                if (level.getBlock(coreX, coreY, coreZ).id !== NS_CORE_BLOCK) continue
            } catch (be) { continue }

            var machineKey = coreX + ',' + coreY + ',' + coreZ + ',' + dim

            // Already processing?
            if (nsProcessing[machineKey]) {
                server.runCommandSilent('execute in ' + dim + ' positioned ' + bx + ' ' + by + ' ' + bz + ' run immersivemessages sendcustom @a[distance=..8] {anchor:"CENTER_CENTER",color:"#FFAA00",size:1.0,italic:1,slideup:1,slideoutdown:1} 3 \u2699 Sintetizador ja esta em operacao! \u2699')
                return
            }

            // Validate full structure
            if (!nsValidateStructure(level, coreX, coreY, coreZ)) {
                server.runCommandSilent('execute in ' + dim + ' positioned ' + bx + ' ' + by + ' ' + bz + ' run immersivemessages sendcustom @a[distance=..8] {anchor:"CENTER_CENTER",color:"#FF5555",size:1.0,bold:1,shake:1,slideup:1,slideoutdown:1} 4 \u2716 Estrutura incompleta ou invalida!')
                return
            }

            // Check recipe — collect what's in chests
            var recipe = nsCheckRecipe(level, coreX, coreY, coreZ)
            if (!recipe) {
                // Build a detailed error message showing what's missing
                var errorLines = []
                for (var r = 0; r < NS_RECIPES.length; r++) {
                    var rec = NS_RECIPES[r]
                    var allChestSides = ['north', 'south', 'east', 'west']
                    var itemTotals = {}
                    for (var cs = 0; cs < allChestSides.length; cs++) {
                        var chestPos = NS_STATIONS[allChestSides[cs]].chest
                        try {
                            var block = level.getBlock(coreX + chestPos[0], coreY + chestPos[1], coreZ + chestPos[2])
                            if (!block || block.id !== NS_CHEST) continue
                            var inv = block.inventory
                            if (!inv) continue
                            for (var slot = 0; slot < inv.size; slot++) {
                                var stack = inv.getStackInSlot(slot)
                                if (stack && !stack.isEmpty()) {
                                    if (!itemTotals[stack.id]) itemTotals[stack.id] = 0
                                    itemTotals[stack.id] += stack.count
                                }
                            }
                        } catch (ie) { }
                    }
                    for (var i = 0; i < rec.items.length; i++) {
                        var req = rec.items[i]
                        var have = itemTotals[req.item] || 0
                        if (have < req.count) {
                            var shortName = req.item.split(':')[1].replace(/_/g, ' ')
                            errorLines.push(shortName + ': ' + have + '/' + req.count)
                        }
                    }
                }
                // Show error with missing items
                var errorMsg = errorLines.length > 0 ? 'Faltam: ' + errorLines.join(', ') : 'Nenhuma receita corresponde aos itens'
                server.runCommandSilent('execute in ' + dim + ' positioned ' + bx + ' ' + by + ' ' + bz + ' run immersivemessages sendcustom @a[distance=..8] {anchor:"CENTER_CENTER",color:"#FF5555",size:1.0,bold:1,slideup:1,slideoutdown:1} 4 \u2716 Itens incorretos!')
                server.runCommandSilent('execute in ' + dim + ' positioned ' + bx + ' ' + by + ' ' + bz + ' run immersivemessages sendcustom @a[distance=..8] {anchor:"CENTER_CENTER",color:"#FFAAAA",size:0.8,italic:1,y:14.0,slideup:1,slideoutdown:1,wrap:1} 6 ' + errorMsg)
                return
            }

            // All checks passed — start processing!
            nsConsumeRecipeItems(level, coreX, coreY, coreZ, recipe)
            nsProcessing[machineKey] = {
                startTick: tick,
                centerPos: [coreX, coreY, coreZ],
                dim: dim,
                recipe: recipe,
                processTime: recipe.time
            }

            // Activation effects
            nsPlaySound(server, dim, coreX, coreY, coreZ, 'minecraft:block.beacon.activate', 1.0, 0.8)
            nsPlaySound(server, dim, coreX, coreY, coreZ, 'minecraft:block.conduit.activate', 0.8, 1.0)
            nsPlaySound(server, dim, coreX, coreY, coreZ, 'create:mechanical_press', 0.6, 0.6)
            nsParticle(server, dim, coreX, coreY, coreZ, 'minecraft:enchant', 3, 3, 3, 1.0, 100)
            nsParticle(server, dim, coreX, coreY, coreZ, 'minecraft:end_rod', 2, 2, 2, 0.1, 50)

            server.runCommandSilent('execute in ' + dim + ' positioned ' + coreX + ' ' + coreY + ' ' + coreZ + ' run immersivemessages sendcustom @a[distance=..32] {anchor:"CENTER_CENTER",color:"#FFAA00",size:1.5,bold:1,typewriter:1,sound:1,slideup:1,slideoutdown:1,background:1,borderTop:"#FFAA00",borderBottom:"#AA5500"} 5 \u2699 Sintetizador Nuclear Ativado \u2699')
            server.runCommandSilent('execute in ' + dim + ' positioned ' + coreX + ' ' + coreY + ' ' + coreZ + ' run immersivemessages sendcustom @a[distance=..32] {anchor:"CENTER_CENTER",color:"#AAAAAA",size:1.0,italic:1,typewriter:1,sound:1,y:18.0,slideup:1,slideoutdown:1} 5 Sintetizando: ' + recipe.code)
            return // Found a valid machine
        }
    } catch (e) { }
})

console.info('[Nuclear Synthesizer] Loaded \u2014 Right-click onyx_chiseled_calcite to activate')
