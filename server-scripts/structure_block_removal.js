// Priority: 0
// Remove brewing stands and enchantment tables from structure generation

// Verifica periodicamente ao redor dos jogadores e remove blocos de estrutura
PlayerEvents.tick(function (event) {
    var player = event.player

    // PERFORMANCE: Verifica a cada 600 ticks (~30 segundos) — era 200 (10s)
    // Estruturas não mudam rapidamente, 30s é mais que suficiente
    if (player.age % 600 !== 0) return

    var level = player.level
    if (level.clientSide) return  // PERFORMANCE: Skip client-side

    var pos = player.blockPosition()

    // PERFORMANCE: Raio reduzido de 24 para 16, step de 8 para 12
    // Reduz iterações de ~343 para ~72
    var radius = 16

    for (var x = -radius; x <= radius; x += 12) {
        for (var y = -12; y <= 12; y += 12) {
            for (var z = -radius; z <= radius; z += 12) {
                var checkPos = pos.offset(x, y, z)
                var blockId = level.getBlockState(checkPos).block.id

                if (blockId === 'minecraft:brewing_stand' || blockId === 'minecraft:enchanting_table') {
                    // Conta blocos de estrutura próximos (raio reduzido de 2 para 1)
                    var nearbyStructureBlocks = 0

                    for (var dx = -1; dx <= 1; dx++) {
                        for (var dy = -1; dy <= 1; dy++) {
                            for (var dz = -1; dz <= 1; dz++) {
                                var nearPos = checkPos.offset(dx, dy, dz)
                                var nearBlock = level.getBlockState(nearPos).block.id

                                // Blocos comuns em estruturas
                                if (nearBlock.indexOf('cobblestone') !== -1 ||
                                    nearBlock.indexOf('stone_brick') !== -1 ||
                                    nearBlock.indexOf('mossy') !== -1 ||
                                    nearBlock === 'minecraft:spawner' ||
                                    nearBlock === 'minecraft:chest') {
                                    nearbyStructureBlocks++
                                }
                            }
                        }
                    }

                    // Se rodeado por blocos de estrutura, remove
                    if (nearbyStructureBlocks >= 3) {
                        level.setBlockAndUpdate(checkPos, Block.getBlock('minecraft:air').defaultBlockState())
                    }
                }
            }
        }
    }
})

console.info('[Structure Block Removal] Active - removes brewing stands and enchantment tables from structures')
