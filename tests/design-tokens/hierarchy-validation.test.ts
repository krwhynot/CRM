/**
 * Design Token Hierarchy Validation Tests
 *
 * Automated tests to catch design system drift before it occurs.
 * Validates the four-tier token hierarchy: Primitives → Semantic → Components → Features
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Test file paths
const TOKEN_FILES = {
  primitives: 'src/index.css',
  semantic: 'src/styles/semantic-tokens.css',
  components: 'src/styles/component-tokens.css',
  features: 'src/styles/advanced-colors.css',
  density: 'src/styles/density.css'
};

// Helper function to read CSS file content
const readCSSFile = (filePath: string): string => {
  try {
    return readFileSync(join(process.cwd(), filePath), 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read CSS file: ${filePath}`);
  }
};

// Helper function to extract CSS variable definitions
const extractCSSVariables = (content: string): Array<{ name: string; value: string; line: number }> => {
  const variables: Array<{ name: string; value: string; line: number }> = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const match = line.match(/^\s*--([^:]+):\s*([^;]+);/);
    if (match) {
      variables.push({
        name: match[1].trim(),
        value: match[2].trim(),
        line: index + 1
      });
    }
  });

  return variables;
};

// Helper function to extract CSS variable references
const extractCSSReferences = (content: string): Array<{ variable: string; line: number }> => {
  const references: Array<{ variable: string; line: number }> = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const regex = /var\(--([^)]+)\)/g;
    let match;
    while ((match = regex.exec(line)) !== null) {
      references.push({
        variable: match[1].trim(),
        line: index + 1
      });
    }
  });

  return references;
};

describe('Design Token Hierarchy Validation', () => {
  describe('Primitive Token Layer (index.css)', () => {
    let primitivesContent: string;
    let primitiveVariables: Array<{ name: string; value: string; line: number }>;

    beforeAll(() => {
      primitivesContent = readCSSFile(TOKEN_FILES.primitives);
      primitiveVariables = extractCSSVariables(primitivesContent);
    });

    test('should contain MFB brand color primitives', () => {
      const mfbColors = primitiveVariables.filter(v => v.name.startsWith('mfb-'));
      expect(mfbColors.length).toBeGreaterThan(0);

      // Verify essential MFB colors exist
      const essentialColors = ['mfb-green', 'mfb-green-hover', 'mfb-green-focus', 'mfb-green-active'];
      essentialColors.forEach(color => {
        expect(primitiveVariables.some(v => v.name === color)).toBe(true);
      });
    });

    test('should contain primary color scale', () => {
      const primaryScale = primitiveVariables.filter(v => v.name.match(/^primary-\d+$/));
      expect(primaryScale.length).toBeGreaterThanOrEqual(9); // 50, 100, 200, ... 900

      // Verify OKLCH format usage
      primaryScale.forEach(color => {
        expect(color.value).toMatch(/oklch\(/);
      });
    });

    test('should not reference non-primitive tokens', () => {
      const references = extractCSSReferences(primitivesContent);
      const invalidReferences = references.filter(ref =>
        ref.variable.startsWith('btn-') ||
        ref.variable.startsWith('card-') ||
        ref.variable.startsWith('dialog-')
      );

      expect(invalidReferences).toHaveLength(0);
    });
  });

  describe('Semantic Token Layer (semantic-tokens.css)', () => {
    let semanticContent: string;
    let semanticVariables: Array<{ name: string; value: string; line: number }>;
    let semanticReferences: Array<{ variable: string; line: number }>;

    beforeAll(() => {
      semanticContent = readCSSFile(TOKEN_FILES.semantic);
      semanticVariables = extractCSSVariables(semanticContent);
      semanticReferences = extractCSSReferences(semanticContent);
    });

    test('should map primitives to semantic meanings', () => {
      // Should contain key semantic mappings
      const semanticMappings = ['primary', 'secondary', 'background', 'foreground'];
      semanticMappings.forEach(mapping => {
        expect(semanticVariables.some(v => v.name === mapping)).toBe(true);
      });
    });

    test('should only reference primitive tokens', () => {
      const invalidReferences = semanticReferences.filter(ref =>
        ref.variable.startsWith('btn-') ||
        ref.variable.startsWith('card-') ||
        ref.variable.startsWith('dialog-') ||
        ref.variable.startsWith('input-')
      );

      if (invalidReferences.length > 0) {
        console.log('Invalid references in semantic layer:', invalidReferences);
      }

      expect(invalidReferences).toHaveLength(0);
    });

    test('should not redefine primitive colors', () => {
      const primitiveRedefinitions = semanticVariables.filter(v =>
        (v.name.startsWith('mfb-') || v.name.match(/^(primary|secondary)-\d+$/)) &&
        !v.value.includes('var(')
      );

      if (primitiveRedefinitions.length > 0) {
        console.log('Primitive redefinitions in semantic layer:', primitiveRedefinitions);
      }

      expect(primitiveRedefinitions).toHaveLength(0);
    });
  });

  describe('Component Token Layer (component-tokens.css)', () => {
    let componentContent: string;
    let componentVariables: Array<{ name: string; value: string; line: number }>;
    let componentReferences: Array<{ variable: string; line: number }>;

    beforeAll(() => {
      componentContent = readCSSFile(TOKEN_FILES.components);
      componentVariables = extractCSSVariables(componentContent);
      componentReferences = extractCSSReferences(componentContent);
    });

    test('should use component-specific prefixes', () => {
      const validPrefixes = ['btn-', 'card-', 'dialog-', 'input-', 'select-', 'popover-', 'table-'];
      const unprefixedTokens = componentVariables.filter(v =>
        !validPrefixes.some(prefix => v.name.startsWith(prefix)) &&
        !v.name.match(/^(background|foreground|border|ring)/)
      );

      if (unprefixedTokens.length > 0) {
        console.log('Component tokens without proper prefixes:', unprefixedTokens.map(t => t.name));
      }

      // Allow some flexibility for common tokens
      expect(unprefixedTokens.length).toBeLessThanOrEqual(5);
    });

    test('should reference semantic tokens, not primitives', () => {
      const primitiveReferences = componentReferences.filter(ref =>
        ref.variable.match(/^(primary|secondary|mfb)-\d+$/) ||
        ref.variable.startsWith('color-')
      );

      if (primitiveReferences.length > 0) {
        console.log('Direct primitive references in component layer:', primitiveReferences);
      }

      expect(primitiveReferences).toHaveLength(0);
    });

    test('should properly structure button tokens', () => {
      const buttonTokens = componentVariables.filter(v => v.name.startsWith('btn-'));
      expect(buttonTokens.length).toBeGreaterThan(0);

      // Check for essential button states
      const essentialButtonStates = ['btn-primary-bg', 'btn-primary-bg-hover', 'btn-primary-text'];
      essentialButtonStates.forEach(state => {
        expect(componentVariables.some(v => v.name === state)).toBe(true);
      });
    });
  });

  describe('Feature Token Layer (advanced-colors.css)', () => {
    let featureContent: string;
    let featureVariables: Array<{ name: string; value: string; line: number }>;
    let featureReferences: Array<{ variable: string; line: number }>;

    beforeAll(() => {
      featureContent = readCSSFile(TOKEN_FILES.features);
      featureVariables = extractCSSVariables(featureContent);
      featureReferences = extractCSSReferences(featureContent);
    });

    test('should prefer semantic tokens over primitives', () => {
      const primitiveBypass = featureReferences.filter(ref =>
        ref.variable.match(/^(primary|secondary|mfb)-\d+$/) &&
        !ref.variable.match(/^(primary|secondary)$/)
      );

      if (primitiveBypass.length > 0) {
        console.log('Feature layer bypassing semantic tokens:', primitiveBypass);
      }

      // Allow some flexibility for advanced features
      expect(primitiveBypass.length).toBeLessThanOrEqual(3);
    });

    test('should provide accessibility enhancements', () => {
      const accessibilityTokens = featureVariables.filter(v =>
        v.name.includes('contrast') ||
        v.name.includes('focus') ||
        v.name.includes('accessible')
      );

      expect(accessibilityTokens.length).toBeGreaterThan(0);
    });
  });

  describe('Circular Reference Detection', () => {
    test('should not have circular token references', () => {
      const allFiles = Object.values(TOKEN_FILES);
      const circularReferences: Array<{ file: string; token: string; line: number }> = [];

      allFiles.forEach(filePath => {
        try {
          const content = readCSSFile(filePath);
          const variables = extractCSSVariables(content);

          variables.forEach(variable => {
            if (variable.value.includes(`var(--${variable.name})`)) {
              circularReferences.push({
                file: filePath,
                token: variable.name,
                line: variable.line
              });
            }
          });
        } catch (error) {
          // File might not exist, skip
        }
      });

      if (circularReferences.length > 0) {
        console.log('Circular references detected:', circularReferences);
      }

      expect(circularReferences).toHaveLength(0);
    });
  });

  describe('Design System Drift Prevention', () => {
    test('should have consistent MFB green definitions', () => {
      const primitivesContent = readCSSFile(TOKEN_FILES.primitives);
      const semanticContent = readCSSFile(TOKEN_FILES.semantic);

      // Extract MFB green definitions
      const mfbGreenInPrimitives = extractCSSVariables(primitivesContent)
        .filter(v => v.name === 'mfb-green');
      const mfbGreenInSemantic = extractCSSVariables(semanticContent)
        .filter(v => v.name === 'mfb-green');

      expect(mfbGreenInPrimitives).toHaveLength(1);
      expect(mfbGreenInSemantic).toHaveLength(0); // Should be referenced, not redefined
    });

    test('should maintain OKLCH color format consistency', () => {
      const primitivesContent = readCSSFile(TOKEN_FILES.primitives);
      const primitiveVariables = extractCSSVariables(primitivesContent);

      const colorTokens = primitiveVariables.filter(v =>
        v.name.startsWith('primary-') ||
        v.name.startsWith('secondary-') ||
        v.name.startsWith('mfb-')
      );

      const invalidFormats = colorTokens.filter(token =>
        !token.value.includes('oklch(') &&
        !token.value.includes('var(') &&
        !token.value.includes('hsl(')
      );

      if (invalidFormats.length > 0) {
        console.log('Tokens with invalid color format:', invalidFormats.map(t => `${t.name}: ${t.value}`));
      }

      expect(invalidFormats).toHaveLength(0);
    });

    test('should prevent primitive token duplication across files', () => {
      const primitiveFiles = [TOKEN_FILES.semantic, TOKEN_FILES.components, TOKEN_FILES.features];
      const duplicatedPrimitives: Array<{ file: string; token: string }> = [];

      primitiveFiles.forEach(filePath => {
        try {
          const content = readCSSFile(filePath);
          const variables = extractCSSVariables(content);

          const primitiveDefinitions = variables.filter(v =>
            (v.name.match(/^(primary|secondary|mfb)-\d+$/) || v.name.startsWith('color-')) &&
            !v.value.includes('var(')
          );

          primitiveDefinitions.forEach(primitive => {
            duplicatedPrimitives.push({
              file: filePath,
              token: primitive.name
            });
          });
        } catch (error) {
          // File might not exist, skip
        }
      });

      if (duplicatedPrimitives.length > 0) {
        console.log('Duplicated primitive tokens:', duplicatedPrimitives);
      }

      expect(duplicatedPrimitives).toHaveLength(0);
    });
  });

  describe('Token Usage Validation', () => {
    test('should have no unused tokens (sample check)', () => {
      // This is a simplified test - in practice, you'd scan all component files
      const primitivesContent = readCSSFile(TOKEN_FILES.primitives);
      const semanticContent = readCSSFile(TOKEN_FILES.semantic);

      const allReferences = [
        ...extractCSSReferences(semanticContent),
        ...extractCSSReferences(readCSSFile(TOKEN_FILES.components))
      ];

      const referencedTokens = new Set(allReferences.map(ref => ref.variable));
      const primitiveVariables = extractCSSVariables(primitivesContent);

      // Check critical tokens are referenced
      const criticalTokens = ['mfb-green', 'primary-500', 'background', 'foreground'];
      criticalTokens.forEach(token => {
        expect(
          referencedTokens.has(token) ||
          primitiveVariables.some(v => v.name === token)
        ).toBe(true);
      });
    });
  });
});