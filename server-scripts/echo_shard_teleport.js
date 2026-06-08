// Teleportation delay in ticks (20 ticks = 1 second)
const TELEPORT_DELAY = 60;
const TARGET_DIMENSION = 'cyberspace:darknet_dimension';

// Track players attempting to teleport
let teleportingPlayers = {};

// Event triggered when a player right-clicks with an item
ItemEvents.rightClicked(event => {
    const { player, item, server } = event;

    // Check if the item is an Echo Shard
    if (item.id === 'minecraft:echo_shard') {
        const playerId = player.uuid.toString();
        const currentDim = player.level.dimension.toString();

        // Don't teleport if already in the target dimension
        if (currentDim === TARGET_DIMENSION) {
            player.setStatusMessage([Text.white("Você está no laboratório.")]);
            return;
        }

        // Initialize tracking for the player
        if (!teleportingPlayers[playerId]) {
            teleportingPlayers[playerId] = {
                ticksHeld: 0,
                startDim: currentDim
            };
            player.setStatusMessage([Text.darkRed("Indo para o Laboratório de Heinrich...")]);

            // Play initial sound
            server.runCommandSilent(`playsound minecraft:block.sculk_sensor.clicking player ${player.username} ${player.x} ${player.y} ${player.z} 1.0 0.5`);
        }
    }
});

// Event triggered every tick to process holding actions
PlayerEvents.tick(event => {
    const { player, server, level } = event;
    const playerId = player.uuid.toString();

    // PERFORMANCE: Skip immediately if player is not channeling
    // This makes the handler essentially free for non-channeling players
    if (!teleportingPlayers[playerId]) return;

    const isHoldingShard = player.mainHandItem.id === 'minecraft:echo_shard' || player.offHandItem.id === 'minecraft:echo_shard';
    const isChanneling = isHoldingShard;

    if (isChanneling) {
        teleportingPlayers[playerId].ticksHeld++;

        // Feedback every second
        if (teleportingPlayers[playerId].ticksHeld === 20) {
            player.setStatusMessage([Text.darkRed("Conexão criada")]);
            server.runCommandSilent(`playsound minecraft:block.sculk.charge player ${player.username} ${player.x} ${player.y} ${player.z} 1.0 0.8`);
            server.runCommandSilent(`particle minecraft:sculk_soul ${player.x} ${player.y + 1} ${player.z} 0.5 0.5 0.5 0.1 10 normal @a`);
        } else if (teleportingPlayers[playerId].ticksHeld === 40) {
            player.setStatusMessage([Text.darkRed("Andar 82.")]);
            server.runCommandSilent(`playsound minecraft:entity.warden.heartbeat player ${player.username} ${player.x} ${player.y} ${player.z} 1.0 1.0`);
            server.runCommandSilent(`particle minecraft:sculk_soul ${player.x} ${player.y + 1} ${player.z} 0.5 0.5 0.5 0.2 20 normal @a`);
        }

        // Teleport threshold reached
        if (teleportingPlayers[playerId].ticksHeld >= TELEPORT_DELAY) {
            // Ensure we only teleport once per cycle
            teleportingPlayers[playerId].ticksHeld = 0;
            delete teleportingPlayers[playerId];

            performTeleport(player, server);
        }
    } else {
        // Player unequipped the shard
        if (teleportingPlayers[playerId].ticksHeld > 0) {
            player.setStatusMessage([Text.gray("Conexão perdida.")]);
        }
        delete teleportingPlayers[playerId];
    }
});

