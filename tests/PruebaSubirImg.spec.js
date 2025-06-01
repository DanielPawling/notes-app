const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  // Navigate to the page before each test
  await page.goto('http://localhost:4000/upload')
});

test.describe('Prueba Subir Imagen', () => {
    test('Prueba Upload', async ({ page }) => {
        // Upload a file
        const filePath = 'tests/PruebaSubirImg.spec.js';
        const input = page.locator('input[type="file"]');
        await input.setInputFiles(filePath);
        
        await page.getByPlaceholder('Ingresa un título descriptivo', { exact: true }).fill('Prueba de subida de imagen');
        await page.getByPlaceholder('Añade una descripción detallada...', { exact: true }).fill('Esta es una prueba de subida de imagen');
        await page.getByPlaceholder('0.00', { exact: true }).fill('1000');

        // Click the upload button
        await page.getByRole('button', { name: 'Upload' }).click();

        // Wait for the success message
        await page.waitForSelector('text=File uploaded successfully');
        
        // Assert that the file was uploaded successfully
        const successMessage = await page.locator('text=File uploaded successfully').isVisible();
        expect(successMessage).toBe(true);

    });
    
    });
