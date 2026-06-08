// Priority: 0
// File: kubejs/server_scripts/warden_block_break.js
// Warden quebra blocos no caminho até o alvo usando EntityJS customGoal
// Não quebra obsidian/bedrock. Quebra sculk instantaneamente.
// Requer: EntityJS

// ============ CONFIGURAÇÃO ============
var BREAK_TICK_INTERVAL = 10   // A cada 10 ticks (0.5s) tenta quebrar blocos
var SCAN_AHEAD = 4             // Blocos à frente na direção do alvo
var SCAN_WIDTH = 1             // Blocos laterais (1 = 3 de largura: -1, 0, +1)
var SCAN_HEIGHT_UP = 3         // Blocos acima dos pés do Warden (Warden tem ~3 blocos de altura)
var SCAN_HEIGHT_DOWN = 1       // Blocos abaixo dos pés (para cavar)

// ============ BLOCOS INQUERÁVEIS ============
var UNBREAKABLE_BLOCKS = {
    'minecraft:obsidian': true,
    'minecraft:crying_obsidian': true,
    'minecraft:bedrock': true,
    'minecraft:reinforced_deepslate': true,
    'minecraft:end_portal_frame': true,
    'minecraft:end_portal': true,
    'minecraft:nether_portal': true,
    'minecraft:command_block': true,
    'minecraft:chain_command_block': true,
    'minecraft:repeating_command_block': true,
    'minecraft:barrier': true,
    'minecraft:structure_block': true,
    'minecraft:jigsaw': true
}

// ============ BLOCOS SCULK (destruição instantânea) ============
var SCULK_BLOCKS = {
    'minecraft:sculk': true,
    'minecraft:sculk_vein': true,
    'minecraft:sculk_catalyst': true,
    'minecraft:sculk_sensor': true,
    'minecraft:sculk_shrieker': true,
    'minecraft:calibrated_sculk_sensor': true
}

// ============ HELPER: BlockPos ============
var BlockPos = Java.loadClass('net.minecraft.core.BlockPos')

// ============ FUNÇÕES AUXILIARES ============

/**
 * Verifica se um bloco pode ser quebrado pelo Warden
 * @returns 0 = ignorar (ar/não-sólido), 1 = quebrar normal, 2 = sculk (instant), -1 = inquebrável
 */
function classifyBlock(level, pos) {
    var state = level.getBlockState(pos)

    // Ar ou não-sólido: ignorar
    if (state.isAir()) return 0

    var blockId = state.getBlock().arch$registryName().toString()

    // Bloco inquebrável
    if (UNBREAKABLE_BLOCKS[blockId]) return -1

    // Sculk: destruição instantânea
    if (SCULK_BLOCKS[blockId]) return 2

    // Líquido (água, lava): ignorar
    if (!state.getFluidState().isEmpty()) return 0

    // Bloco sólido quebrável
    // Verificar se realmente é um bloco sólido que obstrui
    // Usa blocksMotion() para saber se é sólido o suficiente para bloquear passagem
    try {
        if (state.blocksMotion()) return 1
    } catch (e) {
        // Fallback: considerar quebrável se não for ar
        return 1
    }

    return 0 // Não bloqueia movimento, ignorar
}

/**
 * Escaneia e quebra blocos entre o Warden e o alvo
 * Retorna true se quebrou pelo menos um bloco
 */
