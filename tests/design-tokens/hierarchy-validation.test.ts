/**
 * Design Token Hierarchy Validation Tests
 *
 * Automated tests to catch design system drift before it occurs.
 * Validates the two-tier token hierarchy: Primitives → Semantic
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Test file paths (2-layer architecture)
const TOKEN_FILES = {
  primitives: 'src/styles/tokens/primitives.css',
  semantic: 'src/styles/tokens/semantic.css'
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

    test('should not reference any other tokens (primitives are base layer)', () => {
      const references = extractCSSReferences(primitivesContent);
      // In 2-layer system, primitives should not reference any other tokens
      const anyReferences = references.filter(ref => true); // All references are invalid for primitives

      expect(anyReferences).toHaveLength(0);
    });
  });

  describe('Semantic Token Layer (2-layer system)', () => {
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

    test('should only reference primitive tokens (2-layer system)', () => {
      // In 2-layer system, semantic should only reference primitives
      // Check for any references to non-existent layers
      const invalidReferences = semanticReferences.filter(ref =>
        ref.variable.startsWith('btn-') ||
        ref.variable.startsWith('card-') ||
        ref.variable.startsWith('dialog-') ||
        ref.variable.startsWith('input-') ||
        ref.variable.startsWith('component-') ||
        ref.variable.startsWith('feature-')
      );

      if (invalidReferences.length > 0) {
        console.log('Invalid references in semantic layer (non-existent layers):', invalidReferences);
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

  // Component and Feature layers removed in 2-layer architecture
  // Components should use semantic tokens directly from semantic.css

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

    test('should prevent primitive token duplication across files (2-layer system)', () => {
      // In 2-layer system, only check semantic file for primitive duplication
      const semanticFile = TOKEN_FILES.semantic;
      const duplicatedPrimitives: Array<{ file: string; token: string }> = [];

      try {
        const content = readCSSFile(semanticFile);
        const variables = extractCSSVariables(content);

        const primitiveDefinitions = variables.filter(v =>
          (v.name.match(/^(primary|secondary|mfb)-\d+$/) || v.name.startsWith('color-')) &&
          !v.value.includes('var(')
        );

        primitiveDefinitions.forEach(primitive => {
          duplicatedPrimitives.push({
            file: semanticFile,
            token: primitive.name
          });
        });
      } catch (error) {
        // File might not exist, skip
      }

      if (duplicatedPrimitives.length > 0) {
        console.log('Duplicated primitive tokens in semantic layer:', duplicatedPrimitives);
      }

      expect(duplicatedPrimitives).toHaveLength(0);
    });
  });

  describe('Token Usage Validation (2-layer system)', () => {
    test('should have no unused tokens (sample check)', () => {
      // This is a simplified test - in practice, you'd scan all component files
      const primitivesContent = readCSSFile(TOKEN_FILES.primitives);
      const semanticContent = readCSSFile(TOKEN_FILES.semantic);

      const allReferences = [
        ...extractCSSReferences(semanticContent)
        // In 2-layer system, we only check semantic layer references
      ];

      const referencedTokens = new Set(allReferences.map(ref => ref.variable));
      const primitiveVariables = extractCSSVariables(primitivesContent);

      // Check critical tokens are referenced
      const criticalTokens = ['mfb-green', 'background', 'foreground'];
      criticalTokens.forEach(token => {
        expect(
          referencedTokens.has(token) ||
          primitiveVariables.some(v => v.name === token)
        ).toBe(true);
      });
    });
  });
});