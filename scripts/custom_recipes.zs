// CraftTweaker Script - Custom Recipes

import crafttweaker.api.recipe.IRecipeManager;
import crafttweaker.api.item.IItemStack;

// Remove a receita original da Alteration Table
craftingTable.removeByName("ars_nouveau:alteration_table");

// Adiciona a nova receita com Brass Ingots nos cantos
// Layout da receita:
// B A B    (B = Brass Ingot, A = Source Gem)
// A C A    (C = Arcane Core)
// B A B
craftingTable.addShaped("custom_alteration_table", <item:ars_nouveau:alteration_table>, [
    [<item:create:brass_ingot>, <item:ars_nouveau:magebloom_fiber>, <item:create:brass_ingot>],
    [<item:ars_nouveau:magebloom_fiber>, <item:ars_nouveau:scribes_table>, <item:ars_nouveau:magebloom_fiber>],
    [<item:create:brass_ingot>, <item:ars_nouveau:magebloom_fiber>, <item:create:brass_ingot>]
]);

// ============================================
// Railgun do Immersive Engineering modificada
// Troca o HV Capacitor do centro pelo Lightning Upgrade Orb
// ============================================

// Remove a receita original da Railgun
craftingTable.removeByName("immersiveengineering:crafting/railgun");

// Adiciona a nova receita com Lightning Upgrade Orb no centro
// Layout da receita:
// N C W    (N = Nada, C = HV Capacitor, W = Wooden Grip)
// S L E    (S = Steel Ingot, L = Lightning Upgrade Orb, E = Adv Electronic Component)
// M S N    (M = MV Coil)
craftingTable.addShaped("custom_railgun", <item:immersiveengineering:railgun>, [
    [<item:minecraft:air>, <item:immersiveengineering:capacitor_hv>, <item:immersiveengineering:wooden_grip>],
    [<item:immersiveengineering:ingot_steel>, <item:irons_spellbooks:energized_core>, <item:immersiveengineering:component_electronic_adv>],
    [<item:immersiveengineering:coil_mv>, <item:immersiveengineering:ingot_steel>, <item:minecraft:air>]
]);

// ============================================
// Arcane Anvil do Iron's Spellbooks modificada
// Troca Polished Deepslate por Steel Storage Block
// ============================================

// Remove a receita original da Arcane Anvil
craftingTable.removeByName("irons_spellbooks:arcane_anvil");

// Adiciona a nova receita com Steel Storage Block
// Layout da receita:
// A A A    (A = Amethyst Cluster)
// S D S    (S = Steel Storage Block, D = Diamond)
// S S S
craftingTable.addShaped("custom_arcane_anvil", <item:irons_spellbooks:arcane_anvil>, [
    [<item:minecraft:amethyst_cluster>, <item:minecraft:amethyst_cluster>, <item:minecraft:amethyst_cluster>],
    [<item:minecraft:air>, <item:minecraft:diamond>, <item:minecraft:air>],
    [<item:immersiveengineering:storage_steel>, <item:minecraft:anvil>, <item:immersiveengineering:storage_steel>]
]);

// ============================================
// Scroll Forge do Iron's Spellbooks modificada
// Troca Polished Deepslate por Steel Storage Block
// ============================================

// Remove a receita original do Scroll Forge
craftingTable.removeByName("irons_spellbooks:scroll_forge");

// Adiciona a nova receita com Steel Storage Block
// Layout da receita:
// S S S    (S = Steel Storage Block)
// N C N    (N = Nada, C = Crying Obsidian)
// C C C
craftingTable.addShaped("custom_scroll_forge", <item:irons_spellbooks:scroll_forge>, [
    [<item:immersiveengineering:ingot_steel>, <item:immersiveengineering:ingot_steel>, <item:immersiveengineering:ingot_steel>],
    [<item:minecraft:air>, <item:minecraft:crying_obsidian>, <item:minecraft:air>],
    [<item:minecraft:crying_obsidian>, <item:minecraft:crying_obsidian>, <item:minecraft:crying_obsidian>]
]);

