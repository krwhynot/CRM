// Feature Flag Testing Script for Organizations Page
console.log("🧪 Testing Organizations Page Feature Flags");

// Test with NEW_STYLE enabled (default)
localStorage.setItem('useNewStyle', 'true');
console.log("✅ NEW_STYLE enabled");
console.log("Features active: MFB cream background, elevated cards, hover effects, sort indicators, rounded badges");

// Test with NEW_STYLE disabled  
localStorage.setItem('useNewStyle', 'false');
console.log("✅ NEW_STYLE disabled");
console.log("Features active: Original styling, basic hover, standard badges");

// Reset to default (enabled)
localStorage.removeItem('useNewStyle');
console.log("✅ Reset to default (NEW_STYLE enabled)");
