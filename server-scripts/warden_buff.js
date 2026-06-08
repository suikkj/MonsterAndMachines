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

// Machine-spawned Warden lifetime (5 minutes)
var WARDEN_MACHINE_LIFETIME = 6000  // 5 minutes in ticks

// ============ RASTREAMENTO DE WARDENS VIVOS ============
// { "dim:uuid": { x, y, z, dim } }
var activeWardens = {}

// ============ SPAWN: APLICA TODOS OS BUFFS ============
// Usa flag persistentData para evitar re-aplicação ao carregar chunk
// Usa delay de 1 tick para garantir que AttributeFix já processou os limites
EntityEvents.spawned('minecraft:warden', function (event) {
    var warden = event.entity
    if (!warden) return

    // Registrar no tracker independente de já ter buffs (tracker é volátil em memória)
    var dimKey = warden.level.dimension.toString()
    var uuid = warden.uuid.toString()

    // Detectar se é um Warden spawnado pelo sistema de máquinas Create
    var isMachineSpawned = false
    try {
        isMachineSpawned = warden.getTags().contains('machine_spawned')
    } catch (e) { }

    activeWardens[dimKey + ':' + uuid] = {
        uuid: uuid,
        dim: dimKey,
        machineSpawned: isMachineSpawned,
        spawnTick: warden.level.getServer().tickCount,
        despawnWarned: false
    }

    if (isMachineSpawned) {
        console.info('[Warden Buff] Warden de máquinas Create detectado — será despawnado em 5 minutos.')
    }

    // Verificar se já foi buffado (evita re-aplicação ao carregar chunk)
    if (warden.persistentData.getBoolean('warden_buffed')) {
        console.info('[Warden Buff] Warden já buffado, apenas re-registrado no tracker.')
        return
    }

    try {
        var server = warden.level.getServer()

        // Delay de 1 tick para AttributeFix processar os limites de atributos
        server.scheduleInTicks(1, function () {
            try {
                // Verificar se o warden ainda existe
                if (!warden.isAlive()) return

                // Aplicar atributos usando getAttribute().setBaseValue()
                warden.getAttribute('minecraft:generic.max_health').setBaseValue(W_MAX_HEALTH)
                warden.getAttribute('minecraft:generic.movement_speed').setBaseValue(W_MOVEMENT_SPEED)
                warden.getAttribute('minecraft:generic.attack_damage').setBaseValue(W_ATTACK_DAMAGE)
                warden.getAttribute('minecraft:generic.attack_knockback').setBaseValue(W_ATTACK_KNOCKBACK)
                warden.getAttribute('minecraft:generic.follow_range').setBaseValue(W_FOLLOW_RANGE)
                warden.getAttribute('minecraft:generic.armor').setBaseValue(W_ARMOR)
                warden.getAttribute('minecraft:generic.armor_toughness').setBaseValue(W_ARMOR_TOUGHNESS)

                // Curar para o máximo — heal() respeita o max_health atual sem clipar
                warden.heal(W_MAX_HEALTH)

                // Marcar como buffado para não re-aplicar ao carregar chunk
                warden.persistentData.putBoolean('warden_buffed', true)

                console.info('[Warden Buff] Warden spawnado com buffs completos. HP: ' + warden.getHealth() + '/' + W_MAX_HEALTH)
            } catch (innerErr) {
                console.error('[Warden Buff] Erro ao aplicar atributos (delayed): ' + innerErr)
            }
        })
    } catch (e) {
        console.error('[Warden Buff] Erro ao agendar buffs: ' + e)
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
    var currentTick = server.tickCount
    if (currentTick % TERROR_INTERVAL !== 0) return

    // Se não há wardens ativos, não faz nada
    var wardenCount = 0
    for (var k in activeWardens) wardenCount++
    if (wardenCount === 0) return

    // === DESPAWN CHECK for machine-spawned Wardens ===
    var despawnKeys = []
    for (var dKey in activeWardens) {
        var wd = activeWardens[dKey]
        if (!wd.machineSpawned) continue

        var elapsed = currentTick - wd.spawnTick

        // Despawn after 5 minutes
        if (elapsed >= WARDEN_MACHINE_LIFETIME) {
            try {
                // Find the warden entity to get its position for the message
                var despawnLevel = null
                var allPlayers = server.playerList.players
                for (var dp = 0; dp < allPlayers.size(); dp++) {
                    if (allPlayers.get(dp).level.dimension.toString() === wd.dim) {
                        despawnLevel = allPlayers.get(dp).level
                        break
                    }
                }

                if (despawnLevel) {
                    var wardenToDespawn = null
                    try {
                        wardenToDespawn = despawnLevel.getEntity(Utils.uuid(wd.uuid))
                    } catch (ue) { }

                    if (wardenToDespawn && wardenToDespawn.isAlive()) {
                        var wx = Math.floor(wardenToDespawn.x)
                        var wy = Math.floor(wardenToDespawn.y)
                        var wz = Math.floor(wardenToDespawn.z)

                        // Despawn effects
                        server.runCommandSilent('execute in ' + wd.dim + ' positioned ' + wx + ' ' + wy + ' ' + wz + ' run particle minecraft:sculk_soul ~ ~1 ~ 1 2 1 0.02 40 force')
                        server.runCommandSilent('execute in ' + wd.dim + ' positioned ' + wx + ' ' + wy + ' ' + wz + ' run playsound minecraft:entity.warden.dig hostile @a[distance=..64] ~ ~ ~ 2 0.5')

                        // Despawn message: "A Profanidade procurará você novamente"
                        server.runCommandSilent(
                            'execute in ' + wd.dim + ' positioned ' + wx + ' ' + wy + ' ' + wz +
                            ' run immersivemessages sendcustom @a[distance=..64] {anchor:4,background:1,typewriter:1,color:"#0689a0ff",italic:1,slideoutdown:1} 5 A Profanidade procurará você novamente'
                        )

                        // Remove the warden
                        wardenToDespawn.kill()
                        console.info('[Warden Buff] Machine-spawned Warden despawnado após 5 minutos.')
                    }
                }
            } catch (despawnErr) {
                console.error('[Warden Buff] Erro ao despawnar Warden: ' + despawnErr)
            }
            despawnKeys.push(dKey)
        }
    }
    for (var dk = 0; dk < despawnKeys.length; dk++) {
        delete activeWardens[despawnKeys[dk]]
    }

    // === TERROR AURA ===
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
