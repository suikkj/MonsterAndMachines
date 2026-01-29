// Priority: 100
// Trial Key Removal - Prevents MobControl crash by removing trial keys completely

// Remove trial keys from any loot table (chests, mobs, etc)
LootJS.modifiers(function (event) {
    // Remove trial keys from ALL loot tables using correct API
    event.addTableModifier(/.*/)
        .removeLoot('minecraft:trial_key')
        .removeLoot('minecraft:ominous_trial_key')
})

// Remove trial keys when a player picks them up
PlayerEvents.inventoryChanged(function (event) {
    let player = event.player
    let item = event.item

    if (item.id === 'minecraft:trial_key' || item.id === 'minecraft:ominous_trial_key') {
        // Remove the keys from player inventory
        player.inventory.clear('minecraft:trial_key')
        player.inventory.clear('minecraft:ominous_trial_key')
        player.tell('§c[Servidor] Trial Keys foram removidas - este item é proibido.')
    }
})

// Periodic check - remove trial keys with small chance each tick
ServerEvents.tick(function (event) {
    let server = event.server

    // ~0.17% chance each tick (equivalent to ~600 ticks average)
    if (Math.random() > 0.00167) return

    server.players.forEach(function (player) {
        let hadKeys = false

        // Check main inventory
        for (let i = 0; i < player.inventory.size; i++) {
            let stack = player.inventory.getStackInSlot(i)
            if (stack.id === 'minecraft:trial_key' || stack.id === 'minecraft:ominous_trial_key') {
                player.inventory.setStackInSlot(i, Item.empty)
                hadKeys = true
            }
        }

        if (hadKeys) {
            player.tell('§c[Servidor] Trial Keys foram confiscadas do seu inventário.')
        }
    })
})

console.info('[Trial Key Removal] Trial keys will be removed from loot and inventories')
