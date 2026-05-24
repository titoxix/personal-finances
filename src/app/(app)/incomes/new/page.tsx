import { IncomeForm } from '@/components/incomes/IncomeForm'
import { createIncome } from '../actions'

export default function NewIncomePage() {
	return <IncomeForm mode="create" onSubmit={createIncome} />
}
