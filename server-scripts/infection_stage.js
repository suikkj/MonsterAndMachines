// Priority: 0
// Infection Stage System - Sistema de estágios de infecção apocalíptica
//
// Estágio 1: 15 dias | Estágio 2: 15 dias | Estágio 3: 8 dias
// Estágio 4: 5 dias  | Estágio 5: 2 dias  (estágio final)
//
// Comandos:
//   /infectionstage check              — Verifica seu próprio estágio (todos)
//   /infectionstage check <jogador>    — Verifica estágio de outro jogador (OP)
//   /infectionstage set <jogador> <1-5> — Define o estágio de um jogador (OP)
//   /infectionstage remove <jogador>   — Remove a infecção de um jogador (OP)

// ============================================
// CONFIGURAÇÃO DE DURAÇÃO DOS ESTÁGIOS (em dias reais)
// ============================================

var INFECTION_STAGE_DURATION = {
    1: 15,  // 15 dias
    2: 15,  // 15 dias
    3: 8,   // 8 dias
    4: 5,   // 5 dias
    5: 2    // 2 dias (estágio final)
}

// ============================================
// MODIFICADORES POR JOGADOR
// ============================================
// 'multiply'      — multiplica a duração base pelo valor
// 'indeterminate' — o estágio nunca progride sozinho, apenas via /infectionstage set

var PLAYER_INFECTION_OVERRIDES = {
    'Cineraria_':   { type: 'multiply', value: 2 },     // Dobro do tempo
    'dupcdugamer':  { type: 'multiply', value: 0.5 },   // Metade do tempo (arredonda para cima)
    '_Myos_':       { type: 'indeterminate' }            // Apenas avança manualmente
}

// Milissegundos em um dia
var MS_PER_DAY = 86400000
var MS_PER_HOUR = 3600000
var MS_PER_MINUTE = 60000

// ============================================
// FUNÇÕES DE PERSISTÊNCIA
// ============================================
// Usa chaves separadas com métodos tipados do CompoundTag (NBT)
// infection_stage_<nome> = int (1-5)
// infection_time_<nome>  = string (epoch ms como texto)

/**
 * Verifica se um jogador possui dados de infecção.
 */
function hasInfectionData(server, playerName) {
    var data = server.persistentData
    return data.contains('infection_stage_' + playerName)
}

/**
 * Retorna os dados de infecção de um jogador.
 * Retorna null se o jogador não está infectado.
 */
function getInfectionData(server, playerName) {
    var data = server.persistentData
    var stageKey = 'infection_stage_' + playerName
    var timeKey = 'infection_time_' + playerName

    if (!data.contains(stageKey)) {
        return null
    }

    try {
        var stage = data.getInt(stageKey)
        var startTimeStr = data.getString(timeKey)
        var startTime = parseFloat(startTimeStr) || 0

        var pauseKey = 'infection_paused_' + playerName
        var isPaused = data.contains(pauseKey)
        var pausedElapsed = isPaused ? (parseFloat(data.getString(pauseKey)) || 0) : 0

        if (stage < 1 || stage > 5) {
            console.warn('[InfectionStage] Estágio inválido para ' + playerName + ': ' + stage)
            return null
        }

        return {
            stage: stage,
            startTime: startTime,
            isPaused: isPaused,
            pausedElapsed: pausedElapsed
        }
    } catch (e) {
        console.warn('[InfectionStage] Erro ao ler dados de ' + playerName + ': ' + e)
        return null
    }
}

/**
 * Salva os dados de infecção de um jogador.
 * O startTime é armazenado como String porque Date.now() excede o limite de int NBT.
 */
function setInfectionData(server, playerName, stage, startTime) {
    var data = server.persistentData
    var stageKey = 'infection_stage_' + playerName
    var timeKey = 'infection_time_' + playerName
    var pauseKey = 'infection_paused_' + playerName

    data.putInt(stageKey, stage)
    data.putString(timeKey, '' + startTime)
    if (data.contains(pauseKey)) {
        data.remove(pauseKey)
    }

    console.info('[InfectionStage] Dados salvos para ' + playerName + ': estágio=' + stage + ', time=' + startTime)
}

/**
 * Remove os dados de infecção de um jogador.
 */
function removeInfectionData(server, playerName) {
    var data = server.persistentData
    var stageKey = 'infection_stage_' + playerName
    var timeKey = 'infection_time_' + playerName
    var pauseKey = 'infection_paused_' + playerName

    if (data.contains(stageKey)) {
        data.remove(stageKey)
    }
    if (data.contains(timeKey)) {
        data.remove(timeKey)
    }
    if (data.contains(pauseKey)) {
        data.remove(pauseKey)
    }
}

/**
 * Pausa o relógio de infecção de um jogador salvando o tempo decorrido.
 */
function pauseInfection(server, playerName) {
    var data = server.persistentData
    var pauseKey = 'infection_paused_' + playerName
    if (data.contains(pauseKey)) return false // Já está pausado

    var infectionData = getInfectionData(server, playerName)
    if (!infectionData) return false

    var elapsed = Date.now() - infectionData.startTime
    data.putString(pauseKey, '' + elapsed)
    return true
}

/**
 * Retoma o relógio de infecção reajustando o startTime baseado no tempo decorrido.
 */
function resumeInfection(server, playerName) {
    var data = server.persistentData
    var pauseKey = 'infection_paused_' + playerName
    if (!data.contains(pauseKey)) return false // Não estava pausado

    var infectionData = getInfectionData(server, playerName)
    if (!infectionData) return false

    var elapsed = parseFloat(data.getString(pauseKey)) || 0
    data.remove(pauseKey)

    var newStartTime = Date.now() - elapsed
    
    // Atualiza apenas o startTime sem remover outras coisas (pois setInfectionData removeria a pausa, mas já removemos)
    var timeKey = 'infection_time_' + playerName
    data.putString(timeKey, '' + newStartTime)
    
    console.info('[InfectionStage] Relógio retomado para ' + playerName + ': newStartTime=' + newStartTime)
    return true
}

/**
 * Retorna a duração base do estágio em milissegundos (sem modificadores de jogador).
 */
function getStageDurationMs(stage) {
    var days = INFECTION_STAGE_DURATION[stage]
    if (!days) return 0
    return days * MS_PER_DAY
}

/**
 * Retorna a duração do estágio em dias para um jogador específico,
 * aplicando os modificadores de PLAYER_INFECTION_OVERRIDES.
 * Retorna -1 se o jogador tem progressão indeterminada.
 */
function getPlayerStageDays(stage, playerName) {
    var baseDays = INFECTION_STAGE_DURATION[stage]
    if (!baseDays) return 0

    var override = PLAYER_INFECTION_OVERRIDES[playerName]
    if (!override) return baseDays

    if (override.type === 'indeterminate') return -1

    if (override.type === 'multiply') {
        return Math.ceil(baseDays * override.value)
    }

    return baseDays
}

/**
 * Retorna a duração do estágio em milissegundos para um jogador específico.
 * Retorna -1 se o jogador tem progressão indeterminada.
 */
function getPlayerStageDurationMs(stage, playerName) {
    var days = getPlayerStageDays(stage, playerName)
    if (days === -1) return -1
    if (days <= 0) return 0
    return days * MS_PER_DAY
}

/**
 * Calcula o tempo restante no estágio atual em milissegundos.
 * Retorna valor negativo se o estágio já expirou.
 * Retorna Infinity se o jogador tem progressão indeterminada.
 */
function getTimeRemainingMs(infectionData, playerName) {
    var duration = getPlayerStageDurationMs(infectionData.stage, playerName)
    if (duration === -1) return Infinity  // Indeterminado
    
    var elapsed
    if (infectionData.isPaused) {
        elapsed = infectionData.pausedElapsed
    } else {
        elapsed = Date.now() - infectionData.startTime
    }
    
    return duration - elapsed
}

/**
 * Formata milissegundos em uma string legível (X dias, Y horas, Z minutos).
 */
