// Priority: 900
// Essential Items System - Provides temporary class items after death
// Items are removed when player gets within 5 blocks of their corpse

// ============================================
// HELPER FUNCTIONS (safe - only modify data inside events)
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
            items: [],
            deathX: 0,
            deathY: 0,
            deathZ: 0,
            deathDimension: '',
            hasTemporaryItems: false,
            temporaryItemIds: []
        }
    }
    return data[playerName]
}

function serializeItemForStorage(itemStack) {
    try {
        // In 1.21, use toItemString() which gives SNBT format with all components
        var snbt = itemStack.toItemString()
        console.info('[Essential Items] Serialized: ' + snbt.substring(0, 100) + '...')
        return {
            snbt: snbt,
            id: itemStack.getId(),
            count: itemStack.getCount()
        }
    } catch (e) {
        console.warn('[Essential Items] Serialize error: ' + e)
        return {
            snbt: '',
            id: itemStack.getId(),
            count: itemStack.getCount()
        }
    }
}

function deserializeItemFromStorage(serialized) {
    try {
        // First try to restore from SNBT string (preserves all data)
        if (serialized.snbt && serialized.snbt.length > 0) {
            console.info('[Essential Items] Deserializing from SNBT: ' + serialized.snbt.substring(0, 100) + '...')
            var item = Item.of(serialized.snbt)
            if (item && !item.isEmpty()) {
                return item
            }
        }

        // Fallback: try old nbtString format (for backwards compatibility)
        if (serialized.nbtString && serialized.nbtString.length > 0) {
            console.info('[Essential Items] Trying legacy nbtString format')
            var nbtString = serialized.nbtString
            // Try to extract components from old format
            var componentsMatch = nbtString.match(/components:\{(.+)\},count/)
            if (componentsMatch && componentsMatch[1]) {
                var itemString = serialized.id + '[' + componentsMatch[1] + ']'
                return Item.of(itemString)
            }
        }

        // Last fallback: just the item ID
        console.info('[Essential Items] Falling back to basic item: ' + serialized.id)
        return Item.of(serialized.id)
    } catch (e) {
        console.error('[Essential Items] Deserialize error: ' + e)
        return Item.of(serialized.id)
    }
}

function getTemporaryItemIds(server, playerName) {
    var essentials = getPlayerEssentials(server, playerName)
    if (!essentials.temporaryItemIds) {
        essentials.temporaryItemIds = []
    }
    return essentials.temporaryItemIds
}

function markItemAsTemporary(server, playerName, itemId) {
    var ids = getTemporaryItemIds(server, playerName)
    if (ids.indexOf(itemId) === -1) {
        ids.push(itemId)
    }
}

function clearTemporaryItemIds(server, playerName) {
    var essentials = getPlayerEssentials(server, playerName)
    essentials.temporaryItemIds = []
}

function removeTemporaryItems(player) {
    var inventory = player.inventory
    var removed = 0
    var playerName = player.getName().getString()
    var ids = getTemporaryItemIds(player.server, playerName)

    if (ids.length === 0) return 0

    for (var i = 0; i < inventory.getContainerSize(); i++) {
        var stack = inventory.getItem(i)
        if (!stack.isEmpty() && ids.indexOf(stack.getId()) !== -1) {
            inventory.setItem(i, Item.of('minecraft:air'))
            removed++
        }
    }

    clearTemporaryItemIds(player.server, playerName)
    return removed
}

// ============================================
// PROXIMITY CHECK
// ============================================

var tickCounter = 0

ServerEvents.tick(function (event) {
    tickCounter++
    if (tickCounter < 40) return
    tickCounter = 0

    var server = event.server
    var persistentData = server.persistentData

    server.getPlayers().forEach(function (player) {
        var playerName = player.getName().getString()
        var prefix = 'essentialDeath_' + playerName + '_'

        // Check if player has death items using NBT
        var hasDeathItems = persistentData.getBoolean(prefix + 'hasItems')
        if (!hasDeathItems) return

        var deathDim = persistentData.getString(prefix + 'dim')
        var currentDim = player.level.dimensionKey.toString()
        if (currentDim !== deathDim) return

        var deathX = persistentData.getDouble(prefix + 'x')
        var deathY = persistentData.getDouble(prefix + 'y')
        var deathZ = persistentData.getDouble(prefix + 'z')

        var px = player.getX()
        var py = player.getY()
        var pz = player.getZ()
        var dx = px - deathX
        var dy = py - deathY
        var dz = pz - deathZ
        var distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (distance <= 5) {
            var removed = removeTemporaryItems(player)
            if (removed > 0) {
                player.tell(Text.of('§aCorpo recuperado! §7' + removed + ' item(ns) removido(s).'))
            }
            // Clear death position using NBT
            persistentData.putBoolean(prefix + 'hasItems', false)
            persistentData.putDouble(prefix + 'x', 0)
            persistentData.putDouble(prefix + 'y', 0)
            persistentData.putDouble(prefix + 'z', 0)
            persistentData.putString(prefix + 'dim', '')
        }
    })
})

