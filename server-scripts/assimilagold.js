// Priority: 0
// Assimilagold - Sistema de Cálculo de Transmutação do Ouro Abissal
// 
// Fórmulas do Compêndio Alquímico:
//   Θ (Carga de Singularidade) = ΔΩ · ln(Φ / Ψ) − λsombra
//
// Variáveis:
//   Ψ (Barreira Solar / Lúmens de Estase) = base de lumen do jogador
//   Φ (Densidade do Vazio) = partículas de vazio do jogador
//   ΔΩ (Fator de Adaptação) = 1.2  (constante)
//   λsombra (Radiação Residual / Perda) = 0.5  (constante)
//   Θ (Carga de Singularidade) = resultado final (exibido como porcentagem)
//
// Mecânica:
//   - A cada 8 irons_spellbooks:divine_soulshard no inventário → +10 lumen base
//   - O código só verifica o inventário quando o comando é executado
//
// Comandos:
//   /assimilagold add lumen <nickname>    → Conta divine_soulshards e adiciona lumen
//   /assimilagold set lumen <nickname>    → Define lumen manualmente (valor numérico)
//   /assimilagold add vazio <nickname>    → Adiciona partículas de vazio manualmente
//   /assimilagold set vazio <nickname>    → Define vazio manualmente (valor numérico)
//   /assimilagold check <nickname>        → Exibe informações de lumen, vazio e Θ%

// ============================================
// CONSTANTES DO COMPÊNDIO ALQUÍMICO
// ============================================

var AG_DELTA_OMEGA = 1.2     // Fator de Adaptação (ΔΩ)
var AG_LAMBDA_SOMBRA = 0.5   // Radiação Residual (λsombra)
var AG_SHARD_ITEM = 'irons_spellbooks:divine_soulshard'
var AG_SHARDS_PER_LUMEN = 8  // A cada 8 shards → +10 lumen
var AG_LUMEN_PER_BATCH = 10  // +10 lumen por lote de 8 shards

// Partículas de Vazio baseadas no estágio de infecção (infection_stage.js)
var AG_VAZIO_POR_ESTAGIO = {
    0: 0,         // Sem infecção
    1: 1000,      // Estágio 1
    2: 2718,      // Estágio 2 (≈ e¹)
    3: 7389,      // Estágio 3 (≈ e²)
    4: 20085,     // Estágio 4 (≈ e³)
    5: 54598      // Estágio 5 (≈ e⁴)
}

// ============================================
// PERSISTÊNCIA DE DADOS
// ============================================

function agGetLumen(server, playerName) {
    var data = server.persistentData
    var key = 'assimilagold_lumen_' + playerName
    if (!data.contains(key)) return 0
    return data.getDouble(key)
}

function agSetLumen(server, playerName, value) {
    var data = server.persistentData
    var key = 'assimilagold_lumen_' + playerName
    data.putDouble(key, value)
}

function agGetVazio(server, playerName) {
    var data = server.persistentData
    var manualKey = 'assimilagold_vazio_' + playerName

    // Se há override manual, usa o valor manual
    if (data.contains(manualKey)) {
        return data.getDouble(manualKey)
    }

    // Caso contrário, deriva do estágio de infecção
    return agGetVazioFromStage(server, playerName)
}

function agSetVazio(server, playerName, value) {
    var data = server.persistentData
    var key = 'assimilagold_vazio_' + playerName
    data.putDouble(key, value)
}

function agClearVazioOverride(server, playerName) {
    var data = server.persistentData
    var key = 'assimilagold_vazio_' + playerName
    if (data.contains(key)) {
        data.remove(key)
    }
}

function agHasVazioOverride(server, playerName) {
    var data = server.persistentData
    var key = 'assimilagold_vazio_' + playerName
    return data.contains(key)
}

// Obtém o estágio de infecção do jogador (lê do infection_stage.js persistentData)
function agGetInfectionStage(server, playerName) {
    var data = server.persistentData
    var stageKey = 'infection_stage_' + playerName
    if (!data.contains(stageKey)) return 0
    return data.getInt(stageKey)
}

// Converte estágio de infecção em partículas de vazio
function agGetVazioFromStage(server, playerName) {
    var stage = agGetInfectionStage(server, playerName)
    var vazio = AG_VAZIO_POR_ESTAGIO[stage]
    return (vazio !== undefined) ? vazio : 0
}