function formatTimeRemaining(ms) {
    if (ms <= 0) return '§cExpirado'

    var days = Math.floor(ms / MS_PER_DAY)
    var remaining = ms % MS_PER_DAY
    var hours = Math.floor(remaining / MS_PER_HOUR)
    remaining = remaining % MS_PER_HOUR
    var minutes = Math.floor(remaining / MS_PER_MINUTE)

    var parts = []
    if (days > 0) parts.push(days + (days === 1 ? ' dia' : ' dias'))
    if (hours > 0) parts.push(hours + (hours === 1 ? ' hora' : ' horas'))
    if (minutes > 0) parts.push(minutes + (minutes === 1 ? ' minuto' : ' minutos'))

    if (parts.length === 0) return '§cMenos de 1 minuto'

    return parts.join(', ')
}

/**
 * Retorna a cor do estágio para formatação no chat.
 */
function getStageColor(stage) {
    switch (stage) {
        case 1: return '§a'   // Verde
        case 2: return '§e'   // Amarelo
        case 3: return '§6'   // Laranja/Dourado
        case 4: return '§c'   // Vermelho
        case 5: return '§4'   // Vermelho escuro
        default: return '§f'  // Branco
    }
}

/**
 * Retorna o nome descritivo do estágio.
 */
function getStageName(stage) {
    switch (stage) {
        case 1: return 'Infecção Inicial'
        case 2: return 'Infecção Moderada'
        case 3: return 'Infecção Avançada'
        case 4: return 'Infecção Severa'
        case 5: return 'Infecção Terminal'
        default: return 'Desconhecido'
    }
}

/**
 * Envia a mensagem de status de infecção para um jogador.
 */
function sendInfectionStatus(receiver, targetName, infectionData) {
    var stage = infectionData.stage
    var color = getStageColor(stage)
    var name = getStageName(stage)
    var timeRemaining = getTimeRemainingMs(infectionData, targetName)
    var playerDays = getPlayerStageDays(stage, targetName)
    var isIndeterminate = (playerDays === -1)

    receiver.tell(Text.of('§8§m                                                §r'))
    receiver.tell(Text.of('§5§l⚠ INFECÇÃO §8| §f' + targetName))
    receiver.tell(Text.of(''))
    receiver.tell(Text.of('  §7Estágio: ' + color + '§l' + stage + ' §8— ' + color + name))

    if (isIndeterminate) {
        receiver.tell(Text.of('  §7Duração do estágio: §d§lIndeterminado'))
    } else {
        receiver.tell(Text.of('  §7Duração do estágio: §f' + playerDays + ' dias'))
    }

    if (infectionData.isPaused) {
        receiver.tell(Text.of('  §7Status do relógio: §e§l⏸ Pausado'))
    }

    if (stage < 5) {
        if (isIndeterminate) {
            receiver.tell(Text.of('  §7Tempo restante: §d§l∞ Indeterminado'))
            receiver.tell(Text.of('  §7Próximo estágio: ' + getStageColor(stage + 1) + 'Estágio ' + (stage + 1) + ' — ' + getStageName(stage + 1)))
            receiver.tell(Text.of('  §8(Progressão apenas via comando)'))
        } else {
            receiver.tell(Text.of('  §7Tempo restante: §f' + formatTimeRemaining(timeRemaining)))
            receiver.tell(Text.of('  §7Próximo estágio: ' + getStageColor(stage + 1) + 'Estágio ' + (stage + 1) + ' — ' + getStageName(stage + 1)))
        }
    } else {
        if (isIndeterminate) {
            receiver.tell(Text.of('  §7Tempo restante: §d§l∞ Indeterminado'))
        } else {
            receiver.tell(Text.of('  §7Tempo restante: §f' + formatTimeRemaining(timeRemaining)))
        }
        receiver.tell(Text.of('  §4§l  ⚠ Estágio final — não há próximo estágio.'))
    }

    receiver.tell(Text.of('§8§m                                                §r'))
}

// ============================================
// PROGRESSÃO AUTOMÁTICA DE ESTÁGIOS
// ============================================
// Verifica a cada 5 minutos (6000 ticks) se algum jogador deve avançar de estágio

var infectionCheckCounter = 0

