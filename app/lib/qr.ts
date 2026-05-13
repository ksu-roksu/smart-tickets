import * as crypto from "crypto";

const QR_SECRET = process.env.QR_SECRET || "smart-tickets-qr-secret-2025";

function getTimeStep(): number {
  return Math.floor(Date.now() / 1000 / 30);
}

export function generateTicketToken(ticketId: string): string {
  const step = getTimeStep();
  const hash = crypto
    .createHmac("sha256", QR_SECRET)
    .update(`${ticketId}-${step}`)
    .digest("hex")
    .slice(0, 8);
  return `ST-${ticketId}-${hash}`;
}

export function verifyTicketToken(ticketId: string, token: string): boolean {
  const currentStep = getTimeStep();
  for (const step of [currentStep, currentStep - 1]) {
    const hash = crypto
      .createHmac("sha256", QR_SECRET)
      .update(`${ticketId}-${step}`)
      .digest("hex")
      .slice(0, 8);
    if (token === `ST-${ticketId}-${hash}`) return true;
  }
  return false;
}

export function getTokenExpiresIn(): number {
  const now = Math.floor(Date.now() / 1000);
  return 30 - (now % 30);
}
