import { chromium } from 'playwright';

async function debugInteractionsPage() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('Navigating to interactions page...');
    await page.goto('http://localhost:5176/interactions', { waitUntil: 'networkidle' });
    
    console.log('Page title:', await page.title());
    console.log('Current URL:', page.url());
    
    // Take a screenshot
    await page.screenshot({ path: 'tests/debug-page.png' });
    
    // Get page content
    const headings = await page.locator('h1').allTextContents();
    console.log('All H1 headings:', headings);
    
    // Check if we're on login page or interactions page
    const loginForm = await page.locator('form').count();
    console.log('Number of forms on page:', loginForm);
    
    // Get all text content to see what's actually on the page
    const bodyText = await page.locator('body').textContent();
    console.log('Page contains "Interactions":', bodyText.includes('Interactions'));
    console.log('Page contains "Login":', bodyText.includes('Login'));
    
    // Look for the add interaction button
    const addButton = await page.locator('button:has-text("Add Interaction")').count();
    console.log('Add Interaction button found:', addButton > 0);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugInteractionsPage();