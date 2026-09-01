<template>
	<n-card class="themed-card rounded-xl border shadow-sm" title="Public API Documentation">
		<div class="themed-panel mb-10 rounded-xl border p-6">
			<n-text class="themed-muted text-sm leading-relaxed md:text-base" depth="3">
				Semua endpoint di bawah ini tidak membutuhkan autentikasi dan dapat diakses secara publik.
			</n-text>

			<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div class="themed-chip flex items-center rounded-lg border p-3 shadow-sm transition-all">
					<n-tag class="mr-3 font-bold" round size="small" type="info">Base URL</n-tag>
					<code class="themed-link truncate font-mono text-[11px] md:text-xs">{{ apiBase }}/public</code>
				</div>
				<div class="themed-chip flex items-center rounded-lg border p-3 shadow-sm transition-all">
					<n-tag class="mr-3 font-bold" round size="small" type="info">File URL</n-tag>
					<code class="themed-link truncate font-mono text-[11px] md:text-xs">{{ apiBase }}/storage</code>
				</div>
			</div>
		</div>

		<div class="space-y-12">
			<section>
				<div class="themed-divider mb-6 flex items-center gap-3 border-b pb-2">
					<div class="h-6 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"></div>
					<h3 class="themed-title text-xl font-extrabold tracking-tight">Landing Page</h3>
				</div>

				<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
					<div v-for="endpoint in landingEndpoints" :key="endpoint.path" class="endpoint-container">
						<n-collapse arrow-placement="right">
							<n-collapse-item
								class="themed-chip overflow-hidden rounded-lg border shadow-sm transition-all duration-300 hover:shadow-md"
								:name="endpoint.path"
							>
								<template #header>
									<div class="flex items-center gap-3">
										<n-tag class="px-2 font-black" round size="small" strong type="success">
											GET
										</n-tag>
										<code
											class="truncate font-mono text-xs font-bold tracking-tighter text-blue-700"
										>
											{{ endpoint.path }}
										</code>
									</div>
								</template>

								<div class="themed-section border-t p-4">
									<n-text class="themed-muted mb-3 block text-[11px] font-medium" depth="3">
										{{ endpoint.desc }}
									</n-text>
									<div class="group relative">
										<span
											class="themed-muted absolute right-2 top-2 text-[9px] font-bold uppercase tracking-widest opacity-0 transition-opacity group-hover:opacity-100"
										>
											Response
										</span>
										<pre
											class="scrollbar-thin overflow-x-auto rounded-lg border border-slate-800 bg-slate-900 p-4 font-mono text-[10px] leading-normal text-blue-300"
										><code>{{ examples[endpoint.exampleKey] }}</code></pre>
									</div>
								</div>
							</n-collapse-item>
						</n-collapse>
					</div>
				</div>
			</section>
		</div>
	</n-card>
</template>

<script setup>
import { NCard, NCollapse, NCollapseItem, NTag, NText } from "naive-ui"

const apiBase = import.meta.env.VITE_API_BASE_URL + "/api" || "/api"

const landingEndpoints = [
	{ path: "/divisions", desc: "Daftar divisi & subdivisi aktif.", exampleKey: "divisions" },
	{ path: "/officers?year=2026", desc: "Daftar pengurus per tahun (default tahun ini).", exampleKey: "officers" },
	{
		path: "/activists?subdivision_id=1&year=2026",
		desc: "Daftar aktivis berdasarkan subdivisi & tahun (default tahun ini).",
		exampleKey: "activistsBySubdivision"
	},
	{ path: "/events?year=2025", desc: "Daftar event aktif (default tahun ini).", exampleKey: "events" },
	{
		path: "/articles?search=BSLC&type=Event&page=1&pageSize=10",
		desc: "Artikel yang sudah dipublish & aktif dengan pagination; filter optional `type` (Event/Info).",
		exampleKey: "articles"
	},
	{
		path: "/variables",
		desc: "Ambil variables berdasarkan array `names` di query/body.",
		exampleKey: "variablesResponse"
	}
]

