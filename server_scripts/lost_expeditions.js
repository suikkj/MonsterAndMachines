// Priority: 0
// File: kubejs/server_scripts/lost_expeditions.js
// Lore books from the 12 lost expedition groups before Group No. 13

// ============ LORE BOOK CONTENT ============
// Each group has their story told through notes found in ruins

var EXPEDITION_LORE = {
    group1: {
        title: 'Grupo de Expedição',
        author: 'Sunny Dantas',
        pages: [
            'Dia 1 - Finalmente saímos do Refúgio Cigarra após 2.740 anos. A superfície é... como foi descrito pelos cientistas da "T.U.R.". Ainda sim, é difícil acreditar que isso é o que restou. Em livros e fotografias, eu e o Nimbus sempre víamos como o mundo era antigamente. Os reinos. As árvores. Como que construções tão grandiosas se tornaram... apenas ruínas. Cascas vazias de algo que já foi cheio de vida.',
            'Dia 2 - A dificuldade avisada antes de sair, antes poderia apenas parecer exagero, mas agora eu entendo. Dormir na superfície.. Sequer se manter nela parece uma tarefa difícil. Diria impossível, dada a missão que nos foi dada. Não consigo ver esperança para essa terra. Não agora. Uma terra infértil, onde toda a vida foi sugada. É difícil entender se essa terra quer me sugar junto com o resto da vida ao redor.',
            'Dia 4 - Saímos para procurar na superfície. Realmente as dicas que a "T.U.R." deu eram úteis. Ouro é realmente a chave para algumas coisas, mesmo que temporariamente. Encontramos o que parece ser ruínas de uma antiga vila. Me pergunto o que permitiu algumas construções se manterem mais do que outras. Foi sorte? Foi um outro povo que vivia aqui? Ou houve algum ato nisso. Independente, vamos tent-',
            'Tem alguém aqui.'
        ]
    },
    group2: {
        title: 'Relatório do Grupo de Expedição - 2',
        author: 'Dr. Lynnus ',
        pages: [
            'Início da Expedição:Data: 26/09/5912',
            'Início da Expedição sob a superfície remanescente de Asttär. Durante as investigações, percebi índicies de algumas ruínas e marcas que levam a crer que a localização do Refúgio Cigarra se localizada a poucos quilômetros da capital. É possível analisar facilmente como o Vírus VALID-71 ("Vazio") tem sua preferência e foco por aquilo que é vivo e possui consciência. Acredito eu que moradores do lixão estariam a salvo nessas terras desoladas. Brincadeiras a parte, é, no mínimo, curioso ver até onde esse vírus pode ir. Com as pesquisas sobre o possível envolvimento humano na criação desse vírus me trás um medo e ao mesmo tempo um facínio vindos da mesma pergunta. "Por que?"',
            'Foram coletadas amostras do VALID-71 de áreas diferentes. Das áreas completamente consumidas até as que se mantiveram de pé, mesmo que em ruínas. Enviaremos isso ao Refúgio Cigarra para que enviem a cientista do Refúgio Cobra. Talvez as amostras possam mostrar resultados em suas pesquisas.',
            'Meu companheiro de Expedição Thomas veio comunicar que, durante suas explorações sobre diferentes ruínas, ele parece ter encontrado alguém. Suas vestes e aparências não pareciam ter vindo de um Refúgio. Pelo menos não os refúgios que conhecemos. Irei imediatamente com ele ao local de encontro. Talvez possamos ter respostas.',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            'Agora consigo entender. Parece que... tudo isso foi algum tipo de piada cósmica sobre nós, não é? Dançamos a sua dança como você queria, universo. Tudo bem... Se é isso que você quer, não só para mim, mas para todos que ousarem pisar nas terras que você tomou com suas rédeas de aço, não irei intervir. Apenas deixo um aviso, caso há leitores que tenham sido burros o suficiente de pisar para fora do Refúgio por livre e espontânea vontade: Independente do que você escutar, não confie Nele. Você não vai conseguir enganar Ele. Muito menos arrancar algo Dele. Indepentende do que ele te disser, não escute Ele.'
        ]
    },
    group3: {
        title: 'Galera Expedicionária - Terceira Edição',
        author: 'Carlito',
        pages: [
            'Já que o pessoal do Refúgio vai ler essas anotações quando a gente voltar, queria enfatizar A MISÉRIA DE SUPRIMENTO. ELES NOS MANDAM PRA MORTE E O MÁXIMO QUE CONSEGUEM MANDAR É COMIDA PRA UMA SEMANA? NO MÁXIMO. Ficam falando sobre "Racionamento de Recursos" mas eu sei que no castelo eles devem comer até encher a pança. Não são eles que tem que ficar comendo ração molhada com gosto de sapato. Então, querido Governo da República de Asttär e querido pessoal da T.U.R., peço encarecidamente para que vocês chupem uma rola do tamanho do ego de vocês. Prefiro morrer aqui do que dar algo minimante útil pra vocês.'
        ]
    },
    group4: {
        title: 'Mensagem do Grupo 4',
        author: 'Sargento Almeida',
        pages: [
            'Encontramos os corpos do Grupo 1. Não... não eram mais corpos. Eram... esculturas de escuridão.',
            'A substância - eles a chamam de "Vazio" - ela não apenas mata. Ela CONSOME.',
            'Perdemos três membros hoje. Um deles... ainda caminha. Mas não é mais ele.'
        ]
    },
    group5: {
        title: 'Diário Científico - G5',
        author: 'Prof. Medeiros',
        pages: [
            'Hipótese confirmada: o Vazio é atraído por som e movimento. Quanto mais barulho, mais rápido ele se espalha.',
            'As criaturas da superfície - zumbis, esqueletos - elas servem ao Vazio. Quando morrem, espalham mais corrupção.',
            'Ouro é a chave. O metal dourado parece "purificar" áreas contaminadas. Mas é tão raro...'
        ]
    },
    group6: {
        title: 'Registro do Grupo 6',
        author: 'Capitã Rocha',
        pages: [
            'Seguindo as notas do Grupo 5. O ouro realmente funciona, mas não é garantido. Às vezes falha.',
            'Descoberta: armas de ouro matam criaturas sem espalhar o Vazio. Crucial para sobrevivência.',
            'Estamos cercados. O Vazio cresce mais rápido do que podemos purificar. Enviando este registro de volta.'
        ]
    },
    group7: {
        title: 'Último Relatório - G7',
        author: 'Tenente Costa',
        pages: [
            'O Refúgio precisa saber: NÃO USEM MÁQUINAS BARULHENTAS PERTO DO VAZIO.',
            'Nossas fornalhas, nossos motores, nossos geradores - todos atraíram uma onda de corrupção.',
            'Há algo maior lá fora. Algo que caça pelo som. Ouvimos seus passos... pesados... lentos...'
        ]
    },
    group8: {
        title: 'Fragmento - Grupo 8',
        author: 'Desconhecido',
        pages: [
            'dia 12 ou 13, perdi a conta',
            'o warden veio. É real. É como as histórias antigas.',
            'ele não vem pelo vazio. ele É o vazio.'
        ]
    },
    group9: {
        title: 'Súplica do Grupo 9',
        author: 'Sobrevivente',
        pages: [
            'Se você encontrar isso, NÃO VENHA nos procurar.',
            'Os templos do deserto têm tecnologia antiga. As minas têm mais. O Deep Dark tem... tudo.',
            'Mas o custo é alto demais. O Vazio é mais forte lá.',
            'Voltem. Digam ao Refúgio para fechar as portas.'
        ]
    },
    group10: {
        title: 'Código do Grupo 10',
        author: 'FRAGMENTO_CORROMPIDO',
        pages: [
            '01100001 01101010 01110101 01100100 01100001',
            'TRADUÇÃO: A-J-U-D-A',
            'As máquinas antigas... elas ainda funcionam. Mas estão... conscientes.',
            'Os monstros do Cataclysm. São reais. E são nossa única esperança.'
        ]
    },
    group11: {
        title: 'Testamento - Grupo 11',
        author: 'Padre Miguel',
        pages: [
            'Em nome de todos os que vieram antes, deixo este registro.',
            'Aprendemos muito. O ouro purifica. O silêncio salva. A noite é mortal.',
            'Mas há esperança. Nas ruínas Tech Tier 4, há algo que pode reverter tudo.',
            'Que o Grupo 12 tenha mais sorte do que nós.'
        ]
    },
    group12: {
        title: 'Nota Final',
        author: '???',
        pages: [
            'O ouro não foi suficiente.',
            '',
            '',
            'Corra.'
        ]
    }
}

