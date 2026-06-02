export const COOKIE_NAME = 'kashi_session'
export const MAX_AGE = 60 * 60 * 24 * 30

export async function getExpectedToken(): Promise<string> {
	const secret = process.env.SESSION_SECRET
	if (!secret) throw new Error('SESSION_SECRET is not set')

	const encoder = new TextEncoder()
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign'],
	)

	const signature = await crypto.subtle.sign(
		'HMAC',
		key,
		encoder.encode('kashi-auth'),
	)

	return Array.from(new Uint8Array(signature))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('')
}

export function safeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false
	const aBytes = new TextEncoder().encode(a)
	const bBytes = new TextEncoder().encode(b)
	let result = 0
	for (let i = 0; i < aBytes.length; i++) {
		result |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0)
	}
	return result === 0
}
