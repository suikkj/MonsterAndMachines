// Priority: 10
// File: kubejs/startup_scripts/sculk_globals.js
// Initialize global shared state for sculk ecosystem
// In KubeJS 1.21, global can only be WRITTEN in startup_scripts
// Server scripts can READ global properties

// ============ SHARED STATE ============
// Emitter positions (shared between sculk_scrubber.js and sculk_spread.js)
global.activeEmitters = {}

// Transmitter positions (shared between sculk_transmitter_spread.js)
global.activeTransmitters = {}

console.info('[Sculk Globals] Shared state initialized — activeEmitters, activeTransmitters')
