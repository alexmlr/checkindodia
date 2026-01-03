import { checkConfig } from './config.js';
import { Scraper } from './scraper.js';
import { Formatter } from './formatter.js';
import { Notifier } from './notifier.js';

async function main() {
    console.log('Starting Daily Report Scraper...');
    console.log('Execution Mode: Compiled JS (npm start)');

    // 1. Validate Env
    try {
        checkConfig();
    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
        }
        process.exit(1);
    }

    const scraper = new Scraper();
    const notifier = new Notifier();

    try {
        // 2. Scrape
        await scraper.init();
        await scraper.login();
        const reportData = await scraper.scrapeReport();
        console.log('Scraping complete. Items:', reportData.reservations.length);

        // 3. Format
        // data is already structured
        // 3. Format
        // data is already structured
        const emailHtml = Formatter.toEmailHtml(reportData);

        // 4. Notify
        console.log('Sending Notifications...');

        // Email
        const subject = `Relatório Diário - ${reportData.date}`;
        await notifier.sendEmail(subject, emailHtml);

    } catch (error) {
        console.error('Workflow failed:', error);
        process.exit(1);
    } finally {
        await scraper.close();
        console.log('Done.');
    }
}

main();
