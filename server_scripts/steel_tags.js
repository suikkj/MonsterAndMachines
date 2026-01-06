// KubeJS Script - Separação de Steel Ingots por Mod
// Remove os steels "fáceis" da tag para que apenas o steel do Immersive Engineering funcione
// em receitas que usam a tag c:ingots/steel

ServerEvents.tags('item', event => {
    // Remove apenas os steels fáceis da tag
    // O steel do Immersive Engineering PERMANECE na tag
    event.remove('c:ingots/steel', 'createnuclear:steel_ingot');
    event.remove('c:ingots/steel', 'hazennstuff:steel_ingot');
});
