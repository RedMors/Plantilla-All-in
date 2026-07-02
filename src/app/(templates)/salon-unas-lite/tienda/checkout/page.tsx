import { config } from '../../template.config'
import CheckoutClient from './CheckoutClient'

export const metadata = { title: 'Carrito — Nails by Mariela' }

export default function CheckoutPage() {
  return <CheckoutClient methods={config.methods} />
}