function breakBlocksTowardTarget(mob) {
    var target = mob.getTarget()
    if (!target) return false

    var level = mob.level

    // Posição do Warden (pés)
    var wx = mob.getX()
    var wy = mob.getY()
    var wz = mob.getZ()

    // Posição do alvo
    var tx = target.getX()
    var ty = target.getY()
    var tz = target.getZ()

    // Vetor direção (horizontal)
    var dx = tx - wx
    var dy = ty - wy
    var dz = tz - wz
    var distH = Math.sqrt(dx * dx + dz * dz)

    var brokeAny = false

    // --- QUEBRA HORIZONTAL ---
    // Normalizar direção horizontal
    if (distH > 0.5) {
        var ndx = dx / distH
        var ndz = dz / distH

        // Vetor perpendicular para largura
        var px = -ndz
        var pz = ndx

        // Escanear blocos à frente
        for (var ahead = 1; ahead <= SCAN_AHEAD; ahead++) {
            var baseX = Math.floor(wx + ndx * ahead)
            var baseZ = Math.floor(wz + ndz * ahead)

            for (var w = -SCAN_WIDTH; w <= SCAN_WIDTH; w++) {
                var scanX = baseX + Math.floor(px * w)
                var scanZ = baseZ + Math.floor(pz * w)

                // Escanear na coluna vertical (altura do Warden)
                for (var h = -SCAN_HEIGHT_DOWN; h <= SCAN_HEIGHT_UP; h++) {
                    var scanY = Math.floor(wy) + h
                    var pos = new BlockPos(scanX, scanY, scanZ)
                    var classification = classifyBlock(level, pos)

                    if (classification === 1 || classification === 2) {
                        // Quebrar o bloco (false = sem drops para evitar lag)
                        try {
                            level.destroyBlock(pos, false)
                            brokeAny = true
                        } catch (e) {
                            // Silenciar erro de bloco protegido
                        }
                    }
                    // classification === -1: inquebrável, pula
                    // classification === 0: ar/não-sólido, pula
                }
            }

            // Se quebrou algo nesta "fatia", parar para não destruir demais de uma vez
            if (brokeAny) break
        }
    }

    // --- QUEBRA VERTICAL ---
    // Se o alvo está significativamente acima ou abaixo
    if (Math.abs(dy) > 1.5) {
        var dirY = dy > 0 ? 1 : -1
        var startY = dirY > 0 ? Math.floor(wy) + SCAN_HEIGHT_UP + 1 : Math.floor(wy) - 1

        for (var v = 0; v < 3; v++) {
            var vY = startY + (dirY * v)

            // Escanear 3x3 ao redor do Warden para caber
            for (var vx = -1; vx <= 1; vx++) {
                for (var vz = -1; vz <= 1; vz++) {
                    var vPos = new BlockPos(Math.floor(wx) + vx, vY, Math.floor(wz) + vz)
                    var vClass = classifyBlock(level, vPos)

                    if (vClass === 1 || vClass === 2) {
                        try {
                            level.destroyBlock(vPos, false)
                            brokeAny = true
                        } catch (e) { }
                    }
                }
            }

            if (brokeAny) break
        }
    }

    return brokeAny
}

/**
 * Verifica se há blocos sólidos entre o Warden e o alvo (simplificado)
 */
function hasObstacleToTarget(mob) {
    var target = mob.getTarget()
    if (!target) return false

    var level = mob.level
    var wx = mob.getX()
    var wy = mob.getY()
    var wz = mob.getZ()
    var tx = target.getX()
    var ty = target.getY()
    var tz = target.getZ()

    var dx = tx - wx
    var dz = tz - wz
    var distH = Math.sqrt(dx * dx + dz * dz)

    // Verificar se está perto o suficiente para não precisar quebrar
    if (distH < 2) return false

    // Checar linha reta na altura dos pés e do corpo
    if (distH > 0.5) {
        var ndx = dx / distH
        var ndz = dz / distH

        for (var ahead = 1; ahead <= Math.min(SCAN_AHEAD, Math.floor(distH)); ahead++) {
            var checkX = Math.floor(wx + ndx * ahead)
            var checkZ = Math.floor(wz + ndz * ahead)

            // Checar pés e cabeça
            for (var h = 0; h <= 2; h++) {
                var pos = new BlockPos(checkX, Math.floor(wy) + h, checkZ)
                var cls = classifyBlock(level, pos)
                if (cls === 1 || cls === 2) return true
            }
        }
    }

    // Checar verticalmente
    var dy = ty - wy
    if (Math.abs(dy) > 1.5) {
        var dirY = dy > 0 ? 1 : -1
        var checkY = dirY > 0 ? Math.floor(wy) + SCAN_HEIGHT_UP + 1 : Math.floor(wy) - 1
        var pos = new BlockPos(Math.floor(wx), checkY, Math.floor(wz))
        var cls = classifyBlock(level, pos)
        if (cls === 1 || cls === 2) return true
    }

    return false
}

// ============ CONTADOR INTERNO DE TICKS ============
var breakTickCounters = {}

// ============ CONFIGURAÇÃO DE ESCALADA ============
var CLIMB_TICK_INTERVAL = 10   // A cada 10 ticks (0.5s) tenta escalar
var CLIMB_HEIGHT_THRESHOLD = 2 // Diferença mínima de Y para ativar escalada
var CLIMB_STEP = 1             // Blocos por step de escalada
var PILLAR_BREAK_RADIUS = 2    // Raio para destruir base de pilares

// ============ SISTEMA DE ESCALADA DE PAREDES ============

/**
 * Escala paredes para alcançar o alvo acima.
 * Quebra blocos acima da cabeça, coloca sculk como scaffolding,
 * e teleporta o Warden para cima gradualmente.
 */
