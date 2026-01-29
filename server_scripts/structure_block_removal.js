// Priority: 0
// Remove brewing stands and enchantment tables from structure generation

// Verifica periodicamente ao redor dos jogadores e remove blocos de estrutura
PlayerEvents.tick(function (event) {
    var player = event.player

    // 0.5% chance cada tick (~200 ticks em média para economizar CPU)
    if (Math.random() > 0.005) return

    var level = player.level
    var pos = player.blockPosition()

    // Verifica em um raio ao redor do jogador
    var radius = 24

    for (var x = -radius; x <= radius; x += 8) {
        for (var y = -16; y <= 16; y += 8) {
            for (var z = -radius; z <= radius; z += 8) {
                var checkPos = pos.offset(x, y, z)
                var blockId = level.getBlockState(checkPos).block.id

                if (blockId === 'minecraft:brewing_stand' || blockId === 'minecraft:enchanting_table') {
                    // Conta blocos de estrutura próximos
                    var nearbyStructureBlocks = 0

                    for (var dx = -2; dx <= 2; dx++) {
                        for (var dy = -2; dy <= 2; dy++) {
                            for (var dz = -2; dz <= 2; dz++) {
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
