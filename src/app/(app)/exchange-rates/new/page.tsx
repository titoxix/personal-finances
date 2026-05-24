import { ExchangeRateForm } from '@/components/exchange-rates/ExchangeRateForm'
import { createExchangeRates } from '../actions'

export default function NewExchangeRatePage() {
	return <ExchangeRateForm onSubmit={createExchangeRates} />
}