ServerEvents.tick(function (event) {
    infectionCheckCounter++
    // Verificar a cada 5 minutos (6000 ticks)
    if (infectionCheckCounter < 6000) return
    infectionCheckCounter = 0

    var server = event.server

    server.getPlayers().forEach(function (player) {
        var playerName = player.getName().getString()
        var infectionData = getInfectionData(server, playerName)

        if (!infectionData) return // Jogador não está infectado

        // Jogadores com progressão indeterminada nunca avançam automaticamente
        var override = PLAYER_INFECTION_OVERRIDES[playerName]
        if (override && override.type === 'indeterminate') return

        // Jogadores pausados não avançam
        if (infectionData.isPaused) return

        var timeRemaining = getTimeRemainingMs(infectionData, playerName)

        // Se o tempo expirou e não está no estágio 5, avançar
        if (timeRemaining <= 0 && infectionData.stage < 5) {
            var newStage = infectionData.stage + 1
            setInfectionData(server, playerName, newStage, Date.now())

            var color = getStageColor(newStage)
            var name = getStageName(newStage)
            var newDays = getPlayerStageDays(newStage, playerName)

            player.tell(Text.of(''))
            player.tell(Text.of('§5§l⚠ INFECÇÃO AVANÇOU ⚠'))
            player.tell(Text.of('§7A infecção de §e' + playerName + '§7 progrediu para o ' + color + '§lEstágio ' + newStage + ' §8— ' + color + name))

            if (newStage === 5) {
                player.tell(Text.of('§4§l⚠ ' + playerName + ' atingiu o estágio final da infecção!'))
            } else {
                player.tell(Text.of('§7Tempo neste estágio: §f' + newDays + ' dias'))
            }

            player.tell(Text.of(''))
            console.info('[InfectionStage] ' + playerName + ' avançou para o Estágio ' + newStage)
        }
    })
})

// ============================================
// COMANDO /infectionstage
// ============================================

