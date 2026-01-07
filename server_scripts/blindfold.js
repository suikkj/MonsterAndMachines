// Priority: 900
// Blindfold System - Permanent blindness for roleplay characters
// Allows sprinting while blind

// ============================================
// PERSISTENT DATA
// ============================================

function getBlindfoldData(server) {
    var data = server.persistentData
    if (!data.blindfoldedPlayers) {
        data.blindfoldedPlayers = {}
    }
    return data.blindfoldedPlayers
}

// ============================================
// APPLY/REMOVE BLINDNESS
// ============================================

function applyBlindfold(player) {
    // Duration: 999999 ticks (~13.8 hours), will be reapplied on login
    // Amplifier 0 = Blindness I
    player.potionEffects.add('minecraft:blindness', 999999, 0, false, false)
}

function removeBlindfold(player) {
    player.removeEffect('minecraft:blindness')
}

// ============================================
// PLAYER LOGIN - Reapply blindfold if needed
// ============================================

PlayerEvents.loggedIn(event => {
    var player = event.player
    var playerName = player.getName().getString()
    var data = getBlindfoldData(player.server)

    if (data[playerName]) {
        // Delay slightly to ensure player is fully loaded
        player.server.scheduleInTicks(5, () => {
            applyBlindfold(player)
            player.tell(Text.of('§8[Personagem cego - Blindfold ativo]'))
        })
    }
})

// ============================================
// PERIODIC REAPPLY (every 5 minutes to ensure it stays)
// ============================================

var blindfoldTickCounter = 0

ServerEvents.tick(event => {
    blindfoldTickCounter++
    // Every 5 minutes (6000 ticks)
    if (blindfoldTickCounter < 6000) return
    blindfoldTickCounter = 0

    var server = event.server
    var data = getBlindfoldData(server)

    server.getPlayers().forEach(player => {
        var playerName = player.getName().getString()
        if (data[playerName]) {
            // Reapply if effect is about to expire or missing
            if (!player.hasEffect('minecraft:blindness')) {
                applyBlindfold(player)
            }
        }
    })
})

// ============================================
// COMMAND: /blindfold <nick> <true/false>
// ============================================

ServerEvents.commandRegistry(event => {
    var Commands = event.commands
    var StringArgumentType = Java.loadClass('com.mojang.brigadier.arguments.StringArgumentType')
    var BoolArgumentType = Java.loadClass('com.mojang.brigadier.arguments.BoolArgumentType')

    event.register(
        Commands.literal('blindfold')
            .requires(src => src.hasPermission(2))
            .then(Commands.argument('nick', StringArgumentType.word())
                .then(Commands.argument('enabled', BoolArgumentType.bool())
                    .executes(ctx => {
                        var source = ctx.getSource()
                        var server = source.getServer()
                        var targetNick = StringArgumentType.getString(ctx, 'nick')
                        var enabled = BoolArgumentType.getBool(ctx, 'enabled')

                        var data = getBlindfoldData(server)

                        // Find target player (if online)
                        var targetPlayer = null
                        server.getPlayers().forEach(p => {
                            if (p.getName().getString() === targetNick) {
                                targetPlayer = p
                            }
                        })

                        if (enabled) {
                            data[targetNick] = true
                            if (targetPlayer) {
                                applyBlindfold(targetPlayer)
                                targetPlayer.tell(Text.of('§8[Personagem cego - Blindfold ativado]'))
                            }
                            source.sendSuccess(() => Text.of('§aBlindfold §eATIVADO §apara §f' + targetNick +
                                (targetPlayer ? '' : ' §7(offline - será aplicado no login)')), true)
                        } else {
                            delete data[targetNick]
                            if (targetPlayer) {
                                removeBlindfold(targetPlayer)
                                targetPlayer.tell(Text.of('§a[Blindfold removido]'))
                            }
                            source.sendSuccess(() => Text.of('§aBlindfold §cDESATIVADO §apara §f' + targetNick), true)
                        }

                        return 1
                    })
                )
            )
            // /blindfold list - List all blindfolded players
            .then(Commands.literal('list')
                .executes(ctx => {
                    var source = ctx.getSource()
                    var data = getBlindfoldData(source.getServer())

                    var players = Object.keys(data)
                    if (players.length === 0) {
                        source.sendSuccess(() => Text.of('§7Nenhum jogador com blindfold ativo.'), false)
                    } else {
                        source.sendSuccess(() => Text.of('§6Jogadores com blindfold: §f' + players.join(', ')), false)
                    }

                    return 1
                })
            )
    )
})
