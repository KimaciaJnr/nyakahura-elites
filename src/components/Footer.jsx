export default function Footer() {
	return (
		<footer className="bg-navy-dark px-6 py-8 text-white lg:px-10">
			<div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<img
						src="/logo.png"
						alt="Nyakahura Elites"
						className="h-10 w-10 rounded-full object-cover ring-1 ring-white/20"
					/>
					<p className="font-serif text-lg font-bold text-white">Nyakahura Elites</p>
				</div>
				<p>Growing together. Giving back.</p>
			</div>
		</footer>
	);
}
