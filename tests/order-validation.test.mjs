import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrderSchema, updateOrderSchema } from '../lib/order-validation.ts';

const response = {customerName:'Test participant',customerEmail:'participant@example.com',orderDate:'2026-10-12',chocolate:1,lemon:0,mango:0,raspberry:0,pickupWindow:'09-11',priceAcknowledged:true,requestKey:'cccb191b-58c7-4560-ab11-dc881598bfe2'};

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

test('New orders require a valid contact email and trim surrounding spaces', () => {
  for (const customerEmail of ['', '   ', null, undefined, 'not-an-email', 'person@', 'person@example.com\nBcc:other@example.com', `${'x'.repeat(250)}@example.com`]) {
    assert.equal(createOrderSchema.safeParse({...response,customerEmail}).success, false);
  }
  assert.equal(createOrderSchema.parse({...response,customerEmail:' participant+cake@example.com '}).customerEmail, 'participant+cake@example.com');
});

test('Admin edits accept legacy orders without email and validate supplied addresses', () => {
  const {requestKey,priceAcknowledged,...fields}=response;
  for (const customerEmail of ['', null, undefined]) {
    assert.equal(updateOrderSchema.parse({...fields,customerEmail,version:1}).customerEmail, null);
  }
  assert.equal(updateOrderSchema.safeParse({...fields,customerEmail:'invalid',version:1}).success, false);
});
