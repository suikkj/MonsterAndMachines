// Priority: 900
// Essential Items System - Provides class items after death
// Items are removed when player gets within 5 blocks of their corpse
// 
// CONFIGURAÇÃO POR NOME DE JOGADOR (offline-mode)
// Edite PLAYER_ESSENTIAL_ITEMS para adicionar itens aos jogadores
// Use /getessencialid para obter o ID SNBT de um item na mão

// ============================================
// ITENS ESSENCIAIS POR JOGADOR (por nickname)
// ============================================
// Para adicionar itens:
// 1. Segure o item desejado na mão
// 2. Use /getessencialid para obter o código SNBT
// 3. Cole o código no array 'itens' do jogador
// 4. Use /reload para aplicar

var PLAYER_ESSENTIAL_ITEMS = {
    // ==============================
    // JOGADORES - EDITE AQUI
    // ==============================

    'cactian0': {
        // Itens que o jogador recebe ao renascer (códigos SNBT)
        itens: [
            // Exemplo: 'minecraft:iron_sword[enchantments={sharpness:5}]'
        ],
        // Armadura inicial (equipada automaticamente ao renascer)
        armadura: {
            head: '',      // Ex: 'minecraft:iron_helmet'
            chest: '',     // Ex: 'minecraft:iron_chestplate'
            legs: '',      // Ex: 'minecraft:iron_leggings'
            feet: ''       // Ex: 'minecraft:iron_boots'
        }
    },

    'Cineraria_': {
        itens: [],
        armadura: { head: '', chest: '', legs: '', feet: '' }
    },

    'adrielg1': {
        itens: [],
        armadura: { head: '', chest: '', legs: '', feet: '' }
    },

    'Grixzs': {
        itens: [],
        armadura: { head: '', chest: '', legs: '', feet: '' }
    },

    'MonoChroma9696': {
        itens: [],
        armadura: { head: '', chest: '', legs: '', feet: '' }
    },

    'JoooVi_': {
        itens: [],
        armadura: { head: '', chest: '', legs: '', feet: '' }
    },

    'Merida': {
        itens: [],
        armadura: { head: '', chest: '', legs: '', feet: '' }
    },

    'Ma4tsu': {
        itens: [],
        armadura: { head: '', chest: '', legs: '', feet: '' }
    },

    'suikkj': {
        itens: [],
        armadura: { head: '', chest: '', legs: '', feet: '' }
    },

    'Undy55': {
        itens: [],
        armadura: { head: '', chest: '', legs: '', feet: '' }
    },

    '_Myos_': {
        itens: [
            // Adicione os IDs SNBT aqui
            // Exemplo:
            // 'minecraft:iron_sword[enchantments={sharpness:2,unbreaking:3}]',
            // 'irons_spellbooks:scroll[irons_spellbooks:spell={id:"irons_spellbooks:fireball",level:3}]'
        ],
        armadura: { head: '', chest: '', legs: '', feet: '' }
    },

    'Rafafinha_': {
        itens: [],
        armadura: { head: '', chest: '', legs: '', feet: '' }
    },

    'LukGojo': {
        itens: [],
        armadura: { head: '', chest: '', legs: '', feet: '' }
    },

    'Yuna_Lyn': {
        itens: [],
        armadura: { head: '', chest: '', legs: '', feet: '' }
    },

    'dupcdugamer': {
        itens: [],
        armadura: { head: '', chest: '', legs: '', feet: '' }
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getPlayerConfig(playerName) {
    if (PLAYER_ESSENTIAL_ITEMS[playerName]) {
        return PLAYER_ESSENTIAL_ITEMS[playerName]
    }
    return { itens: [], armadura: { head: '', chest: '', legs: '', feet: '' } }
}

function getDeathData(server) {
    var data = server.persistentData
    return data
}

function getTemporaryItemIds(server, playerName) {
    var data = server.persistentData
    var key = 'essentialTempItems_' + playerName
    var idsString = data.getString(key)
    if (!idsString || idsString === '') {
        return []
    }
    try {
        return JSON.parse(idsString)
    } catch (e) {
        return []
    }
}

function setTemporaryItemIds(server, playerName, ids) {
    var data = server.persistentData
    var key = 'essentialTempItems_' + playerName
    data.putString(key, JSON.stringify(ids))
}

function markItemAsTemporary(server, playerName, itemId) {
    var ids = getTemporaryItemIds(server, playerName)
    if (ids.indexOf(itemId) === -1) {
        ids.push(itemId)
    }
    setTemporaryItemIds(server, playerName, ids)
}

function clearTemporaryItemIds(server, playerName) {
    setTemporaryItemIds(server, playerName, [])
}

function removeTemporaryItems(player) {
    var inventory = player.inventory
    var removed = 0
    var playerName = player.getName().getString()
    var ids = getTemporaryItemIds(player.server, playerName)

    if (ids.length === 0) return 0

    // Remove items from inventory
    for (var i = 0; i < inventory.getContainerSize(); i++) {
        var stack = inventory.getItem(i)
        if (!stack.isEmpty() && ids.indexOf(stack.getId()) !== -1) {
            inventory.setItem(i, Item.of('minecraft:air'))
            removed++
        }
    }

    // Remove armor pieces
    var EquipmentSlot = Java.loadClass('net.minecraft.world.entity.EquipmentSlot')
    var armorSlots = [EquipmentSlot.HEAD, EquipmentSlot.CHEST, EquipmentSlot.LEGS, EquipmentSlot.FEET]
    for (var j = 0; j < armorSlots.length; j++) {
        var armor = player.getItemBySlot(armorSlots[j])
        if (!armor.isEmpty() && ids.indexOf(armor.getId()) !== -1) {
            player.setItemSlot(armorSlots[j], Item.of('minecraft:air'))
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
    var data = server.persistentData

    server.getPlayers().forEach(function (player) {
        var playerName = player.getName().getString()
        var prefix = 'essentialDeath_' + playerName + '_'

        // Check if player has death items
        var hasDeathItems = data.getBoolean(prefix + 'hasItems')
        if (!hasDeathItems) return

        var deathDim = data.getString(prefix + 'dim')
        var currentDim = player.level.dimensionKey.toString()
        if (currentDim !== deathDim) return

        var deathX = data.getDouble(prefix + 'x')
        var deathY = data.getDouble(prefix + 'y')
        var deathZ = data.getDouble(prefix + 'z')

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
            // Clear death position
            data.putBoolean(prefix + 'hasItems', false)
            data.putDouble(prefix + 'x', 0)
            data.putDouble(prefix + 'y', 0)
            data.putDouble(prefix + 'z', 0)
            data.putString(prefix + 'dim', '')
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
    var config = getPlayerConfig(playerName)

    console.info('[Essential Items] Death event for ' + playerName)

    // Check if player has any items configured
    var hasItems = config.itens && config.itens.length > 0
    var hasArmor = config.armadura && (config.armadura.head || config.armadura.chest || config.armadura.legs || config.armadura.feet)

    if (!hasItems && !hasArmor) {
        console.info('[Essential Items] No items configured for ' + playerName + ', skipping')
        return
    }

    // Store coordinates in server persistentData
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
    var config = getPlayerConfig(playerName)

    // Read death position
    var data = player.server.persistentData
    var prefix = 'essentialDeath_' + playerName + '_'
    var hasDeathItems = data.getBoolean(prefix + 'hasItems')

    console.info('[Essential Items] Respawn event for ' + playerName)
    console.info('[Essential Items] Has death items: ' + hasDeathItems)

    if (!hasDeathItems) {
        console.info('[Essential Items] No death items flag, skipping')
        return
    }

    clearTemporaryItemIds(player.server, playerName)

    var given = 0
    var EquipmentSlot = Java.loadClass('net.minecraft.world.entity.EquipmentSlot')

    // Give items from configuration
    if (config.itens && config.itens.length > 0) {
        for (var i = 0; i < config.itens.length; i++) {
            try {
                var snbt = config.itens[i]
                if (!snbt || snbt === '') continue

                console.info('[Essential Items] Giving item: ' + snbt)
                var item = Item.of(snbt)
                if (item && !item.isEmpty()) {
                    player.give(item)
                    markItemAsTemporary(player.server, playerName, item.getId())
                    given++
                }
            } catch (e) {
                console.warn('[Essential Items] Failed to give item: ' + e)
            }
        }
    }

    // Equip armor from configuration
    if (config.armadura) {
        try {
            if (config.armadura.head && config.armadura.head !== '') {
                var head = Item.of(config.armadura.head)
                if (head && !head.isEmpty()) {
                    player.setItemSlot(EquipmentSlot.HEAD, head)
                    markItemAsTemporary(player.server, playerName, head.getId())
                    given++
                }
            }
            if (config.armadura.chest && config.armadura.chest !== '') {
                var chest = Item.of(config.armadura.chest)
                if (chest && !chest.isEmpty()) {
                    player.setItemSlot(EquipmentSlot.CHEST, chest)
                    markItemAsTemporary(player.server, playerName, chest.getId())
                    given++
                }
            }
            if (config.armadura.legs && config.armadura.legs !== '') {
                var legs = Item.of(config.armadura.legs)
                if (legs && !legs.isEmpty()) {
                    player.setItemSlot(EquipmentSlot.LEGS, legs)
                    markItemAsTemporary(player.server, playerName, legs.getId())
                    given++
                }
            }
            if (config.armadura.feet && config.armadura.feet !== '') {
                var feet = Item.of(config.armadura.feet)
                if (feet && !feet.isEmpty()) {
                    player.setItemSlot(EquipmentSlot.FEET, feet)
                    markItemAsTemporary(player.server, playerName, feet.getId())
                    given++
                }
            }
        } catch (e) {
            console.warn('[Essential Items] Failed to equip armor: ' + e)
        }
    }

    if (given > 0) {
        player.tell(Text.of('§6Recebeu ' + given + ' item(ns) essencial(is) temporário(s).'))
        console.info('[Essential Items] Gave ' + given + ' items to ' + playerName)
    }
})

// ============================================
// COMMANDS
// ============================================

ServerEvents.commandRegistry(function (event) {
    var Commands = event.commands
    var StringArgumentType = Java.loadClass('com.mojang.brigadier.arguments.StringArgumentType')
    var EntityArgument = Java.loadClass('net.minecraft.commands.arguments.EntityArgument')

    // /getessencialid - Obtém o código SNBT do item na mão
    event.register(
        Commands.literal('getessencialid')
            .requires(function (src) { return src.hasPermission(2) })
            .executes(function (ctx) {
                var source = ctx.getSource()
                var executor = source.getPlayer()

                if (!executor) return 0

                var heldItem = executor.getMainHandItem()
                if (heldItem.isEmpty()) {
                    executor.tell(Text.of('§cSegure um item na mão principal.'))
                    return 0
                }

                try {
                    var snbt = heldItem.toItemString()
                    executor.tell(Text.of('§aCopie este código SNBT:'))
                    executor.tell(Text.of('§7' + snbt))
                    console.info('[Essential Items] SNBT for ' + executor.getName().getString() + ': ' + snbt)
                } catch (e) {
                    executor.tell(Text.of('§cErro ao obter SNBT: ' + e))
                }

                return 1
            })
    )

    // /essencial list [nick] - Lista itens configurados
    event.register(
        Commands.literal('essencial')
            .then(Commands.literal('list')
                .requires(function (src) { return src.hasPermission(2) })
                .executes(function (ctx) {
                    var source = ctx.getSource()
                    var executor = source.getPlayer()
                    if (!executor) return 0
                    return listEssentials(executor, executor.getName().getString())
                })
                .then(Commands.argument('nick', StringArgumentType.word())
                    .executes(function (ctx) {
                        var source = ctx.getSource()
                        var executor = source.getPlayer()
                        var targetNick = StringArgumentType.getString(ctx, 'nick')
                        return listEssentials(executor, targetNick)
                    })
                )
            )
            .then(Commands.literal('reload')
                .requires(function (src) { return src.hasPermission(2) })
                .executes(function (ctx) {
                    var source = ctx.getSource()
                    var executor = source.getPlayer()
                    if (executor) {
                        executor.tell(Text.of('§e[Essential Items] §fPara alterar itens, edite o arquivo:'))
                        executor.tell(Text.of('§7kubejs/server_scripts/essential_items.js'))
                        executor.tell(Text.of('§7Modifique a variável PLAYER_ESSENTIAL_ITEMS'))
                        executor.tell(Text.of('§cDepois use /reload para aplicar as mudanças'))
                    }
                    return 1
                })
            )
    )

    console.info('[Essential Items] Commands registered')
})

function listEssentials(player, targetNick) {
    if (!player) return 1

    var config = getPlayerConfig(targetNick)

    player.tell(Text.of('§6=== Itens Essenciais de §e' + targetNick + ' §6==='))

    // List items
    if (config.itens && config.itens.length > 0) {
        player.tell(Text.of('§aItens:'))
        for (var i = 0; i < config.itens.length; i++) {
            var snbt = config.itens[i]
            var preview = snbt.length > 50 ? snbt.substring(0, 50) + '...' : snbt
            player.tell(Text.of('  §7' + (i + 1) + '. §f' + preview))
        }
    } else {
        player.tell(Text.of('§7Nenhum item configurado'))
    }

    // List armor
    if (config.armadura) {
        var hasArmor = config.armadura.head || config.armadura.chest || config.armadura.legs || config.armadura.feet
        if (hasArmor) {
            player.tell(Text.of('§aArmadura:'))
            if (config.armadura.head) player.tell(Text.of('  §7Head: §f' + config.armadura.head))
            if (config.armadura.chest) player.tell(Text.of('  §7Chest: §f' + config.armadura.chest))
            if (config.armadura.legs) player.tell(Text.of('  §7Legs: §f' + config.armadura.legs))
            if (config.armadura.feet) player.tell(Text.of('  §7Feet: §f' + config.armadura.feet))
        } else {
            player.tell(Text.of('§7Nenhuma armadura configurada'))
        }
    }

    return 1
}

console.info('[Essential Items] System loaded - Using player names from config')
