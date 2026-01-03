import { Notifier } from './notifier.js';

async function testEmail() {
    console.log('Starting Email Test...');
    const notifier = new Notifier();

    const subject = '🚀 Teste de Configuração do Robô';
    const html = `
    <html>
        <body>
            <h1>Teste bem sucedido!</h1>
            <p>Se você está lendo isso, a configuração de email do Robô de Checkins está funcionando.</p>
        </body>
    </html>
    `;

    const result = await notifier.sendEmail(subject, html);
    if (result.success) {
        console.log('Email enviado com sucesso!');
    } else {
        console.error('Falha ao enviar email:', result.error);
    }
}

testEmail();
