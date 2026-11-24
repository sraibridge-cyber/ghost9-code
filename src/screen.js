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

// Count nodes by what they are, not by what they are not. The four buckets are exhaustive
// over the values this system writes (legacy `undefined` resolves to 'passed'), so
// total === passed + released + pending + quarantined holds by construction on any state.
// A screen value the system does not write falls to quarantined: it is neither served nor
// pending, and counting it as either would be a false claim about it.
function screenCounts(nodes) {
  const counts = { passed: 0, released: 0, pending: 0, quarantined: 0 };
  for (const node of nodes || []) {
    const s = screenOf(node);
    if (s === 'passed') counts.passed++;
    else if (s === 'released') counts.released++;
    else if (s === 'pending') counts.pending++;
    else counts.quarantined++;
  }
  return counts;
}

module.exports = { screenOf, isServed, mayServeContent, screenCounts, SERVABLE };