// ============================================
// CÁLCULO DA CARGA DE SINGULARIDADE (Θ)
// ============================================
// Θ = ΔΩ · ln(Φ / Ψ) − λsombra
//
// Benchmarks (com Φ=2718, ΔΩ=1.2, λ=0.5):
//   Ψ=1000  → Θ ≈ 0.70  (70%) → Ouro Maculado / Liga Instável
//   Ψ=1181  → Θ ≈ 0.50  (50%) → Ouro Maculado Inerte
//   Ψ=1792  → Θ ≈ 0.00  (0%)  → Inércia Alquímica / Rejeição

function agCalculateTheta(lumen, vazio) {
    // Proteção contra divisão por zero ou valores inválidos
    if (lumen <= 0 || vazio <= 0) return 0

    var ratio = vazio / lumen
    if (ratio <= 0) return 0

    var theta = AG_DELTA_OMEGA * Math.log(ratio) - AG_LAMBDA_SOMBRA
    return theta
}

// Calcula quanto de lumen é necessário para atingir estabilidade (Θ = 0)
// Θ = 0 → ΔΩ · ln(Φ / Ψ) − λ = 0 → Ψ = Φ / e^(λ/ΔΩ)
function agCalculateLumenForStability(vazio) {
    if (vazio <= 0) return 0
    var exponent = AG_LAMBDA_SOMBRA / AG_DELTA_OMEGA
    return Math.ceil(vazio / Math.exp(exponent))
}

// Calcula lumen para atingir um Θ específico
// Θ = ΔΩ · ln(Φ / Ψ) − λ → Ψ = Φ / e^((Θ + λ) / ΔΩ)
function agCalculateLumenForTheta(vazio, targetTheta) {
    if (vazio <= 0) return 0
    var exponent = (targetTheta + AG_LAMBDA_SOMBRA) / AG_DELTA_OMEGA
    return Math.ceil(vazio / Math.exp(exponent))
}

function agThetaToPercent(theta) {
    return Math.round(theta * 10000) / 100 // 2 casas decimais
}

// ============================================
// CLASSIFICAÇÃO DO RESULTADO
// ============================================

function agGetClassification(theta) {
    if (theta >= 0.9) {
        return '§4§l⚠ Limiar Crítico de Assimilação ⚠ §7— A transmutação está próxima do colapso total. O "Vazio" domina quase completamente.'
    } else if (theta >= 0.7) {
        return '§c§lOuro Maculado / Liga Instável §7— O "Vazio" supera o ouro, adaptação bruta.'
    } else if (theta >= 0.5) {
        return '§6§lOuro Maculado Inerte §7— Equilíbrio precário, condutor mediano.'
    } else if (theta > 0) {
        return '§e§lOuro Parcialmente Assimilado §7— Assimilação fraca, instável.'
    } else if (theta === 0) {
        return '§7§lInércia Alquímica / Rejeição §7— Falha total de assimilação.'
    } else {
        return '§b§lBarreira Solar Dominante §7— O ouro resiste completamente ao "Vazio".'
    }
}

// ============================================
// FUNÇÕES DE INVENTÁRIO
// ============================================

function agCountShardsInInventory(player) {
    var count = 0
    var inventory = player.inventory
    // Percorre todos os slots do inventário (0-35 no inventário normal)
    for (var i = 0; i < inventory.getContainerSize(); i++) {
        var stack = inventory.getItem(i)
        if (!stack || stack.isEmpty()) continue
        if (stack.getId() === AG_SHARD_ITEM) {
            count += stack.getCount()
        }
    }
    return count
}

function agRemoveShardsFromInventory(player, amount) {
    var remaining = amount
    var inventory = player.inventory
    for (var i = 0; i < inventory.getContainerSize(); i++) {
        if (remaining <= 0) break
        var stack = inventory.getItem(i)
        if (!stack || stack.isEmpty()) continue
        if (stack.getId() === AG_SHARD_ITEM) {
            var inSlot = stack.getCount()
            if (inSlot <= remaining) {
                inventory.setItem(i, Item.of('minecraft:air'))
                remaining -= inSlot
            } else {
                stack.setCount(inSlot - remaining)
                remaining = 0
            }
        }
    }
    // Sincroniza o inventário
    player.inventoryMenu.broadcastChanges()
}

// ============================================
// COMANDO /assimilagold
// ============================================

