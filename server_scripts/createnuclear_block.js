// Priority: 0
// Block Create:Nuclear items except allowed ones
// Allowed: anti-radiation armor, cloth (all colors), graphite_rod, reinforced_glass

// Lista de itens PERMITIDOS do createnuclear
var ALLOWED_CREATENUCLEAR = [
    // Anti-radiation armor (todas as cores)
    'createnuclear:yellow_anti_radiation_helmet',
    'createnuclear:yellow_anti_radiation_chestplate',
    'createnuclear:yellow_anti_radiation_leggings',
    'createnuclear:anti_radiation_boots',
    'createnuclear:orange_anti_radiation_helmet',
    'createnuclear:orange_anti_radiation_chestplate',
    'createnuclear:orange_anti_radiation_leggings',
    'createnuclear:white_anti_radiation_helmet',
    'createnuclear:white_anti_radiation_chestplate',
    'createnuclear:white_anti_radiation_leggings',

    // Cloth (todas as cores)
    'createnuclear:white_cloth',
    'createnuclear:orange_cloth',
    'createnuclear:yellow_cloth',
    'createnuclear:magenta_cloth',
    'createnuclear:light_blue_cloth',
    'createnuclear:lime_cloth',
    'createnuclear:pink_cloth',
    'createnuclear:gray_cloth',
    'createnuclear:light_gray_cloth',
    'createnuclear:cyan_cloth',
    'createnuclear:purple_cloth',
    'createnuclear:blue_cloth',
    'createnuclear:brown_cloth',
    'createnuclear:green_cloth',
    'createnuclear:red_cloth',
    'createnuclear:black_cloth',

    // Outros itens permitidos
    'createnuclear:graphite_rod',
    'createnuclear:reinforced_glass'
]

// Bloquear crafting de todos os itens createnuclear que NÃO estão na lista
ItemEvents.crafted(function (event) {
    var player = event.player
    if (!player) return

    var item = event.item
    if (!item || item.isEmpty()) return

    var itemId = item.getId()

    // Verificar se é um item do createnuclear
    if (itemId.startsWith('createnuclear:')) {
        // Se NÃO está na lista de permitidos, bloquear
        var allowed = false
        for (var i = 0; i < ALLOWED_CREATENUCLEAR.length; i++) {
            if (itemId === ALLOWED_CREATENUCLEAR[i]) {
                allowed = true
                break
            }
        }

        if (!allowed) {
            event.item.setCount(0)
            player.tell(Text.of('§c[Bloqueado] §fEste item do Create:Nuclear não pode ser craftado!'))
        }
    }
})

console.info('[Create Nuclear Block] Loaded - Blocking non-allowed createnuclear items')
