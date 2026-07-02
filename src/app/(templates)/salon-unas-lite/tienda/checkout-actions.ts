'use server'

import { config } from '../template.config'
import * as shared from '@/lib/salon/checkout-actions'
import type { CheckoutResult } from '@/lib/salon/checkout-actions'

export type { CheckoutResult }

export async function createOrder(input: Omit<Parameters<typeof shared.createOrder>[1], 'basePath'>): Promise<CheckoutResult> {
  return shared.createOrder(config, { ...input, basePath: '/salon-unas-lite' })
}

export async function checkOrderPayment(orderId: string) {
  return shared.checkOrderPayment(config, orderId)
}
