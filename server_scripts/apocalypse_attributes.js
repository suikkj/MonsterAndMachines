// Priority: 0
// File: kubejs/server_scripts/apocalypse_attributes.js
// Apocalypse mob behavior: enhanced aggression and pursuit

EntityEvents.spawned(event => {
    const entity = event.entity
    if (!entity.isLiving()) return

    // Configuration
    const RANGE_HUNTER = 64.0      // Standard hostile mob range
    const RANGE_PREDATOR = 96.0    // Aggressive predator range
    const RANGE_WARDEN = 128.0     // Warden detection range

    const setMobAttributes = (mob, attributes) => {
        mob.mergeNbt({
            Attributes: attributes
        })
    }

    const type = entity.type.toString()

    // ========================================
    // WARDEN - The Apocalypse Guardian
    // ========================================
    if (type === 'minecraft:warden') {
        // Warden: 1000 HP, massive range, fast movement
        entity.mergeNbt({
            Attributes: [
                { Name: "minecraft:generic.max_health", Base: 1000 },
                { Name: "minecraft:generic.follow_range", Base: RANGE_WARDEN },
                { Name: "minecraft:generic.movement_speed", Base: 0.4 },
                { Name: "minecraft:generic.attack_damage", Base: 45 },
                { Name: "minecraft:generic.knockback_resistance", Base: 1.0 }
            ],
            Health: 1000
        })
        // Heal to full after attribute change
        entity.heal(1000)
        return
    }

    // ========================================
    // SPIDERS (Vanilla & Nyf's)
    // ========================================
    if (type === 'minecraft:spider' || type === 'minecraft:cave_spider' || type.includes('nyfsspiders')) {
        setMobAttributes(entity, [
            { Name: "minecraft:generic.follow_range", Base: RANGE_HUNTER },
            { Name: "minecraft:generic.movement_speed", Base: 0.35 }
        ])
        return
    }

    // ========================================
    // CREEPERS (Vanilla & Creeper Overhaul)
    // ========================================
    if (type === 'minecraft:creeper' || type.includes('creeperoverhaul')) {
        setMobAttributes(entity, [
            { Name: "minecraft:generic.follow_range", Base: RANGE_HUNTER }
        ])
        return
    }

    // ========================================
    // ZOMBIES & VARIANTS
    // ========================================
    if (type.includes('zombie') || type.includes('drowned') || type.includes('husk')) {
        setMobAttributes(entity, [
            { Name: "minecraft:generic.follow_range", Base: RANGE_HUNTER }
        ])
        return
    }

    // ========================================
    // SKELETONS & VARIANTS
    // ========================================
    if (type.includes('skeleton') || type.includes('stray')) {
        setMobAttributes(entity, [
            { Name: "minecraft:generic.follow_range", Base: RANGE_HUNTER }
        ])
        return
    }

    // ========================================
    // ENDERMEN
    // ========================================
    if (type.includes('enderman')) {
        setMobAttributes(entity, [
            { Name: "minecraft:generic.follow_range", Base: RANGE_PREDATOR }
        ])
        return
    }

    // ========================================
    // PHANTOMS
    // ========================================
    if (type === 'minecraft:phantom') {
        setMobAttributes(entity, [
            { Name: "minecraft:generic.follow_range", Base: RANGE_PREDATOR }
        ])
        return
    }

    // ========================================
    // MUTANT MONSTERS (Bosses)
    // ========================================
    if (type.includes('mutantmonsters')) {
        setMobAttributes(entity, [
            { Name: "minecraft:generic.follow_range", Base: RANGE_PREDATOR }
        ])
        return
    }

    // ========================================
    // BOSSES (Cataclysm and others)
    // ========================================
    if (type.includes('cataclysm') || type.includes('boss')) {
        setMobAttributes(entity, [
            { Name: "minecraft:generic.follow_range", Base: RANGE_PREDATOR }
        ])
        return
    }

    // ========================================
    // BORN IN CHAOS MOBS
    // ========================================
    if (type.includes('born_in_chaos')) {
        setMobAttributes(entity, [
            { Name: "minecraft:generic.follow_range", Base: RANGE_HUNTER }
        ])
        return
    }

    // ========================================
    // GENERAL HOSTILE MOBS
    // ========================================
    // For any other hostile mob, increase follow range
    if (entity.isMonster && entity.isMonster()) {
        setMobAttributes(entity, [
            { Name: "minecraft:generic.follow_range", Base: RANGE_HUNTER }
        ])
    }
})