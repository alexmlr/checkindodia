import { ReportData, Reservation } from './types.js';

export class Formatter {
    /**
     * Generates the WhatsApp formatted message
     */
    static toWhatsAppText(data: ReportData): string {
        const header = `*Entradas do dia ${data.date}*`;

        if (data.reservations.length === 0) {
            return `${header}\n\n*Não há entrada de hospedes hoje*`;
        }

        const body = data.reservations
            .sort((a, b) => a.suiteNumber - b.suiteNumber)
            .map(res => {
                const lines = [
                    `Suíte ${res.suiteNumber}`,
                    `🗓 Entra ${res.checkInDate} e sai ${res.checkOutDate}`,
                    `${res.guestName} - ${res.reservationCode}`,
                    `💰 ${res.paymentStatus}`,
                    `👤 ${res.peopleCount}`
                ];

                if (res.hasRomanticDecoration) {
                    lines.push(`❤️ Decoração romântica: pétalas`);
                }

                return lines.join('\n');
            })
            .join('\n\n');

        return `${header}\n\n${body}`;
    }

    static toEmailHtml(data: ReportData): string {
        const header = `<h2>Entradas do dia ${data.date}</h2>`;

        if (data.reservations.length === 0) {
            return `${header}<p><strong>Não há entrada de hospedes hoje</strong></p>`;
        }

        const body = data.reservations
            .sort((a, b) => a.suiteNumber - b.suiteNumber)
            .map(res => {
                const romantic = res.hasRomanticDecoration ? '<br>❤️ Decoração romântica: pétalas' : '';
                return `
                <div style="border-bottom: 1px solid #ccc; padding: 10px 0;">
                    <strong>Suíte ${res.suiteNumber}</strong><br>
                    🗓 Entra ${res.checkInDate} e sai ${res.checkOutDate}<br>
                    ${res.guestName} - ${res.reservationCode}<br>
                    💰 ${res.paymentStatus}<br>
                    👤 ${res.peopleCount}
                    ${romantic}
                </div>`;
            })
            .join('');

        return `
        <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            ${header}
            ${body}
        </body>
        </html>`;
    }

}
