export interface Reservation {
    suite: string;
    suiteNumber: number; // For sorting
    guestName: string;
    reservationCode: string; // The numeric part (e.g. "015079")
    checkInDate: string; // Formatted dd/mm
    checkOutDate: string; // Formatted dd/mm
    paymentStatus: string; // "Já pagou tudo" or "Falta pagar: R$ ..."
    peopleCount: string; // "2 pessoas"
    hasRomanticDecoration: boolean;
}

export interface ReportData {
    date: string;
    reservations: Reservation[];
    rawText?: string;
}

export interface NotificationResult {
    channel: 'email' | 'whatsapp';
    success: boolean;
    error?: any;
}
