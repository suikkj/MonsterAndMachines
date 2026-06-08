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

// Gera hashmap de IDs de armaduras banidas (PERFORMANCE: O(1) lookup ao invés de indexOf)
var BANNED_ARMOR_MAP = {}
for (var i = 0; i < BANNED_ARMOR_SETS.length; i++) {
    for (var j = 0; j < ARMOR_SLOTS.length; j++) {
        BANNED_ARMOR_MAP['crystal_chronicles:' + BANNED_ARMOR_SETS[i] + '_' + ARMOR_SLOTS[j]] = true
    }
}

console.info('[Crystal Chronicles] Armaduras banidas registradas: ' + Object.keys(BANNED_ARMOR_MAP).length + ' itens')

// Slot names para comando: head, chest, legs, feet
var SLOT_NAMES = ['feet', 'legs', 'chest', 'head']

// Verifica com 5% de chance cada tick (~20 ticks em média)
PlayerEvents.tick(function (event) {
    var player = event.player

    // Ignora jogadores em modo criativo ou spectator
    if (player.isCreative() || player.isSpectator()) return

    // Verifica a cada segundo (20 ticks) - determinístico
    if (player.age % 20 !== 0) return

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

                // Verifica se está na lista de banidos (PERFORMANCE: O(1) hashmap lookup)
                if (BANNED_ARMOR_MAP[itemId]) {
                    console.info('[Crystal Chronicles] Detectado ' + itemId + ' em ' + player.username)

                    // Remove a armadura e dá de volta (via API direta)
                    var slotName = SLOT_NAMES[slot]
                    player.give(armorItem.copy())
                    armorSlots.set(slot, Item.of('minecraft:air'))

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
