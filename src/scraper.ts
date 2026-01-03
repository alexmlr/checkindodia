import { chromium, Browser, Page } from 'playwright';
import { config } from './config.js';
import { ReportData, Reservation } from './types.js';

export class Scraper {
    private browser: Browser | null = null;
    private page: Page | null = null;

    async init() {
        this.browser = await chromium.launch({
            headless: config.app.headless,
        });
        this.page = await this.browser.newPage();
    }

    async login() {
        if (!this.page) throw new Error('Browser not initialized');

        console.log(`Navigating to Login: ${config.urls.login}`);
        await this.page.goto(config.urls.login, { waitUntil: 'networkidle' });

        // Updated selectors based on inspection
        const USER_SELECTOR = '#user_email';
        const PASS_SELECTOR = '#user_password';
        const SUBMIT_SELECTOR = '.btn-yellow--login';

        try {
            if (await this.page.isVisible(USER_SELECTOR)) {
                await this.page.fill(USER_SELECTOR, config.credentials.username);
                await this.page.fill(PASS_SELECTOR, config.credentials.password);
                await this.page.click(SUBMIT_SELECTOR);

                await this.page.waitForTimeout(3000); // Simple wait for navigation
                console.log('Login form submitted');
            } else {
                console.log('Login form not found, might be already logged in or page specific?');
                await this.page.screenshot({ path: 'login_debug.png' });
            }
        } catch (e) {
            console.error('Error during login step', e);
            throw e;
        }
    }

    async scrapeReport(): Promise<ReportData> {
        if (!this.page) throw new Error('Browser not initialized');

        console.log(`Navigating to Report: ${config.urls.report}`);
        await this.page.goto(config.urls.report, { waitUntil: 'networkidle' });

        const TABLE_SELECTOR = 'div.card-body .table-responsive table.table tbody tr';

        try {
            // Wait for the table to load
            await this.page.waitForSelector('div.card-body', { timeout: 15000 });

            // Check if table exists
            const rows = await this.page.$$(TABLE_SELECTOR);
            console.log(`Found ${rows.length} rows in the table.`);

            const reservations: Reservation[] = [];
            const currentDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

            // We iterate specifically over the visible rows of the first table
            // The selector 'div.card-body .table-responsive table.table tbody tr' matches all tables
            // But querySelectorAll returns them in document order.
            // We need to ensure we only get rows from the FIRST table-responsive div.

            // Refined selector for strictly the first table
            const FIRST_TABLE_ROWS_SELECTOR = 'div.card-body > div.table-responsive:first-of-type table.table tbody tr';
            const firstTableRows = await this.page.$$(FIRST_TABLE_ROWS_SELECTOR);
            console.log(`Processing ${firstTableRows.length} rows from the Daily Entries table.`);

            for (const row of firstTableRows) {
                const cols = await row.$$('td');
                if (cols.length < 7) continue;

                // 1. Extract Basic Info
                const numText = await cols[0].innerText(); // "BO:015079"
                const guestName = (await cols[1].innerText()).trim();
                const uhText = (await cols[2].innerText()).trim(); // "Quarto 2"
                const checkoutText = (await cols[3].innerText()).trim(); // "03/01/2026"
                const totalPaymentText = (await cols[5].innerText()).trim(); // "R$ 0,00" or value
                const peopleText = (await cols[6].innerText()).trim(); // "2" or "2 (1)"

                // 1.1 Extract Details Link
                const linkElement = await cols[0].$('a');
                const detailUrl = linkElement ? await linkElement.getAttribute('href') : null;

                // 2. Parse Data
                const suiteNumber = parseInt(uhText.replace(/\D/g, '')) || 999;
                const reservationCode = numText.includes(':') ? numText.split(':')[1] : numText;

                // Date basic formatting (remove year if present)
                const checkOutDate = checkoutText.substring(0, 5); // "03/01"

                // Payment Status Logic
                let paymentStatus = `Falta pagar: ${totalPaymentText}`;
                if (totalPaymentText === 'R$ 0,00') {
                    paymentStatus = 'Já pagou tudo';
                }

                // People Logic
                let peopleCount = peopleText;
                const peopleMatches = peopleText.match(/\d+/g);
                if (peopleMatches && peopleMatches.length > 1) {
                    const totalPeople = peopleMatches.reduce((acc, val) => acc + parseInt(val), 0);
                    peopleCount = `${totalPeople} pessoas`;
                } else if (peopleMatches && peopleMatches.length === 1) {
                    peopleCount = `${peopleMatches[0]} pessoas`;
                }

                // 3. Navigation for details (Sequential to manage browser state)
                let hasRomanticDecoration = false;
                if (detailUrl) {
                    const fullUrl = detailUrl.startsWith('http') ? detailUrl : new URL(detailUrl, config.urls.report).toString();
                    console.log(`Checking details for ${reservationCode} at ${fullUrl}`);

                    const newPage = await this.browser!.newPage();
                    try {
                        await newPage.goto(fullUrl, { waitUntil: 'domcontentloaded' });

                        // Check for observation
                        const OBS_SELECTOR = '#reservation_note';
                        if (await newPage.isVisible(OBS_SELECTOR)) {
                            const matchText = 'DECORAÇÃO ROMÂNTICA: PÉTALAS';
                            const obsContent = await newPage.inputValue(OBS_SELECTOR);
                            if (obsContent && obsContent.toUpperCase().includes(matchText)) {
                                hasRomanticDecoration = true;
                            }
                        }
                    } catch (err) {
                        console.error(`Failed to scrape details for ${reservationCode}`, err);
                    } finally {
                        await newPage.close();
                    }
                }

                reservations.push({
                    suite: uhText,
                    suiteNumber,
                    guestName: guestName.split('-')[0].trim(), // Assuming name might have dash, but usually safe
                    reservationCode,
                    checkInDate: currentDate, // As per instruction: "data do dia em que o relatorio está sendo extraido"
                    checkOutDate,
                    paymentStatus,
                    peopleCount,
                    hasRomanticDecoration
                });
            }

            return {
                date: currentDate,
                reservations,
                rawText: `Scraped ${reservations.length} reservations.`
            };

        } catch (e) {
            console.error('Error during scraping', e);
            // Return empty or throw
            throw e;
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}
