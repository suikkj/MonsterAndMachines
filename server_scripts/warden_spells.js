// Priority: 0
// File: kubejs/server_scripts/warden_spells.js
// Adiciona spellcasting ao Warden usando EntityJS + KubeJS Iron's Spells
// Requer: entityjs, irons_spellbooks, irons_spells_js (KubeJS Iron's Spells)
//
// API: EntityJSEvents.addGoalSelectors + WizardAttackGoal
// Referência: https://github.com/liopyu/EntityJS/wiki/Addon-Compatibilities
//
// Todos os spell IDs verificados no en_us.json do irons_spellbooks-1.21.1-3.15.4.jar

var WizardAttackGoal = Java.loadClass('io.redspace.ironsspellbooks.entity.mobs.goals.WizardAttackGoal')

// ============ SPELLS DO WARDEN ============
//
// ATAQUE — magias ofensivas (usadas ao perseguir o alvo)
//   eldritch_blast  : raio de energia eldritch devastador
//   void_tentacles  : tentáculos do vazio que aprisionam o alvo
//   sculk_tentacles : tentáculos de sculk (temático!)
//   wither_skull    : caveira de wither projetada
//   sonic_boom      : versão mágica do sonic boom do próprio Warden
//   fang_strike     : presas de magia corpo a corpo
//   devour          : drena vida do alvo
//
// DEFESA — usadas quando o Warden está em perigo
//   abyssal_shroud  : manto eldritch que absorve dano
//   root            : imobiliza o jogador no chão
//   slow            : lentidão máxima, jogador não foge
//
// MOVIMENTO — reposicionamento tático
//   blood_step      : teletransporte de sangue (perseguição implacável)
//
// SUPORTE — Warden é solitário, sem suporte

var loadedSpells = [];
var skippedSpells = [];

function safeSpellOf(spellId, spellName) {
    try {
        let spell = Spell.of(spellId);
        if (spell == null) {
            skippedSpells.push(`${spellName} (${spellId})`);
            console.warn(`[Warden Spells] Spell nulo (não registrado no servidor): ${spellId}`);
            return null;
        }
        loadedSpells.push(spellName);
        return spell;
    } catch (e) {
        skippedSpells.push(`${spellName} (${spellId})`);
        console.warn(`[Warden Spells] Erro ao carregar spell: ${spellName} (${spellId}). Erro: ${e.message}`);
        return null;
    }
}

var ATTACK_SPELL_DEFINITIONS = [
    { id: 'irons_spellbooks:eldritch_blast', name: 'Eldritch Blast' },
    { id: 'irons_spellbooks:void_tentacles', name: 'Void Tentacles' },
    { id: 'irons_spellbooks:sculk_tentacles', name: 'Sculk Tentacles' },
    { id: 'irons_spellbooks:wither_skull', name: 'Wither Skull' },
    { id: 'irons_spellbooks:sonic_boom', name: 'Sonic Boom' },
    { id: 'irons_spellbooks:fang_strike', name: 'Fang Strike' },
    { id: 'irons_spellbooks:devour', name: 'Devour' },
];

var DEFENSE_SPELL_DEFINITIONS = [
    { id: 'irons_spellbooks:abyssal_shroud', name: 'Abyssal Shroud' },
    { id: 'irons_spellbooks:root', name: 'Root' },
    { id: 'irons_spellbooks:slow', name: 'Slow' },
];

var MOVEMENT_SPELL_DEFINITIONS = [
    { id: 'irons_spellbooks:blood_step', name: 'Blood Step' },
];

var SUPPORT_SPELL_DEFINITIONS = []; // Warden é solitário — sem suporte

var WARDEN_ATTACK_SPELLS = ATTACK_SPELL_DEFINITIONS
    .map(s => safeSpellOf(s.id, s.name))
    .filter(s => s != null);

var WARDEN_DEFENSE_SPELLS = DEFENSE_SPELL_DEFINITIONS
    .map(s => safeSpellOf(s.id, s.name))
    .filter(s => s != null);

var WARDEN_MOVEMENT_SPELLS = MOVEMENT_SPELL_DEFINITIONS
    .map(s => safeSpellOf(s.id, s.name))
    .filter(s => s != null);

var WARDEN_SUPPORT_SPELLS = SUPPORT_SPELL_DEFINITIONS
    .map(s => safeSpellOf(s.id, s.name))
    .filter(s => s != null);

// ============ REGISTRAR GOAL SELECTOR ============
// WizardAttackGoal(entity, movementSpeedMultiplier, castIntervalTicks)
// castIntervalTicks = 100 = 5 segundos entre cada magia

EntityJSEvents.addGoalSelectors('minecraft:warden', function (event) {
    event.arbitraryGoal(1, function (entity) {
        return new WizardAttackGoal(entity, 1.0, 100)
            .setSpells(
                WARDEN_ATTACK_SPELLS,
                WARDEN_DEFENSE_SPELLS,
                WARDEN_MOVEMENT_SPELLS,
                WARDEN_SUPPORT_SPELLS
            )
    })
})

if (loadedSpells.length > 0) {
    console.info(`[Warden Spells] Carregado com sucesso: ${loadedSpells.join(', ')}`);
} else {
    console.warn('[Warden Spells] Nenhuma magia foi carregada com sucesso para o Warden.');
}

if (skippedSpells.length > 0) {
    console.warn(`[Warden Spells] Magias ignoradas devido a erro de carregamento: ${skippedSpells.join(', ')}`);
} else if (loadedSpells.length > 0) {
    console.info('[Warden Spells] Todas as magias definidas foram carregadas com sucesso!');
}
