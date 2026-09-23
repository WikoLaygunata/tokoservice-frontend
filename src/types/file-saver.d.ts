declare module "file-saver" {
	export interface FileSaverOptions {
		autoBom?: boolean
	}

	export function saveAs(
		data: Blob | string,
		filename?: string,
		options?: FileSaverOptions
	): void

	export default saveAs
}
