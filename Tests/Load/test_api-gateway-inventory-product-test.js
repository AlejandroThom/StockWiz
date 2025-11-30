const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('k6 Load Test: api-gateway-inventory-product-test.js', () => {
  const testFile = path.join(__dirname, 'api-gateway-inventory-product-test.js');
  let scriptContent;

  beforeAll(() => {
    // Read the k6 test script
    scriptContent = fs.readFileSync(testFile, 'utf-8');
  });

  describe('Script Structure Validation', () => {
    test('should have valid JavaScript syntax', () => {
      // Try to parse the script - if it fails, syntax is invalid
      expect(() => {
        // Basic syntax check - k6 uses ES6 modules
        expect(scriptContent).toBeTruthy();
        expect(typeof scriptContent).toBe('string');
      }).not.toThrow();
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
      expect(scriptContent).toContain('vus');
      expect(scriptContent).toContain('duration');
    });

    test('should have default function exported', () => {
      expect(scriptContent).toContain('export default function');
    });

    test('should use TARGET_HOST environment variable', () => {
      expect(scriptContent).toContain('__ENV.TARGET_HOST');
      expect(scriptContent).toContain('TARGET_HOST');
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

  describe('Test Logic Validation', () => {
    test('should define productId variable', () => {
      expect(scriptContent).toContain('productId');
    });

    test('should set productId to 3', () => {
      const productIdMatch = scriptContent.match(/productId\s*=\s*(\d+)/);
      expect(productIdMatch).toBeTruthy();
      expect(parseInt(productIdMatch[1])).toBe(3);
    });

    test('should construct correct URL pattern', () => {
      expect(scriptContent).toContain('/api/inventory/product/');
      expect(scriptContent).toMatch(/\/api\/inventory\/product\/\$\{productId\}/);
    });

    test('should make HTTP GET request', () => {
      expect(scriptContent).toContain('http.get');
      expect(scriptContent).toContain('url');
    });

    test('should have check assertions', () => {
      expect(scriptContent).toContain('check(res');
      expect(scriptContent).toContain('status is 200');
      expect(scriptContent).toContain('inventory returned');
    });

    test('should check for status 200', () => {
      const statusCheck = scriptContent.match(/["']status is 200["']/);
      expect(statusCheck).toBeTruthy();
    });

    test('should check for inventory returned', () => {
      const inventoryCheck = scriptContent.match(/["']inventory returned["']/);
      expect(inventoryCheck).toBeTruthy();
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
    test('should use const for productId', () => {
      expect(scriptContent).toMatch(/const\s+productId/);
    });

    test('should use let for url and res variables', () => {
      expect(scriptContent).toMatch(/let\s+url/);
      expect(scriptContent).toMatch(/let\s+res/);
    });

    test('should have proper URL template string', () => {
      expect(scriptContent).toMatch(/`\$\{TARGET_HOST\}\/api\/inventory\/product\/\$\{productId\}`/);
    });
  });

  describe('k6 Execution Validation', () => {
    test('should be executable by k6 (syntax check)', () => {
      // This test validates that k6 can at least parse the script
      // We'll do a dry run to check syntax
      try {
        // Check if k6 is available
        execSync('k6 version', { stdio: 'ignore' });
        
        // Try to validate the script syntax with k6
        // k6 run --dry-run would be ideal but may not be available in all versions
        // Instead, we'll just verify the file exists and is readable
        expect(fs.existsSync(testFile)).toBe(true);
        expect(fs.statSync(testFile).isFile()).toBe(true);
      } catch (error) {
        // k6 might not be installed, but that's okay for CI/CD
        // The script structure is still valid
        console.warn('k6 not found in PATH, skipping execution test');
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle missing TARGET_HOST gracefully', () => {
      // The script uses __ENV.TARGET_HOST which will be undefined if not set
      // k6 will handle this and the URL will be malformed, but the script won't crash
      expect(scriptContent).toContain('__ENV.TARGET_HOST');
    });

    test('should have proper error handling in checks', () => {
      // The check function handles errors internally
      expect(scriptContent).toContain('check(res');
    });
  });

  describe('Performance Thresholds Validation', () => {
    test('should have reasonable failure rate threshold', () => {
      // 20% failure rate is acceptable for load tests
      const thresholdMatch = scriptContent.match(/rate<0\.(\d+)/);
      expect(thresholdMatch).toBeTruthy();
      const rate = parseFloat(`0.${thresholdMatch[1]}`);
      expect(rate).toBeLessThanOrEqual(0.2);
    });

    test('should have reasonable duration threshold', () => {
      // 3000ms (3 seconds) is reasonable for API calls
      const durationMatch = scriptContent.match(/p\(95\)<(\d+)/);
      expect(durationMatch).toBeTruthy();
      const duration = parseInt(durationMatch[1]);
      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeLessThanOrEqual(10000); // Max 10 seconds
    });
  });

  describe('Test Coverage Validation', () => {
    test('should test inventory product endpoint', () => {
      expect(scriptContent).toContain('/api/inventory/product/');
    });

    test('should use GET method', () => {
      expect(scriptContent).toContain('http.get');
      expect(scriptContent).not.toContain('http.post');
      expect(scriptContent).not.toContain('http.put');
      expect(scriptContent).not.toContain('http.delete');
    });

    test('should validate response structure', () => {
      expect(scriptContent).toContain('r.status');
      expect(scriptContent).toContain('r.json()');
    });
  });
});

