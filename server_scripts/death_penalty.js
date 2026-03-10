// Priority: 1000
// Death Penalty - removes HALF of a random item stack when player dies
// The removed item is stored in server persistentData
// Admin can use /deathinv <player> to retrieve confiscated items

// Track players who died (to avoid triggering multiple times)
var pendingDeathPenalty = {}

// ============ HELPER: Salvar item confiscado no persistentData ============
function storeConfiscatedItem(server, playerName, item, reason) {
    try {
        var data = server.persistentData

        // Inicializar estrutura se necessário
        if (!data.confiscated) {
            data.confiscated = {}
        }
        if (!data.confiscated[playerName]) {
            data.confiscated[playerName] = []
        }

        // Serializar o item como tag NBT
        var entry = {
            item: item.save(),          // Salva o item completo em NBT
            itemName: item.getDisplayName().getString(),
            reason: reason || 'death_penalty',
            timestamp: new Date().toISOString()
        }

        data.confiscated[playerName].push(entry)
        console.info('[Death Penalty] Item confiscado de ' + playerName + ': ' + entry.itemName)
    } catch (e) {
        console.error('[Death Penalty] Erro ao armazenar item: ' + e)
    }
}

// ============ EVENTO DE MORTE ============
EntityEvents.death(event => {
    var entity = event.entity
    if (!entity.isPlayer()) return

    var player = entity
    var uuid = player.getStringUuid()

    // Prevenir duplicatas
    if (pendingDeathPenalty[uuid]) return
    pendingDeathPenalty[uuid] = true

    player.server.scheduleInTicks(20, () => {
        delete pendingDeathPenalty[uuid]
    })

    var inventory = player.inventory
    var candidates = []
    var playerName = player.getName().getString()

    // Carregar itens essenciais protegidos
    var essentialIds = []
    try {
        var essentialData = player.server.persistentData.essentialItems
        if (essentialData && essentialData[playerName] && essentialData[playerName].items) {
            var items = essentialData[playerName].items
            for (var j = 0; j < items.length; j++) {
                essentialIds.push(items[j].id)
            }
        }
    } catch (e) {
        console.warn('[Death Penalty] Could not get essential items: ' + e)
    }

    // Escanear inventário principal e armadura
    var containerSize = inventory.getContainerSize()
    for (var i = 0; i < containerSize; i++) {
        var stack = inventory.getItem(i)
        if (!stack.isEmpty()) {
            var modId = stack.getMod()
            var itemId = stack.getId()

            // Ignorar backpacks/storage
            if (modId === 'sophisticatedbackpacks' || modId === 'sophisticatedstorage') continue

            // Ignorar itens essenciais
            if (essentialIds.indexOf(itemId) !== -1) {
                console.info('[Death Penalty] Skipping essential item: ' + itemId)
                continue
            }

            candidates.push({ slot: i, item: stack })
        }
    }

    // Aplicar penalidade em um item aleatório
    if (candidates.length > 0) {
        var randomIndex = Math.floor(Math.random() * candidates.length)
        var selectedCandidate = candidates[randomIndex]
        var selectedItem = selectedCandidate.item
        var lostItemName = selectedItem.getDisplayName()

        if (selectedItem.maxDamage > 0) {
            // ITEM COM DURABILIDADE: Confiscar cópia danificada ao meio
            var currentDamage = selectedItem.damageValue || 0
            var maxDurability = selectedItem.maxDamage
            var currentDurability = maxDurability - currentDamage
            var durabilityToLose = Math.max(1, Math.floor(currentDurability / 2))
            var newDamage = currentDamage + durabilityToLose

            if (newDamage >= maxDurability) {
                // Item teria quebrado — confiscar a cópia original antes de quebrar
                var confiscatedCopy = selectedItem.copy()
                storeConfiscatedItem(player.server, playerName, confiscatedCopy, 'item_quebrado')
                inventory.setItem(selectedCandidate.slot, Item.of('minecraft:air'))
                player.tell(Text.of('Item confiscado: ').append(lostItemName).append(Text.of(' (estava prestes a quebrar)')).red())
            } else {
                // Item danificado: confiscar e colocar versão danificada de volta
                var confiscatedCopy = selectedItem.copy()
                storeConfiscatedItem(player.server, playerName, confiscatedCopy, 'durabilidade_reduzida')
                var damagedItem = selectedItem.copy()
                damagedItem.damageValue = newDamage
                inventory.setItem(selectedCandidate.slot, damagedItem)
                var durabilityLeft = maxDurability - newDamage
                player.tell(Text.of('Item danificado: ').append(lostItemName)
                    .append(Text.of(` (-${durabilityToLose} durabilidade, restam ${durabilityLeft})`)).yellow())
            }
        } else {
            // ITEM EMPILHÁVEL: Confiscar metade da pilha
            var currentCount = selectedItem.getCount()
            var halfCount = Math.max(1, Math.floor(currentCount / 2))
            var newCount = currentCount - halfCount

            // Criar cópia do item confiscado com a quantidade exata removida
            var confiscatedCopy = selectedItem.copy()
            confiscatedCopy.setCount(halfCount)
            storeConfiscatedItem(player.server, playerName, confiscatedCopy, 'stack_reduzido')

            if (newCount <= 0) {
                inventory.setItem(selectedCandidate.slot, Item.of('minecraft:air'))
                player.tell(Text.of('Item confiscado: ').append(lostItemName)
                    .append(Text.of(` (todos ${currentCount} removidos)`)).red())
            } else {
                selectedItem.setCount(newCount)
                player.tell(Text.of('Itens confiscados: ').append(lostItemName)
                    .append(Text.of(` (-${halfCount}, restam ${newCount})`)).yellow())
            }
        }

        player.tell(Text.of('Para conseguir seu item novamente, converse com Lucy Berlinde, a coletora de sucata .').gray())
    }
})

