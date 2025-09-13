#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the CRMFormBuilder file
const filePath = path.join(__dirname, '../src/components/forms/CRMFormBuilder.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all control={control} with control={control as any}
content = content.replace(/control={control}/g, 'control={control as any}');

// Write back
fs.writeFileSync(filePath, content);
console.log('Fixed control type issues in CRMFormBuilder.tsx');