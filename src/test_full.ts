import { Scraper } from './scraper.js';
import { Formatter } from './formatter.js';

async function testFullFlow() {
    console.log('Starting Full Flow Test...');
    const scraper = new Scraper();

    try {
        await scraper.init();
        await scraper.login();

        console.log('Scraping report...');
        const reportData = await scraper.scrapeReport();
        console.log('Scraping complete.');
        console.log('Raw Data:', JSON.stringify(reportData, null, 2));

        console.log('Generating Email Content...');
        const message = Formatter.toEmailHtml(reportData);
        console.log('--- HTML START ---');
        console.log(message);
        console.log('--- HTML END ---');

        await scraper.close();
        console.log('Test passed!');
    } catch (error) {
        console.error('Test failed:', error);
        await scraper.close();
        process.exit(1);
    }
}

testFullFlow();
