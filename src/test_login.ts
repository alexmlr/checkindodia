import { Scraper } from './scraper.js';
import { config } from './config.js';

async function testLogin() {
    console.log('Starting login test...');
    const scraper = new Scraper();

    try {
        await scraper.init();
        await scraper.login();
        console.log('Login function completed without error.');

        // Add a small delay to see the result if needed or take a screenshot
        // In a real test, we might check for a specific element on the dashboard

        await scraper.close();
        console.log('Test passed!');
        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        await scraper.close();
        process.exit(1);
    }
}

testLogin();
