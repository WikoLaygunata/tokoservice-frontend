const imageBaseUrl = (import.meta.env.VITE_IMAGE_BASE_URL || "").replace(/\/+$/, "")

export function resolveImageUrl(path?: string | null): string {
	if (!path) return ""
	if (path.startsWith("data:") || path.startsWith("blob:")) return path

	if (/^https?:\/\//i.test(path)) {
		try {
			const parsedUrl = new URL(path)
			const storageIndex = parsedUrl.pathname.indexOf("/storage/")

			if (storageIndex >= 0) {
				return `${imageBaseUrl}/${parsedUrl.pathname.slice(storageIndex + "/storage/".length)}`
			}
		} catch {
			return path
		}

		return path
	}

	return `${imageBaseUrl}/${path.replace(/^\/?(storage\/)?\/?/, "")}`
}
