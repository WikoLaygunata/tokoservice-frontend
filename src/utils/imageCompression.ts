import imageCompression from "browser-image-compression"

export const TICKET_IMAGE_COMPRESS_OPTIONS = {
	maxSizeMB: 0.1, // Max 100KB
	maxWidthOrHeight: 1280, // Max 1280px
	useWebWorker: true,
	fileType: "image/webp",
	initialQuality: 0.75
} as const

function toWebpFile(compressed: Blob | File, originalFile: File): File {
	if (compressed instanceof File && compressed.name && compressed.name !== "blob" && compressed.name.endsWith(".webp")) {
		return compressed
	}

	const originalName = originalFile?.name ?? "ticket-photo"
	const baseName = originalName.replace(/\.[^/.]+$/, "") || "ticket-photo"
	return new File([compressed], `${baseName}.webp`, { type: "image/webp" })
}

export async function compressImageFile(file: File, options = TICKET_IMAGE_COMPRESS_OPTIONS): Promise<File> {
	const compressed = await imageCompression(file, options)
	return toWebpFile(compressed, file)
}