// ============================================
// Enchanting Table modificada
// Troca Book por Chronicle e Diamond por Mithril Ingot
// ============================================

// Remove a receita original da Enchanting Table
craftingTable.removeByName("minecraft:enchanting_table");

// Adiciona a nova receita
// Layout da receita:
// N C N    (N = Nada, C = Chronicle)
// M O M    (M = Mithril Ingot, O = Obsidian)
// O O O
craftingTable.addShaped("custom_enchanting_table", <item:minecraft:enchanting_table>, [
    [<item:minecraft:air>, <item:irons_spellbooks:chronicle>, <item:minecraft:air>],
    [<item:irons_spellbooks:mithril_ingot>, <item:minecraft:obsidian>, <item:irons_spellbooks:mithril_ingot>],
    [<item:minecraft:obsidian>, <item:minecraft:obsidian>, <item:minecraft:obsidian>]
]);

// ============================================
// Iron Spell Book modificado
// Troca Leather por Magebloom Fiber e Paper por Source Gem
// ============================================

// Remove a receita original do Iron Spell Book
craftingTable.removeByName("irons_spellbooks:iron_spell_book");

// Adiciona a nova receita
// Layout da receita:
// F S F    (F = Magebloom Fiber, S = Source Gem)
// F S F
// F S F
craftingTable.addShaped("custom_iron_spell_book", <item:irons_spellbooks:iron_spell_book>, [
    [<item:minecraft:chain>, <item:ars_nouveau:magebloom_fiber>, <item:ars_nouveau:magebloom_fiber>],
    [<item:minecraft:chain>, <item:ars_nouveau:source_gem>, <item:minecraft:paper>],
    [<item:minecraft:chain>, <item:ars_nouveau:magebloom_fiber>, <item:ars_nouveau:magebloom_fiber>]
]);

// ============================================
// Ancient Iron Ingot - Block Factory's Bosses
// Iron Bar no centro com 8 Diamantes em volta
// ============================================

// Adiciona a receita do Ancient Iron Ingot
// Layout da receita:
// D D D    (D = Diamond)
// D I D    (I = Iron Bars)
// D D D
craftingTable.addShaped("custom_ancient_iron_ingot", <item:block_factorys_bosses:ancient_iron_ingot>, [
    [<item:minecraft:diamond>, <item:minecraft:diamond>, <item:minecraft:diamond>],
    [<item:minecraft:diamond>, <item:minecraft:iron_ingot>, <item:minecraft:diamond>],
    [<item:minecraft:diamond>, <item:minecraft:diamond>, <item:minecraft:diamond>]
]);

// ============================================
// Remoção de receitas - Abyssal Sacrifice e Abyssal Knife
// ============================================

// Remove a receita do Abyssal Sacrifice
craftingTable.removeByName("block_factorys_bosses:abyssal_sacrifice");

// Remove a receita do Abyssal Knife
craftingTable.removeByName("block_factorys_bosses:abyssal_knife");

// ============================================
// Ironclad Bow - Too Many Bows modificado
// Troca Iron Ingots por Ancient Iron Ingot
// ============================================

// Remove a receita original do Ironclad Bow
craftingTable.removeByName("too_many_bows:ironclad_bow");

// Adiciona a nova receita com Ancient Iron Ingot
// Layout da receita (baseado na imagem):
// A S A    (A = Ancient Iron Ingot, S = Stick)
// S B A    (B = Bow)
// A S A
craftingTable.addShaped("custom_ironclad_bow", <item:too_many_bows:ironclad_bow>, [
    [<item:block_factorys_bosses:ancient_iron_ingot>, <item:block_factorys_bosses:ancient_iron_ingot>, <item:block_factorys_bosses:ancient_iron_ingot>],
    [<item:block_factorys_bosses:ancient_iron_ingot>, <item:minecraft:bow>, <item:block_factorys_bosses:ancient_iron_ingot>],
    [<item:block_factorys_bosses:ancient_iron_ingot>, <item:block_factorys_bosses:ancient_iron_ingot>, <item:block_factorys_bosses:ancient_iron_ingot>]
]);
