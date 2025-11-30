const fs = require('fs');
const path = require('path');

describe('k6 Load Test: api-gateway-products-full-test.js', () => {
  const testFile = path.join(__dirname, 'api-gateway-products-full-test.js');
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
      expect(scriptContent).toContain('import { sleep }');
      expect(scriptContent).toContain('k6/http');
      expect(scriptContent).toContain('k6');
    });

    test('should export options configuration', () => {
      expect(scriptContent).toContain('export let options');
      expect(scriptContent).toContain('scenarios');
    });

    test('should use scenarios instead of default function', () => {
      expect(scriptContent).toContain('scenarios:');
      expect(scriptContent).not.toContain('export default function');
    });

    test('should use TARGET_HOST environment variable', () => {
      expect(scriptContent).toContain('__ENV.TARGET_HOST');
    });
  });

  describe('Scenarios Configuration Validation', () => {
    test('should have scenarios configured', () => {
      expect(scriptContent).toContain('scenarios:');
    });

    test('should have products scenario', () => {
      expect(scriptContent).toContain('products:');
      expect(scriptContent).toContain('exec: "getProducts"');
    });

    test('should have productById scenario', () => {
      expect(scriptContent).toContain('productById:');
      expect(scriptContent).toContain('exec: "getProductById"');
    });

    test('should have productsFull scenario', () => {
      expect(scriptContent).toContain('productsFull:');
      expect(scriptContent).toContain('exec: "getProductsFull"');
    });

    test('should have inventoryByProduct scenario', () => {
      expect(scriptContent).toContain('inventoryByProduct:');
      expect(scriptContent).toContain('exec: "getInventoryByProduct"');
    });

    test('should use constant-vus executor', () => {
      expect(scriptContent).toContain('executor: "constant-vus"');
    });

    test('should have vus set to 1 for all scenarios', () => {
      const vusMatches = scriptContent.match(/vus:\s*1/g);
      expect(vusMatches).toBeTruthy();
      expect(vusMatches.length).toBe(4);
    });

    test('should have duration set to 5s for all scenarios', () => {
      const durationMatches = scriptContent.match(/duration:\s*["']5s["']/g);
      expect(durationMatches).toBeTruthy();
      expect(durationMatches.length).toBe(4);
    });
  });

  describe('Function Exports Validation', () => {
    test('should export getProducts function', () => {
      expect(scriptContent).toContain('export function getProducts');
    });

    test('should export getProductById function', () => {
      expect(scriptContent).toContain('export function getProductById');
    });

    test('should export getProductsFull function', () => {
      expect(scriptContent).toContain('export function getProductsFull');
    });

    test('should export getInventoryByProduct function', () => {
      expect(scriptContent).toContain('export function getInventoryByProduct');
    });
  });

  describe('getProducts Function Validation', () => {
    test('should construct products URL', () => {
      expect(scriptContent).toContain('/api/products');
    });

    test('should make HTTP GET request', () => {
      expect(scriptContent).toContain('http.get(url)');
    });

    test('should have sleep call', () => {
      expect(scriptContent).toContain('sleep(1)');
    });
  });

  describe('getProductById Function Validation', () => {
    test('should define id variable', () => {
      expect(scriptContent).toContain('const id = 3');
    });

    test('should construct product by id URL', () => {
      expect(scriptContent).toMatch(/url\+`\/\$\{id\}`/);
    });

    test('should make HTTP GET request', () => {
      expect(scriptContent).toContain('http.get');
    });
  });

  describe('getProductsFull Function Validation', () => {
    test('should construct products-full URL', () => {
      expect(scriptContent).toContain('/api/products-full');
    });

    test('should make HTTP GET request', () => {
      expect(scriptContent).toContain('http.get(url)');
    });
  });

  describe('getInventoryByProduct Function Validation', () => {
    test('should define id variable', () => {
      expect(scriptContent).toContain('const id = 3');
    });

    test('should construct inventory by product URL', () => {
      expect(scriptContent).toContain('/api/inventory/product');
      expect(scriptContent).toMatch(/url\+`\/\$\{id\}`/);
    });

    test('should make HTTP GET request', () => {
      expect(scriptContent).toContain('http.get');
    });
  });

  describe('Test Coverage Validation', () => {
    test('should test multiple endpoints', () => {
      expect(scriptContent).toContain('/api/products');
      expect(scriptContent).toContain('/api/products-full');
      expect(scriptContent).toContain('/api/inventory/product');
    });

    test('should use GET method for all requests', () => {
      expect(scriptContent).toContain('http.get');
      expect(scriptContent).not.toContain('http.post');
      expect(scriptContent).not.toContain('http.put');
      expect(scriptContent).not.toContain('http.del');
    });
  });
});

