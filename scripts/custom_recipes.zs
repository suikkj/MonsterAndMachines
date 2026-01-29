// CraftTweaker Script - Custom Recipes

import crafttweaker.api.recipe.IRecipeManager;
import crafttweaker.api.item.IItemStack;

// ============================================
// Create:Nuclear - Receitas originais mantidas
// Bloqueio de itens específicos é feito via KubeJS
// ============================================

// ============================================
// Create: Deep Dark - Remove ALL recipes
// ============================================
recipes.removeByModid("create_deep_dark");

// ============================================
// Arcane Essence - Iron's Spellbooks
// 3 Lapis + 3 Source Gem = 2 Arcane Essence
// ============================================
craftingTable.addShaped("custom_arcane_essence", <item:irons_spellbooks:arcane_essence> * 2, [
    [<item:minecraft:air>, <item:minecraft:air>, <item:minecraft:air>],
    [<item:minecraft:lapis_lazuli>, <item:minecraft:lapis_lazuli>, <item:minecraft:lapis_lazuli>],
    [<item:ars_nouveau:source_gem>, <item:ars_nouveau:source_gem>, <item:ars_nouveau:source_gem>]
]);
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
    [<item:minecraft:air>, <item:irons_spellbooks:mithril_ingot>, <item:minecraft:air>],
    [<item:minecraft:iron_block>, <item:minecraft:anvil>, <item:minecraft:iron_block>]
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
    [<item:block_factorys_bosses:ancient_iron_ingot>, <item:block_factorys_bosses:ancient_iron_ingot>, <item:block_factorys_bosses:ancient_iron_ingot>],
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

// Remove a receita original do Ancient Iron Ingot
craftingTable.removeByName("block_factorys_bosses:ancient_iron_ingot_recipe");

// Adiciona a receita customizada do Ancient Iron Ingot
// Layout da receita:
// D D D    (D = Diamond)
// D I D    (I = Iron Ingot)
// D D D
craftingTable.addShaped("custom_ancient_iron_ingot", <item:block_factorys_bosses:ancient_iron_ingot>, [
    [<item:minecraft:diamond>, <item:minecraft:diamond>, <item:minecraft:diamond>],
    [<item:minecraft:diamond>, <item:minecraft:iron_ingot>, <item:minecraft:diamond>],
    [<item:minecraft:diamond>, <item:minecraft:diamond>, <item:minecraft:diamond>]
]);

// ============================================
// Remoção de receitas - Abyssal Sacrifice e Abyssal Knife
// DESATIVADO: Esses itens não existem no modpack atual
// ============================================

// craftingTable.remove(<item:block_factorys_bosses:abyssal_sacrifice>);
// craftingTable.remove(<item:block_factorys_bosses:abyssal_knife>);

// ============================================
// Ironclad Bow - Too Many Bows modificado
// Troca Iron Ingots por Ancient Iron Ingot
// ============================================

// Remove TODAS as receitas que produzem Ironclad Bow (por output)
craftingTable.remove(<item:too_many_bows:ironclad_bow>);

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

// ============================================
// Dark Rod -> Blaze Rod (Furnace Smelting)
// Born in Chaos dark_rod pode ser derretido em blaze_rod
// ============================================

furnace.addRecipe("dark_rod_to_blaze_rod", <item:minecraft:blaze_rod>, <item:born_in_chaos_v1:dark_rod>, 1.0, 200);
blastFurnace.addRecipe("dark_rod_to_blaze_rod_blast", <item:minecraft:blaze_rod>, <item:born_in_chaos_v1:dark_rod>, 1.0, 100);

// ============================================
// Gold Spell Book - Iron's Spellbooks modificado
// Gold Ingot + Dragon Bone + Arcane Essence
// ============================================

// Remove a receita original do Gold Spell Book
craftingTable.removeByName("irons_spellbooks:gold_spell_book");

// Adiciona a nova receita
// Layout da receita:
// G B A    (G = Gold Ingot, B = Dragon Bone, A = Arcane Essence)
// G B A
// G B A
craftingTable.addShaped("custom_gold_spell_book", <item:irons_spellbooks:gold_spell_book>, [
    [<item:minecraft:gold_ingot>, <item:irons_spellbooks:arcane_essence>, <item:irons_spellbooks:arcane_essence>],
    [<item:minecraft:gold_ingot>, <item:block_factorys_bosses:dragon_bone>, <item:irons_spellbooks:arcane_essence>],
    [<item:minecraft:gold_ingot>, <item:irons_spellbooks:arcane_essence>, <item:irons_spellbooks:arcane_essence>]
]);

// ============================================
// Bloqueio de Alloy Brick e Alloy Kiln Brass
// Removido para balanceamento
// ============================================

// Remove todas as receitas de crafting do Alloy Brick
craftingTable.remove(<item:immersiveengineering:alloybrick>);

// Remove receita do Alloy Kiln que faz Brass Ingot
// Tentando múltiplos nomes de receita possíveis
<recipetype:immersiveengineering:alloy>.removeByName("create:alloying/brass");
<recipetype:immersiveengineering:alloy>.removeByName("create:brass_ingot");
<recipetype:immersiveengineering:alloy>.removeByName("immersiveengineering:alloying/brass");

