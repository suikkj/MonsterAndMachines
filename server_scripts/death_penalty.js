// Priority: 1000
// Death Penalty - removes HALF of a random item stack when player dies
// For tools/weapons with durability, reduces durability by HALF instead
// Works with PlayerRevive and Corpse mods

// Track players who died (to avoid triggering multiple times)
var pendingDeathPenalty = {}

// When player dies, apply penalty
EntityEvents.death(event => {
    var entity = event.entity
    if (!entity.isPlayer()) return

    var player = entity
    var uuid = player.getStringUuid()

    // Prevent duplicate penalties
    if (pendingDeathPenalty[uuid]) return
    pendingDeathPenalty[uuid] = true

    // Schedule cleanup of the flag after 1 second
    player.server.scheduleInTicks(20, () => {
        delete pendingDeathPenalty[uuid]
    })

    var inventory = player.inventory
    var candidates = []

    // Scan main inventory and armor
    var containerSize = inventory.getContainerSize()
    for (var i = 0; i < containerSize; i++) {
        var stack = inventory.getItem(i)
        // Check if item exists and is not Sophisticated Backpacks
        if (!stack.isEmpty()) {
            var modId = stack.getMod()
            // Skip Sophisticated Backpacks/Storage
            if (modId === 'sophisticatedbackpacks' || modId === 'sophisticatedstorage') {
                continue
            }
            // Skip temporary essential items
            var nbt = stack.getNbt()
            if (nbt && nbt.getBoolean('essential_temporary') === true) {
                continue
            }
            candidates.push({ slot: i, item: stack })
        }
    }

    // If there are valid candidates, apply penalty to one at random
    if (candidates.length > 0) {
        var randomIndex = Math.floor(Math.random() * candidates.length)
        var selectedCandidate = candidates[randomIndex]
        var selectedItem = selectedCandidate.item

        // Get item display name for notification
        var lostItemName = selectedItem.getDisplayName()

        // Check if item has durability (tools, weapons, armor)
        if (selectedItem.maxDamage > 0) {
            // DURABILITY ITEM: Reduce durability by HALF
            var currentDamage = selectedItem.damageValue || 0
            var maxDurability = selectedItem.maxDamage
            var currentDurability = maxDurability - currentDamage

            // Calculate half of remaining durability to lose
            var durabilityToLose = Math.max(1, Math.floor(currentDurability / 2))
            var newDamage = currentDamage + durabilityToLose

            if (newDamage >= maxDurability) {
                // Item breaks completely
                inventory.setItem(selectedCandidate.slot, Item.of('minecraft:air'))
                player.tell(Text.of('Item perdido: ').append(lostItemName).append(Text.of(' (quebrou!)')).red())
            } else {
                // Create new item with reduced durability
                var newItem = selectedItem.copy()
                newItem.damageValue = newDamage
                inventory.setItem(selectedCandidate.slot, newItem)

                var durabilityLeft = maxDurability - newDamage
                player.tell(Text.of('Item danificado: ').append(lostItemName)
                    .append(Text.of(` (-${durabilityToLose} durabilidade, restam ${durabilityLeft})`)).yellow())
            }
        } else {
            // STACKABLE ITEM: Remove HALF of the stack
            var currentCount = selectedItem.getCount()
            var halfCount = Math.max(1, Math.floor(currentCount / 2))
            var newCount = currentCount - halfCount

            if (newCount <= 0) {
                // Remove the item entirely
                inventory.setItem(selectedCandidate.slot, Item.of('minecraft:air'))
                player.tell(Text.of('Item perdido: ').append(lostItemName)
                    .append(Text.of(` (todos ${currentCount} removidos)`)).red())
            } else {
                // Reduce the stack
                selectedItem.setCount(newCount)
                player.tell(Text.of('Itens perdidos: ').append(lostItemName)
                    .append(Text.of(` (-${halfCount}, restam ${newCount})`)).yellow())
            }
        }

        player.tell(Text.of('Para conseguir seu item novamente, desbloqueie a quest "O Coletor de Sucata".').gray())
    }
})
