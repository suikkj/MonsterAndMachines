// Priority: 900
// Essential Items System - Provides temporary class items after death
// Items are removed when player gets within 5 blocks of their corpse

// ============================================
// PERSISTENT DATA HELPERS
// ============================================

function getEssentialData(server) {
    var data = server.persistentData
    if (!data.essentialItems) {
        data.essentialItems = {}
    }
    return data.essentialItems
}

function getPlayerEssentials(server, playerName) {
    var data = getEssentialData(server)
    if (!data[playerName]) {
        data[playerName] = {
            items: [],  // Array of serialized items (with full NBT)
            deathPos: null,
            deathDimension: null,
            hasTemporaryItems: false
        }
    }
    return data[playerName]
}

// ============================================
// ITEM SERIALIZATION (preserves NBT for spellbooks, etc.)
// ============================================

function serializeItem(itemStack) {
    return {
        id: itemStack.getId(),
        nbt: itemStack.getNbt() ? itemStack.getNbt().toString() : null,
        count: itemStack.getCount()
    }
}

function deserializeItem(serialized, withTemporaryTag) {
    var item = Item.of(serialized.id)

    // Restore original NBT
    if (serialized.nbt) {
        try {
            item = Item.of(serialized.id + serialized.nbt)
        } catch (e) {
            // Fallback if NBT parsing fails
            item = Item.of(serialized.id)
        }
    }

    item.setCount(serialized.count || 1)

    // Add temporary marker
    if (withTemporaryTag) {
        var nbt = item.getNbt() || {}
        nbt.essential_temporary = true
        item.setNbt(nbt)

        // Add visual lore
        var lore = item.getLore() || []
        lore.unshift(Text.of('§c[Item Essencial Temporário]'))
        lore.unshift(Text.of('§7Será removido ao recuperar seu corpo'))
        item.setLore(lore)
    }

    return item
}

// ============================================
// TEMPORARY ITEM CHECK
// ============================================

function isTemporaryItem(itemStack) {
    if (itemStack.isEmpty()) return false
    var nbt = itemStack.getNbt()
    if (!nbt) return false
    return nbt.getBoolean('essential_temporary') === true
}

function removeTemporaryItems(player) {
    var inventory = player.inventory
    var removed = 0

    for (var i = 0; i < inventory.getContainerSize(); i++) {
        var stack = inventory.getItem(i)
        if (isTemporaryItem(stack)) {
            inventory.setItem(i, Item.of('minecraft:air'))
            removed++
        }
    }

    return removed
}

// ============================================
// PROXIMITY CHECK (runs every 40 ticks = 2 seconds)
// ============================================

var tickCounter = 0

ServerEvents.tick(event => {
    tickCounter++
    if (tickCounter < 40) return
    tickCounter = 0

    var server = event.server
    var data = getEssentialData(server)

    server.getPlayers().forEach(player => {
        var playerName = player.getName().getString()
        var playerData = data[playerName]

        if (!playerData || !playerData.hasTemporaryItems) return
        if (!playerData.deathPos) return

        // Check if same dimension
        var currentDim = player.getLevel().dimension().toString()
        if (currentDim !== playerData.deathDimension) return

        // Check distance
        var dx = player.getX() - playerData.deathPos.x
        var dy = player.getY() - playerData.deathPos.y
        var dz = player.getZ() - playerData.deathPos.z
        var distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (distance <= 5) {
            var removed = removeTemporaryItems(player)
            if (removed > 0) {
                player.tell(Text.of('§aVocê recuperou seu corpo! §7' + removed + ' item(ns) essencial(is) temporário(s) removido(s).'))
            }
            playerData.hasTemporaryItems = false
            playerData.deathPos = null
            playerData.deathDimension = null
        }
    })
})

// ============================================
// DEATH EVENT - Save death position
// ============================================

EntityEvents.death(event => {
    var entity = event.entity
    if (!entity.isPlayer()) return

    var player = entity
    var playerName = player.getName().getString()
    var playerData = getPlayerEssentials(player.server, playerName)

    // Only save if player has essential items configured
    if (playerData.items.length === 0) return

    // Save death position
    playerData.deathPos = {
        x: player.getX(),
        y: player.getY(),
        z: player.getZ()
    }
    playerData.deathDimension = player.getLevel().dimension().toString()
})

// ============================================
// RESPAWN EVENT - Give temporary essential items
// ============================================

PlayerEvents.respawn(event => {
    var player = event.player
    var playerName = player.getName().getString()
    var playerData = getPlayerEssentials(player.server, playerName)

    // Only if player has essential items configured
    if (playerData.items.length === 0) return

    // Only if we have a death position (meaning they died with essentials)
    if (!playerData.deathPos) return

    // Give temporary copies of essential items
    var given = 0
    playerData.items.forEach(serializedItem => {
        var tempItem = deserializeItem(serializedItem, true)
        player.give(tempItem)
        given++
    })

    if (given > 0) {
        playerData.hasTemporaryItems = true
        player.tell(Text.of('§6Você recebeu ' + given + ' item(ns) essencial(is) temporário(s).'))
        player.tell(Text.of('§7Eles serão removidos quando você chegar ao seu corpo.'))
    }
})

