// Priority: 0
// Darkvision Command - Permite jogadores específicos enxergarem no escuro
// Aplica Night Vision infinita para simular visão no escuro

// ============================================
// JOGADORES PERMITIDOS
// ============================================
// Apenas estes jogadores podem usar o comando /darkvision

var DARKVISION_ALLOWED_PLAYERS = [
    'dupcdugamer',
    '_Myos_',
    'Undy55',
    'adrielg1',
    'Ma4tsu',
    'suikkj',
    'cactian0'
]

// Duração do efeito em ticks (20 ticks = 1 segundo)
// 72000 ticks = 1 hora (será reaplicado automaticamente)
var DARKVISION_DURATION = 72000

// ============================================
// HELPER FUNCTIONS
// ============================================

function isPlayerAllowed(playerName) {
    for (var i = 0; i < DARKVISION_ALLOWED_PLAYERS.length; i++) {
        if (DARKVISION_ALLOWED_PLAYERS[i] === playerName) {
            return true
        }
    }
    return false
}

function hasDarkvision(player) {
    return player.hasEffect('minecraft:night_vision')
}

function enableDarkvision(player) {
    var MobEffects = Java.loadClass('net.minecraft.world.effect.MobEffects')
    var MobEffectInstance = Java.loadClass('net.minecraft.world.effect.MobEffectInstance')

    // Night Vision com duração longa, sem partículas, ambient
    var effect = new MobEffectInstance(
        MobEffects.NIGHT_VISION,
        DARKVISION_DURATION,
        0,      // amplifier (0 = nível 1)
        true,   // ambient (efeito mais sutil)
        false,  // showParticles
        true    // showIcon
    )

    player.addEffect(effect)
    return true
}

function disableDarkvision(player) {
    var MobEffects = Java.loadClass('net.minecraft.world.effect.MobEffects')
    player.removeEffect(MobEffects.NIGHT_VISION)
    return true
}

// ============================================
// PERSISTÊNCIA DO ESTADO
// ============================================

function getDarkvisionState(server, playerName) {
    var data = server.persistentData
    var key = 'darkvision_enabled_' + playerName
    return data.getBoolean(key)
}

function setDarkvisionState(server, playerName, enabled) {
    var data = server.persistentData
    var key = 'darkvision_enabled_' + playerName
    data.putBoolean(key, enabled)
}

// ============================================
// REAPLICAR EFEITO AUTOMATICAMENTE
// ============================================

var darkvisionTickCounter = 0

ServerEvents.tick(function (event) {
    darkvisionTickCounter++
    // Verificar a cada 30 segundos (600 ticks)
    if (darkvisionTickCounter < 600) return
    darkvisionTickCounter = 0

    var server = event.server

    server.getPlayers().forEach(function (player) {
        var playerName = player.getName().getString()

        // Verificar se o jogador está na lista E tem darkvision ativado
        if (isPlayerAllowed(playerName) && getDarkvisionState(server, playerName)) {
            // Reaplicar o efeito se estiver acabando ou não tiver
            if (!hasDarkvision(player)) {
                enableDarkvision(player)
            }
        }
    })
})

// ============================================
// RESTAURAR DARKVISION NO LOGIN
// ============================================

PlayerEvents.loggedIn(function (event) {
    var player = event.player
    var playerName = player.getName().getString()
    var server = player.server

    // Se o jogador é permitido e tinha darkvision ativado, reaplicar
    if (isPlayerAllowed(playerName) && getDarkvisionState(server, playerName)) {
        // Pequeno delay para garantir que o jogador está totalmente carregado
        server.scheduleInTicks(20, function () {
            enableDarkvision(player)
            player.tell(Text.of('§7[Darkvision] §fSua visão noturna foi restaurada.'))
        })
    }
})

// ============================================
// COMANDO /darkvision
// ============================================

ServerEvents.commandRegistry(function (event) {
    var Commands = event.commands

    event.register(
        Commands.literal('darkvision')
            .executes(function (ctx) {
                var source = ctx.getSource()
                var player = source.getPlayer()

                if (!player) {
                    source.sendFailure(Text.of('§cApenas jogadores podem usar este comando.'))
                    return 0
                }

                var playerName = player.getName().getString()

                // Verificar se o jogador está na lista de permitidos
                if (!isPlayerAllowed(playerName)) {
                    player.tell(Text.of('§c[Darkvision] §fVocê não possui a habilidade de visão noturna.'))
                    return 0
                }

                var server = player.server
                var currentState = getDarkvisionState(server, playerName)

                if (currentState) {
                    // Desativar darkvision
                    disableDarkvision(player)
                    setDarkvisionState(server, playerName, false)
                    player.tell(Text.of('§7[Darkvision] §fVisão noturna §cdesativada§f.'))
                } else {
                    // Ativar darkvision
                    enableDarkvision(player)
                    setDarkvisionState(server, playerName, true)
                    player.tell(Text.of('§7[Darkvision] §fVisão noturna §aativada§f.'))
                }

                return 1
            })
            .then(Commands.literal('on')
                .executes(function (ctx) {
                    var source = ctx.getSource()
                    var player = source.getPlayer()

                    if (!player) {
                        source.sendFailure(Text.of('§cApenas jogadores podem usar este comando.'))
                        return 0
                    }

                    var playerName = player.getName().getString()

                    if (!isPlayerAllowed(playerName)) {
                        player.tell(Text.of('§c[Darkvision] §fVocê não possui a habilidade de visão noturna.'))
                        return 0
                    }

                    enableDarkvision(player)
                    setDarkvisionState(player.server, playerName, true)
                    player.tell(Text.of('§7[Darkvision] §fVisão noturna §aativada§f.'))

                    return 1
                })
            )
            .then(Commands.literal('off')
                .executes(function (ctx) {
                    var source = ctx.getSource()
                    var player = source.getPlayer()

                    if (!player) {
                        source.sendFailure(Text.of('§cApenas jogadores podem usar este comando.'))
                        return 0
                    }

                    var playerName = player.getName().getString()

                    if (!isPlayerAllowed(playerName)) {
                        player.tell(Text.of('§c[Darkvision] §fVocê não possui a habilidade de visão noturna.'))
                        return 0
                    }

                    disableDarkvision(player)
                    setDarkvisionState(player.server, playerName, false)
                    player.tell(Text.of('§7[Darkvision] §fVisão noturna §cdesativada§f.'))

                    return 1
                })
            )
    )

    console.info('[Darkvision] Command registered')
})

console.info('[Darkvision] System loaded - ' + DARKVISION_ALLOWED_PLAYERS.length + ' players allowed')
