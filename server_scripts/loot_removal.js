// Priority: 0
// Removes all loot from Artifacts Mimic and blocks relics/artifacts items

LootJS.modifiers(function (event) {
    // Remove ALL loot from Artifacts Mimic completely
    event.addEntityModifier('artifacts:mimic')
        .removeLoot(/.*/)

    // Target mimic loot tables directly
    event.addTableModifier(/.*mimic.*/)
        .removeLoot(/.*/)

    // Block specific mod items from entity loot
    event.addTableModifier(LootType.ENTITY)
        .removeLoot(/^relics:.*/)
        .removeLoot(/^artifacts:.*/)
        .removeLoot(/^relics_artifacts_compat:.*/)
        .removeLoot(/^rarcompat:.*/)
        .removeLoot(/^more_relics:.*/)
        .removeLoot(/^morerelics:.*/)

    console.info('[Loot Removal] Configured: mimic/relics loot removal')
})

