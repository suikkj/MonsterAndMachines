// Priority: 900
// Blindfold System - Permanent darkness for roleplay characters
// Uses Darkness effect for immersive blind experience

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
// APPLY/REMOVE DARKNESS
// ============================================

function applyBlindfold(player) {
    player.potionEffects.add('minecraft:darkness', 999999, 0, false, false)
}

function removeBlindfold(player) {
    player.removeEffect('minecraft:darkness')
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
// COMMAND: /blindfold <true/false>
// O próprio jogador ativa/desativa
// ============================================

ServerEvents.commandRegistry(function (event) {
    var Commands = event.commands
    var BoolArgumentType = Java.loadClass('com.mojang.brigadier.arguments.BoolArgumentType')

    event.register(
        Commands.literal('blindfold')
            // /blindfold <true/false> - Jogador ativa/desativa para si mesmo
            .then(Commands.argument('enabled', BoolArgumentType.bool())
                .executes(function (ctx) {
                    var source = ctx.getSource()
                    var player = source.getPlayer()

                    if (!player) {
                        return 0
                    }

                    var server = source.getServer()
                    var enabled = BoolArgumentType.getBool(ctx, 'enabled')
                    var playerName = player.getName().getString()
                    var data = getBlindfoldData(server)

                    if (enabled) {
                        data[playerName] = true
                        applyBlindfold(player)
                        player.tell(Text.of('§8[Personagem cego - Blindfold ativado]'))
                    } else {
                        delete data[playerName]
                        removeBlindfold(player)
                        player.tell(Text.of('§a[Blindfold removido]'))
                    }

                    return 1
                })
            )
            // /blindfold - Sem argumento, mostra status atual
            .executes(function (ctx) {
                var source = ctx.getSource()
                var player = source.getPlayer()

                if (!player) {
                    return 0
                }

                var playerName = player.getName().getString()
                var data = getBlindfoldData(source.getServer())

                if (data[playerName]) {
                    player.tell(Text.of('§8[Blindfold está ATIVO] §7Use /blindfold false para desativar'))
                } else {
                    player.tell(Text.of('§a[Blindfold está DESATIVADO] §7Use /blindfold true para ativar'))
                }

                return 1
            })
    )

    console.info('[Blindfold] Command /blindfold registered')
})
