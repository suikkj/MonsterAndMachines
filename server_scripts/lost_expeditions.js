// Priority: 0
// Lost Expeditions - Lore books from the 12 lost expedition groups

var EXPEDITION_LORE = {
    group1: {
        title: 'Grupo de Expedição',
        author: 'Sunny Dantas',
        pages: [
            'Dia 1 - Finalmente saimos do Refúgio Cigarra apos 2.740 anos. A superficie é... como foi descrito pelos cientistas da T.U.R. Ainda sim, é difícil acreditar que isso é o que restou. Em livros e fotografias, eu e o Nimbus sempre víamos como o mundo era antigamente.',
            'Os reinos. As árvores. Como que construções tão grandiosas se tornaram... apenas ruínas. Cascas vazias de algo que já foi cheio de vida.',
            'Dia 2 - A dificuldade avisada antes de sair, antes poderia apenas parecer exagero, mas agora eu entendo. Dormir na superfície.. Sequer se manter nela parece uma tarefa difícil. Diria impossível, dada a missão que nos foi dada.',
            'Não consigo ver esperança para essa terra. Não agora. Uma terra infértil, onde toda a vida foi sugada. É difícil entender se essa terra quer me sugar junto com o resto da vida ao redor.',
            'Dia 4 - Saímos para explorar na superfície. Realmente as dicas que a "T.U.R." deu eram úteis. Ouro é realmente a chave para algumas coisas, mesmo que temporariamente.',
            'Encontramos o que parece ser ruínas de uma antiga vila. Me pergunto o que permitiu algumas construções se manterem mais do que outras. Foi sorte? Foi um outro povo que vivia aqui? Ou houve algum ato nisso. Independente, vamos tent-',
            'Tem alguém aqui.'
        ]
    },
    group2: {
        title: 'Relatório do Grupo 2',
        author: 'Dr. Lynnus',
        pages: [
            'Inicio da Expedicao: Data: 26/09/5912 - Inicio da Expedicao sob a superficie remanescente de Asttar.',
            'Durante as investigações, percebi índices de algumas ruínas e marcas que levam a crer que a localização do Refúgio Coruja se localiza a poucos quilômetros da capital.',
            'É possível analisar facilmente como o Vírus VALID-71 ("Vazio") tem sua preferência e foco por aquilo que é vivo e possui consciência. Acredito eu que moradores do lixão estariam a salvo nessas terras desoladas.',
            'Brincadeiras à parte, é, no mínimo, curioso ver até onde esse vírus pode ir. Com as pesquisas sobre o possível envolvimento humano na criação desse vírus me trás um medo e ao mesmo tempo um fascínio vindos da mesma pergunta. Por que?.',
            'Foram coletadas amostras do VALID-71 de areas diferentes. Das áreas completamente consumidas até as que se mantiveram de pé, mesmo que em ruínas. Enviaremos isso ao Refúgio Coruja para que enviem a cientista do Refúgio Cobra.',
            'Talvez as amostras possam mostrar resultados em suas pesquisas.',
            'Um companheiro de Expedição veio comunicar que, durante suas explorações sobre diferentes ruínas, ele parece ter encontrado alguém. Suas vestes e aparências não pareciam ter vindo de um Refúgio. Pelo menos não os Refúgios que conhecemos.',
            'Irei imediatamente com ele ao local de encontro. Talvez possamos ter respostas.',
            'Agora consigo entender. Parece que... tudo isso foi algum tipo de piada cósmica sobre nós, não é? Dançamos a sua dança como você queria, universo. Tudo bem... Se é isso que você quer, não só para mim, mas para todos que ousaram pisar nas terras',
            'que você tomou com suas rédeas de aço, não irei intervir. Apenas deixo um aviso, caso haja leitores que tenham sido burros o suficiente de pisar para fora do Refúgio por livre e espontânea vontade: Independente do que você escutar, não confie Nele.',
            'Você não vai conseguir enganar Ele. Muito menos arrancar algo Dele. Independente do que Ele disser, não escute Ele.'
        ]
    },
    group3: {
        title: 'Galera Expedicionária 3',
        author: 'Carlito',
        pages: [
            'Ja que o pessoal do Refugio vai ler essas anotacoes, queria enfatizar A MISERIA DE SUPRIMENTO. VTNC T.U.R. EMPRESA DE MERDA.'
        ]
    }
}

// Add books to loot tables
LootJS.modifiers(function (event) {
    console.info('[Lost Expeditions] Registering loot tables...')

    var tables = [
        /.*chests\/village.*/,
        /.*chests\/simple_dungeon.*/,
        /.*chests\/abandoned_mineshaft.*/,
        /.*chests\/stronghold.*/,
        /.*chests\/desert_pyramid.*/,
        /.*yung.*/,
        /.*dungeon.*/,
        /.*ruin.*/
    ]

    event.addTableModifier(tables)
        .randomChance(0.15)
        .addLoot('minecraft:book')

    event.addTableModifier(/.*ancient_city.*/)
        .randomChance(0.35)
        .addLoot('minecraft:book')
})

// Test command
ServerEvents.commandRegistry(function (event) {
    var Commands = event.commands
    var StringArgumentType = Java.loadClass('com.mojang.brigadier.arguments.StringArgumentType')

    event.register(
        Commands.literal('testlorebook')
            .requires(function (src) { return src.hasPermission(2) })
            .executes(function (ctx) {
                var player = ctx.getSource().getPlayer()
                if (!player) return 0
                var keys = Object.keys(EXPEDITION_LORE)
                var key = keys[Math.floor(Math.random() * keys.length)]
                giveWrittenBook(player, EXPEDITION_LORE[key])
                return 1
            })
            .then(Commands.argument('group', StringArgumentType.word())
                .executes(function (ctx) {
                    var player = ctx.getSource().getPlayer()
                    var key = StringArgumentType.getString(ctx, 'group')
                    if (!player) return 0
                    if (!EXPEDITION_LORE[key]) {
                        player.tell(Text.of('Grupo nao encontrado: group1-group12'))
                        return 0
                    }
                    giveWrittenBook(player, EXPEDITION_LORE[key])
                    return 1
                })
            )
    )
    console.info('[Lost Expeditions] Command registered')
})

// Give written book - 1.21.1 format
function giveWrittenBook(player, lore) {
    try {
        // Build pages - REMOVE all quotes and backslashes (escaping breaks SNBT)
        var pages = []
        for (var i = 0; i < lore.pages.length; i++) {
            var t = String(lore.pages[i])
            // Remove ALL problematic characters - don't try to escape
            t = t.replace(/\\/g, '')
            t = t.replace(/"/g, '')
            t = t.replace(/'/g, '')
            pages.push("'{\"text\":\"" + t + "\"}'")
        }

        // Also clean title and author
        var title = lore.title.replace(/["'\\]/g, '')
        var author = lore.author.replace(/["'\\]/g, '')

        var snbt = 'minecraft:written_book[written_book_content={pages:[' + pages.join(',') + '],title:"' + title + '",author:"' + author + '",resolved:1b}]'

        console.info('[Lost Expeditions] Creating: ' + title)

        var book = Item.of(snbt)

        if (book && !book.isEmpty()) {
            player.give(book)
            player.tell(Text.of('Recebeu: ' + lore.title))
        } else {
            player.give(Item.of('minecraft:book'))
            player.tell(Text.of('Livro: ' + lore.title))
        }
    } catch (e) {
        console.error('[Lost Expeditions] Error: ' + e)
        player.give(Item.of('minecraft:writable_book'))
    }
}

console.info('[Lost Expeditions] Loaded')
