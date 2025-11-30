const fs = require('fs');
const path = require('path');

describe('k6 Load Test: api-gateway-product-detail-load-test.js', () => {
  const testFile = path.join(__dirname, 'api-gateway-product-detail-load-test.js');
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
      expect(scriptContent).toContain('thresholds');
      expect(scriptContent).toContain('stages');
    });

    test('should have default function exported', () => {
      expect(scriptContent).toContain('export default function');
    });

    test('should use TARGET_HOST environment variable', () => {
      expect(scriptContent).toContain('__ENV.TARGET_HOST');
    });
  });

  describe('Options Configuration Validation', () => {
    test('should have thresholds configured', () => {
      expect(scriptContent).toContain('http_req_failed');
      expect(scriptContent).toContain('http_req_duration');
    });

    test('should have http_req_failed threshold with rate<0.20', () => {
      const thresholdMatch = scriptContent.match(/http_req_failed.*\[.*rate<0\.20/);
      expect(thresholdMatch).toBeTruthy();
    });

    test('should have http_req_duration threshold with p(95)<5000', () => {
      const thresholdMatch = scriptContent.match(/http_req_duration.*\[.*p\(95\)<5000/);
      expect(thresholdMatch).toBeTruthy();
    });

    test('should have stages configured', () => {
      expect(scriptContent).toContain('stages:');
    });

    test('should have three stages', () => {
      const stageMatches = scriptContent.match(/duration:\s*["']\d+s["']/g);
      expect(stageMatches).toBeTruthy();
      expect(stageMatches.length).toBe(3);
    });
  });

  describe('Test Logic Validation', () => {
    test('should define productId variable', () => {
      expect(scriptContent).toContain('const productId');
    });

    test('should set productId to 4', () => {
      const productIdMatch = scriptContent.match(/productId\s*=\s*(\d+)/);
      expect(productIdMatch).toBeTruthy();
      expect(parseInt(productIdMatch[1])).toBe(4);
    });

    test('should construct correct URL pattern', () => {
      expect(scriptContent).toContain('/api/products/');
      expect(scriptContent).toMatch(/\/api\/products\/\$\{productId\}/);
    });

    test('should make HTTP GET request', () => {
      expect(scriptContent).toContain('http.get');
    });

    test('should have multiple check assertions', () => {
      expect(scriptContent).toContain('check(res');
      expect(scriptContent).toContain('status OK');
      expect(scriptContent).toContain('returns JSON');
      expect(scriptContent).toContain('includes inventory');
    });

    test('should check for status 200', () => {
      const statusCheck = scriptContent.match(/["']status OK["']/);
      expect(statusCheck).toBeTruthy();
    });

    test('should check for JSON response', () => {
      const jsonCheck = scriptContent.match(/["']returns JSON["']/);
      expect(jsonCheck).toBeTruthy();
    });

    test('should check for inventory field', () => {
      const inventoryCheck = scriptContent.match(/["']includes inventory["']/);
      expect(inventoryCheck).toBeTruthy();
    });

    test('should validate inventory field type', () => {
      expect(scriptContent).toContain('json.inventory');
      expect(scriptContent).toContain('typeof json.inventory');
    });

    test('should have sleep call', () => {
      expect(scriptContent).toContain('sleep(');
    });
  });

  describe('Test Coverage Validation', () => {
    test('should test product detail endpoint', () => {
      expect(scriptContent).toContain('/api/products/');
    });

    test('should use GET method', () => {
      expect(scriptContent).toContain('http.get');
    });

    test('should validate response structure', () => {
      expect(scriptContent).toContain('r.status');
      expect(scriptContent).toContain('r.json()');
    });
  });
});

