const test = require("node:test");
const assert = require("node:assert");

const BASE = "http://localhost:4000";

test("health endpoint", async () => {
  const response = await fetch(`${BASE}/api/health`);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.ok, true);
});

test("shops endpoint returns demo shops", async () => {
  const response = await fetch(`${BASE}/api/shops`);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.ok(Array.isArray(data));
  assert.ok(data.length > 0);
});

test("prediction endpoint calculates estimated days", async () => {
  const response = await fetch(`${BASE}/api/predictions/1`);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.ok(data[0].estimatedDays >= 0);
  assert.ok(data[0].risk);
});