// ============================================
// CHAT COMMANDS
// ============================================

ServerEvents.commandRegistry(event => {
    var Commands = event.commands
    var StringArgumentType = Java.loadClass('com.mojang.brigadier.arguments.StringArgumentType')
    var IntegerArgumentType = Java.loadClass('com.mojang.brigadier.arguments.IntegerArgumentType')

    event.register(
        Commands.literal('essencial')
            // /essencial add <nick> - Add held item as essential for player
            .then(Commands.literal('add')
                .requires(src => src.hasPermission(2))
                .then(Commands.argument('nick', StringArgumentType.word())
                    .executes(ctx => {
                        var source = ctx.getSource()
                        var executor = source.getPlayer()
                        var targetNick = StringArgumentType.getString(ctx, 'nick')

                        if (!executor) {
                            source.sendFailure(Text.of('§cEste comando deve ser executado por um jogador.'))
                            return 0
                        }

                        var heldItem = executor.getMainHandItem()
                        if (heldItem.isEmpty()) {
                            source.sendFailure(Text.of('§cVocê precisa segurar um item na mão principal.'))
                            return 0
                        }

                        var playerData = getPlayerEssentials(source.getServer(), targetNick)
                        var serialized = serializeItem(heldItem)
                        playerData.items.push(serialized)

                        source.sendSuccess(() => Text.of('§aItem essencial adicionado para §e' + targetNick + '§a: ')
                            .append(heldItem.getDisplayName())
                            .append(Text.of(' §7(slot ' + playerData.items.length + ')')), true)

                        return 1
                    })
                )
            )
            // /essencial remove <nick> <slot> - Remove essential item by slot
            .then(Commands.literal('remove')
                .requires(src => src.hasPermission(2))
                .then(Commands.argument('nick', StringArgumentType.word())
                    .then(Commands.argument('slot', IntegerArgumentType.integer(1))
                        .executes(ctx => {
                            var source = ctx.getSource()
                            var targetNick = StringArgumentType.getString(ctx, 'nick')
                            var slot = IntegerArgumentType.getInteger(ctx, 'slot')

                            var playerData = getPlayerEssentials(source.getServer(), targetNick)

                            if (slot < 1 || slot > playerData.items.length) {
                                source.sendFailure(Text.of('§cSlot inválido. Use /essencial list ' + targetNick + ' para ver os slots.'))
                                return 0
                            }

                            var removed = playerData.items.splice(slot - 1, 1)[0]
                            source.sendSuccess(() => Text.of('§aItem essencial removido do slot ' + slot + ' de §e' + targetNick + '§a: ' + removed.id), true)

                            return 1
                        })
                    )
                )
            )
            // /essencial list [nick] - List essential items
            .then(Commands.literal('list')
                .requires(src => src.hasPermission(2))
                .executes(ctx => {
                    var source = ctx.getSource()
                    var executor = source.getPlayer()
                    if (!executor) {
                        source.sendFailure(Text.of('§cEspecifique um nick: /essencial list <nick>'))
                        return 0
                    }
                    var targetNick = executor.getName().getString()
                    return listEssentials(source, targetNick)
                })
                .then(Commands.argument('nick', StringArgumentType.word())
                    .executes(ctx => {
                        var source = ctx.getSource()
                        var targetNick = StringArgumentType.getString(ctx, 'nick')
                        return listEssentials(source, targetNick)
                    })
                )
            )
            // /essencial clear <nick> - Clear all essential items
            .then(Commands.literal('clear')
                .requires(src => src.hasPermission(2))
                .then(Commands.argument('nick', StringArgumentType.word())
                    .executes(ctx => {
                        var source = ctx.getSource()
                        var targetNick = StringArgumentType.getString(ctx, 'nick')

                        var playerData = getPlayerEssentials(source.getServer(), targetNick)
                        var count = playerData.items.length
                        playerData.items = []
                        playerData.hasTemporaryItems = false

                        source.sendSuccess(() => Text.of('§aLimpou ' + count + ' item(ns) essencial(is) de §e' + targetNick), true)

                        return 1
                    })
                )
            )
    )
})

function listEssentials(source, targetNick) {
    var data = getEssentialData(source.getServer())
    var playerData = data[targetNick]

    if (!playerData || playerData.items.length === 0) {
        source.sendSuccess(() => Text.of('§7' + targetNick + ' não tem itens essenciais configurados.'), false)
        return 1
    }

    source.sendSuccess(() => Text.of('§6Itens essenciais de §e' + targetNick + '§6:'), false)
    playerData.items.forEach((item, index) => {
        var nbtInfo = item.nbt ? ' §8(com NBT)' : ''
        source.sendSuccess(() => Text.of('  §7' + (index + 1) + '. §f' + item.id + nbtInfo), false)
    })

    return 1
}
