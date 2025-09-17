/**
 * Design Token Duplication Detection Tests
 *
 * Automated tests to detect and prevent duplicate token definitions
 * across the design system hierarchy.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

interface TokenDefinition {
  name: string;
  value: string;
  file: string;
  line: number;
}

interface TokenUsage {
  variable: string;
  file: string;
  line: number;
  context: string;
}

// Helper function to recursively find all CSS and TypeScript files
const findFiles = (dir: string, extensions: string[]): string[] => {
  const files: string[] = [];

  try {
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...findFiles(fullPath, extensions));
      } else if (stat.isFile() && extensions.includes(extname(item))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory might not exist or be accessible
  }

  return files;
};

// Helper function to extract all token definitions from a file
const extractTokenDefinitions = (filePath: string): TokenDefinition[] => {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const definitions: TokenDefinition[] = [];

    lines.forEach((line, index) => {
      const match = line.match(/^\s*--([^:]+):\s*([^;]+);/);
      if (match) {
        definitions.push({
          name: match[1].trim(),
          value: match[2].trim(),
          file: filePath,
          line: index + 1
        });
      }
    });

    return definitions;
  } catch (error) {
    return [];
  }
};

// Helper function to extract all token usages from a file
const extractTokenUsages = (filePath: string): TokenUsage[] => {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const usages: TokenUsage[] = [];

    lines.forEach((line, index) => {
      const regex = /var\(--([^)]+)\)/g;
      let match;
      while ((match = regex.exec(line)) !== null) {
        usages.push({
          variable: match[1].trim(),
          file: filePath,
          line: index + 1,
          context: line.trim()
        });
      }
    });

    return usages;
  } catch (error) {
    return [];
  }
};

// Helper function to normalize color values for comparison
const normalizeColorValue = (value: string): string => {
  // Remove whitespace and normalize format
  return value.replace(/\s+/g, ' ').trim().toLowerCase();
};

// Helper function to extract color value from OKLCH/HSL
const extractColorValues = (value: string): { type: string; values: number[] } | null => {
  const oklchMatch = value.match(/oklch\(([^)]+)\)/);
  if (oklchMatch) {
    const values = oklchMatch[1].split(/\s+/).map(v => parseFloat(v));
    return { type: 'oklch', values };
  }

  const hslMatch = value.match(/hsl\(([^)]+)\)/);
  if (hslMatch) {
    const values = hslMatch[1].split(/[,\s]+/).map(v => parseFloat(v.replace('%', '')));
    return { type: 'hsl', values };
  }

  return null;
};

describe('Design Token Duplication Detection', () => {
  let allTokenDefinitions: TokenDefinition[] = [];
  let allTokenUsages: TokenUsage[] = [];

  beforeAll(() => {
    // Find all CSS files in the project
    const cssFiles = findFiles('src', ['.css']);
    const tsFiles = findFiles('src', ['.ts', '.tsx']);

    // Extract all token definitions
    cssFiles.forEach(file => {
      allTokenDefinitions.push(...extractTokenDefinitions(file));
    });

    // Extract all token usages
    [...cssFiles, ...tsFiles].forEach(file => {
      allTokenUsages.push(...extractTokenUsages(file));
    });
  });

  describe('Exact Token Name Duplication', () => {
    test('should not have exact duplicate token names across files', () => {
      const tokensByName = new Map<string, TokenDefinition[]>();

      // Group tokens by name
      allTokenDefinitions.forEach(token => {
        if (!tokensByName.has(token.name)) {
          tokensByName.set(token.name, []);
        }
        tokensByName.get(token.name)!.push(token);
      });

      // Find duplicates
      const duplicates: Array<{ name: string; definitions: TokenDefinition[] }> = [];
      tokensByName.forEach((definitions, name) => {
        if (definitions.length > 1) {
          duplicates.push({ name, definitions });
        }
      });

      if (duplicates.length > 0) {
        console.log('Duplicate token names found:');
        duplicates.forEach(({ name, definitions }) => {
          console.log(`  --${name}:`);
          definitions.forEach(def => {
            console.log(`    ${def.file}:${def.line} = ${def.value}`);
          });
        });
      }

      expect(duplicates).toHaveLength(0);
    });
  });

  describe('Semantic Color Value Duplication', () => {
    test('should not have multiple definitions of the same color value', () => {
      const colorDefinitions = allTokenDefinitions.filter(token =>
        token.value.includes('oklch(') ||
        token.value.includes('hsl(') ||
        token.value.match(/^#[0-9a-fA-F]{3,8}$/)
      );

      const colorValueMap = new Map<string, TokenDefinition[]>();

      // Group by normalized color value
      colorDefinitions.forEach(token => {
        const normalizedValue = normalizeColorValue(token.value);
        if (!colorValueMap.has(normalizedValue)) {
          colorValueMap.set(normalizedValue, []);
        }
        colorValueMap.get(normalizedValue)!.push(token);
      });

      // Find color value duplicates
      const colorDuplicates: Array<{ value: string; definitions: TokenDefinition[] }> = [];
      colorValueMap.forEach((definitions, value) => {
        if (definitions.length > 1) {
          // Exclude legitimate cases where semantic tokens reference primitives
          const hasReference = definitions.some(def => def.value.includes('var('));
          if (!hasReference) {
            colorDuplicates.push({ value, definitions });
          }
        }
      });

      if (colorDuplicates.length > 0) {
        console.log('Duplicate color values found:');
        colorDuplicates.forEach(({ value, definitions }) => {
          console.log(`  Color value: ${value}`);
          definitions.forEach(def => {
            console.log(`    --${def.name} in ${def.file}:${def.line}`);
          });
        });
      }

      expect(colorDuplicates).toHaveLength(0);
    });
  });

  describe('MFB Brand Color Consistency', () => {
    test('should have consistent MFB green definitions', () => {
      const mfbGreenTokens = allTokenDefinitions.filter(token =>
        token.name.includes('mfb-green') && !token.value.includes('var(')
      );

      // Should only have one base definition of MFB green
      const baseGreenDefinitions = mfbGreenTokens.filter(token =>
        token.name === 'mfb-green'
      );

      expect(baseGreenDefinitions).toHaveLength(1);

      if (baseGreenDefinitions.length === 1) {
        const baseDefinition = baseGreenDefinitions[0];
        console.log(`Base MFB green defined in: ${baseDefinition.file}:${baseDefinition.line}`);
        console.log(`Value: ${baseDefinition.value}`);

        // Verify it's in the primitives file
        expect(baseDefinition.file).toContain('index.css');
      }
    });

    test('should not redefine MFB colors in non-primitive files', () => {
      const nonPrimitiveFiles = allTokenDefinitions.filter(token =>
        !token.file.includes('index.css') &&
        token.name.startsWith('mfb-') &&
        !token.value.includes('var(')
      );

      if (nonPrimitiveFiles.length > 0) {
        console.log('MFB colors redefined outside primitives:');
        nonPrimitiveFiles.forEach(token => {
          console.log(`  --${token.name} in ${token.file}:${token.line} = ${token.value}`);
        });
      }

      expect(nonPrimitiveFiles).toHaveLength(0);
    });
  });

  describe('Primary Color Scale Consistency', () => {
    test('should have complete primary color scale in primitives only', () => {
      const primaryScalePattern = /^primary-\d{2,3}$/;
      const primaryScaleTokens = allTokenDefinitions.filter(token =>
        primaryScalePattern.test(token.name)
      );

      // Group by file
      const tokensByFile = new Map<string, TokenDefinition[]>();
      primaryScaleTokens.forEach(token => {
        if (!tokensByFile.has(token.file)) {
          tokensByFile.set(token.file, []);
        }
        tokensByFile.get(token.file)!.push(token);
      });

      // Should only be defined in index.css
      const nonPrimitiveScaleTokens = primaryScaleTokens.filter(token =>
        !token.file.includes('index.css') && !token.value.includes('var(')
      );

      if (nonPrimitiveScaleTokens.length > 0) {
        console.log('Primary scale tokens defined outside primitives:');
        nonPrimitiveScaleTokens.forEach(token => {
          console.log(`  --${token.name} in ${token.file}:${token.line}`);
        });
      }

      expect(nonPrimitiveScaleTokens).toHaveLength(0);

      // Verify complete scale in primitives
      const primitiveScaleTokens = primaryScaleTokens.filter(token =>
        token.file.includes('index.css')
      );

      const expectedScaleValues = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
      const foundScaleValues = primitiveScaleTokens.map(token =>
        token.name.replace('primary-', '')
      ).sort();

      expect(foundScaleValues).toEqual(expectedScaleValues);
    });
  });

  describe('Unused Token Detection', () => {
    test('should identify potentially unused tokens', () => {
      const definedTokens = new Set(allTokenDefinitions.map(def => def.name));
      const usedTokens = new Set(allTokenUsages.map(usage => usage.variable));

      const unusedTokens = Array.from(definedTokens).filter(token =>
        !usedTokens.has(token) &&
        !token.match(/^(background|foreground|primary|secondary)$/) && // Exclude core tokens
        !token.includes('50') && // Exclude light variants that might be used conditionally
        !token.includes('900') // Exclude dark variants that might be used conditionally
      );

      if (unusedTokens.length > 0) {
        console.log('Potentially unused tokens (manual verification needed):');
        unusedTokens.slice(0, 10).forEach(token => { // Limit output
          console.log(`  --${token}`);
        });

        if (unusedTokens.length > 10) {
          console.log(`  ... and ${unusedTokens.length - 10} more`);
        }
      }

      // This is informational - don't fail the test unless there are many unused tokens
      expect(unusedTokens.length).toBeLessThan(20);
    });
  });

  describe('Cross-Layer Token References', () => {
    test('should properly reference tokens across layers', () => {
      const semanticLayerUsages = allTokenUsages.filter(usage =>
        usage.file.includes('semantic-tokens.css')
      );

      const componentLayerUsages = allTokenUsages.filter(usage =>
        usage.file.includes('component-tokens.css')
      );

      // Semantic layer should primarily reference primitives
      const semanticPrimitiveRefs = semanticLayerUsages.filter(usage =>
        usage.variable.match(/^(mfb|primary|secondary|color)-/) ||
        usage.variable.match(/^(background|foreground)$/)
      );

      const semanticInvalidRefs = semanticLayerUsages.filter(usage =>
        usage.variable.startsWith('btn-') ||
        usage.variable.startsWith('card-') ||
        usage.variable.startsWith('dialog-')
      );

      if (semanticInvalidRefs.length > 0) {
        console.log('Invalid semantic layer references:');
        semanticInvalidRefs.forEach(ref => {
          console.log(`  var(--${ref.variable}) in ${ref.file}:${ref.line}`);
        });
      }

      expect(semanticInvalidRefs).toHaveLength(0);

      // Component layer should primarily reference semantic tokens
      const componentSemanticRefs = componentLayerUsages.filter(usage =>
        usage.variable.match(/^(primary|secondary|background|foreground|border|ring)$/) ||
        usage.variable.match(/^(success|warning|destructive|info)/)
      );

      const componentPrimitiveBypass = componentLayerUsages.filter(usage =>
        usage.variable.match(/^(primary|secondary|mfb)-\d+$/)
      );

      if (componentPrimitiveBypass.length > 0) {
        console.log('Component layer bypassing semantic tokens:');
        componentPrimitiveBypass.forEach(ref => {
          console.log(`  var(--${ref.variable}) in ${ref.file}:${ref.line}`);
          console.log(`    Context: ${ref.context}`);
        });
      }

      expect(componentPrimitiveBypass).toHaveLength(0);
    });
  });

  describe('Token Naming Consistency', () => {
    test('should follow consistent naming conventions', () => {
      const namingViolations: Array<{ token: string; issue: string; file: string }> = [];

      allTokenDefinitions.forEach(token => {
        // Check for camelCase instead of kebab-case
        if (token.name.match(/[A-Z]/)) {
          namingViolations.push({
            token: token.name,
            issue: 'Uses camelCase instead of kebab-case',
            file: token.file
          });
        }

        // Check for inconsistent prefixes in component tokens
        if (token.file.includes('component-tokens.css')) {
          const validPrefixes = ['btn-', 'card-', 'dialog-', 'input-', 'select-', 'popover-', 'table-'];
          const hasValidPrefix = validPrefixes.some(prefix => token.name.startsWith(prefix));
          const isCommonToken = token.name.match(/^(background|foreground|border|ring|text)/);

          if (!hasValidPrefix && !isCommonToken) {
            namingViolations.push({
              token: token.name,
              issue: 'Component token lacks proper component prefix',
              file: token.file
            });
          }
        }

        // Check for numbered tokens in wrong layers
        if (token.name.match(/^(primary|secondary|mfb)-\d+$/) && !token.file.includes('index.css')) {
          namingViolations.push({
            token: token.name,
            issue: 'Primitive numbered token defined outside primitives layer',
            file: token.file
          });
        }
      });

      if (namingViolations.length > 0) {
        console.log('Token naming violations:');
        namingViolations.forEach(violation => {
          console.log(`  --${violation.token}: ${violation.issue} (${violation.file})`);
        });
      }

      expect(namingViolations).toHaveLength(0);
    });
  });
});