function climbTowardTarget(mob) {
    var target = mob.getTarget()
    if (!target) return false

    var level = mob.level
    var wx = mob.getX()
    var wy = mob.getY()
    var wz = mob.getZ()
    var tx = target.getX()
    var ty = target.getY()

    var dy = ty - wy

    // Só escala se o alvo está significativamente acima
    if (dy < CLIMB_HEIGHT_THRESHOLD) return false

    var bx = Math.floor(wx)
    var by = Math.floor(wy)
    var bz = Math.floor(wz)

    // Quebrar blocos acima do Warden (3 blocos de altura + 1 acima)
    var brokeAbove = false
    for (var h = 3; h <= 5; h++) {
        for (var ox = -1; ox <= 1; ox++) {
            for (var oz = -1; oz <= 1; oz++) {
                var abovePos = new BlockPos(bx + ox, by + h, bz + oz)
                var cls = classifyBlock(level, abovePos)
                if (cls === 1 || cls === 2) {
                    try {
                        level.destroyBlock(abovePos, false)
                        brokeAbove = true
                    } catch (e) { }
                }
            }
        }
    }

    // Colocar sculk embaixo como scaffolding (para não cair)
    try {
        var belowPos = new BlockPos(bx, by, bz)
        var belowState = level.getBlockState(belowPos)
        if (belowState.isAir()) {
            level.setBlockAndUpdate(belowPos, Block.getBlock('minecraft:sculk').defaultBlockState())
        }
    } catch (e) { }

    // Teleportar o Warden para cima
    try {
        mob.teleportTo(wx, wy + CLIMB_STEP, wz)
        mob.setDeltaMovement(0, 0.1, 0) // Pequeno impulso para evitar queda
        mob.setNoGravity(false) // Manter gravidade ativa
        mob.fallDistance = 0 // Resetar dano de queda
    } catch (e) { }

    return true
}

/**
 * Destrói a base de pilares onde o jogador está parado.
 * Se o alvo está em cima de um pilar estreito, o Warden destrói a base.
 */
function destroyPillarBase(mob) {
    var target = mob.getTarget()
    if (!target) return false

    var level = mob.level
    var tx = Math.floor(target.getX())
    var ty = Math.floor(target.getY())
    var tz = Math.floor(target.getZ())
    var wy = Math.floor(mob.getY())

    // Só ativa se o alvo está acima
    if (ty - wy < 3) return false

    // Destruir blocos na coluna abaixo do alvo
    var destroyed = false
    for (var y = wy; y < ty; y++) {
        for (var ox = -PILLAR_BREAK_RADIUS; ox <= PILLAR_BREAK_RADIUS; ox++) {
            for (var oz = -PILLAR_BREAK_RADIUS; oz <= PILLAR_BREAK_RADIUS; oz++) {
                var pos = new BlockPos(tx + ox, y, tz + oz)
                var cls = classifyBlock(level, pos)
                if (cls === 1 || cls === 2) {
                    try {
                        level.destroyBlock(pos, false)
                        destroyed = true
                    } catch (e) { }
                }
            }
        }
        // Limitar a 2 camadas por tick para não destruir demais de uma vez
        if (destroyed) return true
    }

    return destroyed
}

// ============ REGISTRAR GOAL: BLOCK BREAK ============
EntityJSEvents.addGoalSelectors('minecraft:warden', function (event) {
    event.customGoal(
        'warden_break_blocks',  // nome do goal
        2,                      // prioridade (alta, mas abaixo de 1 que é o WizardAttackGoal)

        // canUse: ativa se o Warden tem alvo e há obstáculo
        function (mob) {
            try {
                var target = mob.getTarget()
                if (!target) return false
                if (!target.isAlive()) return false
                return hasObstacleToTarget(mob)
            } catch (e) {
                return false
            }
        },

        // canContinueToUse: continua enquanto há alvo vivo e obstáculos
        function (mob) {
            try {
                var target = mob.getTarget()
                if (!target) return false
                if (!target.isAlive()) return false
                return hasObstacleToTarget(mob)
            } catch (e) {
                return false
            }
        },

        true,  // requiresUpdateEveryTick

        // start: inicializa contador
        function (mob) {
            var uuid = mob.getStringUuid()
            breakTickCounters[uuid] = 0
        },

        // stop: limpa contador
        function (mob) {
            var uuid = mob.getStringUuid()
            delete breakTickCounters[uuid]
        },

        true,  // isInterruptable

        // tick: lógica principal de quebra
        function (mob) {
            try {
                var uuid = mob.getStringUuid()
                if (breakTickCounters[uuid] === undefined) {
                    breakTickCounters[uuid] = 0
                }
                breakTickCounters[uuid]++

                // Só quebra a cada BREAK_TICK_INTERVAL ticks
                if (breakTickCounters[uuid] % BREAK_TICK_INTERVAL !== 0) return

                breakBlocksTowardTarget(mob)
            } catch (e) {
                console.error('[Warden BlockBreak] Erro no tick: ' + e)
            }
        }
    )
})