ServerEvents.commandRegistry(function (event) {
    var Commands = event.commands
    var StringArg = Java.loadClass('com.mojang.brigadier.arguments.StringArgumentType')
    var IntegerArg = Java.loadClass('com.mojang.brigadier.arguments.IntegerArgumentType')
    var SharedSuggestionProvider = Java.loadClass('net.minecraft.commands.SharedSuggestionProvider')

    // Função de sugestão que lista os jogadores online no server
    var suggestPlayers = function (ctx, builder) {
        var playerNames = []
        ctx.getSource().getServer().getPlayers().forEach(function (p) {
            playerNames.push(p.getName().getString())
        })
        return SharedSuggestionProvider.suggest(playerNames, builder)
    }

    event.register(
        Commands.literal('infectionstage')

            // ─────────────────────────────────────
            // /infectionstage check — Qualquer jogador pode verificar seu próprio estágio
            // ─────────────────────────────────────
            .then(Commands.literal('check')
                .executes(function (ctx) {
                    var source = ctx.getSource()
                    var player = source.getPlayer()

                    if (!player) {
                        source.sendFailure(Text.of('§cApenas jogadores podem usar este comando.'))
                        return 0
                    }

                    var playerName = player.getName().getString()
                    var infectionData = getInfectionData(player.server, playerName)

                    if (!infectionData) {
                        player.tell(Text.of('§a[Infecção] §fVocê não está infectado.'))
                        return 1
                    }

                    sendInfectionStatus(player, playerName, infectionData)
                    return 1
                })

                // ─────────────────────────────────────
                // /infectionstage check <jogador> — Apenas OP pode verificar outro jogador
                // ─────────────────────────────────────
                .then(Commands.argument('target', StringArg.word()).suggests(suggestPlayers)
                    .requires(function (src) { return src.hasPermission(2) })
                    .executes(function (ctx) {
                        var source = ctx.getSource()
                        var player = source.getPlayer()
                        var targetName = StringArg.getString(ctx, 'target')

                        if (!player) {
                            source.sendFailure(Text.of('§cApenas jogadores podem usar este comando.'))
                            return 0
                        }

                        var infectionData = getInfectionData(player.server, targetName)

                        if (!infectionData) {
                            player.tell(Text.of('§a[Infecção] §f' + targetName + ' não está infectado.'))
                            return 1
                        }

                        sendInfectionStatus(player, targetName, infectionData)
                        return 1
                    })
                )
            )

            // ─────────────────────────────────────
            // /infectionstage set <jogador> <1-5> — Apenas OP
            // ─────────────────────────────────────
            .then(Commands.literal('set')
                .requires(function (src) { return src.hasPermission(2) })
                .then(Commands.argument('target', StringArg.word()).suggests(suggestPlayers)
                    .then(Commands.argument('stage', IntegerArg.integer(1, 5))
                        .executes(function (ctx) {
                            var source = ctx.getSource()
                            var player = source.getPlayer()
                            var targetName = StringArg.getString(ctx, 'target')
                            var stage = IntegerArg.getInteger(ctx, 'stage')

                            if (!player) {
                                source.sendFailure(Text.of('§cApenas jogadores podem usar este comando.'))
                                return 0
                            }

                            // Definir a infecção com o tempo atual como início do estágio
                            setInfectionData(player.server, targetName, stage, Date.now())

                            var color = getStageColor(stage)
                            var name = getStageName(stage)
                            player.tell(Text.of('§5[Infecção] §fInfecção de §e' + targetName + '§f definida para ' + color + '§lEstágio ' + stage + ' §8— ' + color + name))
                            var setDays = getPlayerStageDays(stage, targetName)
                            if (setDays === -1) {
                                player.tell(Text.of('§7Duração: §d§lIndeterminado §7(progressão apenas via comando)'))
                            } else {
                                player.tell(Text.of('§7Duração: §f' + setDays + ' dias a partir de agora.'))
                            }

                            // Notificar o jogador alvo se estiver online
                            var targetPlayer = player.server.getPlayer(targetName)
                            if (targetPlayer) {
                                targetPlayer.tell(Text.of(''))
                                targetPlayer.tell(Text.of('§5§l⚠ INFECÇÃO ATUALIZADA ⚠'))
                                targetPlayer.tell(Text.of('§7A infecção de §e' + targetName + '§7 foi definida para ' + color + '§lEstágio ' + stage + ' §8— ' + color + name))
                                var notifyDays = getPlayerStageDays(stage, targetName)
                                if (notifyDays === -1) {
                                    targetPlayer.tell(Text.of('§7Tempo neste estágio: §d§l∞ Indeterminado'))
                                } else {
                                    targetPlayer.tell(Text.of('§7Tempo neste estágio: §f' + notifyDays + ' dias'))
                                }
                                targetPlayer.tell(Text.of(''))
                            }

                           // Log e notificação
                        console.info('[InfectionStage] ' + player.getName().getString() + ' definiu ' + targetName + ' para Estágio ' + stage)
                        return 1
                    })
                )
            )
        )

            // ─────────────────────────────────────
            // /infectionstage pause <jogador> — Apenas OP
            // ─────────────────────────────────────
            .then(Commands.literal('pause')
                .requires(function (src) { return src.hasPermission(2) })
                .then(Commands.argument('target', StringArg.word()).suggests(suggestPlayers)
                    .executes(function (ctx) {
                        var source = ctx.getSource()
                        var targetName = StringArg.getString(ctx, 'target')

                        if (!hasInfectionData(source.getServer(), targetName)) {
                            source.sendFailure(Text.of('§a[Infecção] §f' + targetName + ' não está infectado.'))
                            return 0
                        }

                        if (pauseInfection(source.getServer(), targetName)) {
                            source.sendSuccess(Text.of('§a[Infecção] §fRelógio de §e' + targetName + ' §fpausado.'), false)
                            var targetPlayer = source.getServer().getPlayer(targetName)
                            if (targetPlayer) targetPlayer.tell(Text.of('§e§l[!] §fSeu relógio de infecção foi §epausado§f.'))
                        } else {
                            source.sendFailure(Text.of('§c[Infecção] O relógio de ' + targetName + ' já está pausado.'))
                        }
                        return 1
                    })
                )
            )

            // ─────────────────────────────────────
            // /infectionstage resume <jogador> — Apenas OP
            // ─────────────────────────────────────
            .then(Commands.literal('resume')
                .requires(function (src) { return src.hasPermission(2) })
                .then(Commands.argument('target', StringArg.word()).suggests(suggestPlayers)
                    .executes(function (ctx) {
                        var source = ctx.getSource()
                        var targetName = StringArg.getString(ctx, 'target')

                        if (!hasInfectionData(source.getServer(), targetName)) {
                            source.sendFailure(Text.of('§a[Infecção] §f' + targetName + ' não está infectado.'))
                            return 0
                        }

                        if (resumeInfection(source.getServer(), targetName)) {
                            source.sendSuccess(Text.of('§a[Infecção] §fRelógio de §e' + targetName + ' §fretomado.'), false)
                            var targetPlayer = source.getServer().getPlayer(targetName)
                            if (targetPlayer) targetPlayer.tell(Text.of('§a§l[!] §fSeu relógio de infecção foi §aretomado§f.'))
                        } else {
                            source.sendFailure(Text.of('§c[Infecção] O relógio de ' + targetName + ' não está pausado.'))
                        }
                        return 1
                    })
                )
            )

            // ─────────────────────────────────────
            // /infectionstage remove <jogador> — Apenas OP
            // ─────────────────────────────────────
            .then(Commands.literal('remove')
                .requires(function (src) { return src.hasPermission(2) })
                .then(Commands.argument('target', StringArg.word()).suggests(suggestPlayers)
                    .executes(function (ctx) {
                        var source = ctx.getSource()
                        var player = source.getPlayer()
                        var targetName = StringArg.getString(ctx, 'target')

                        if (!player) {
                            source.sendFailure(Text.of('§cApenas jogadores podem usar este comando.'))
                            return 0
                        }

                        var infectionData = getInfectionData(player.server, targetName)

                        if (!infectionData) {
                            player.tell(Text.of('§a[Infecção] §f' + targetName + ' não está infectado.'))
                            return 1
                        }

                        removeInfectionData(player.server, targetName)
                        player.tell(Text.of('§a[Infecção] §fInfecção de §e' + targetName + '§a removida com sucesso.'))

                        // Notificar o jogador alvo se estiver online
                        var targetPlayer = player.server.getPlayer(targetName)
                        if (targetPlayer) {
                            targetPlayer.tell(Text.of(''))
                            targetPlayer.tell(Text.of('§a§l✦ INFECÇÃO REMOVIDA ✦'))
                            targetPlayer.tell(Text.of('§fA infecção de §e' + targetName + '§f foi curada.'))
                            targetPlayer.tell(Text.of(''))
                        }

                        console.info('[InfectionStage] ' + player.getName().getString() + ' removeu infecção de ' + targetName)
                        return 1
                    })
                )
            )
    )

    console.info('[InfectionStage] Commands registered')
})

