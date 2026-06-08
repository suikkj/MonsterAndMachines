// Priority: 0
// Torna a bedrock quebrável
// destroySpeed = 300 (obsidian = 50 para comparação)
//
// Tempos aproximados:
// Picareta de netherite (sem encantamentos):  ~15 minutos
// Picareta de diamante (sem encantamentos):   ~18 minutos
// Netherite + Eficiência V:                   ~2.5 minutos
// Netherite + Eficiência V + Pressa II:       ~1.5 minutos
// Sem ferramenta adequada:                    Impossível (requiresTool = true)

BlockEvents.modification(event => {
	event.modify('minecraft:bedrock', block => {
		block.destroySpeed = 300.0          // 6x mais duro que obsidiana (50)
		block.explosionResistance = 3600000.0  // Mantém resistência alta a explosões
		block.requiresTool = true           // Requer picareta para minerar
	})
})

console.info('[Bedrock Breakable] Bedrock configurada: destroySpeed=300, requer picareta')
