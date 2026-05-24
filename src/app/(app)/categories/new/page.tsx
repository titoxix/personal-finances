import { CategoryForm } from '@/components/categories/CategoryForm'
import { createCategory } from '../actions'

export default function NewCategoryPage() {
	return <CategoryForm mode="create" onSubmit={createCategory} />
}