// ============================================
// NOTIFICAÇÃO AO LOGAR
// ============================================

PlayerEvents.loggedIn(function (event) {
    var player = event.player
    var playerName = player.getName().getString()
    var server = player.server

    server.scheduleInTicks(40, function () {
        var infectionData = getInfectionData(server, playerName)
        if (!infectionData) return

        // Jogadores com progressão indeterminada não avançam offline
        var loginOverride = PLAYER_INFECTION_OVERRIDES[playerName]
        var isIndeterminatePlayer = (loginOverride && loginOverride.type === 'indeterminate')

        // Verificar se precisa avançar de estágio enquanto estava offline
        if (!isIndeterminatePlayer && !infectionData.isPaused) {
            var timeRemaining = getTimeRemainingMs(infectionData, playerName)
            while (timeRemaining <= 0 && infectionData.stage < 5) {
                // Calcular quanto tempo sobrou após expirar este estágio
                var overflow = Math.abs(timeRemaining)
                var newStage = infectionData.stage + 1
                var newStartTime = infectionData.startTime + getPlayerStageDurationMs(infectionData.stage, playerName)

                setInfectionData(server, playerName, newStage, newStartTime)
                infectionData = { stage: newStage, startTime: newStartTime }
                timeRemaining = getTimeRemainingMs(infectionData, playerName)

                console.info('[InfectionStage] ' + playerName + ' avançou offline para Estágio ' + newStage)
            }
        }

        // Exibir status ao jogador
        sendInfectionStatus(player, playerName, infectionData)
    })
})

console.info('[InfectionStage] System loaded — /infectionstage check | set | remove')
