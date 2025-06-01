const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  // Navigate to the page before each test
  await page.goto('http://localhost:3000/users/signup')
});

test.describe('Prueba SignUp', () => {
    test('Prueba SignUp', async ({ page }) => {
        await page.getByLabel('Name').fill('Juan Perez');
        await page.getByLabel('Email').fill('juanperez@gmail.com');
        await page.getByLabel('Password', { exact: true }).fill('1234567890');
        await page.getByLabel('Confirm Password', { exact: true }).fill('1234567890');
        
        await page.getByRole('button', { name: 'Register' }).click();
    });
    
    });
