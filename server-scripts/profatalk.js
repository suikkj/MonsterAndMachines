// Priority: 0
// File: kubejs/server_scripts/profatalk.js
// Comando /profatalk — envia mensagens estilizadas usando Immersive Messages
// Uso: /profatalk as <modelo> to <jogador> <tempo> <mensagem>
// Modelos: janus, violetta, ele, profano

// ============ PRESETS DE MENSAGEM ============
var PROFATALK_PRESETS = {
    Janus: {
        // Azul com background, typewriter, som
        buildCommand: function (player, time, message) {
            return 'immersivemessages sendcustom ' + player +
                ' {color:blue,background:2,typewriter:1,sound:1,size:1,anchor:CENTER_CENTER,y:15.0} ' +
                time + ' ' + message
        }
    },
    Violetta: {
        // Roxo sem background, typewriter, som
        buildCommand: function (player, time, message) {
            return 'immersivemessages sendcustom ' + player +
                ' {color:"#6c22bf",background:0,typewriter:1,sound:1,anchor:CENTER_CENTER,y:15.0} ' +
                time + ' ' + message
        }
    },
    Ele: {
        // Mensagem comum (sem estilo especial)
        buildCommand: function (player, time, message) {
            return 'immersivemessages send ' + player + ' ' + time + ' ' + message
        }
    },
    Profano: {
        // Vermelho escuro sem background, typewriter, som (mesmo layout da Violetta)
        buildCommand: function (player, time, message) {
            return 'immersivemessages sendcustom ' + player +
                ' {color:"#6e0000",typewriter:1,sound:1,anchor:CENTER_CENTER,y:15.0} ' +
                time + ' ' + message
        }
    },
    Agaleon: {
        // Vermelho escuro sem background, typewriter, som (mesmo layout da Violetta)
        buildCommand: function (player, time, message) {
            return 'immersivemessages sendcustom ' + player +
                ' {color:"#ffd000ff",typewriter:1,sound:1,anchor:CENTER_CENTER,y:15.0} ' +
                time + ' ' + message
        }
    }
}

// ============ REGISTRAR COMANDO ============
ServerEvents.commandRegistry(function (event) {
    var Commands = event.commands
    var StringArgumentType = Java.loadClass('com.mojang.brigadier.arguments.StringArgumentType')
    var IntegerArgumentType = Java.loadClass('com.mojang.brigadier.arguments.IntegerArgumentType')
    var EntityArgument = Java.loadClass('net.minecraft.commands.arguments.EntityArgument')

    event.register(
        Commands.literal('profatalk')
            .requires(function (src) { return src.hasPermission(2) })
            .then(
                Commands.literal('as')
                    // Modelo: janus, violetta, ele, profano
                    .then(Commands.literal('janus').then(buildToChain(Commands, StringArgumentType, IntegerArgumentType, EntityArgument, 'janus')))
                    .then(Commands.literal('violetta').then(buildToChain(Commands, StringArgumentType, IntegerArgumentType, EntityArgument, 'violetta')))
                    .then(Commands.literal('ele').then(buildToChain(Commands, StringArgumentType, IntegerArgumentType, EntityArgument, 'ele')))
                    .then(Commands.literal('profano').then(buildToChain(Commands, StringArgumentType, IntegerArgumentType, EntityArgument, 'profano')))
                    .then(Commands.literal('agaleon').then(buildToChain(Commands, StringArgumentType, IntegerArgumentType, EntityArgument, 'agaleon')))
            )
    )
})

/**
 * Constrói a cadeia: to <jogador> <tempo> <mensagem...>
 */
function buildToChain(Commands, StringArgumentType, IntegerArgumentType, EntityArgument, presetName) {
    return Commands.literal('to')
        .then(
            Commands.argument('target', EntityArgument.players())
                .then(
                    Commands.argument('time', IntegerArgumentType.integer(1, 120))
                        .then(
                            Commands.argument('message', StringArgumentType.greedyString())
                                .executes(function (ctx) {
                                    return executeProfatalk(ctx, presetName)
                                })
                        )
                )
        )
}

/**
 * Executa o comando /profatalk
 */
function executeProfatalk(ctx, presetName) {
    try {
        var EntityArgument = Java.loadClass('net.minecraft.commands.arguments.EntityArgument')
        var StringArgumentType = Java.loadClass('com.mojang.brigadier.arguments.StringArgumentType')
        var IntegerArgumentType = Java.loadClass('com.mojang.brigadier.arguments.IntegerArgumentType')

        var targetPlayers = EntityArgument.getPlayers(ctx, 'target')
        var time = IntegerArgumentType.getInteger(ctx, 'time')
        var message = StringArgumentType.getString(ctx, 'message')

        var preset = PROFATALK_PRESETS[presetName]
        if (!preset) {
            ctx.source.sendFailure(Text.literal('§c[ProfaTalk] Modelo desconhecido: ' + presetName))
            return 0
        }

        var server = ctx.source.getServer()
        var sentCount = 0
        var sentNames = []

        targetPlayers.forEach(function (targetPlayer) {
            var playerName = targetPlayer.getGameProfile().getName()
            var command = preset.buildCommand(playerName, time, message)
            server.runCommandSilent(command)
            sentCount++
            sentNames.push(playerName)
            console.info('[ProfaTalk] ' + presetName + ' -> ' + playerName + ': ' + message)
        })

        var namesDisplay = sentNames.length <= 3 ? sentNames.join(', ') : sentNames.length + ' jogadores'
        ctx.source.sendSuccess(
            Text.literal('§a[ProfaTalk] §7Mensagem enviada como §e' + presetName + '§7 para §b' + namesDisplay + '§7: §f' + message),
            false
        )

        return sentCount
    } catch (e) {
        ctx.source.sendFailure(Text.literal('§c[ProfaTalk] Erro: ' + e))
        console.error('[ProfaTalk] Erro ao executar: ' + e)
        return 0
    }
}

console.info('[ProfaTalk] Comando /profatalk registrado — Modelos: janus, violetta, ele, profano, agaleon')