function performTeleport(player, server) {
    const px = Math.floor(player.x);
    // The flat world floor (sculk layer) is at Y=64.
    // Always teleport to Y=65 (one block above the floor) to avoid spawning inside solid blocks.
    const py = 65;
    const pz = Math.floor(player.z);

    player.setStatusMessage([Text.darkPurple("Atravessou para outra dimensão.")]);
    server.runCommandSilent(`playsound minecraft:entity.warden.sonic_boom player ${player.username} ${player.x} ${player.y} ${player.z} 1.0 0.8`);

    // 1. Build an Ancient City arrival room in the target dimension BEFORE teleporting
    // We must forceload the chunk first, otherwise fill/setblock commands will fail if the chunk is unloaded
    server.runCommandSilent(`execute in ${TARGET_DIMENSION} run forceload add ${px} ${pz}`);

    // Room: 7x5 interior (9x7 outer), deepslate bricks walls/ceiling, sculk floor, soul lanterns

    // Floor (sculk)
    fillBlocks(server, TARGET_DIMENSION, px - 4, py - 1, pz - 3, px + 4, py - 1, pz + 3, 'minecraft:deepslate_bricks');
    fillBlocks(server, TARGET_DIMENSION, px - 3, py - 1, pz - 2, px + 3, py - 1, pz + 2, 'minecraft:sculk');

    // Ceiling (deepslate bricks)
    fillBlocks(server, TARGET_DIMENSION, px - 4, py + 4, pz - 3, px + 4, py + 4, pz + 3, 'minecraft:deepslate_bricks');

    // Outer walls (deepslate bricks)
    fillBlocks(server, TARGET_DIMENSION, px - 4, py, pz - 3, px - 4, py + 3, pz + 3, 'minecraft:deepslate_bricks'); // west wall
    fillBlocks(server, TARGET_DIMENSION, px + 4, py, pz - 3, px + 4, py + 3, pz + 3, 'minecraft:deepslate_bricks'); // east wall
    fillBlocks(server, TARGET_DIMENSION, px - 4, py, pz - 3, px + 4, py + 3, pz - 3, 'minecraft:deepslate_bricks'); // north wall
    fillBlocks(server, TARGET_DIMENSION, px - 4, py, pz + 3, px + 4, py + 3, pz + 3, 'minecraft:deepslate_bricks'); // south wall

    // Clear the interior air
    fillBlocks(server, TARGET_DIMENSION, px - 3, py, pz - 2, px + 3, py + 3, pz + 2, 'minecraft:air');

    // Soul lanterns in the four ceiling corners
    server.runCommandSilent(`execute in ${TARGET_DIMENSION} run setblock ${px - 3} ${py + 4} ${pz - 2} minecraft:soul_lantern[hanging=true]`);
    server.runCommandSilent(`execute in ${TARGET_DIMENSION} run setblock ${px + 3} ${py + 4} ${pz - 2} minecraft:soul_lantern[hanging=true]`);
    server.runCommandSilent(`execute in ${TARGET_DIMENSION} run setblock ${px - 3} ${py + 4} ${pz + 2} minecraft:soul_lantern[hanging=true]`);
    server.runCommandSilent(`execute in ${TARGET_DIMENSION} run setblock ${px + 3} ${py + 4} ${pz + 2} minecraft:soul_lantern[hanging=true]`);

    // Sculk vein decoration on the inner walls (individual placements)
    server.runCommandSilent(`execute in ${TARGET_DIMENSION} run setblock ${px - 3} ${py + 1} ${pz} minecraft:sculk_vein[west=true]`);
    server.runCommandSilent(`execute in ${TARGET_DIMENSION} run setblock ${px - 3} ${py + 2} ${pz - 1} minecraft:sculk_vein[west=true]`);
    server.runCommandSilent(`execute in ${TARGET_DIMENSION} run setblock ${px + 3} ${py + 1} ${pz + 1} minecraft:sculk_vein[east=true]`);
    server.runCommandSilent(`execute in ${TARGET_DIMENSION} run setblock ${px + 3} ${py + 2} ${pz} minecraft:sculk_vein[east=true]`);

    // 2. Execute the teleport
    // Give player slow falling briefly to prevent any fall damage glitching during the cross-dimensional load
    server.runCommandSilent(`effect give ${player.username} minecraft:slow_falling 5 1 true`);
    server.runCommandSilent(`execute in ${TARGET_DIMENSION} run tp ${player.username} ${px + 0.5} ${py} ${pz + 0.5}`);

    // Remove forceload after teleporting
    server.runCommandSilent(`execute in ${TARGET_DIMENSION} run forceload remove ${px} ${pz}`);

    // Optional: Consume the echo shard (uncomment if desired)
    // if (!player.isCreative()) {
    //     player.mainHandItem.count--;
    // }
}

// Helper to fill blocks cross-dimension
function fillBlocks(server, dim, x1, y1, z1, x2, y2, z2, block) {
    server.runCommandSilent(`execute in ${dim} run fill ${x1} ${y1} ${z1} ${x2} ${y2} ${z2} ${block}`);
}
