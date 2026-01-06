// Block crafting of specific items
// This removes ALL recipes that produce these items (crafting table, mixer, etc.)

ServerEvents.recipes(event => {
    // List of items to block from being crafted
    const blockedItems = [
        'cataclysm:abyssal_sacrifice',
        'lendersdelight:abyssal_knife'
    ];

    // Remove all recipes that output these items
    blockedItems.forEach(item => {
        event.remove({ output: item });
        console.log(`[Blocked Recipes] Removed all recipes for: ${item}`);
    });
});
