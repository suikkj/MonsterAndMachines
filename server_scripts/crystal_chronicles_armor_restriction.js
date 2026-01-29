// Restrição de armaduras do Crystal Chronicles
// Remove automaticamente armaduras proibidas quando equipadas

var BANNED_ARMOR_SETS = [
    'paladin_armor',
    'tank_armor',
    'mage_armor',
    'rogue_armor',
    'pyromancer_armor',
    'toxic_armor',
    'electromancer_armor',
    'evoker_armor'
]

var ARMOR_SLOTS = ['helmet', 'chestplate', 'leggings', 'boots']

// Gera lista completa de IDs de armaduras banidas
var BANNED_ARMOR_IDS = []
for (var i = 0; i < BANNED_ARMOR_SETS.length; i++) {
    for (var j = 0; j < ARMOR_SLOTS.length; j++) {
        BANNED_ARMOR_IDS.push('crystal_chronicles:' + BANNED_ARMOR_SETS[i] + '_' + ARMOR_SLOTS[j])
    }
}

console.info('[Crystal Chronicles] Armaduras banidas: ' + BANNED_ARMOR_IDS.join(', '))

// Slot names para comando: head, chest, legs, feet
var SLOT_NAMES = ['feet', 'legs', 'chest', 'head']

// Verifica com 5% de chance cada tick (~20 ticks em média)
PlayerEvents.tick(function (event) {
    // 5% chance cada tick
    if (Math.random() > 0.05) return

    var player = event.player

    // Ignora jogadores em modo criativo ou spectator
    if (player.isCreative() || player.isSpectator()) return

    // Acessa os slots de armadura via inventory.armor
    var armorSlots = player.inventory.armor
    if (!armorSlots) {
        console.warn('[Crystal Chronicles] Não foi possível acessar armor slots')
        return
    }

    // Slots: 0=boots, 1=leggings, 2=chestplate, 3=helmet
    for (var slot = 0; slot < 4; slot++) {
        try {
            var armorItem = armorSlots.get(slot)

            if (armorItem && !armorItem.isEmpty()) {
                var itemId = armorItem.id

                // Verifica se está na lista de banidos
                var isBanned = false
                for (var b = 0; b < BANNED_ARMOR_IDS.length; b++) {
                    if (itemId === BANNED_ARMOR_IDS[b]) {
                        isBanned = true
                        break
                    }
                }

                if (isBanned) {
                    console.info('[Crystal Chronicles] Detectado ' + itemId + ' em ' + player.username)

                    // Remove a armadura usando comando (mais confiável)
                    var slotName = SLOT_NAMES[slot]
                    event.server.runCommandSilent('item replace entity ' + player.username + ' armor.' + slotName + ' with minecraft:air')

                    // Dá o item de volta para o jogador
                    event.server.runCommandSilent('give ' + player.username + ' ' + itemId)

                    // Notifica o jogador
                    player.tell('§c[Sistema] §7Você não pode usar §e' + itemId.replace('crystal_chronicles:', '') + '§7!')
                }
            }
        } catch (e) {
            console.error('[Crystal Chronicles] Erro no slot ' + slot + ': ' + e)
        }
    }
})

console.info('[Crystal Chronicles] Script de restrição de armaduras carregado')
