// Priority: 0
// Arcane Transmutation Machine
// 4 items on arcane_pedestals near spell_sensor, earth_relay, transmutation_turret
// Right-click earth_relay to activate. After 30 seconds: consume items -> outputs

// ============ CONFIGURATION ============
var ATM_PROCESS_TICKS = 600       // 30 seconds processing time
var ATM_MACHINE_RADIUS = 6        // Radius to find machine parts around turret

var ATM_PEDESTAL = 'ars_nouveau:arcane_pedestal'
var ATM_REQUIRED_BLOCKS = [
    'ars_nouveau:spell_sensor',
    'ars_elemental:earth_relay',
    'ars_technica:transmutation_turret'
]
var ATM_PEDESTAL_COUNT = 4

// ============ RECIPES ============
// Each recipe: { inputs: [{id, count}], outputs: [{id, count}] }
// Total input count must equal ATM_PEDESTAL_COUNT (4)
var ATM_RECIPES = [
    {
        name: 'Amuleto da Salvação e da Ressonância',
        inputs: [
            { id: 'createnuclear:uranium_rod', count: 4 }
        ],
        outputs: [
            { id: 'ars_additions:void_protection_charm', count: 10 },
            { id: 'ars_additions:sonic_boom_protection_charm', count: 10 }
        ]
    },
    {
        name: 'Alma Funebre',
        inputs: [
            { id: 'irons_spellbooks:blood_vial', count: 2 },
            { id: 'discerning_the_eldritch:shard_of_malice', count: 2 }
        ],
        outputs: [
            { id: 'vampirism:soul_orb_vampire', count: 4 }
        ]
    }
]

// ============ STATE ============
var atmProcessing = {} // "x,y,z,dim" -> { startTick, pedestals, turretPos, dim }

// ============ HELPERS ============

function atmGetPedestalItemId(level, x, y, z) {
    try {
        var block = level.getBlock(x, y, z)
        if (!block || block.id !== ATM_PEDESTAL) return null
        var inv = block.inventory
        if (!inv) return null
        var stack = inv.getStackInSlot(0)
        if (!stack || stack.isEmpty()) return null
        return stack.id
    } catch (e) { return null }
}

function atmClearPedestal(level, x, y, z) {
    try {
        var block = level.getBlock(x, y, z)
        if (!block) return
        var inv = block.inventory
        if (inv) inv.extractItem(0, 64, false)
        if (block.entity) block.entity.setChanged()
    } catch (e) { }
}

function atmValidateStructure(level, tx, ty, tz) {
    var r = ATM_MACHINE_RADIUS
    var found = {}
    var pedestals = []

    for (var dx = -r; dx <= r; dx++) {
        for (var dy = -r; dy <= r; dy++) {
            for (var dz = -r; dz <= r; dz++) {
                try {
                    var bid = level.getBlock(tx + dx, ty + dy, tz + dz).id
                    if (bid === ATM_PEDESTAL) {
                        pedestals.push([tx + dx, ty + dy, tz + dz])
                    }
                    for (var i = 0; i < ATM_REQUIRED_BLOCKS.length; i++) {
                        if (bid === ATM_REQUIRED_BLOCKS[i]) found[bid] = true
                    }
                } catch (e) { }
            }
        }
    }

    // Check all required blocks present
    for (var i = 0; i < ATM_REQUIRED_BLOCKS.length; i++) {
        if (!found[ATM_REQUIRED_BLOCKS[i]]) return null
    }
    if (pedestals.length < ATM_PEDESTAL_COUNT) return null

    // Try to match a recipe: count items on pedestals
    for (var ri = 0; ri < ATM_RECIPES.length; ri++) {
        var recipe = ATM_RECIPES[ri]
        var matched = []
        var itemCounts = {} // track how many of each required input we found

        // Initialize required counts
        var needed = {}
        for (var inp = 0; inp < recipe.inputs.length; inp++) {
            needed[recipe.inputs[inp].id] = recipe.inputs[inp].count
        }

        // Scan pedestals for matching items
        for (var pi = 0; pi < pedestals.length; pi++) {
            var p = pedestals[pi]
            var itemId = atmGetPedestalItemId(level, p[0], p[1], p[2])
            if (itemId && needed[itemId] !== undefined) {
                if (!itemCounts[itemId]) itemCounts[itemId] = 0
                if (itemCounts[itemId] < needed[itemId]) {
                    itemCounts[itemId]++
                    matched.push(p)
                }
            }
        }

        // Verify all inputs satisfied
        var allSatisfied = true
        for (var inp = 0; inp < recipe.inputs.length; inp++) {
            var req = recipe.inputs[inp]
            if (!itemCounts[req.id] || itemCounts[req.id] < req.count) {
                allSatisfied = false
                break
            }
        }

        if (allSatisfied && matched.length >= ATM_PEDESTAL_COUNT) {
            return { pedestals: matched, recipe: recipe }
        }
    }
    return null
}

