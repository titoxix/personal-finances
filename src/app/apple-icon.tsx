import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
	return new ImageResponse(
		<div
			style={{
				width: 180,
				height: 180,
				background: '#0b1326',
				borderRadius: 36,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontSize: 120,
				fontWeight: 700,
				color: '#4edea3',
			}}
		>
			$
		</div>,
		{ ...size },
	)
}