// ============ ADD BOOKS TO LOOT TABLES ============
LootJS.modifiers(function (event) {
    // In KubeJS 1.21+, we use simple books since written_book with custom NBT
    // requires complex component syntax that isn't fully supported
    // Using enchanted books with custom names as placeholder lore items

    function createLoreBook(groupKey) {
        var lore = EXPEDITION_LORE[groupKey]
        if (!lore) {
            return 'minecraft:book'
        }
        // Return a simple book - the lore content would need a mod like Patchouli
        // or in-game commands to set properly
        return 'minecraft:written_book'
    }

    // Add simple written books to structure loot tables
    // Note: Full lore book functionality requires additional setup
    var structureTables = [
        /.*chests\/village.*/,
        /.*chests\/simple_dungeon.*/,
        /.*chests\/abandoned_mineshaft.*/,
        /.*chests\/stronghold.*/,
        /.*chests\/desert_pyramid.*/,
        /.*chests\/jungle_temple.*/,
        /.*chests\/pillager_outpost.*/,
        /.*chests\/woodland_mansion.*/,
        /.*chests\/ancient_city.*/,
        /.*chests\/bastion.*/,
        /.*chests\/nether_bridge.*/,
        /.*chests\/end_city.*/,
        /.*yung.*/,
        /.*dungeon.*/,
        /.*ruin.*/,
        /.*tower.*/
    ]

    // Add lore books with 15% chance
    event.addTableModifier(structureTables)
        .randomChance(0.15)
        .addLoot('minecraft:book')

    // Ancient City specifically has higher chance (35%)
    event.addTableModifier(/.*ancient_city.*/)
        .randomChance(0.35)
        .addLoot('minecraft:book')

    console.log('[Lost Expeditions] Registered lore books to structure loot tables (simplified for 1.21)')
})