// ============================================
// DEATH EVENT
// ============================================

EntityEvents.death(function (event) {
    var entity = event.entity
    if (!entity.isPlayer()) return

    var player = entity
    var playerName = player.getName().getString()
    var playerData = getPlayerEssentials(player.server, playerName)

    console.info('[Essential Items] Death event for ' + playerName)
    console.info('[Essential Items] Items count: ' + (playerData.items ? playerData.items.length : 0))

    if (!playerData.items || playerData.items.length === 0) {
        console.info('[Essential Items] No items configured, skipping death registration')
        return
    }

    // Store coordinates directly in server persistentData using putDouble
    var data = player.server.persistentData
    var prefix = 'essentialDeath_' + playerName + '_'

    data.putDouble(prefix + 'x', player.getX())
    data.putDouble(prefix + 'y', player.getY())
    data.putDouble(prefix + 'z', player.getZ())
    data.putString(prefix + 'dim', player.level.dimensionKey.toString())
    data.putBoolean(prefix + 'hasItems', true)

    console.info('[Essential Items] Death position saved: ' + player.getX() + ', ' + player.getY() + ', ' + player.getZ())
})

// ============================================
// RESPAWN EVENT
// ============================================

PlayerEvents.respawned(function (event) {
    var player = event.player
    var playerName = player.getName().getString()
    var playerData = getPlayerEssentials(player.server, playerName)

    // Read death position using NBT methods
    var data = player.server.persistentData
    var prefix = 'essentialDeath_' + playerName + '_'

    var deathX = data.getDouble(prefix + 'x')
    var deathY = data.getDouble(prefix + 'y')
    var deathZ = data.getDouble(prefix + 'z')
    var hasDeathItems = data.getBoolean(prefix + 'hasItems')

    console.info('[Essential Items] Respawn event for ' + playerName)
    console.info('[Essential Items] Death coords (NBT): ' + deathX + ', ' + deathY + ', ' + deathZ)
    console.info('[Essential Items] Has death items: ' + hasDeathItems)
    console.info('[Essential Items] Items count: ' + (playerData.items ? playerData.items.length : 0))

    // Check if death position exists
    if (!hasDeathItems) {
        console.info('[Essential Items] No death items flag, skipping item give')
        return
    }

    clearTemporaryItemIds(player.server, playerName)

    var given = 0

    if (playerData.items && playerData.items.length > 0) {
        for (var i = 0; i < playerData.items.length; i++) {
            try {
                console.info('[Essential Items] Giving item ' + (i + 1) + ': ' + playerData.items[i].id)
                var item = deserializeItemFromStorage(playerData.items[i])
                player.give(item)
                markItemAsTemporary(player.server, playerName, item.getId())
                given++
            } catch (e) {
                console.warn('[Essential Items] Failed to give: ' + e)
            }
        }
    }

    if (given > 0) {
        playerData.hasTemporaryItems = true
        player.tell(Text.of('§6Recebeu ' + given + ' item(ns) essencial(is) temporário(s).'))
        console.info('[Essential Items] Gave ' + given + ' items to ' + playerName)
    } else {
        console.info('[Essential Items] No items given to ' + playerName)
    }
})

// ============================================
// COMMANDS
// ============================================

