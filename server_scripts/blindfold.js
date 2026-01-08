// Priority: 900
// Blindfold System - Permanent blindness for roleplay characters
// Uses Blindness + Speed III to allow fast movement despite blind

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
    // Using Blindness for complete blackout + Speed III to compensate for no sprint
    player.potionEffects.add('minecraft:blindness', 999999, 0, false, false)
    player.potionEffects.add('minecraft:speed', 999999, 2, false, false) // Speed III
}

function removeBlindfold(player) {
    player.removeEffect('minecraft:blindness')
    player.removeEffect('minecraft:speed')
}

// ============================================
// PLAYER LOGIN - Reapply blindfold if needed
// ============================================

PlayerEvents.loggedIn(function (event) {
    var player = event.player
    var playerName = player.getName().getString()
    var data = getBlindfoldData(player.server)

    if (data[playerName]) {
        player.server.scheduleInTicks(5, function () {
            applyBlindfold(player)
            player.tell(Text.of('§8[Personagem cego - Blindfold ativo]'))
        })
    }
})

// ============================================
// PERIODIC REAPPLY (every 5 minutes)
// ============================================

var blindfoldTickCounter = 0

ServerEvents.tick(function (event) {
    blindfoldTickCounter++
    if (blindfoldTickCounter < 6000) return
    blindfoldTickCounter = 0

    var server = event.server
    var data = getBlindfoldData(server)

    server.getPlayers().forEach(function (player) {
        var playerName = player.getName().getString()
        if (data[playerName]) {
            if (!player.hasEffect('minecraft:darkness')) {
                applyBlindfold(player)
            }
        }
    })
})

// ============================================
// COMMAND: /blindfold <nick> <true/false>
// ============================================

ServerEvents.commandRegistry(function (event) {
    var Commands = event.commands
    var EntityArgument = Java.loadClass('net.minecraft.commands.arguments.EntityArgument')
    var BoolArgumentType = Java.loadClass('com.mojang.brigadier.arguments.BoolArgumentType')

    event.register(
        Commands.literal('blindfold')
            .requires(function (src) { return src.hasPermission(2) })
            // /blindfold <player> <true/false>
            .then(Commands.argument('target', EntityArgument.player())
                .then(Commands.argument('enabled', BoolArgumentType.bool())
                    .executes(function (ctx) {
                        var source = ctx.getSource()
                        var server = source.getServer()
                        var targetPlayer = EntityArgument.getPlayer(ctx, 'target')
                        var enabled = BoolArgumentType.getBool(ctx, 'enabled')
                        var targetNick = targetPlayer.getName().getString()
                        var executor = source.getPlayer()

                        var data = getBlindfoldData(server)

                        if (enabled) {
                            data[targetNick] = true
                            applyBlindfold(targetPlayer)
                            targetPlayer.tell(Text.of('§8[Personagem cego - Blindfold ativado]'))
                            if (executor) {
                                executor.tell(Text.of('§aBlindfold §eATIVADO §apara §f' + targetNick))
                            }
                        } else {
                            delete data[targetNick]
                            removeBlindfold(targetPlayer)
                            targetPlayer.tell(Text.of('§a[Blindfold removido]'))
                            if (executor) {
                                executor.tell(Text.of('§aBlindfold §cDESATIVADO §apara §f' + targetNick))
                            }
                        }

                        return 1
                    })
                )
            )
            // /blindfold list - List all blindfolded players
            .then(Commands.literal('list')
                .executes(function (ctx) {
                    var source = ctx.getSource()
                    var executor = source.getPlayer()
                    var data = getBlindfoldData(source.getServer())

                    var playersList = Object.keys(data)
                    if (executor) {
                        if (playersList.length === 0) {
                            executor.tell(Text.of('§7Nenhum jogador com blindfold ativo.'))
                        } else {
                            executor.tell(Text.of('§6Jogadores com blindfold: §f' + playersList.join(', ')))
                        }
                    }

                    return 1
                })
            )
    )

    console.info('[Blindfold] Command /blindfold registered')
})
