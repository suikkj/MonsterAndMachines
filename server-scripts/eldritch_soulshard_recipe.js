// Priority: 0
// Eldritch Soul Shard — Recipe Override
// Replaces irons_spellbooks:divine_soulshard with crystal_chronicles:voidstone_shard

ServerEvents.recipes(function (event) {
    // Remove specifically the recipe that uses divine_soulshard to avoid breaking the liquid malice recipe
    event.remove({ type: 'irons_spellbooks:alchemist_cauldron_brew', input: 'irons_spellbooks:divine_soulshard' })

    // Adiciona a nova receita usando o formato interno "alchemist_cauldron_brew"
    event.custom({
        type: 'irons_spellbooks:alchemist_cauldron_brew',
        base_fluid: {
            id: 'discerning_the_eldritch:liquid_malice',
            amount: 1000
        },
        input: {
            item: 'crystal_chronicles:voidstone_shard'
        },
        results: [
            {
                id: 'discerning_the_eldritch:liquid_malice',
                amount: 50
            }
        ],
        byproduct: {
            id: 'discerning_the_eldritch:eldritch_soul_shard',
            count: 1
        }
    })
})
