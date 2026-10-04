// Self-check for the Return Guarantee rule. Run with: npx tsx src/lib/returnGuarantee.test.ts
// No test framework is used; plain node:assert only.
import assert from 'node:assert/strict';
import { fitsReturnGuarantee } from './returnGuarantee';

let passed = 0;

function check(name: string, actual: unknown, expected: unknown): void {
  assert.deepStrictEqual(actual, expected);
  passed += 1;
  console.log(`ok - ${name}`);
}

// 10:00 + 120min ends 12:00; latest back 13:00 - 45min = 12:15 -> fits, 15 min slack
check('fits with slack', fitsReturnGuarantee('10:00', 120, '13:00'), {
  fits: true,
  slackMin: 15,
});

// Exact boundary: 10:00 + 120min = 12:00; latest back 12:45 - 45min = 12:00 -> fits, slack 0
check('exact boundary fits', fitsReturnGuarantee('10:00', 120, '12:45'), {
  fits: true,
  slackMin: 0,
});

// One minute over the boundary: latest back 12:44 - 45min = 11:59 -> does not fit
check('one minute over does not fit', fitsReturnGuarantee('10:00', 120, '12:44'), {
  fits: false,
  slackMin: -1,
});

// Clearly does not fit: 15:30 + 180min = 18:30; latest back 17:00 - 45min = 16:15
check('clearly does not fit', fitsReturnGuarantee('15:30', 180, '17:00'), {
  fits: false,
  slackMin: -135,
});

// Large slack: 09:00 + 120min = 11:00; latest back 18:00 - 45min = 17:15
check('large slack fits', fitsReturnGuarantee('09:00', 120, '18:00'), {
  fits: true,
  slackMin: 375,
});

// Departure before the trip could even end: 20:00 + 60min = 21:00; latest back 19:00 - 45min = 18:15
check('departure before trip end does not fit', fitsReturnGuarantee('20:00', 60, '19:00'), {
  fits: false,
  slackMin: -165,
});

// Evening slot: 16:30 + 180min = 19:30; latest back 21:30 - 45min = 20:45 -> fits, 75 min slack
check('evening slot fits', fitsReturnGuarantee('16:30', 180, '21:30'), {
  fits: true,
  slackMin: 75,
});

console.log(`\nAll ${passed} return-guarantee checks passed.`);
