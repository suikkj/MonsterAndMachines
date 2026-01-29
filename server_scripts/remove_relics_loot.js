// Priority: 100
// Remove all relics, artifacts, morerelics, and reliquified items from loot tables
// Uses LootJS to modify chest loot and mob drops

// Remove items from these mods from ALL loot tables (chests, mobs, fishing, etc.)
LootJS.modifiers(event => {
    // Remove from all loot tables using regex patterns for each mod
    event.addTableModifier(/.*/)
        .removeLoot(/^relics:.*/)
        .removeLoot(/^artifacts:.*/)
        .removeLoot(/^morerelics:.*/)
        .removeLoot(/^reliquified_ars_nouveau:.*/)
        .removeLoot(/^reliquified_lenders_cataclysm:.*/)
        .removeLoot(/^reliquified_twilight_forest:.*/)

    console.info('[Relics Removal] Removed relics/artifacts items from all loot tables')
})
