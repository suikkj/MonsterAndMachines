// Priority: 0
// File: kubejs/startup_scripts/boots_durability.js
// Increase durability of specific boots to 5000

ItemEvents.modification(event => {
    // Anti-radiation boots - 5000 durability
    event.modify('createnuclear:anti_radiation_boots', item => {
        item.maxDamage = 5000
    })

    // Steampunk boots - 5000 durability
    event.modify('immersive_armors:steampunk_boots', item => {
        item.maxDamage = 5000
    })
})
