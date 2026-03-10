// Priority: 100
// Remove all relics, artifacts, morerelics, and reliquified items from loot tables
// Uses LootJS to modify chest loot and mob drops

// ============ LOOT TABLE MODIFIER (chests, fishing, generic mob drops) ============
LootJS.modifiers(event => {
    // Remove from all loot tables using regex patterns for each mod
    event.addTableModifier(/.*/)
        .removeLoot(/^relics:.*/)
        .removeLoot(/^artifacts:.*/)
        .removeLoot(/^morerelics:.*/)
        .removeLoot(/^reliquified_ars_nouveau:.*/)
        .removeLoot(/^reliquified_lenders_cataclysm:.*/)
        .removeLoot(/^reliquified_twilight_forest:.*/)

    // Mimic entity-specific modifier (artifacts:mimic drops a random artifact hardcoded)
    event.addEntityModifier('artifacts:mimic')
        .removeLoot(/^artifacts:.*/)
        .removeLoot(/^relics:.*/)
        .removeLoot(/^morerelics:.*/)

    console.info('[Relics Removal] Removed relics/artifacts items from all loot tables')
})

// ============ ENTITY DEATH — Intercept hardcoded mimic drops ============
// The artifacts:mimic drops items via Java code (not loot table), so LootJS alone
// may not catch it. This event removes banned items from all drops on death.
EntityEvents.death('artifacts:mimic', event => {
    try {
        var drops = event.drops
        if (!drops) return
        var toRemove = []
        for (var i = 0; i < drops.size(); i++) {
            var drop = drops.get(i)
            if (!drop) continue
            var id = drop.id || ''
            if (
                id.startsWith('artifacts:') ||
                id.startsWith('relics:') ||
                id.startsWith('morerelics:') ||
                id.startsWith('reliquified_')
            ) {
                toRemove.push(i)
            }
        }
        // Remove in reverse order to preserve indices
        for (var j = toRemove.length - 1; j >= 0; j--) {
            drops.remove(toRemove[j])
        }
    } catch (e) {
        console.error('[Relics Removal] Error filtering mimic drops: ' + e)
    }
})

console.info('[Relics Removal] Mimic drop interceptor active')