// Remove por output - garante que qualquer receita que produza brass seja removida
<recipetype:immersiveengineering:alloy>.remove(<item:create:brass_ingot>);

// ============================================
// Ruined Book - Iron's Spellbooks
// Crafting customizado com itens de boss
// ============================================

// Layout da receita:
// S D S    (S = Sculk, D = Dragon Bone)
// A C E    (A = Abyssal Egg, C = Chronicle, E = Essence of the Storm)
// S D S
craftingTable.addShaped("custom_ruined_book", <item:irons_spellbooks:ruined_book>, [
    [<item:minecraft:sculk>, <item:block_factorys_bosses:dragon_bone>, <item:minecraft:sculk>],
    [<item:cataclysm:abyssal_egg>, <item:irons_spellbooks:chronicle>, <item:cataclysm:essence_of_the_storm>],
    [<item:minecraft:sculk>, <item:block_factorys_bosses:dragon_bone>, <item:minecraft:sculk>]
]);

// ============================================
// Diamond Spell Book - Iron's Spellbooks
// D A A    (D = Diamond, A = Magic Cloth)
// C E C    (C = Cursium Ingot, E = Enchanted Book)
// D A A
// ============================================
craftingTable.remove(<item:irons_spellbooks:diamond_spell_book>);
craftingTable.addShaped("custom_diamond_spell_book", <item:irons_spellbooks:diamond_spell_book>, [
    [<item:minecraft:diamond>, <item:irons_spellbooks:magic_cloth>, <item:irons_spellbooks:magic_cloth>],
    [<item:cataclysm:cursium_ingot>, <item:minecraft:enchanted_book>, <item:cataclysm:cursium_ingot>],
    [<item:minecraft:diamond>, <item:irons_spellbooks:magic_cloth>, <item:irons_spellbooks:magic_cloth>]
]);

// ============================================
// Graphene Coated Iron Ingot - Cyberspace
// Troca Iron Ingot por Steel Ingot
// ============================================

// Remove a receita original do Graphene Coated Iron Ingot
craftingTable.remove(<item:cyberspace:graphene_coated_iron_ingot>);

// Adiciona a nova receita com Steel Ingot
// Layout da receita:
// N G N    (N = Nada, G = Graphene)
// G S G    (S = Steel Ingot)
// N G N
craftingTable.addShaped("custom_graphene_coated_iron_ingot", <item:cyberspace:graphene_coated_iron_ingot>, [
    [<item:minecraft:air>, <item:cyberspace:graphene>, <item:minecraft:air>],
    [<item:cyberspace:graphene>, <item:immersiveengineering:ingot_steel>, <item:cyberspace:graphene>],
    [<item:minecraft:air>, <item:cyberspace:graphene>, <item:minecraft:air>]
]);

// ============================================
// Divine Pearl - Iron's Spellbooks
// Troca Amethyst Shard por Arcane Essence
// ============================================

// Remove a receita original do Divine Pearl
craftingTable.removeByName("irons_spellbooks:divine_pearl");

// Adiciona a nova receita
// Layout: Gold Ingot + Arcane Essence = Divine Pearl
craftingTable.addShapeless("custom_divine_pearl", <item:irons_spellbooks:divine_pearl>, [
    <item:minecraft:gold_ingot>,
    <item:irons_spellbooks:arcane_essence>
]);

// ============================================
// Lightning Bottle - Iron's Spellbooks
// Crafting customizado com Arcane Ingot, Glass e Mithril Scrap
// ============================================

// Layout da receita:
// N A N    (N = Nada, A = Arcane Ingot)
// G M G    (G = Glass, M = Mithril Scrap)
// N G N
craftingTable.addShaped("custom_lightning_bottle", <item:irons_spellbooks:lightning_bottle> * 4, [
    [<item:minecraft:air>, <item:irons_spellbooks:arcane_ingot>, <item:minecraft:air>],
    [<item:minecraft:glass>, <item:irons_spellbooks:mithril_scrap>, <item:minecraft:glass>],
    [<item:minecraft:air>, <item:minecraft:glass>, <item:minecraft:air>]
]);

// ============================================
// Soundproof Glass - Deeper and Darker
// O R O    (O = Overcharged Diamond, R = Reactor Glass)
// R A R    (A = Arcane Ingot)
// O R O
// ============================================

// Remove a receita original do Soundproof Glass
craftingTable.remove(<item:deeperdarker:soundproof_glass>);

// Adiciona a nova receita
craftingTable.addShaped("custom_soundproof_glass", <item:deeperdarker:soundproof_glass> * 8, [
    [<item:create_new_age:overcharged_diamond>, <item:create_new_age:reactor_glass>, <item:create_new_age:overcharged_diamond>],
    [<item:create_new_age:reactor_glass>, <item:irons_spellbooks:arcane_ingot>, <item:create_new_age:reactor_glass>],
    [<item:create_new_age:overcharged_diamond>, <item:create_new_age:reactor_glass>, <item:create_new_age:overcharged_diamond>]
]);
