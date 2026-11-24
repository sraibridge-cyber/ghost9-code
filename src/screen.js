// === Ghost9 screening predicate (BRIEF 005, S1) ===
// One job: may this node's content be served?
//
// screen: 'passed' | 'released'   -> servable
//         'pending'               -> stored, unscreened, listed as a record, never read
//         'quarantined' | 'held'  -> stored, held, never read
//         undefined               -> legacy node, written before screening existed: servable
//
// Both doors import this: GET /nodes and GET /recall (src/ghost_face.js, src/ghost_kernel.js).
// No second copy of the rule, no default buried in a filter expression.
'use strict';

const SERVABLE = new Set(['passed', 'released']);

// The node's screening status, with the legacy case resolved once.
function screenOf(node) {
  if (!node || node.screen === undefined || node.screen === null) return 'passed';
  return node.screen;
}

// May this node take part in propagation: served, swept, merged, indexed?
function isServed(node) {
  return mayServeContent(node);
}

// May this node's text leave the system? This is the predicate. Everything else delegates to it.
function mayServeContent(node) {
  return SERVABLE.has(screenOf(node));
}

module.exports = { screenOf, isServed, mayServeContent, SERVABLE };
