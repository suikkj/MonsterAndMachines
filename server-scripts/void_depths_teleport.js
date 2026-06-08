// Priority: 0
// ============================================================
// VOID → DEEPER DOWN TELEPORT
// ============================================================
// Quando o jogador cai abaixo da bedrock (Y <= -65) no Overworld,
// ao invés de morrer no void, ele é teleportado para a mesma
// coordenada X/Z na dimensão pastel:deeper_down.
//
// O jogador recebe slow_falling e resistance para não morrer
// ao chegar na outra dimensão.
// ============================================================

// === CONFIGURAÇÃO ===
const VOID_TRIGGER_Y = -65              // Y que ativa o teleporte (1 abaixo da bedrock em -64)
const VOID_TARGET_DIM = 'pastel:deeper_down'
const VOID_SPAWN_Y = 200                // Y onde o jogador spawna no Deeper Down (alto para cair com segurança)
const VOID_COOLDOWN_TICKS = 100         // Cooldown de 5 segundos (100 ticks) para evitar loops

// ============================================================
// DETECÇÃO: Checar a cada tick se o jogador está abaixo do Y limite
// ============================================================
PlayerEvents.tick(event => {
	let player = event.player

	// PERFORMANCE: Checar a cada 10 ticks (~2x por segundo), suficiente para detectar queda no void
	if (player.tickCount % 10 !== 0) return

	// Ignorar jogadores em modo criativo ou espectador
	if (player.creative || player.spectator) return

	// Checar Y PRIMEIRO (operação mais barata, evita alocação de String desnecessária)
	if (player.y > VOID_TRIGGER_Y) return

	// Só funciona no Overworld
	let dim = String(player.level.dimension)
	if (dim.indexOf('overworld') === -1) return

	// Checar cooldown para evitar teleporte em loop
	let pData = player.persistentData
	let lastTp = pData.getInt('void_tp_tick')
	let currentTick = player.age  // age = total ticks alive

	if (lastTp > 0 && (currentTick - lastTp) < VOID_COOLDOWN_TICKS) return

	// Marcar cooldown
	pData.putInt('void_tp_tick', currentTick)

	// Coordenadas do jogador
	let px = player.x
	let pz = player.z
	let yaw = player.yRot
	let pitch = player.xRot

	// Teleportar para o Deeper Down na mesma coordenada X/Z
	player.teleportTo(
		VOID_TARGET_DIM,
		px,
		VOID_SPAWN_Y,
		pz,
		yaw,
		pitch
	)

	// Dar efeitos de proteção para a transição
	let server = event.server

	// Slow falling por 15 segundos para descer suavemente
	server.runCommandSilent(
		'effect give ' + player.username + ' minecraft:slow_falling 15 0 true'
	)

	// Resistance por 10 segundos para não morrer de dano
	server.runCommandSilent(
		'effect give ' + player.username + ' minecraft:resistance 10 4 true'
	)

	// Fire resistance para caso haja lava
	server.runCommandSilent(
		'effect give ' + player.username + ' minecraft:fire_resistance 15 0 true'
	)

	console.info('[Void Teleport] ' + player.username + ' caiu no void em (' + Math.floor(px) + ', ' + Math.floor(pz) + ') — teleportado para ' + VOID_TARGET_DIM)

	// Mensagem para o jogador
	server.runCommandSilent(
		'title ' + player.username + ' subtitle {"text":"Você atravessou a bedrock...","color":"dark_purple","italic":true}'
	)
	server.runCommandSilent(
		'title ' + player.username + ' title {"text":"Deeper Down","color":"#6a0dad","bold":true}'
	)
})

console.info('[Void Teleport] Script carregado — Jogadores que caem no void do Overworld são teleportados para ' + VOID_TARGET_DIM)
