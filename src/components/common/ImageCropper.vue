<template>
	<div class="image-cropper">
		<slot :openCropper="openCropper"></slot>

		<n-modal v-model:show="showCropper">
			<n-card class="image-cropper-modal flex flex-col" content-style="padding:20px">
				<div class="aspect-square">
					<div v-if="!img" class="upload-box">
						<n-upload
							v-show="!img"
							ref="uploader"
							accept="image/*"
							:show-file-list="false"
							@change="setImage"
						>
							<n-upload-dragger>
								<div>{{ placeholder }}</div>
							</n-upload-dragger>
						</n-upload>
					</div>
					<div v-if="img" class="crop-box">
						<Cropper
							ref="cropper"
							class="cropper aspect-square"
							image-restriction="stencil"
							:resize-image="resizeImage"
							:src="img"
							:stencil-component="CircleStencil"
							:stencil-props="stencilProps"
							:stencil-size="stencilSize"
						></Cropper>
					</div>
				</div>
				<div class="flex justify-end gap-4 mt-4">
					<n-button secondary @click="closeCropper()">Close</n-button>
					<n-button v-if="img" type="primary" @click="emitCrop()">Save</n-button>
				</div>
			</n-card>
		</n-modal>
	</div>
</template>

<script lang="ts" setup>
import { NButton, NCard, NModal, NUpload, NUploadDragger, type UploadFileInfo } from "naive-ui"
import { ref, toRefs } from "vue"
import { CircleStencil, Cropper, type CropperResult } from "vue-advanced-cropper"
import "vue-advanced-cropper/dist/style.css"

export type ImageCropperResult = CropperResult

const emit = defineEmits<{
	(e: "crop", value: ImageCropperResult): void
}>()

const props = withDefaults(
	defineProps<{
		placeholder?: string
	}>(),
	{ placeholder: "Select a picture" }
)
const { placeholder } = toRefs(props)

const img = ref("")
const showCropper = ref(false)
const cropper = ref<typeof Cropper | null>(null)

const stencilSize = ref({
	width: 300,
	height: 300
})
const stencilProps = ref({
	handlers: {},
	movable: false,
	scalable: false,
	aspectRatio: 1
})
const resizeImage = ref({
	adjustStencil: false
})

function closeCropper() {
	showCropper.value = false
	img.value = ""
}
function openCropper() {
	showCropper.value = true
	img.value = ""
}

function setImage(data: {
	file: UploadFileInfo
	fileList: UploadFileInfo[]
	event: ProgressEvent | Event | undefined
}): void {
	if (data?.file?.file) {
		const reader = new FileReader()
		reader.readAsDataURL(data.file.file)
		reader.onload = () => {
			img.value = reader.result?.toString() || ""
		}
	}
}

function emitCrop() {
	if (cropper.value) {
		const result = cropper.value.getResult()
		emit("crop", result)
	}
	closeCropper()
}
</script>

<style lang="scss" scoped>
.image-cropper-modal {
	width: 90vw;
	max-width: 300px;

	.upload-box {
		height: 100%;
		width: 100%;

		.n-upload {
			height: 100%;
			width: 100%;

			:deep() {
				.n-upload-trigger,
				.n-upload-dragger {
					height: 100%;
					width: 100%;
					display: flex;
					justify-content: center;
					align-items: center;
				}
			}
		}
	}

	.crop-box {
		overflow: hidden;
		border-radius: var(--border-radius-small);

		:deep() {
			.vue-line-wrapper {
				display: none;
			}
		}
	}
}
</style>
