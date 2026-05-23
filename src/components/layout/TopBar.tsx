import { Menu, Bell } from 'lucide-react'

export function TopBar() {
	return (
		<header className="sticky top-0 z-40 flex items-center justify-between bg-[#0b1326]/95 backdrop-blur-sm px-5 py-3 lg:hidden">
			<button
				type="button"
				className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
				aria-label="Menú"
			>
				<Menu className="h-5 w-5" />
			</button>

			<div className="flex items-center gap-2.5">
				<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#10b981] to-[#065f46]">
					<span className="text-xs font-bold text-[#003824]">N</span>
				</div>
				<div>
					<p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground leading-none">
						Hello!
					</p>
					<p className="text-sm font-semibold text-foreground leading-tight">Nisrina Saidah</p>
				</div>
			</div>

			<button
				type="button"
				className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
				aria-label="Notificaciones"
			>
				<Bell className="h-5 w-5" />
			</button>
		</header>
	)
}
