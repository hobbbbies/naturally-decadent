import test from 'node:test';
import assert from 'node:assert/strict';
import { money, UNIT_PRICE_CENTS } from '../lib/catalog.ts';

test('Stored integer cents display as CAD dollars on forms, receipts and admin rows',()=>{
  assert.equal(money(0),'$0.00');
  assert.equal(money(UNIT_PRICE_CENTS),'$5.50');
  assert.equal(money(2*UNIT_PRICE_CENTS),'$11.00');
  assert.equal(money(99*4*UNIT_PRICE_CENTS),'$2,178.00');
});
