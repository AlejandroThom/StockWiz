const fs = require('fs');
const path = require('path');

describe('k6 Load Test: api-gateway-products-full-load-test.js', () => {
  const testFile = path.join(__dirname, 'api-gateway-products-full-load-test.js');
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

    test('should have http_req_duration threshold with p(95)<1200', () => {
      const thresholdMatch = scriptContent.match(/http_req_duration.*\[.*p\(95\)<1200/);
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

    test('should have correct stage targets', () => {
      expect(scriptContent).toContain('target: 2');
      expect(scriptContent).toContain('target: 1');
      expect(scriptContent).toContain('target: 0');
    });
  });

  describe('Test Logic Validation', () => {
    test('should construct correct URL pattern', () => {
      expect(scriptContent).toContain('/api/products-full');
      expect(scriptContent).toMatch(/\/api\/products-full/);
    });

    test('should make HTTP GET request', () => {
      expect(scriptContent).toContain('http.get');
    });

    test('should use const for res variable', () => {
      expect(scriptContent).toMatch(/const\s+res/);
    });

    test('should have check assertions', () => {
      expect(scriptContent).toContain('check(res');
      expect(scriptContent).toContain('status OK');
      expect(scriptContent).toContain('is array');
    });

    test('should check for status 200', () => {
      const statusCheck = scriptContent.match(/["']status OK["']/);
      expect(statusCheck).toBeTruthy();
    });

    test('should check for array response', () => {
      const arrayCheck = scriptContent.match(/["']is array["']/);
      expect(arrayCheck).toBeTruthy();
    });

    test('should validate array using Array.isArray', () => {
      expect(scriptContent).toContain('Array.isArray');
    });

    test('should have sleep call', () => {
      expect(scriptContent).toContain('sleep(');
    });

    test('should sleep for 1 second', () => {
      const sleepMatch = scriptContent.match(/sleep\((\d+)\)/);
      expect(sleepMatch).toBeTruthy();
      expect(parseInt(sleepMatch[1])).toBe(1);
    });
  });

  describe('Performance Thresholds Validation', () => {
    test('should have stricter duration threshold (1200ms)', () => {
      const durationMatch = scriptContent.match(/p\(95\)<(\d+)/);
      expect(durationMatch).toBeTruthy();
      const duration = parseInt(durationMatch[1]);
      expect(duration).toBe(1200);
    });
  });

  describe('Test Coverage Validation', () => {
    test('should test products-full endpoint', () => {
      expect(scriptContent).toContain('/api/products-full');
    });

    test('should use GET method', () => {
      expect(scriptContent).toContain('http.get');
    });

    test('should validate response structure', () => {
      expect(scriptContent).toContain('r.status');
      expect(scriptContent).toContain('r.json()');
      expect(scriptContent).toContain('Array.isArray');
    });
  });
});

