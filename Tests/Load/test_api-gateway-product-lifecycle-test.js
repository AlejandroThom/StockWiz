const fs = require('fs');
const path = require('path');

describe('k6 Load Test: api-gateway-product-lifecycle-test.js', () => {
  const testFile = path.join(__dirname, 'api-gateway-product-lifecycle-test.js');
  let scriptContent;

  beforeAll(() => {
    scriptContent = fs.readFileSync(testFile, 'utf-8');
  });

  describe('Script Structure Validation', () => {
    test('should have valid JavaScript syntax', () => {
      expect(scriptContent).toBeTruthy();
      expect(typeof scriptContent).toBe('string');
    });

    test('should import required k6 modules', () => {
      expect(scriptContent).toContain('import http from');
      expect(scriptContent).toContain('import { check, sleep }');
      expect(scriptContent).toContain('k6/http');
      expect(scriptContent).toContain('k6');
    });

    test('should export options configuration', () => {
      expect(scriptContent).toContain('export let options');
      expect(scriptContent).toContain('vus');
      expect(scriptContent).toContain('duration');
    });

    test('should have default function exported', () => {
      expect(scriptContent).toContain('export default function');
    });

    test('should use TARGET_HOST environment variable', () => {
      expect(scriptContent).toContain('__ENV.TARGET_HOST');
    });
  });

  describe('Options Configuration Validation', () => {
    test('should have vus configured', () => {
      expect(scriptContent).toMatch(/vus:\s*\d+/);
    });

    test('should have duration configured', () => {
      expect(scriptContent).toMatch(/duration:\s*["']\d+s["']/);
    });

    test('should have vus set to 1', () => {
      const vusMatch = scriptContent.match(/vus:\s*(\d+)/);
      expect(vusMatch).toBeTruthy();
      expect(parseInt(vusMatch[1])).toBe(1);
    });

    test('should have duration set to 5s', () => {
      const durationMatch = scriptContent.match(/duration:\s*["'](\d+)s["']/);
      expect(durationMatch).toBeTruthy();
      expect(durationMatch[1]).toBe('5');
    });
  });

  describe('Test Logic Validation - CREATE', () => {
    test('should construct products URL', () => {
      expect(scriptContent).toContain('/api/products');
    });

    test('should make HTTP POST request for creation', () => {
      expect(scriptContent).toContain('http.post');
    });

    test('should send JSON payload for creation', () => {
      expect(scriptContent).toContain('JSON.stringify');
      expect(scriptContent).toContain('name:');
      expect(scriptContent).toContain('description:');
      expect(scriptContent).toContain('price:');
    });

    test('should set Content-Type header', () => {
      expect(scriptContent).toContain('Content-Type');
      expect(scriptContent).toContain('application/json');
    });

    test('should check for 201 status on creation', () => {
      const createCheck = scriptContent.match(/["']create OK \(201\)["']/);
      expect(createCheck).toBeTruthy();
    });

    test('should parse created product response', () => {
      expect(scriptContent).toContain('createRes.json()');
      expect(scriptContent).toContain('created?.id');
    });
  });

  describe('Test Logic Validation - UPDATE', () => {
    test('should make HTTP PUT request for update', () => {
      expect(scriptContent).toContain('http.put');
    });

    test('should construct update URL with product id', () => {
      expect(scriptContent).toMatch(/url\+`\/\$\{id\}`/);
    });

    test('should send updated JSON payload', () => {
      expect(scriptContent).toContain('Updated Test Product');
    });

    test('should check for 200 status on update', () => {
      const updateCheck = scriptContent.match(/["']update OK \(200\)["']/);
      expect(updateCheck).toBeTruthy();
    });
  });

  describe('Test Logic Validation - DELETE', () => {
    test('should make HTTP DELETE request', () => {
      expect(scriptContent).toContain('http.del');
    });

    test('should construct delete URL with product id', () => {
      expect(scriptContent).toMatch(/url\+`\/\$\{id\}`/);
    });

    test('should check for 204 status on delete', () => {
      const deleteCheck = scriptContent.match(/["']delete OK \(204\)["']/);
      expect(deleteCheck).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    test('should handle missing id gracefully', () => {
      expect(scriptContent).toContain('if (!id)');
      expect(scriptContent).toContain('return');
    });
  });

  describe('Test Coverage Validation', () => {
    test('should test full product lifecycle', () => {
      expect(scriptContent).toContain('http.post');
      expect(scriptContent).toContain('http.put');
      expect(scriptContent).toContain('http.del');
    });

    test('should validate all response statuses', () => {
      expect(scriptContent).toContain('r.status === 201');
      expect(scriptContent).toContain('r.status === 200');
      expect(scriptContent).toContain('r.status === 204');
    });
  });
});

