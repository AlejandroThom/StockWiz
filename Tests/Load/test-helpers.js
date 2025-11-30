/**
 * Helper functions for k6 test coverage validation
 * Shared utilities to reduce code duplication
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Loads and returns the content of a k6 test file
 * @param {string} filename - Name of the k6 test file
 * @returns {string} File content
 */
function loadK6Script(filename) {
  const testFile = path.join(__dirname, filename);
  return fs.readFileSync(testFile, 'utf-8');
}

/**
 * Creates common structure validation tests
 * @param {string} scriptContent - Content of the k6 script
 */
function validateScriptStructure(scriptContent) {
  const content = scriptContent;
  return {
    hasValidSyntax: () => {
      expect(content).toBeTruthy();
      expect(typeof content).toBe('string');
    },
    hasK6Imports: () => {
      expect(content).toContain('import http from');
      expect(content).toContain('k6/http');
    },
    hasOptionsExport: () => {
      expect(content).toContain('export let options');
    },
    hasTargetHost: () => {
      expect(content).toContain('__ENV.TARGET_HOST');
    }
  };
}

/**
 * Validates threshold configuration
 * @param {string} scriptContent - Content of the k6 script
 */
function validateThresholds(scriptContent) {
  const content = scriptContent;
  return {
    hasHttpReqFailed: (expectedRate = '0.20') => {
      const pattern = new RegExp(`http_req_failed.*\\[.*rate<${expectedRate.replace('.', '\\.')}`);
      expect(content).toMatch(pattern);
    },
    hasHttpReqDuration: (expectedDuration) => {
      const pattern = new RegExp(`http_req_duration.*\\[.*p\\(95\\)<${expectedDuration}`);
      expect(content).toMatch(pattern);
    },
    hasThresholds: () => {
      expect(content).toContain('http_req_failed');
      expect(content).toContain('http_req_duration');
    }
  };
}

/**
 * Validates stages configuration
 * @param {string} scriptContent - Content of the k6 script
 */
function validateStages(scriptContent) {
  const content = scriptContent;
  return {
    hasStages: () => {
      expect(content).toContain('stages:');
    },
    hasStageCount: (expectedCount) => {
      const stageMatches = content.match(/duration:\s*["']\d+s["']/g);
      expect(stageMatches).toBeTruthy();
      expect(stageMatches.length).toBe(expectedCount);
    },
    hasStageTargets: (targets) => {
      targets.forEach(target => {
        expect(content).toContain(`target: ${target}`);
      });
    }
  };
}

/**
 * Validates HTTP request methods
 * @param {string} scriptContent - Content of the k6 script
 */
function validateHttpMethods(scriptContent) {
  const content = scriptContent;
  return {
    usesGet: () => {
      expect(content).toContain('http.get');
    },
    usesPost: () => {
      expect(content).toContain('http.post');
    },
    usesPut: () => {
      expect(content).toContain('http.put');
    },
    usesDelete: () => {
      expect(content).toContain('http.del');
    },
    onlyUsesGet: () => {
      expect(content).toContain('http.get');
      expect(content).not.toContain('http.post');
      expect(content).not.toContain('http.put');
      expect(content).not.toContain('http.del');
    }
  };
}

/**
 * Validates check assertions
 * @param {string} scriptContent - Content of the k6 script
 */
function validateChecks(scriptContent) {
  const content = scriptContent;
  return {
    hasCheckFunction: () => {
      expect(content).toContain('check(');
    },
    hasCheckName: (checkName) => {
      const pattern = new RegExp(`["']${checkName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`);
      expect(content).toMatch(pattern);
    },
    hasStatusCheck: (expectedStatus) => {
      const pattern = new RegExp(`r\\.status\\s*===\\s*${expectedStatus}`);
      expect(content).toMatch(pattern);
    }
  };
}

/**
 * Validates URL patterns
 * @param {string} scriptContent - Content of the k6 script
 */
function validateUrls(scriptContent) {
  const content = scriptContent;
  return {
    containsUrl: (urlPattern) => {
      expect(content).toContain(urlPattern);
    },
    hasUrlTemplate: (templatePattern) => {
      const escapedPattern = templatePattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      expect(content).toMatch(new RegExp(escapedPattern));
    }
  };
}

/**
 * Validates sleep calls
 * @param {string} scriptContent - Content of the k6 script
 */
function validateSleep(scriptContent) {
  const content = scriptContent;
  return {
    hasSleep: () => {
      expect(content).toContain('sleep(');
    },
    hasSleepDuration: (expectedDuration) => {
      const sleepMatch = content.match(/sleep\((\d+)\)/);
      expect(sleepMatch).toBeTruthy();
      expect(parseInt(sleepMatch[1])).toBe(expectedDuration);
    }
  };
}

/**
 * Validates variable declarations
 * @param {string} scriptContent - Content of the k6 script
 */
function validateVariables(scriptContent) {
  const content = scriptContent;
  return {
    hasConst: (varName) => {
      expect(content).toMatch(new RegExp(`const\\s+${varName}`));
    },
    hasLet: (varName) => {
      expect(content).toMatch(new RegExp(`let\\s+${varName}`));
    },
    hasVariableValue: (varName, expectedValue) => {
      const pattern = new RegExp(`${varName}\\s*=\\s*${expectedValue}`);
      expect(content).toMatch(pattern);
    }
  };
}

/**
 * Validates scenarios configuration
 * @param {string} scriptContent - Content of the k6 script
 */
function validateScenarios(scriptContent) {
  const content = scriptContent;
  return {
    hasScenarios: () => {
      expect(content).toContain('scenarios:');
    },
    hasScenario: (scenarioName) => {
      expect(content).toContain(`${scenarioName}:`);
    },
    hasExecutor: (executorType) => {
      expect(content).toContain(`executor: "${executorType}"`);
    },
    hasExecFunction: (functionName) => {
      expect(content).toContain(`exec: "${functionName}"`);
    }
  };
}

/**
 * Validates exported functions
 * @param {string} scriptContent - Content of the k6 script
 */
function validateExports(scriptContent) {
  const content = scriptContent;
  return {
    hasDefaultFunction: () => {
      expect(content).toContain('export default function');
    },
    hasExportedFunction: (functionName) => {
      expect(content).toContain(`export function ${functionName}`);
    }
  };
}

/**
 * Validates VUs and duration configuration
 * @param {string} scriptContent - Content of the k6 script
 */
function validateVusAndDuration(scriptContent) {
  const content = scriptContent;
  return {
    hasVus: (expectedVus) => {
      const vusMatch = content.match(/vus:\s*(\d+)/);
      expect(vusMatch).toBeTruthy();
      if (expectedVus !== undefined) {
        expect(parseInt(vusMatch[1])).toBe(expectedVus);
      }
    },
    hasDuration: (expectedDuration) => {
      const durationMatch = content.match(/duration:\s*["'](\d+)s["']/);
      expect(durationMatch).toBeTruthy();
      if (expectedDuration !== undefined) {
        expect(durationMatch[1]).toBe(expectedDuration);
      }
    }
  };
}

module.exports = {
  loadK6Script,
  validateScriptStructure,
  validateThresholds,
  validateStages,
  validateHttpMethods,
  validateChecks,
  validateUrls,
  validateSleep,
  validateVariables,
  validateScenarios,
  validateExports,
  validateVusAndDuration
};