ServerEvents.commandRegistry(function (event) {
    var Commands = event.commands
    var StringArgumentType = Java.loadClass('com.mojang.brigadier.arguments.StringArgumentType')
    var IntegerArgumentType = Java.loadClass('com.mojang.brigadier.arguments.IntegerArgumentType')
    var DoubleArgumentType = Java.loadClass('com.mojang.brigadier.arguments.DoubleArgumentType')
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
        Commands.literal('assimilagold')
            .requires(function (src) { return src.hasPermission(2) })

            // ==============================
            // /assimilagold add lumen <nickname>
            // ==============================
            .then(Commands.literal('add')
                .then(Commands.literal('lumen')
                    .then(Commands.argument('nickname', StringArgumentType.word()).suggests(suggestPlayers)
                        .executes(function (ctx) {
                            var source = ctx.getSource()
                            var server = source.getServer()
                            var nickname = StringArgumentType.getString(ctx, 'nickname')

                            // Encontra o jogador online pelo nickname
                            var targetPlayer = null
                            var players = server.getPlayers()
                            players.forEach(function (p) {
                                if (p.getName().getString() === nickname) {
                                    targetPlayer = p
                                }
                            })

                            if (!targetPlayer) {
                                source.sendFailure(Text.of('§c[AssimilaGold] §fJogador "' + nickname + '" não está online.'))
                                return 0
                            }

                            // Conta divine_soulshards no inventário
                            var totalShards = agCountShardsInInventory(targetPlayer)

                            if (totalShards < AG_SHARDS_PER_LUMEN) {
                                source.sendFailure(Text.of('§c[AssimilaGold] §f' + nickname + ' possui apenas §e' + totalShards + '§f divine_soulshard(s). São necessárias §6' + AG_SHARDS_PER_LUMEN + '§f para cada §b+' + AG_LUMEN_PER_BATCH + ' lumen§f.'))
                                return 0
                            }

                            // Calcula quantos lotes de 16 podem ser convertidos
                            var batches = Math.floor(totalShards / AG_SHARDS_PER_LUMEN)
                            var shardsToConsume = batches * AG_SHARDS_PER_LUMEN
                            var lumenToAdd = batches * AG_LUMEN_PER_BATCH

                            // Remove as shards do inventário
                            agRemoveShardsFromInventory(targetPlayer, shardsToConsume)

                            // Adiciona lumen
                            var currentLumen = agGetLumen(server, nickname)
                            var newLumen = currentLumen + lumenToAdd
                            agSetLumen(server, nickname, newLumen)

                            // Feedback
                            var caller = source.getPlayer()
                            if (caller) {
                                caller.tell(Text.of('§5[AssimilaGold] §fConvertidas §e' + shardsToConsume + '§f divine_soulshard em §b+' + lumenToAdd + ' Lúmens de Estase§f para §a' + nickname + '§f.'))
                                caller.tell(Text.of('§5[AssimilaGold] §fLumen anterior: §7' + currentLumen + ' §f→ Novo: §b' + newLumen))
                            }
                            targetPlayer.tell(Text.of('§5[AssimilaGold] §fSua Barreira Solar foi reforçada! §b+' + lumenToAdd + ' Lúmens de Estase§f (Total: §b' + newLumen + '§f)'))
                            targetPlayer.tell(Text.of('§7  ' + shardsToConsume + ' divine_soulshard foram consumidas.'))

                            return 1
                        })
                    )
                )

                // ==============================
                // /assimilagold add vazio <nickname> <quantidade>
                // ==============================
                .then(Commands.literal('vazio')
                    .then(Commands.argument('nickname', StringArgumentType.word()).suggests(suggestPlayers)
                        .then(Commands.argument('quantidade', DoubleArgumentType.doubleArg(0))
                            .executes(function (ctx) {
                                var source = ctx.getSource()
                                var server = source.getServer()
                                var nickname = StringArgumentType.getString(ctx, 'nickname')
                                var quantidade = DoubleArgumentType.getDouble(ctx, 'quantidade')

                                var currentVazio = agGetVazio(server, nickname)
                                var newVazio = currentVazio + quantidade
                                agSetVazio(server, nickname, newVazio)

                                var caller = source.getPlayer()
                                if (caller) {
                                    caller.tell(Text.of('§5[AssimilaGold] §fAdicionadas §d+' + quantidade + ' Partículas de Vazio§f para §a' + nickname + '§f.'))
                                    caller.tell(Text.of('§5[AssimilaGold] §fVazio anterior: §7' + currentVazio + ' §f→ Novo: §d' + newVazio))
                                }

                                // Se o jogador estiver online, avisa
                                var players = server.getPlayers()
                                players.forEach(function (p) {
                                    if (p.getName().getString() === nickname) {
                                        p.tell(Text.of('§5[AssimilaGold] §fDensidade do Vazio aumentada! §d+' + quantidade + ' Partículas§f (Total: §d' + newVazio + '§f)'))
                                    }
                                })

                                return 1
                            })
                        )
                    )
                )
            )

            // ==============================
            // /assimilagold set lumen <nickname> <valor>
            // ==============================
            .then(Commands.literal('set')
                .then(Commands.literal('lumen')
                    .then(Commands.argument('nickname', StringArgumentType.word()).suggests(suggestPlayers)
                        .then(Commands.argument('valor', DoubleArgumentType.doubleArg(0))
                            .executes(function (ctx) {
                                var source = ctx.getSource()
                                var server = source.getServer()
                                var nickname = StringArgumentType.getString(ctx, 'nickname')
                                var valor = DoubleArgumentType.getDouble(ctx, 'valor')

                                var oldLumen = agGetLumen(server, nickname)
                                agSetLumen(server, nickname, valor)

                                var caller = source.getPlayer()
                                if (caller) {
                                    caller.tell(Text.of('§5[AssimilaGold] §fLúmens de Estase de §a' + nickname + '§f definidos para §b' + valor + '§f. (Anterior: §7' + oldLumen + '§f)'))
                                }

                                return 1
                            })
                        )
                    )
                )

                // ==============================
                // /assimilagold set vazio <nickname> <valor>
                // ==============================
                .then(Commands.literal('vazio')
                    .then(Commands.argument('nickname', StringArgumentType.word()).suggests(suggestPlayers)
                        .then(Commands.argument('valor', DoubleArgumentType.doubleArg(0))
                            .executes(function (ctx) {
                                var source = ctx.getSource()
                                var server = source.getServer()
                                var nickname = StringArgumentType.getString(ctx, 'nickname')
                                var valor = DoubleArgumentType.getDouble(ctx, 'valor')

                                var oldVazio = agGetVazio(server, nickname)
                                agSetVazio(server, nickname, valor)

                                var caller = source.getPlayer()
                                if (caller) {
                                    caller.tell(Text.of('§5[AssimilaGold] §fPartículas de Vazio de §a' + nickname + '§f definidas para §d' + valor + '§f. (Anterior: §7' + oldVazio + '§f)'))
                                }

                                return 1
                            })
                        )
                    )
                )
            )

            // ==============================
            // /assimilagold check <nickname>
            // ==============================
            .then(Commands.literal('check')
                .then(Commands.argument('nickname', StringArgumentType.word()).suggests(suggestPlayers)
                    .executes(function (ctx) {
                        var source = ctx.getSource()
                        var server = source.getServer()
                        var nickname = StringArgumentType.getString(ctx, 'nickname')
                        var caller = source.getPlayer()

                        var lumen = agGetLumen(server, nickname)
                        var infectionStage = agGetInfectionStage(server, nickname)
                        var hasManualVazio = agHasVazioOverride(server, nickname)
                        var vazio = agGetVazio(server, nickname)
                        var theta = agCalculateTheta(lumen, vazio)
                        var percent = agThetaToPercent(theta)
                        var classification = agGetClassification(theta)

                        if (caller) {
                            caller.tell(Text.of(''))
                            caller.tell(Text.of('§5§l═══════ AssimilaGold — ' + nickname + ' ═══════'))
                            caller.tell(Text.of(''))

                            // Info do estágio de infecção
                            if (infectionStage > 0) {
                                var stageColors = { 1: '§a', 2: '§e', 3: '§6', 4: '§c', 5: '§4' }
                                var stageNames = { 1: 'Inicial', 2: 'Moderada', 3: 'Avançada', 4: 'Severa', 5: 'Terminal' }
                                var sColor = stageColors[infectionStage] || '§f'
                                var sName = stageNames[infectionStage] || 'Desconhecido'
                                caller.tell(Text.of('§f  §5⦿ Estágio de Infecção:§f ' + sColor + '§l' + infectionStage + ' §8— ' + sColor + sName))
                            } else {
                                caller.tell(Text.of('§f  §5⦿ Estágio de Infecção:§f §7Nenhum (não infectado)'))
                            }

                            caller.tell(Text.of('§f  §b⦿ Barreira Solar (Ψ):§f ' + lumen + ' §7Lúmens de Estase'))

                            if (hasManualVazio) {
                                caller.tell(Text.of('§f  §d⦿ Densidade do Vazio (Φ):§f ' + vazio + ' §7Partículas §8(override manual)'))
                            } else {
                                caller.tell(Text.of('§f  §d⦿ Densidade do Vazio (Φ):§f ' + vazio + ' §7Partículas §8(via Estágio ' + infectionStage + ')'))
                            }

                            caller.tell(Text.of(''))
                            caller.tell(Text.of('§f  §7Fator de Adaptação (ΔΩ): §f' + AG_DELTA_OMEGA))
                            caller.tell(Text.of('§f  §7Radiação Residual (λ): §f' + AG_LAMBDA_SOMBRA))
                            caller.tell(Text.of(''))

                            if (lumen <= 0 || vazio <= 0) {
                                caller.tell(Text.of('§f  §e⚠ Carga de Singularidade (Θ):§f Impossível calcular'))
                                caller.tell(Text.of('§7    (Lumen e Vazio devem ser maiores que zero)'))
                            } else {
                                caller.tell(Text.of('§f  §6✦ Carga de Singularidade (Θ):§f ' + (Math.round(theta * 10000) / 10000)))
                                caller.tell(Text.of('§f  §6✦ Porcentagem de Assimilação:§f §l' + percent + '%'))
                                caller.tell(Text.of(''))
                                caller.tell(Text.of('§f  §7Resultado: ' + classification))

                                // Cálculo de estabilidade
                                caller.tell(Text.of(''))
                                var lumenStability = agCalculateLumenForStability(vazio)
                                var lumenInerte = agCalculateLumenForTheta(vazio, 0.5)
                                var lumenInstavel = agCalculateLumenForTheta(vazio, 0.7)

                                caller.tell(Text.of('§f  §a⚗ Lumen para Estabilidade §7(Θ=0):§f §l' + lumenStability + ' §7Lúmens'))
                                if (lumen < lumenStability) {
                                    var lumenFaltante = lumenStability - lumen
                                    var shardsFaltantes = Math.ceil(lumenFaltante / AG_LUMEN_PER_BATCH) * AG_SHARDS_PER_LUMEN
                                    caller.tell(Text.of('§f    §7→ Faltam §c' + Math.ceil(lumenFaltante) + '§7 lumen (§e' + shardsFaltantes + '§7 divine_soulshard)'))
                                } else {
                                    caller.tell(Text.of('§f    §7→ §a✓ Barreira Solar suficiente para estabilidade!'))
                                }

                                caller.tell(Text.of('§f  §6⚗ Lumen para Inerte §7(Θ=0.5):§f ' + lumenInerte + ' §7Lúmens'))
                                caller.tell(Text.of('§f  §c⚗ Lumen para Liga Instável §7(Θ=0.7):§f ' + lumenInstavel + ' §7Lúmens'))
                            }

                            caller.tell(Text.of(''))
                            caller.tell(Text.of('§5§l════════════════════════════════════'))
                            caller.tell(Text.of(''))

                            // Conta shards no inventário do jogador alvo se online
                            var targetPlayer = null
                            var players = server.getPlayers()
                            players.forEach(function (p) {
                                if (p.getName().getString() === nickname) {
                                    targetPlayer = p
                                }
                            })

                            if (targetPlayer) {
                                var shardsInInv = agCountShardsInInventory(targetPlayer)
                                var possibleBatches = Math.floor(shardsInInv / AG_SHARDS_PER_LUMEN)
                                var possibleLumen = possibleBatches * AG_LUMEN_PER_BATCH
                                caller.tell(Text.of('§7  Divine Soulshards no inventário: §e' + shardsInInv + '§7 (Conversível: §b+' + possibleLumen + ' lumen§7)'))
                            } else {
                                caller.tell(Text.of('§7  ' + nickname + ' está offline — inventário não verificado.'))
                            }
                        }

                        return 1
                    })
                )
            )
    )

    console.info('[AssimilaGold] Commands registered')
})

console.info('[AssimilaGold] Sistema de Transmutação do Ouro Abissal carregado')
