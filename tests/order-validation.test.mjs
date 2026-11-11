import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrderSchema, updateOrderSchema } from '../lib/order-validation.ts';

const response = {customerName:'Test participant',orderDate:'2026-10-12',chocolate:1,lemon:0,mango:0,raspberry:0,pickupWindow:'09-11',priceAcknowledged:true,requestKey:'cccb191b-58c7-4560-ab11-dc881598bfe2'};

test('A complete mock response accepts optional price feedback omitted', () => {
  assert.equal(createOrderSchema.parse(response).priceFeedback, null);
});

test('New responses require pickup and price acknowledgement', () => {
  for (const pickupWindow of ['', null, undefined, 'invalid']) {
    assert.equal(createOrderSchema.safeParse({...response,pickupWindow}).success, false);
  }
  for (const priceAcknowledged of [false, null, undefined, 'true']) {
    assert.equal(createOrderSchema.safeParse({...response,priceAcknowledged}).success, false);
  }
});

test('Existing incomplete responses remain editable without fabricating acknowledgement', () => {
  const {requestKey,priceAcknowledged,...fields}=response;
  assert.equal(updateOrderSchema.safeParse({...fields,pickupWindow:'',version:1}).success, true);
});
