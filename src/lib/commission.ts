export type PaymentMethod = 'wompi' | 'cash' | 'transfer'

export interface CommissionResult {
  grossAmount: number
  platformFee: number
  netAmount: number
  paymentMethod: PaymentMethod
  commissionPct: number
}

const COMMISSION_BY_METHOD: Record<PaymentMethod, number> = {
  wompi:    3.5,
  cash:     0,
  transfer: 0,
}

export function calculateCommission(
  grossAmount: number,
  paymentMethod: PaymentMethod = 'wompi'
): CommissionResult {
  if (!isFinite(grossAmount) || grossAmount < 0) {
    throw new Error(`[commission] Invalid grossAmount: ${grossAmount}`)
  }
  const pct = COMMISSION_BY_METHOD[paymentMethod]
  const platformFee = Math.round(grossAmount * pct) / 100
  const netAmount = Math.round((grossAmount - platformFee) * 100) / 100
  return { grossAmount, platformFee, netAmount, paymentMethod, commissionPct: pct }
}

export function fmtUSD(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return `$${Number(amount).toFixed(2)}`
}
