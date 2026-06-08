// Priority: 0
// Adiciona bedrock à tag de minerável por picareta
// Necessário para que picaretas acelerem a quebra da bedrock

ServerEvents.tags('block', event => {
	event.add('minecraft:mineable/pickaxe', 'minecraft:bedrock')
	event.add('minecraft:needs_diamond_tool', 'minecraft:bedrock')
})

console.info('[Bedrock Tags] Bedrock adicionada às tags: mineable/pickaxe, needs_diamond_tool')
