// Priority: 0
// ============================================================
// DEPTHS PORTAL FIX — Pastel Mod
// ============================================================
// O mod Pastel verifica getMinBuildHeight() (-64, padrão vanilla)
// para criar o portal Depths. A bedrock natural fica na Y=-64.
// Este script é um fallback para garantir que o portal funcione
// corretamente na Y=-64 mesmo se o mod falhar.
//
// PARTE 1: Cria o portal quando pastel:ruin é quebrado na Y=-64
// PARTE 2: Reloca o jogador e o portal ao retornar do Deeper Down
// ============================================================

// === CONFIGURAÇÃO ===
const DEPTHS_BEDROCK_Y = -64           // Camada real de bedrock no Overworld
const DEPTHS_RETURN_Y = -62            // Y do jogador ao retornar (2 acima do portal, igual ao mod)
const DEPTHS_MIN_BUILD = -64           // getMinBuildHeight() do nosso servidor (padrão vanilla)
const DEPTHS_PORTAL_BLOCK = 'pastel:deeper_down_portal'
const DEPTHS_RUIN_BLOCK = 'pastel:ruin'
const DEPTHS_DIMENSION = 'pastel:deeper_down'

// ============================================================
// PARTE 1: Interceptar a quebra do ruin na Y=-64
// ============================================================
// No código original (RuinBlock.java onRemove):
//   if (world.dimension() == Level.OVERWORLD && pos.getY() == world.getMinBuildHeight())
//       world.setBlock(pos, DEEPER_DOWN_PORTAL, ...)
//
// Com getMinBuildHeight() em -64 (padrão), o mod deve funcionar.
// Este script é um fallback que cria o portal manualmente.
// ============================================================

BlockEvents.broken(DEPTHS_RUIN_BLOCK, event => {
	let block = event.block
	let pos = block.pos
	let level = event.level

	// Só funciona no Overworld
	if (level.dimension != 'minecraft:overworld') return

	// Só na camada de bedrock natural
	if (pos.y != DEPTHS_BEDROCK_Y) return

	// Verificar se o ruin tem conversion diferente de NONE
	// (ruin com conversion=NONE é ruin colocado manualmente, não gera portal)
	let state = block.blockState
	if (state.hasProperty('conversion')) {
		let conversion = String(state.getValue('conversion')).toLowerCase()
		if (conversion === 'none') return
	}

	let x = pos.x
	let y = pos.y
	let z = pos.z

	// O onRemove do mod vai executar mas NÃO vai criar o portal (porque -64 != -256)
	// Então agendamos a criação do portal 1 tick depois, quando o bloco já foi removido
	event.server.scheduleInTicks(1, { x: x, y: y, z: z, srv: event.server }, callback => {
		// Colocar o portal na posição onde o ruin foi quebrado
		// FACING_UP = false (portal aponta para baixo, igual ao código original do Overworld)
		callback.data.srv.runCommandSilent(
			'execute in minecraft:overworld run setblock ' + callback.data.x + ' ' + callback.data.y + ' ' + callback.data.z + ' ' + DEPTHS_PORTAL_BLOCK + '[up=false]'
		)

		console.info('[Depths Portal Fix] Portal Depths criado na Y=' + callback.data.y + ' em (' + callback.data.x + ', ' + callback.data.z + ')')
	})
})

// ============================================================
// PARTE 2: Corrigir retorno do Deeper Down para o Overworld
// ============================================================
// No código original (DeeperDownPortalBlock.java entityInside):
//   BlockPos portalPos = new BlockPos(pos.getX(), targetWorld.getMinBuildHeight(), pos.getZ());
//   // Cria portal no Overworld na Y=-64
//   // Teleporta entidade para portalPos.above(2) = Y=-62
//
// Fallback: Nós detectamos quando o jogador chega do Deeper Down e:
// 1. Relocamos o jogador para Y=-62 (2 acima da bedrock em -64)
// 2. Removemos qualquer portal errado no minBuildHeight
// 3. Colocamos o portal correto em Y=-64
// ============================================================

// Detect dimension change + process relocation in the same tick handler
PlayerEvents.tick(event => {
	let player = event.player

	// PERFORMANCE: Check every 5 ticks instead of every tick
	// Dimension changes don't need sub-tick precision
	if (player.tickCount % 5 !== 0) return

	let pData = player.persistentData
	let currentDim = String(player.level.dimension)

	// --- Dimension change detection (replaces PlayerEvents.changedDimension) ---
	let prevDim = pData.getString('depths_prev_dim') || ''
	pData.putString('depths_prev_dim', currentDim)

	if (prevDim !== '' && prevDim !== currentDim) {
		// Dimension just changed — check if coming from Deeper Down to Overworld
		if (prevDim.indexOf(DEPTHS_DIMENSION) !== -1 && currentDim.indexOf('overworld') !== -1) {
			let px = Math.floor(player.x)
			let pz = Math.floor(player.z)

			pData.putBoolean('depths_return_pending', true)
			pData.putInt('depths_return_x', px)
			pData.putInt('depths_return_z', pz)

			console.info('[Depths Portal Fix] ' + player.username + ' retornou do Deeper Down, relocalização pendente')
		}
	}

	// --- Process pending relocation ---
	if (!pData.getBoolean('depths_return_pending')) return

	// Só processar se estiver no Overworld
	if (currentDim.indexOf('overworld') === -1) return

	// Remover flag imediatamente para não repetir
	pData.putBoolean('depths_return_pending', false)

	let targetX = pData.getInt('depths_return_x')
	let targetZ = pData.getInt('depths_return_z')
	let server = event.server

	// 1. Remover portal no minBuildHeight (fallback caso o mod tenha criado em posição errada)
	server.runCommandSilent(
		'execute in minecraft:overworld run setblock ' + targetX + ' ' + DEPTHS_MIN_BUILD + ' ' + targetZ + ' minecraft:air'
	)

	// 2. Colocar portal correto na Y=-64 (bedrock real)
	server.runCommandSilent(
		'execute in minecraft:overworld run setblock ' + targetX + ' ' + DEPTHS_BEDROCK_Y + ' ' + targetZ + ' ' + DEPTHS_PORTAL_BLOCK + '[up=false]'
	)

	// 3. Garantir espaço para o jogador acima do portal (limpar 3 blocos acima)
	server.runCommandSilent(
		'execute in minecraft:overworld run fill ' + (targetX - 1) + ' ' + (DEPTHS_BEDROCK_Y + 1) + ' ' + (targetZ - 1) + ' ' + (targetX + 1) + ' ' + (DEPTHS_BEDROCK_Y + 3) + ' ' + (targetZ + 1) + ' minecraft:air replace'
	)

	// 4. Teleportar jogador para posição correta (2 blocos acima do portal, igual ao mod)
	player.teleportTo(
		'minecraft:overworld',
		targetX + 0.5,
		DEPTHS_RETURN_Y,
		targetZ + 0.5,
		player.yRot,
		player.xRot
	)

	// 5. Dar slow falling para evitar dano de queda
	server.runCommandSilent(
		'effect give ' + player.username + ' minecraft:slow_falling 5 0 true'
	)

	console.info('[Depths Portal Fix] ' + player.username + ' relocado para Y=' + DEPTHS_RETURN_Y + ' em (' + targetX + ', ' + targetZ + ')')
})

console.info('[Depths Portal Fix] Script carregado — Fallback para Portal Depths na Y=-64 (minBuildHeight padrão)')
