// Quest Stages - Notificações de Progressão
// Quando uma quest é completada, notifica o jogador sobre novas receitas
// Não precisa mais de AStages - a verificação é feita diretamente via quest_recipes.js
//
// Como funciona:
// 1. FTBQuestsEvents.completed detecta quando uma quest é completada
// 2. Envia mensagem de notificação ao jogador
// 3. quest_recipes.js verifica diretamente a API do FTB Quests para bloquear/liberar receitas

// Mapa de Quest ID -> Stage Name (extraído dos arquivos .snbt)
const QUEST_STAGE_MAP = {
    // ============================================
    // ADAPTAÇÃO - Tutorial/Início
    // ============================================
    // 553E2178224A1375 = Entrega raw_gold (dá creative_chronometer) - desbloqueia paths
    '553E2178224A1375': 'stage_tutorial_completo',

    // ============================================
    // MAGO - Path de Magia
    // ============================================

    // 37FAF4A9BBA5B912 = Entrega creative_chronometer (mago)
    '37FAF4A9BBA5B912': 'stage_mago_entrada',

    // 75D26FBBF5811AFC = Entrega novice_spell_book
    '75D26FBBF5811AFC': 'stage_mago_novato',

    // 3F9C9F557D11B686 = Entrega inscription_table + scribes_table
    '3F9C9F557D11B686': 'stage_mago_mesa',

    // 7ADB2ED7F4D9FD84 = Entrega dowsing_rod
    '7ADB2ED7F4D9FD84': 'stage_mago_dowsing',

    // 4A873E74833611EC = Entrega imbuement_chamber + amethyst + lapis
    '4A873E74833611EC': 'stage_mago_imbuement',

    // 73A8B81BCE0DB385 = Entrega source_gem
    '73A8B81BCE0DB385': 'stage_mago_source',

    // 5A9CE15749E5D019 = Entrega arcane_pedestal
    '5A9CE15749E5D019': 'stage_mago_pedestal',

    // 18FF047AE6550B65 = Entrega volcanic_sourcelink + source_jar + archwood
    '18FF047AE6550B65': 'stage_mago_sourcelink',

    // 7A010FEF305C5109 = Entrega enchanting_apparatus + arcane_core + pedestals
    '7A010FEF305C5109': 'stage_mago_apparatus',

    // 64F764A8FD782673 = Entrega enchanted_books
    '64F764A8FD782673': 'stage_mago_enchanting',

    // 3900A9A2ECB1D3A2 = Entrega magebloom_crop
    '3900A9A2ECB1D3A2': 'stage_mago_magebloom',

    // Armaduras Ars Nouveau
    '126C5E8D6D89060A': 'stage_mago_arcanist',
    '0C697CA67F0CE0C9': 'stage_mago_battlemage',
    '2ED4893CA6D8DB03': 'stage_mago_sorcerer',

    // 29C8DA6AB62E06A3 = Alteration table + blank_thread
    '29C8DA6AB62E06A3': 'stage_mago_alteration',

    // Iron's Spellbooks
    // 3365DF943A086AD8 = Entrega scroll_forge
    '3365DF943A086AD8': 'stage_mago_forge',

    // 133B4F2403B893EA = Entrega alchemist_cauldron
    '133B4F2403B893EA': 'stage_mago_cauldron',

    // 4B90BD3AAF1264F8 = Entrega arcane_anvil
    '4B90BD3AAF1264F8': 'stage_mago_anvil',

    // 3CF1768AC9512C28 = Entrega magic_cloth
    '3CF1768AC9512C28': 'stage_mago_cloth',

    // 6D85AEEFCD9FAA36 = Wizard armor completa
    '6D85AEEFCD9FAA36': 'stage_mago_wizard',

    // ============================================
    // GUERREIRO - Path de Combate
    // ============================================

    // 09715FE225BCFC43 = Entrega creative_chronometer (guerreiro)
    '09715FE225BCFC43': 'stage_guerreiro_entrada',

    // 539AEA7361A1E92C = Tower key (sunset wings)
    '539AEA7361A1E92C': 'stage_guerreiro_twilight',

    // 3E62D4148A332755 = Tower key (obsidian claymore)
    '3E62D4148A332755': 'stage_guerreiro_melee',

    // 6F66E95793BA0B29 = Tower key (tidal bow)
    '6F66E95793BA0B29': 'stage_guerreiro_ranged',

    // Boss Factory items
    '509658E28E2C299C': 'stage_guerreiro_large_sword',
    '3C9CAE104E4AD5E3': 'stage_guerreiro_warrior',
    '5C419C70EEB7FF8C': 'stage_guerreiro_knight_armor',

    // 012412CA67EE4A75 = Kill Nightmare Stalker
    '012412CA67EE4A75': 'stage_guerreiro_nightmare',

    // 7255900565BEC0F4 = Nightmare scythe
    '7255900565BEC0F4': 'stage_guerreiro_scythe',

    // 72709FB2B59CBAFF = Great chalice + goblets + essence
    '72709FB2B59CBAFF': 'stage_guerreiro_knight',

    // Knight Quest armors
    '7DE923A89DE4310A': 'stage_guerreiro_silver',
    '385D83A79C4D0F5B': 'stage_guerreiro_deepslate',
    '6FE922BD9459D2BC': 'stage_guerreiro_spider',
    '6140D73115CA5184': 'stage_guerreiro_creeper',
    '0713D22260585AC2': 'stage_guerreiro_shinobi',

    // Simply Swords uniques
    '192E75847764E36E': 'stage_guerreiro_watcher',
    '3DD33DB8E83DA384': 'stage_guerreiro_waxweaver',
    '3FA854537C384EEB': 'stage_guerreiro_shadowsting',
    '766E2BC79ECBE8DB': 'stage_guerreiro_vessel',
    '44A4739F0914932F': 'stage_guerreiro_grandfrost',

    // ============================================
    // ENGENHEIRO - Path de Create/IE
    // ============================================

    // 7FDE81CC55CA581F = Entrega creative_chronometer (engenheiro)
    '7FDE81CC55CA581F': 'stage_engenheiro_entrada',

    // 27799CC99A40AF21 = Andesite + iron
    '27799CC99A40AF21': 'stage_engenheiro_materiais',

    // 3E79942CE2344294 = Cogwheels + water wheel
    '3E79942CE2344294': 'stage_engenheiro_cogwheels',

    // 73C4635E4EDC4D4E = Andesite casing
    '73C4635E4EDC4D4E': 'stage_engenheiro_casing',

    // 45601948B91E6CCB = Press + depot + water wheel + gearboxes
    '45601948B91E6CCB': 'stage_engenheiro_basico',

    // 341716B8A5685E10 = Mixer + basin
    '341716B8A5685E10': 'stage_engenheiro_mixer',

    // 49B5B326035ED365 = Cardboard armor + sword
    '49B5B326035ED365': 'stage_engenheiro_cardboard',

    // 58F344ACF982BFEC = Gyrodyne
    '58F344ACF982BFEC': 'stage_engenheiro_gyrodyne',

    // 54146588EC313FE6 = Blast bricks
    '54146588EC313FE6': 'stage_engenheiro_blast',

    // 0AF3CECDAE5541F7 = IE steel setup
    '0AF3CECDAE5541F7': 'stage_engenheiro_steel',

    // 2C1FB11A91F633BC = Deployer
    '2C1FB11A91F633BC': 'stage_engenheiro_deployer',

    // 5C9BB2FBA82B9952 = Brass casing
    '5C9BB2FBA82B9952': 'stage_engenheiro_brass',

    // 3F04085F680A4D2B = Hypertube system
    '3F04085F680A4D2B': 'stage_engenheiro_hypertube',

    // 082B87D9A513747E = Biplane
    '082B87D9A513747E': 'stage_engenheiro_biplane',

    // 040D0A848D045F18 = Cloche
    '040D0A848D045F18': 'stage_engenheiro_cloche',

    // 4E3464CD3EFBAB27 = Faraday armor
    '4E3464CD3EFBAB27': 'stage_engenheiro_faraday',

    // 68A8F6A90B18A669 = Steampunk armor
    '68A8F6A90B18A669': 'stage_engenheiro_steampunk',

    // 522C0FA9254657C2 = HV capacitor + components
    '522C0FA9254657C2': 'stage_engenheiro_hv',

    // 2B8BD742CA3DB2BB = Railgun
    '2B8BD742CA3DB2BB': 'stage_engenheiro_railgun',

    // 7BEDBFD13BF166F6 = Mechanical crafters + speed controller
    '7BEDBFD13BF166F6': 'stage_engenheiro_avancado',

    // Gadgets Create
    '2FF0FB35DDCE7F97': 'stage_engenheiro_potato_cannon',
    '15406F3937F9DA86': 'stage_engenheiro_symmetry',
    '3E049B420B320FF7': 'stage_engenheiro_extendo',

    // 3F279A73E53871C4 = Goggles
    '3F279A73E53871C4': 'stage_engenheiro_goggles',

    // 6D7D86AA100FE8C6 = Windmill
    '6D7D86AA100FE8C6': 'stage_engenheiro_windmill',

    // 7711C7D44E788C62 = Create New Age básico
    '7711C7D44E788C62': 'stage_engenheiro_newage',

    // 24424B49574D260A = Solar heating + stirling
    '24424B49574D260A': 'stage_engenheiro_solar',

    // 3612BE384C17084C = Steam engine
    '3612BE384C17084C': 'stage_engenheiro_steam'
}

