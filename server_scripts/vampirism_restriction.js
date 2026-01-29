// Priority: 0
// File: kubejs/server_scripts/vampirism_restriction.js
// Restricts becoming a vampire to admin command only
// Players cannot become vampires through normal gameplay

// Block vampire-related items that allow transformation
ItemEvents.rightClicked(event => {
    let item = event.item
    let itemId = item.id
    let player = event.player

    // Block injection syringe items that could be used to turn into vampire
    if (itemId.startsWith('vampirism:')) {
        // Block vampire blood bottles and syringes
        if (itemId.includes('blood') && (itemId.includes('bottle') || itemId.includes('syringe'))) {
            // Allow drinking blood if already a vampire (check for vampire faction)
            // But block if it's an injection syringe
            if (itemId.includes('injection') || itemId.includes('syringe')) {
                event.cancel()
                player.tell('§c[Server] Você não pode usar este item. Vampirismo é restrito.')
                return
            }
        }

        // Block the altar of inspiration (used to become vampire)
        if (itemId.includes('altar') || itemId.includes('inspiration')) {
            event.cancel()
            player.tell('§c[Server] Você não pode usar este item. Vampirismo é restrito.')
            return
        }
    }
})

// Block placing vampire transformation blocks
BlockEvents.placed(event => {
    let block = event.block
    let blockId = block.id
    let player = event.player

    if (blockId.startsWith('vampirism:')) {
        // Block altar of inspiration and related transformation blocks
        if (blockId.includes('altar_inspiration') || blockId.includes('altar_infusion')) {
            event.cancel()
            if (player) {
                player.tell('§c[Server] Este bloco está desabilitado. Vampirismo é controlado por admins.')
            }
        }
    }
})

// Block right-clicking vampire transformation blocks
BlockEvents.rightClicked(event => {
    let block = event.block
    let blockId = block.id
    let player = event.player

    if (blockId.startsWith('vampirism:')) {
        // Block altar of inspiration interaction
        if (blockId.includes('altar_inspiration') || blockId.includes('altar_infusion')) {
            event.cancel()
            player.tell('§c[Server] Este altar está desabilitado. Vampirismo é controlado por admins.')
        }
    }
})

console.info('[Vampirism Restriction] Vampire transformation restricted to admin commands only')
