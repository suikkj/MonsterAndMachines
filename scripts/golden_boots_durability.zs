// Golden Boots durability modification
// Sets golden boots max damage (durability) to 5000

import crafttweaker.api.item.IItemStack;

<recipetype:minecraft:crafting>.removeByName("minecraft:golden_boots");

// Re-add golden boots recipe that produces boots with higher durability
// We need to use NBT to set max damage

// Create the golden boots with modified durability using custom crafting
<recipetype:minecraft:crafting>.addShaped("custom_golden_boots", 
    <item:minecraft:golden_boots>.withMaxDamage(5000),
    [
        [<item:minecraft:gold_ingot>, <item:minecraft:air>, <item:minecraft:gold_ingot>],
        [<item:minecraft:gold_ingot>, <item:minecraft:air>, <item:minecraft:gold_ingot>]
    ]
);
