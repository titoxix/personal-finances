import type { User } from '@/domain/entities/user'
import type {
	IUserRepository,
	UpdateUserInput,
} from '@/domain/repositories/IUserRepository'

export function createUserService(repo: IUserRepository) {
	return {
		findById: async (id: string): Promise<User> => {
			const user = await repo.findById(id)
			if (!user) throw new Error('User not found')
			return user
		},

		findAllPaginated: (
			page: number,
			pageSize: number,
		): Promise<{ users: User[]; total: number }> =>
			repo.findAllPaginated(page, pageSize),

		update: async (id: string, input: UpdateUserInput): Promise<User> => {
			const existing = await repo.findById(id)
			if (!existing) throw new Error('User not found')
			return repo.update(id, input)
		},
	}
}