// ============ TICK: ESCALADA + ANTI-PILAR ============
// Roda via ServerEvents.tick para todos os Wardens ativos
var climbCounters = {}

ServerEvents.tick(function (event) {
    var server = event.server
    var currentTick = server.tickCount
    if (currentTick % CLIMB_TICK_INTERVAL !== 0) return

    var players = server.playerList.players
    for (var p = 0; p < players.size(); p++) {
        var level = players.get(p).level
        var dimKey = level.dimension.toString()

        // Buscar todos os wardens na dimensão via entidades próximas ao jogador
        try {
            var AABB = Java.loadClass('net.minecraft.world.phys.AABB')
            var player = players.get(p)
            var searchBox = new AABB(
                player.x - 64, player.y - 64, player.z - 64,
                player.x + 64, player.y + 64, player.z + 64
            )

            var wardenClass = Java.loadClass('net.minecraft.world.entity.monster.warden.Warden')
            var wardens = level.getEntitiesOfClass(wardenClass, searchBox)

            for (var i = 0; i < wardens.size(); i++) {
                var warden = wardens.get(i)
                if (!warden.isAlive()) continue

                var target = warden.getTarget()
                if (!target) continue
                if (!target.isAlive()) continue

                var dy = target.getY() - warden.getY()

                // Se o alvo está acima: escalar
                if (dy >= CLIMB_HEIGHT_THRESHOLD) {
                    climbTowardTarget(warden)
                    destroyPillarBase(warden)
                }

                // Anti-fuga: se o Warden não se moveu em vários ticks, teleportar mais agressivamente
                var uuid = warden.getStringUuid()
                if (!climbCounters[uuid]) {
                    climbCounters[uuid] = { lastX: warden.getX(), lastY: warden.getY(), lastZ: warden.getZ(), stuckTicks: 0 }
                }

                var cc = climbCounters[uuid]
                var movedDist = Math.abs(warden.getX() - cc.lastX) + Math.abs(warden.getY() - cc.lastY) + Math.abs(warden.getZ() - cc.lastZ)

                if (movedDist < 0.5) {
                    cc.stuckTicks++
                } else {
                    cc.stuckTicks = 0
                }

                cc.lastX = warden.getX()
                cc.lastY = warden.getY()
                cc.lastZ = warden.getZ()

                // Se preso por 3+ segundos (6 checks), escalar agressivamente + destruir blocos ao redor
                if (cc.stuckTicks >= 6) {
                    // Destruir todos os blocos ao redor em 3x3x5
                    var bx = Math.floor(warden.getX())
                    var by = Math.floor(warden.getY())
                    var bz = Math.floor(warden.getZ())

                    for (var sx = -1; sx <= 1; sx++) {
                        for (var sz = -1; sz <= 1; sz++) {
                            for (var sy = -1; sy <= 5; sy++) {
                                var sPos = new BlockPos(bx + sx, by + sy, bz + sz)
                                var sCls = classifyBlock(level, sPos)
                                if (sCls === 1 || sCls === 2) {
                                    try { level.destroyBlock(sPos, false) } catch (e) { }
                                }
                            }
                        }
                    }

                    // Teleportar na direção do alvo
                    var tdx = target.getX() - warden.getX()
                    var tdz = target.getZ() - warden.getZ()
                    var tdy = target.getY() - warden.getY()
                    var tDist = Math.sqrt(tdx * tdx + tdz * tdz)

                    if (tDist > 0.5) {
                        var stepX = (tdx / tDist) * 2
                        var stepZ = (tdz / tDist) * 2
                        var stepY = tdy > 1 ? 2 : (tdy < -1 ? -1 : 0)
                        try {
                            warden.teleportTo(warden.getX() + stepX, warden.getY() + stepY, warden.getZ() + stepZ)
                            warden.fallDistance = 0
                        } catch (e) { }
                    }

                    cc.stuckTicks = 0
                }
            }
        } catch (e) { }
    }

    // Limpar counters de wardens mortos periodicamente
    if (currentTick % 1200 === 0) {
        climbCounters = {}
    }
})

console.info('[Warden BlockBreak] Goal de destruição de blocos + escalada de paredes registrado — Obsidian/Bedrock protegidos | Sculk destruído instantaneamente | Warden escala paredes.')