// ============ COMANDO /deathinv ============
// Uso: /deathinv <jogador>    — transfere os itens confiscados do jogador para o executor
// Uso: /deathinv list <jogador> — lista os itens confiscados sem removê-los
// Apenas jogadores com permissão de OP (nível 2+) podem usar

ServerEvents.commandRegistry(event => {
    var Commands = event.commands

    event.register(
        Commands.literal('deathinv')
            .requires(source => source.hasPermission(2))  // OP apenas

            // /deathinv list <jogador>
            .then(Commands.literal('list')
                .then(Commands.argument('target', event.buildArgument('player'))
                    .executes(ctx => {
                        try {
                            var targetName = ctx.getInput().split(' ')[2] || ''
                            var executor = ctx.source.playerOrException
                            var data = ctx.source.server.persistentData

                            if (!data.confiscated || !data.confiscated[targetName] || data.confiscated[targetName].length === 0) {
                                executor.tell(Text.of('[DeathInv] Nenhum item confiscado de ' + targetName).yellow())
                                return 1
                            }

                            var list = data.confiscated[targetName]
                            executor.tell(Text.of('[DeathInv] Itens confiscados de ' + targetName + ' (' + list.length + '):').aqua())
                            for (var i = 0; i < list.length; i++) {
                                var entry = list[i]
                                executor.tell(Text.of('  ' + (i + 1) + '. ' + entry.itemName + ' — ' + entry.reason + ' (' + entry.timestamp + ')').gray())
                            }
                        } catch (e) {
                            console.error('[Death Penalty] Erro no /deathinv list: ' + e)
                        }
                        return 1
                    })
                )
            )

            // /deathinv <jogador> — retira os itens e entrega ao executor
            .then(Commands.argument('target', event.buildArgument('player'))
                .executes(ctx => {
                    try {
                        var targetName = ctx.getInput().split(' ')[1] || ''
                        var executor = ctx.source.playerOrException
                        var server = ctx.source.server
                        var data = server.persistentData

                        if (!data.confiscated || !data.confiscated[targetName] || data.confiscated[targetName].length === 0) {
                            executor.tell(Text.of('[DeathInv] Nenhum item confiscado de ' + targetName).yellow())
                            return 1
                        }

                        var list = data.confiscated[targetName]
                        var received = 0

                        for (var i = 0; i < list.length; i++) {
                            try {
                                var entry = list[i]
                                // Recriar o item a partir do NBT salvo
                                var restoredItem = Item.of(entry.item)
                                if (restoredItem && !restoredItem.isEmpty()) {
                                    executor.give(restoredItem)
                                    received++
                                }
                            } catch (itemErr) {
                                console.error('[Death Penalty] Erro ao restaurar item: ' + itemErr)
                            }
                        }

                        // Limpar a lista do jogador
                        data.confiscated[targetName] = []

                        executor.tell(Text.of('[DeathInv] ' + received + ' item(s) de ' + targetName + ' adicionados ao seu inventário.').green())
                        console.info('[Death Penalty] ' + executor.getName().getString() + ' retirou ' + received + ' itens confiscados de ' + targetName)
                    } catch (e) {
                        console.error('[Death Penalty] Erro no /deathinv: ' + e)
                    }
                    return 1
                })
            )
    )
})

console.info('[Death Penalty] Sistema de confisco ativo — use /deathinv <jogador> para resgatar itens.')
