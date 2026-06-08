// Priority: 0
// Expedition World System - Commands for the exploration dimension
// /expedition join - Go to the Expedition World
// /expedition leave - Leave the Expedition World (return to previous position)
// /expedition reset - (Admin) Teleport everyone back and instruct manual deletion

var EXPEDITION_DIM = 'kubejs:expedition'
var OVERWORLD_DIM = 'minecraft:overworld'
var COOLDOWN_TICKS = 600 // 30 seconds

// Cooldown tracking
var expeditionCooldowns = {}

// ============ HELPERS ============

function getExpeditionData(server) {
    var data = server.persistentData
    if (!data.contains('expedition')) {
        var exp = data.getCompound('expedition')
        exp.putLong('lastResetTimestamp', 0)
    }
    return data.getCompound('expedition')
}

/**
 * Save the player's current position before entering the expedition.
 * This stores the dimension they came from + coordinates so /expedition leave
 * can teleport them back to exactly where they were.
 */
function savePlayerReturnPosition(player) {
    var expData = getExpeditionData(player.server)
    var positions = expData.getCompound('returnPositions')
    var uuid = player.uuid.toString()

    var posData = positions.getCompound(uuid)
    posData.putString('dim', player.level.dimension.toString())
    posData.putDouble('x', player.x)
    posData.putDouble('y', player.y)
    posData.putDouble('z', player.z)
    posData.putFloat('yaw', player.yRot)
    posData.putFloat('pitch', player.xRot)
    positions.put(uuid, posData)
    expData.put('returnPositions', positions)
}

/**
 * Get the saved return position for a player (where they were before /expedition return).
 */
function getPlayerReturnPosition(player) {
    var expData = getExpeditionData(player.server)
    var positions = expData.getCompound('returnPositions')
    var uuid = player.uuid.toString()

    if (!positions.contains(uuid)) return null

    var posData = positions.getCompound(uuid)
    return {
        dim: posData.getString('dim') || OVERWORLD_DIM,
        x: posData.getDouble('x'),
        y: posData.getDouble('y'),
        z: posData.getDouble('z'),
        yaw: posData.getFloat('yaw'),
        pitch: posData.getFloat('pitch')
    }
}

/**
 * Save the player's expedition position so they can resume where they left off.
 */
function savePlayerExpeditionPosition(player) {
    var expData = getExpeditionData(player.server)
    var positions = expData.getCompound('expeditionPositions')
    var uuid = player.uuid.toString()

    var posData = positions.getCompound(uuid)
    posData.putDouble('x', player.x)
    posData.putDouble('y', player.y)
    posData.putDouble('z', player.z)
    posData.putFloat('yaw', player.yRot)
    posData.putFloat('pitch', player.xRot)
    positions.put(uuid, posData)
    expData.put('expeditionPositions', positions)
}

/**
 * Get the saved expedition position for a player (where they were inside the expedition).
 * Returns null if they never visited or data was cleared by reset.
 */
function getPlayerExpeditionPosition(player) {
    var expData = getExpeditionData(player.server)
    var positions = expData.getCompound('expeditionPositions')
    var uuid = player.uuid.toString()

    if (!positions.contains(uuid)) return null

    var posData = positions.getCompound(uuid)
    return {
        x: posData.getDouble('x'),
        y: posData.getDouble('y'),
        z: posData.getDouble('z'),
        yaw: posData.getFloat('yaw'),
        pitch: posData.getFloat('pitch')
    }
}

function findSafeY(level, x, z) {
    // Find the highest solid block at the given X/Z
    var maxY = 320
    var minY = -64

    try {
        maxY = level.maxBuildHeight
        minY = level.minBuildHeight
    } catch (e) {
        // Use defaults
    }

    // Start from top and work down
    for (var y = Math.min(maxY - 1, 320); y >= minY; y--) {
        try {
            var block = level.getBlock(x, y, z)
            var blockAbove = level.getBlock(x, y + 1, z)
            var blockAbove2 = level.getBlock(x, y + 2, z)

            if (block && block.id !== 'minecraft:air' &&
                block.id !== 'minecraft:water' &&
                block.id !== 'minecraft:lava' &&
                blockAbove && blockAbove.id === 'minecraft:air' &&
                blockAbove2 && blockAbove2.id === 'minecraft:air') {
                return y + 1
            }
        } catch (e) {
            continue
        }
    }

    // Fallback: return a high Y and let the player fall
    return 200
}