// ============ MAIN TICK ============
ServerEvents.tick(function (event) {
    var tick = event.server.tickCount
    var server = event.server

    // --- Process active machines every second ---
    if (tick % 20 === 0) {
        var keys = Object.keys(atmProcessing)
        for (var k = 0; k < keys.length; k++) {
            var key = keys[k]
            var m = atmProcessing[key]
            var elapsed = tick - m.startTick
            var dim = m.dim
            var tx = m.turretPos[0], ty = m.turretPos[1], tz = m.turretPos[2]

            // Get level from any player in this dimension
            var level = null
            var players = server.playerList.players
            for (var p = 0; p < players.size(); p++) {
                if (players.get(p).level.dimension.toString() === dim) {
                    level = players.get(p).level
                    break
                }
            }
            if (!level) continue

            // Validate turret still exists
            try {
                if (level.getBlock(tx, ty, tz).id !== 'ars_technica:transmutation_turret') {
                    delete atmProcessing[key]
                    continue
                }
            } catch (e) { delete atmProcessing[key]; continue }

            // Verify pedestals still have correct items for this recipe
            var allValid = true
            var recipeInputIds = {}
            for (var ri = 0; ri < m.recipe.inputs.length; ri++) {
                recipeInputIds[m.recipe.inputs[ri].id] = true
            }
            for (var i = 0; i < m.pedestals.length; i++) {
                var pp = m.pedestals[i]
                var pedItem = atmGetPedestalItemId(level, pp[0], pp[1], pp[2])
                if (!pedItem || !recipeInputIds[pedItem]) {
                    allValid = false
                    break
                }
            }
            if (!allValid) {
                delete atmProcessing[key]
                server.runCommandSilent('execute in ' + dim + ' positioned ' + tx + ' ' + ty + ' ' + tz + ' run playsound minecraft:block.beacon.deactivate master @a[distance=..32] ~ ~ ~ 1.0 0.5')
                continue
            }

            // === COMPLETE ===
            if (elapsed >= ATM_PROCESS_TICKS) {
                // Consume pedestal items
                for (var i = 0; i < m.pedestals.length; i++) {
                    var pp = m.pedestals[i]
                    atmClearPedestal(level, pp[0], pp[1], pp[2])
                }
                // Spawn outputs below turret
                for (var i = 0; i < m.recipe.outputs.length; i++) {
                    var out = m.recipe.outputs[i]
                    for (var j = 0; j < out.count; j++) {
                        server.runCommandSilent('execute in ' + dim + ' positioned ' + tx + ' ' + ty + ' ' + tz + ' run summon minecraft:item ~ ~-1 ~ {Item:{id:"' + out.id + '",count:1},PickupDelay:40}')
                    }
                }
                // Completion effects
                server.runCommandSilent('execute in ' + dim + ' positioned ' + tx + ' ' + (ty - 1) + ' ' + tz + ' run particle minecraft:flash ~ ~ ~ 0 0 0 0 1 force')
                server.runCommandSilent('execute in ' + dim + ' positioned ' + tx + ' ' + (ty - 1) + ' ' + tz + ' run particle minecraft:end_rod ~ ~ ~ 1 1 1 0.1 50 force')
                server.runCommandSilent('execute in ' + dim + ' positioned ' + tx + ' ' + ty + ' ' + tz + ' run playsound minecraft:ui.toast.challenge_complete master @a[distance=..32] ~ ~ ~ 1.0 1.0')
                delete atmProcessing[key]
                continue
            }

            // === PROCESSING PARTICLES ===
            for (var i = 0; i < m.pedestals.length; i++) {
                var pp = m.pedestals[i]
                server.runCommandSilent('execute in ' + dim + ' positioned ' + pp[0] + ' ' + (pp[1] + 1) + ' ' + pp[2] + ' run particle minecraft:enchant ~ ~0.5 ~ 0.2 0.3 0.2 0.1 5 force')
            }
            server.runCommandSilent('execute in ' + dim + ' positioned ' + tx + ' ' + ty + ' ' + tz + ' run particle minecraft:end_rod ~ ~-0.5 ~ 0.3 0.5 0.3 0.02 3 force')

            // Ambient sound every 5 seconds
            if (elapsed % 100 === 0) {
                server.runCommandSilent('execute in ' + dim + ' positioned ' + tx + ' ' + ty + ' ' + tz + ' run playsound minecraft:block.conduit.ambient master @a[distance=..32] ~ ~ ~ 0.5 1.5')
            }
        }
    }
})

