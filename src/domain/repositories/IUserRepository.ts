import type { User } from '@/domain/entities/user'

export type UpdateUserInput = {
	firstName?: string
	lastName?: string
	name?: string
	country?: string
}

export interface IUserRepository {
	findById(id: string): Promise<User | null>
	findAllPaginated(
		page: number,
		pageSize: number,
	): Promise<{ users: User[]; total: number }>
	update(id: string, input: UpdateUserInput): Promise<User>
}