function isOnCooldown(player) {
    var uuid = player.uuid.toString()
    var now = player.server.tickCount

    if (expeditionCooldowns[uuid] && (now - expeditionCooldowns[uuid]) < COOLDOWN_TICKS) {
        var remaining = Math.ceil((COOLDOWN_TICKS - (now - expeditionCooldowns[uuid])) / 20)
        player.tell(Text.of('§c[Expedition] §7Aguarde §e' + remaining + ' segundos §7para usar o comando novamente.'))
        return true
    }
    return false
}

function setCooldown(player) {
    expeditionCooldowns[player.uuid.toString()] = player.server.tickCount
}

// ============ COMMANDS ============

ServerEvents.commandRegistry(function (event) {
    var Commands = event.commands

    event.register(
        Commands.literal('expedition')
            // /expedition join - Go TO the Expedition World
            .then(Commands.literal('join')
                .requires(function (src) { return src.hasPermission(0) })
                .executes(function (ctx) {
                    var player = ctx.source.player
                    if (!player) return 0

                    var currentDim = player.level.dimension.toString()

                    // Cannot already be in expedition
                    if (currentDim === EXPEDITION_DIM) {
                        player.tell(Text.of('§c[Expedition] §7Você já está no Mundo de Expedição!'))
                        return 0
                    }

                    // Cooldown check
                    if (isOnCooldown(player)) return 0

                    // Save current position (any dimension) as return point
                    savePlayerReturnPosition(player)

                    // Get expedition level
                    var expeditionLevel = player.server.getLevel(EXPEDITION_DIM)

                    if (!expeditionLevel) {
                        player.tell(Text.of('§c[Expedition] §7O mundo de expedição não foi encontrado!'))
                        return 0
                    }

                    // Check for saved expedition position (resume where they left off)
                    var savedExpPos = getPlayerExpeditionPosition(player)

                    var targetX, targetY, targetZ, targetYaw, targetPitch

                    if (savedExpPos) {
                        targetX = savedExpPos.x
                        targetY = savedExpPos.y
                        targetZ = savedExpPos.z
                        targetYaw = savedExpPos.yaw
                        targetPitch = savedExpPos.pitch
                    } else {
                        // First time — spawn at 0, 0
                        targetX = 0
                        targetZ = 0
                        targetY = findSafeY(expeditionLevel, 0, 0)
                        targetYaw = 0
                        targetPitch = 0
                    }

                    // Show immersive message
                    try {
                        player.server.runCommandSilent(
                            'title ' + player.username + ' title {"text":"§6⚔ Expedição ⚔","bold":true}'
                        )
                        player.server.runCommandSilent(
                            'title ' + player.username + ' subtitle {"text":"§7Adentrando territórios inexplorados..."}'
                        )
                    } catch (e) {
                        // Ignore title errors
                    }

                    // Teleport to expedition
                    player.server.runCommandSilent(
                        'execute in ' + EXPEDITION_DIM + ' run tp ' + player.username +
                        ' ' + targetX + ' ' + targetY + ' ' + targetZ +
                        ' ' + targetYaw + ' ' + targetPitch
                    )

                    // Inform the player
                    player.tell(Text.of('§6[Expedition] §7Você entrou no Mundo de Expedição!'))
                    player.tell(Text.of('§6[Expedition] §cAtenção: §7Homes aqui serão perdidos no reset semanal.'))
                    player.tell(Text.of('§6[Expedition] §7Use §e/expedition leave §7para sair.'))

                    if (savedExpPos) {
                        player.tell(Text.of('§6[Expedition] §7Você retornou à sua última posição na expedição.'))
                    }

                    setCooldown(player)
                    console.info('[Expedition] ' + player.username + ' entered expedition at ' + targetX + ', ' + targetY + ', ' + targetZ)
                    return 1
                })
            )

            // /expedition leave - Leave the Expedition World, return to previous position
            .then(Commands.literal('leave')
                .requires(function (src) { return src.hasPermission(0) })
                .executes(function (ctx) {
                    var player = ctx.source.player
                    if (!player) return 0

                    var currentDim = player.level.dimension.toString()

                    // Must be in Expedition
                    if (currentDim !== EXPEDITION_DIM) {
                        player.tell(Text.of('§c[Expedition] §7Você precisa estar no §eMundo de Expedição §7para sair!'))
                        return 0
                    }

                    // Cooldown check
                    if (isOnCooldown(player)) return 0

                    // Save current expedition position before leaving
                    savePlayerExpeditionPosition(player)

                    // Get saved return position (where they were before entering)
                    var savedPos = getPlayerReturnPosition(player)

                    // Show title
                    try {
                        player.server.runCommandSilent(
                            'title ' + player.username + ' title {"text":"§a✦ Retorno ✦","bold":true}'
                        )
                        player.server.runCommandSilent(
                            'title ' + player.username + ' subtitle {"text":"§7Retornando..."}'
                        )
                    } catch (e) {
                        // Ignore title errors
                    }

                    if (savedPos) {
                        // Teleport to saved position in the original dimension
                        player.server.runCommandSilent(
                            'execute in ' + savedPos.dim + ' run tp ' + player.username +
                            ' ' + savedPos.x + ' ' + savedPos.y + ' ' + savedPos.z +
                            ' ' + savedPos.yaw + ' ' + savedPos.pitch
                        )
                        player.tell(Text.of('§a[Expedition] §7Você retornou à sua posição anterior.'))
                    } else {
                        // No saved position, teleport to overworld spawn
                        player.server.runCommandSilent(
                            'execute in ' + OVERWORLD_DIM + ' run tp ' + player.username + ' 0 100 0'
                        )
                        player.tell(Text.of('§a[Expedition] §7Você retornou ao Overworld no spawn do mundo.'))
                    }

                    setCooldown(player)
                    console.info('[Expedition] ' + player.username + ' left expedition, returned to ' + (savedPos ? savedPos.dim : OVERWORLD_DIM))
                    return 1
                })
            )

            // /expedition reset (Admin only)
            .then(Commands.literal('reset')
                .requires(function (src) { return src.hasPermission(2) })
                .executes(function (ctx) {
                    var player = ctx.source.player
                    var server = ctx.source.server

                    // Warning message to all players
                    server.runCommandSilent(
                        'say §c[Expedition] §eO Mundo de Expedição será resetado! Todos os jogadores serão teleportados de volta.'
                    )

                    // Teleport all players in expedition back
                    var players = server.playerList.players
                    var teleportedCount = 0

                    for (var i = 0; i < players.size(); i++) {
                        var p = players.get(i)
                        if (p.level.dimension.toString() === EXPEDITION_DIM) {
                            var savedPos = getPlayerReturnPosition(p)
                            if (savedPos) {
                                server.runCommandSilent(
                                    'execute in ' + savedPos.dim + ' run tp ' + p.username +
                                    ' ' + savedPos.x + ' ' + savedPos.y + ' ' + savedPos.z
                                )
                            } else {
                                server.runCommandSilent(
                                    'execute in ' + OVERWORLD_DIM + ' run tp ' + p.username + ' 0 100 0'
                                )
                            }
                            p.tell(Text.of('§c[Expedition] §7Você foi teleportado de volta. O mundo de expedição será resetado.'))
                            teleportedCount++
                        }
                    }

                    // Clear all expedition position data (return positions stay intact)
                    var expData = getExpeditionData(server)
                    expData.put('expeditionPositions', expData.getCompound('_empty_reset'))

                    // Notify admin
                    if (player) {
                        player.tell(Text.of('§c[Expedition] §7Teleportados §e' + teleportedCount + ' §7jogadores.'))
                        player.tell(Text.of('§c[Expedition] §7Para completar o reset:'))
                        player.tell(Text.of('§c[Expedition] §71. Execute §e/save-all'))
                        player.tell(Text.of('§c[Expedition] §72. Pare o servidor'))
                        player.tell(Text.of('§c[Expedition] §73. Delete a pasta §eworld/dimensions/kubejs/expedition/'))
                        player.tell(Text.of('§c[Expedition] §74. Reinicie o servidor'))
                    }

                    console.info('[Expedition] Reset initiated by ' + (player ? player.username : 'console') + '. Teleported ' + teleportedCount + ' players.')
                    return 1
                })
            )
    )

    console.info('[Expedition] Commands registered: /expedition join, /expedition leave, /expedition reset')
})

// ============ PERIODIC LOGGING ============

// Log expedition player count every 5 minutes
ServerEvents.tick(function (event) {
    var server = event.server
    var tick = server.tickCount

    if (tick % 6000 === 0) {
        var count = 0
        var players = server.playerList.players
        for (var i = 0; i < players.size(); i++) {
            if (players.get(i).level.dimension.toString() === EXPEDITION_DIM) {
                count++
            }
        }
        if (count > 0) {
            console.info('[Expedition] ' + count + ' player(s) currently in Expedition World')
        }
    }

    // Cleanup cooldowns every 10 minutes
    if (tick % 12000 === 0) {
        var now = tick
        var cleaned = 0
        var keys = Object.keys(expeditionCooldowns)
        for (var i = 0; i < keys.length; i++) {
            if ((now - expeditionCooldowns[keys[i]]) > COOLDOWN_TICKS * 2) {
                delete expeditionCooldowns[keys[i]]
                cleaned++
            }
        }
        if (cleaned > 0) {
            console.info('[Expedition] Cleaned ' + cleaned + ' expired cooldowns')
        }
    }
})

console.info('[Expedition] System loaded')