// Evento: Quando uma quest é completada
FTBQuestsEvents.completed(event => {
    var questId = event.object.id
    var player = event.player

    // Verifica se essa quest tem receitas associadas
    if (QUEST_STAGE_MAP[questId]) {
        console.info('[Quest Stages] Player ' + player.name.getString() + ' completed quest: ' + questId)

        // Mensagem para o jogador
        player.tell(Text.of('§a[Progressão] §fVocê desbloqueou novas receitas!'))
    }
})

// Comando para verificar quests do jogador (debug)
ServerEvents.commandRegistry(event => {
    var Commands = event.commands
    var StringArgument = Java.loadClass('com.mojang.brigadier.arguments.StringArgumentType')
    var Long = Java.loadClass('java.lang.Long')

    // Função helper para verificar quest diretamente via FTB Quests API
    function checkQuestCompleted(player, questIdHex) {
        try {
            var FTBQuestsAPI = Java.loadClass('dev.ftb.mods.ftbquests.api.FTBQuestsAPI')
            var api = FTBQuestsAPI.api()
            var questFile = api.getQuestFile(false)

            if (!questFile) return false

            var questIdLong = Long.parseUnsignedLong(questIdHex, 16)
            var quest = questFile.getQuest(questIdLong)
            if (!quest) return false

            var teamData = questFile.getOrCreateTeamData(player)
            if (!teamData) return false

            return teamData.isCompleted(quest)
        } catch (e) {
            return false
        }
    }

    event.register(Commands.literal('queststages')
        .then(Commands.literal('list')
            .executes(ctx => {
                var player = ctx.source.player
                if (player) {
                    player.tell(Text.of('§e[Quest Stages] §fSuas quests completadas:'))

                    // Lista todas as quests definidas e verifica quais foram completadas
                    var questSet = {}
                    Object.keys(QUEST_STAGE_MAP).forEach(function (questId) {
                        if (!questSet[questId]) {
                            questSet[questId] = true
                            if (checkQuestCompleted(player, questId)) {
                                var stageName = QUEST_STAGE_MAP[questId]
                                player.tell(Text.of('§a✓ ' + stageName + ' §7(' + questId + ')'))
                            }
                        }
                    })
                }
                return 1
            })
        )
        .then(Commands.literal('listall')
            .executes(ctx => {
                var player = ctx.source.player
                if (player) {
                    player.tell(Text.of('§e[Quest Stages] §fTodas as quests de progressão:'))

                    var questSet = {}
                    Object.keys(QUEST_STAGE_MAP).forEach(function (questId) {
                        if (!questSet[questId]) {
                            questSet[questId] = true
                            var has = checkQuestCompleted(player, questId)
                            var stageName = QUEST_STAGE_MAP[questId]
                            player.tell(Text.of((has ? '§a✓ ' : '§c✗ ') + stageName))
                        }
                    })
                }
                return 1
            })
        )
        .then(Commands.literal('check')
            .then(Commands.argument('questId', StringArgument.word())
                .executes(ctx => {
                    var player = ctx.source.player
                    var questId = StringArgument.getString(ctx, 'questId')

                    if (player) {
                        if (checkQuestCompleted(player, questId)) {
                            player.tell(Text.of('§a[Quest Stages] §fQuest §e' + questId + ' §f está §acompletada'))
                        } else {
                            player.tell(Text.of('§c[Quest Stages] §fQuest §e' + questId + ' §f§cnão está completada'))
                        }
                    }
                    return 1
                })
            )
        )
    )
})

console.info('[Quest Stages] System loaded - ' + Object.keys(QUEST_STAGE_MAP).length + ' quest mappings (AStages-free)')
