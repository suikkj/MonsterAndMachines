// Priority: 0
// Script para adicionar itens customizados nos loots de Ancient Cities
// Requer: LootJS, Iron's Spells and Spellbooks

LootJS.modifiers(function (event) {
    console.info('[Loot Customization] Adicionando itens nas Ancient Cities...');

    // Modifica todos os baús de Ancient City para incluir o fragmento de conhecimento antigo com 5% de chance
    event.addTableModifier(/.*ancient_city.*/)
        .randomChance(0.05)
        .addLoot('irons_spellbooks:ancient_knowledge_fragment');

    console.info('[Loot Customization] Modificações nas Ancient Cities carregadas!');
});
