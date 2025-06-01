const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  // Navigate to the page before each test
  await page.goto('http://localhost:3000/users/signin')
});

test.describe('Prueba SignIn', () => {
    test('Prueba SignIn', async ({ page }) => {
        await page.getByPlaceholder('Email').fill('juanperez@gmail.com');
        await page.getByPlaceholder('Password').fill('1234567890');
        await page.getByRole('button', { name: 'Login' }).click();

    });
    
    });
