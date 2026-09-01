import imageCompression from "browser-image-compression"

const DEFAULT_IMAGE_COMPRESS_OPTIONS = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.8
} as const

function toWebpFile(compressed: Blob | File, originalFile: File): File {
	if (compressed instanceof File && compressed.name && compressed.name !== "blob") {
		return compressed
	}

	const originalName = originalFile?.name ?? "documentation"
	const baseName = originalName.replace(/\.[^/.]+$/, "") || "documentation"
	return new File([compressed], `${baseName}.webp`, { type: "image/webp" })
}

export async function compressImageFile(file: File): Promise<File> {
	const compressed = await imageCompression(file, DEFAULT_IMAGE_COMPRESS_OPTIONS)
	return toWebpFile(compressed, file)
}
