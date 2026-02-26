// Priority: 0
// File: kubejs/server_scripts/sculk_transporting_restriction.js
// Sculk Emitter: only allowed players can CRAFT (others can use/hold)
// Sculk Transmitter: only allowed players can CRAFT or HOLD in inventory

var ALLOWED_PLAYERS = {
    '_Myos_': true,
    'suikkj': true
}

// Emitter: crafting only restriction
var CRAFT_ONLY_RESTRICTED = {
    'sculktransporting:sculk_emitter': true,
    'mem_sculkapocalypse:void_cleaner': true
}

// Transmitter: full restriction (craft + inventory)
var FULL_RESTRICTED = {
    'sculktransporting:sculk_transmitter': true,
    'mem_sculkapocalypse:void_amplifier': true
}

PlayerEvents.inventoryChanged(function (event) {
    var player = event.player
    if (!player) return
    if (player.isCreative()) return

    var item = event.item
    if (!item) return

    var itemId = item.id
    var username = player.username

    // If allowed player, skip all checks
    if (ALLOWED_PLAYERS[username]) return

    // TRANSMITTER: Full block — nobody else can even hold it
    if (FULL_RESTRICTED[itemId]) {
        event.item.count = 0
        player.inventory.markDirty()
        event.server.runCommandSilent('title ' + username + ' actionbar {"text":"Apenas Mnemosyne pode possuir este item!","color":"red","bold":true}')
        event.server.runCommandSilent('playsound minecraft:block.note_block.bass master ' + username + ' ~ ~ ~ 1 0.5')
        return
    }

    // EMITTER: Only block crafting
    if (CRAFT_ONLY_RESTRICTED[itemId]) {
        try {
            var menu = player.openInventory
            if (!menu) return

            var menuType = menu.getClass().getName()
            var isCrafting = menuType.indexOf('CraftingMenu') !== -1 ||
                menuType.indexOf('InventoryMenu') !== -1 ||
                menuType.indexOf('crafting') !== -1

            if (!isCrafting) return
        } catch (e) {
            return
        }

        event.item.count = 0
        player.inventory.markDirty()
        event.server.runCommandSilent('title ' + username + ' actionbar {"text":"Apenas Mnemosyne pode fabricar este item!","color":"red","bold":true}')
        event.server.runCommandSilent('playsound minecraft:block.note_block.bass master ' + username + ' ~ ~ ~ 1 0.5')
    }
})

console.info('[Sculk Transporting] Loaded — emitter: craft-restricted / transmitter: fully restricted')
