// Priority: 0
// File: kubejs/server_scripts/warden_buff.js
// Warden Reforçado: 5000 HP, 2x mais rápido, dano massivo, e aura de terror

// ============ CONFIGURAÇÃO ============
var W_MAX_HEALTH = 5000   // HP total
var W_MOVEMENT_SPEED = 0.55   // Velocidade (~83% maior que o vanilla 0.3)
var W_ATTACK_DAMAGE = 60     // Dano melee (vanilla hard: 45)
var W_ATTACK_KNOCKBACK = 4.0    // Knockback brutal
var W_FOLLOW_RANGE = 64     // Perseguição agressiva (vanilla: 16)
var W_ARMOR = 30     // Redução de dano por armor
var W_ARMOR_TOUGHNESS = 20     // Toughness adicional (~50% redução total)

var TERROR_RADIUS_SQ = 30 * 30  // Raio² da aura de terror (30 blocos)
var TERROR_INTERVAL = 40       // Verificar a cada 2 segundos (40 ticks)

// ============ RASTREAMENTO DE WARDENS VIVOS ============
// { "dim:uuid": { x, y, z, dim } }
var activeWardens = {}

// ============ SPAWN: APLICA TODOS OS BUFFS ============
EntityEvents.spawned('minecraft:warden', function (event) {
    var warden = event.entity
    if (!warden) return

    try {
        warden.setAttributeBaseValue('minecraft:generic.max_health', W_MAX_HEALTH)
        warden.setAttributeBaseValue('minecraft:generic.movement_speed', W_MOVEMENT_SPEED)
        warden.setAttributeBaseValue('minecraft:generic.attack_damage', W_ATTACK_DAMAGE)
        warden.setAttributeBaseValue('minecraft:generic.attack_knockback', W_ATTACK_KNOCKBACK)
        warden.setAttributeBaseValue('minecraft:generic.follow_range', W_FOLLOW_RANGE)
        warden.setAttributeBaseValue('minecraft:generic.armor', W_ARMOR)
        warden.setAttributeBaseValue('minecraft:generic.armor_toughness', W_ARMOR_TOUGHNESS)

        warden.heal(W_MAX_HEALTH)

        // Registrar warden no tracker
        var dimKey = warden.level.dimension.toString()
        var uuid = warden.uuid.toString()
        activeWardens[dimKey + ':' + uuid] = { uuid: uuid, dim: dimKey }

        console.info('[Warden Buff] Warden spawnado com buffs completos.')
    } catch (e) {
        console.error('[Warden Buff] Erro ao aplicar atributos: ' + e)
    }
})

// ============ MORTE: REMOVE DO TRACKER ============
EntityEvents.death('minecraft:warden', function (event) {
    try {
        var warden = event.entity
        if (!warden) return
        var dimKey = warden.level.dimension.toString()
        var uuid = warden.uuid.toString()
        delete activeWardens[dimKey + ':' + uuid]
    } catch (e) { }
})

// ============ AURA DE TERROR ============
// Jogadores próximos a qualquer Warden ativo recebem Darkness + Slowness
ServerEvents.tick(function (event) {
    var server = event.server
    if (server.tickCount % TERROR_INTERVAL !== 0) return

    // Se não há wardens ativos, não faz nada
    var wardenCount = 0
    for (var k in activeWardens) wardenCount++
    if (wardenCount === 0) return

    var players = server.players
    players.forEach(function (player) {
        if (player.isCreative() || player.isSpectator()) return

        try {
            var dimKey = player.level.dimension.toString()
            var px = player.x
            var py = player.y
            var pz = player.z

            var terrorized = false

            for (var key in activeWardens) {
                var w = activeWardens[key]
                if (w.dim !== dimKey) continue

                // Buscar entidade pelo UUID para pegar posição atual
                var wardenEntity = null
                try {
                    wardenEntity = player.level.getEntity(Utils.uuid(w.uuid))
                } catch (ue) { }

                if (!wardenEntity) {
                    // Warden sumiu (morreu sem disparo do evento) — remover do tracker
                    delete activeWardens[key]
                    continue
                }

                var dx = px - wardenEntity.x
                var dy = py - wardenEntity.y
                var dz = pz - wardenEntity.z
                var distSq = dx * dx + dy * dy + dz * dz

                if (distSq <= TERROR_RADIUS_SQ) {
                    terrorized = true
                    break
                }
            }

            if (terrorized) {
                player.potionEffects.add('minecraft:darkness', 60, 0, false, false)
                player.potionEffects.add('minecraft:slowness', 60, 1, false, false)
            }
        } catch (e) {
            console.error('[Warden Buff] Erro na aura de terror: ' + e)
        }
    })
})

console.info('[Warden Buff] Carregado — 5000 HP | Speed 0.55 | Dano 60 | Aura de Terror ativa (30 blocos).')