const examples = {
	divisions: JSON.stringify(
		[
			{
				id: 1,
				name: "Learning",
				description:
					"Divisi yang mengatur dan me-monitoring kegiatan mentoring BSLC serta menyiapkan perlengkapan kegiatan.",
				subdivisions: [
					{
						id: 1,
						division_id: 1,
						name: "Mentoring",
						description: "Mengelola operasional belajar mengajar antara Mentor dan Mentee."
					}
				]
			}
		],
		null,
		2
	),
	officers: JSON.stringify(
		[
			{ id: 1, title: "Chairman of BSLC", name: "Ana", image_path: null, year: 2026 },
			{ id: 2, title: "General Secretary of BSLC", name: "Ana", image_path: null, year: 2026 }
		],
		null,
		2
	),
	activistsBySubdivision: JSON.stringify(
		[
			{
				id: 1,
				name: "Nama Aktivis",
				year: 2026,
				subdivision_id: 1,
				image_path: "/storage/activists/contoh.jpg"
			}
		],
		null,
		2
	),
	events: JSON.stringify(
		[
			{
				id: 1,
				title: "BSLC Orientation 2025",
				description: "Acara perkenalan anggota baru BSLC dan overview program tahun ini.",
				image_path: null,
				year: 2025
			}
		],
		null,
		2
	),
	articles: JSON.stringify(
		{
			current_page: 1,
			data: [
				{
					id: 1,
					title: "Selamat Datang di BSLC",
					slug: "selamat-datang-di-bslc",
					thumbnail: null,
					type: "Event",
					status: "published",
					created_at: "2025-01-01T00:00:00.000000Z"
				}
			],
			first_page_url: "http://localhost:8000/api/public/articles?page=1",
			from: 1,
			last_page: 1,
			last_page_url: "http://localhost:8000/api/public/articles?page=1",
			links: [
				{ url: null, label: "&laquo; Sebelumnya", page: null, active: false },
				{
					url: "http://localhost:8000/api/public/articles?page=1",
					label: "1",
					page: 1,
					active: true
				},
				{ url: null, label: "Berikutnya &raquo;", page: null, active: false }
			],
			next_page_url: null,
			path: "http://localhost:8000/api/public/articles",
			per_page: 10,
			prev_page_url: null,
			to: 1,
			total: 1
		},
		null,
		2
	),
	variablesResponse: JSON.stringify(
		[
			{
				id: 1,
				name: "slogan",
				value: "Belajar Bersama, Berkarya Bersama",
				image_path: null
			}
		],
		null,
		2
	)
}
</script>

<style scoped>
/* Styling Header Collapse Naive UI */
:deep(.n-collapse-item__header) {
	padding: 14px !important;
	font-size: 13px;
}

:deep(.n-collapse-item__content-inner) {
	padding: 0 !important; /* Hilangkan padding default agar background slate full */
}

/* Custom Scrollbar for Code Blocks */
pre::-webkit-scrollbar {
	height: 4px;
}
pre::-webkit-scrollbar-thumb {
	background: #334155;
	border-radius: 10px;
}

.themed-card {
	border-color: var(--border-color);
}
.themed-panel {
	border-color: var(--border-color);
	background: var(--hover-color);
}
.themed-chip {
	border-color: var(--border-color);
	background: var(--card-color);
}
.themed-divider {
	border-color: var(--border-color);
}
.themed-section {
	border-color: var(--border-color);
	background: color-mix(in srgb, var(--hover-color) 70%, transparent);
}
.themed-title {
	color: var(--text-color-1);
}
.themed-muted {
	color: var(--text-color-3);
}
.themed-link {
	color: var(--primary-color);
}
.themed-coming {
	border-color: color-mix(in srgb, #f97316 50%, var(--divider-color));
	background: color-mix(in srgb, #f97316 10%, var(--card-color));
}
</style>