// ============ ACTIVATION TRIGGER ============
// Right-click the earth_relay to start the transmutation
BlockEvents.rightClicked('ars_elemental:earth_relay', function (event) {
    try {
        var server = event.server
        var level = event.level
        if (level.clientSide) return

        var relayX = event.block.x
        var relayY = event.block.y
        var relayZ = event.block.z
        var dim = level.dimension.toString()
        var tick = server.tickCount

        // Search for transmutation_turret nearby
        var r = ATM_MACHINE_RADIUS
        for (var dx = -r; dx <= r; dx++) {
            for (var dy = -r; dy <= r; dy++) {
                for (var dz = -r; dz <= r; dz++) {
                    try {
                        var bx = relayX + dx, by = relayY + dy, bz = relayZ + dz
                        if (level.getBlock(bx, by, bz).id !== 'ars_technica:transmutation_turret') continue

                        var machineKey = bx + ',' + by + ',' + bz + ',' + dim
                        if (atmProcessing[machineKey]) continue

                        var result = atmValidateStructure(level, bx, by, bz)
                        if (!result) continue

                        // Start processing!
                        atmProcessing[machineKey] = {
                            startTick: tick,
                            turretPos: [bx, by, bz],
                            pedestals: result.pedestals,
                            recipe: result.recipe,
                            dim: dim
                        }

                        server.runCommandSilent('execute in ' + dim + ' positioned ' + bx + ' ' + by + ' ' + bz + ' run playsound minecraft:block.beacon.activate master @a[distance=..32] ~ ~ ~ 1.0 0.5')
                        server.runCommandSilent('execute in ' + dim + ' positioned ' + bx + ' ' + by + ' ' + bz + ' run particle minecraft:enchant ~ ~-1 ~ 1.5 1 1.5 0.5 50 force')

                        server.runCommandSilent('execute in ' + dim + ' positioned ' + bx + ' ' + by + ' ' + bz + ' run immersivemessages sendcustom @a[distance=..32] {anchor:\"CENTER_CENTER\",color:\"#006cb4ff\",size:1.5,bold:1,obfuscate:1,typewriter:1,sound:1,slideup:1,slideoutdown:1,background:1,borderTop:\"#FF55FF\",borderBottom:\"#5500AA\"} 5 Transmutacao Arcana Iniciada ')
                        server.runCommandSilent('execute in ' + dim + ' positioned ' + bx + ' ' + by + ' ' + bz + ' run immersivemessages sendcustom @a[distance=..32] {anchor:\"CENTER_CENTER\",color:\"#AAAAAA\",size:1.0,italic:1,typewriter:1,sound:1,y:15.0,slideup:1,slideoutdown:1} 5 Transmutando: ' + result.recipe.name + '')
                        return // Only activate one machine per click
                    } catch (e) { }
                }
            }
        }
    } catch (e) { }
})

console.info('[Arcane Transmutation Machine] Loaded — right-click earth_relay to activate')