ServerEvents.commandRegistry(function (event) {
    var Commands = event.commands
    var StringArgumentType = Java.loadClass('com.mojang.brigadier.arguments.StringArgumentType')
    var IntegerArgumentType = Java.loadClass('com.mojang.brigadier.arguments.IntegerArgumentType')
    var EntityArgument = Java.loadClass('net.minecraft.commands.arguments.EntityArgument')

    event.register(
        Commands.literal('essencial')
            .then(Commands.literal('add')
                .requires(function (src) { return src.hasPermission(2) })
                .then(Commands.argument('target', EntityArgument.player())
                    .executes(function (ctx) {
                        var source = ctx.getSource()
                        var executor = source.getPlayer()
                        var targetPlayer = EntityArgument.getPlayer(ctx, 'target')
                        var targetNick = targetPlayer.getName().getString()

                        if (!executor) return 0

                        var heldItem = executor.getMainHandItem()
                        if (heldItem.isEmpty()) {
                            executor.tell(Text.of('§cSegure um item.'))
                            return 0
                        }

                        var serialized = serializeItemForStorage(heldItem)
                        var playerData = getPlayerEssentials(source.getServer(), targetNick)
                        playerData.items.push(serialized)

                        executor.tell(Text.of('§aItem adicionado para §e' + targetNick + '§a: §f' + heldItem.getId()))

                        return 1
                    })
                )
            )
            .then(Commands.literal('remove')
                .requires(function (src) { return src.hasPermission(2) })
                .then(Commands.argument('nick', StringArgumentType.word())
                    .then(Commands.argument('slot', IntegerArgumentType.integer(1))
                        .executes(function (ctx) {
                            var source = ctx.getSource()
                            var executor = source.getPlayer()
                            var targetNick = StringArgumentType.getString(ctx, 'nick')
                            var slot = IntegerArgumentType.getInteger(ctx, 'slot')

                            var playerData = getPlayerEssentials(source.getServer(), targetNick)

                            if (slot < 1 || slot > playerData.items.length) {
                                if (executor) executor.tell(Text.of('§cSlot inválido.'))
                                return 0
                            }

                            var removedId = playerData.items[slot - 1].id

                            var newItems = []
                            for (var i = 0; i < playerData.items.length; i++) {
                                if (i !== slot - 1) {
                                    newItems.push(playerData.items[i])
                                }
                            }
                            playerData.items = newItems

                            if (executor) executor.tell(Text.of('§aRemovido: §f' + removedId))

                            return 1
                        })
                    )
                )
            )
            .then(Commands.literal('list')
                .requires(function (src) { return src.hasPermission(2) })
                .executes(function (ctx) {
                    var source = ctx.getSource()
                    var executor = source.getPlayer()
                    if (!executor) return 0
                    return listEssentials(executor, source.getServer(), executor.getName().getString())
                })
                .then(Commands.argument('nick', StringArgumentType.word())
                    .executes(function (ctx) {
                        var source = ctx.getSource()
                        var executor = source.getPlayer()
                        var targetNick = StringArgumentType.getString(ctx, 'nick')
                        return listEssentials(executor, source.getServer(), targetNick)
                    })
                )
            )
            .then(Commands.literal('clear')
                .requires(function (src) { return src.hasPermission(2) })
                .then(Commands.argument('nick', StringArgumentType.word())
                    .executes(function (ctx) {
                        var source = ctx.getSource()
                        var executor = source.getPlayer()
                        var targetNick = StringArgumentType.getString(ctx, 'nick')

                        var playerData = getPlayerEssentials(source.getServer(), targetNick)
                        var count = playerData.items ? playerData.items.length : 0

                        playerData.items = []
                        playerData.hasTemporaryItems = false
                        clearTemporaryItemIds(source.getServer(), targetNick)

                        if (executor) executor.tell(Text.of('§aLimpou ' + count + ' item(ns) de §e' + targetNick))

                        return 1
                    })
                )
            )
    )

    console.info('[Essential Items] Commands registered')
})

function listEssentials(player, server, targetNick) {
    var playerData = getPlayerEssentials(server, targetNick)

    if (!player) return 1

    if (!playerData.items || playerData.items.length === 0) {
        player.tell(Text.of('§7Nenhum item essencial para ' + targetNick))
        return 1
    }

    player.tell(Text.of('§6Itens de §e' + targetNick + '§6:'))
    for (var i = 0; i < playerData.items.length; i++) {
        player.tell(Text.of('  §7' + (i + 1) + '. §f' + playerData.items[i].id))
    }

    return 1
}

console.info('[Essential Items] System loaded')
