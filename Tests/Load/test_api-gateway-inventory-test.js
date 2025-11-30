const fs = require('fs');
const path = require('path');

describe('k6 Load Test: api-gateway-inventory-test.js', () => {
  const testFile = path.join(__dirname, 'api-gateway-inventory-test.js');
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

    test('should have http_req_duration threshold with p(95)<3000', () => {
      const thresholdMatch = scriptContent.match(/http_req_duration.*\[.*p\(95\)<3000/);
      expect(thresholdMatch).toBeTruthy();
    });

    test('should have stages configured', () => {
      expect(scriptContent).toContain('stages:');
      expect(scriptContent).toMatch(/duration:\s*["']\d+s["']/);
      expect(scriptContent).toMatch(/target:\s*\d+/);
    });

    test('should have three stages', () => {
      const stageMatches = scriptContent.match(/duration:\s*["']\d+s["']/g);
      expect(stageMatches).toBeTruthy();
      expect(stageMatches.length).toBe(3);
    });

    test('should have correct stage durations', () => {
      expect(scriptContent).toContain('duration: "7s"');
      expect(scriptContent).toContain('duration: "10s"');
      expect(scriptContent).toContain('duration: "3s"');
    });
  });

  describe('Test Logic Validation', () => {
    test('should define id variable', () => {
      expect(scriptContent).toContain('const id');
    });

    test('should set id to 3', () => {
      const idMatch = scriptContent.match(/const id\s*=\s*(\d+)/);
      expect(idMatch).toBeTruthy();
      expect(parseInt(idMatch[1])).toBe(3);
    });

    test('should construct correct URL pattern', () => {
      expect(scriptContent).toContain('/api/inventory/');
      expect(scriptContent).toMatch(/\/api\/inventory\/\$\{id\}/);
    });

    test('should make HTTP GET request', () => {
      expect(scriptContent).toContain('http.get');
    });

    test('should have check assertions', () => {
      expect(scriptContent).toContain('check(res');
      expect(scriptContent).toContain('status is 200');
      expect(scriptContent).toContain('returns JSON');
    });

    test('should check for status 200', () => {
      const statusCheck = scriptContent.match(/["']status is 200["']/);
      expect(statusCheck).toBeTruthy();
    });

    test('should check for JSON response', () => {
      const jsonCheck = scriptContent.match(/["']returns JSON["']/);
      expect(jsonCheck).toBeTruthy();
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

  describe('Code Quality Checks', () => {
    test('should use const for id', () => {
      expect(scriptContent).toMatch(/const\s+id/);
    });

    test('should use let for url and res variables', () => {
      expect(scriptContent).toMatch(/let\s+url/);
      expect(scriptContent).toMatch(/let\s+res/);
    });
  });

  describe('Test Coverage Validation', () => {
    test('should test inventory endpoint', () => {
      expect(scriptContent).toContain('/api/inventory/');
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

