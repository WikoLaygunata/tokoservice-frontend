<template>
	<n-form ref="formRef" :model="model" :rules="rules">
		<n-form-item label="Username" path="username">
			<n-input v-model:value="model.username" autocomplete="off" size="large" @keydown.enter="signIn" />
		</n-form-item>

		<n-form-item label="Password" path="password">
			<n-input
				v-model:value="model.password"
				autocomplete="off"
				show-password-on="click"
				size="large"
				type="password"
				@keydown.enter="signIn"
			/>
		</n-form-item>
		<div class="flex flex-col items-end gap-6">
			<div class="w-full">
				<n-button class="!w-full" :loading="loading" size="large" type="primary" @click="signIn">
					Login
				</n-button>
			</div>
		</div>
	</n-form>
</template>

<script lang="ts" setup>
import { ref } from "vue"

import { useAuthStore } from "@/stores/auth"
import axios from "axios"
import {
	NButton,
	NForm,
	NFormItem,
	NInput,
	useMessage,
	type FormInst,
	type FormRules,
	type FormValidationError
} from "naive-ui"
import { useRouter } from "vue-router"

interface ModelType {
	username: string | null
	password: string | null
}

const router = useRouter()
const formRef = ref<FormInst | null>(null)
const message = useMessage()
const model = ref<ModelType>({
	username: "",
	password: ""
})

// const emit = defineEmits<{
// 	(e: "forgot-password"): void
// }>()

const loading = ref(false)
const rules: FormRules = {
	username: [
		{
			required: true,
			trigger: ["blur"],
			message: "Username Wajiib diisi"
		}
	],
	password: [
		{
			required: true,
			trigger: ["blur"],
			message: "Password Wajib diisi"
		}
	]
}

const authStore = useAuthStore()

function signIn(e: Event) {
	e.preventDefault()

	formRef.value?.validate(async (errors: Array<FormValidationError> | undefined) => {
		if (!errors) {
			loading.value = true

			await axios
				.post("auth/login", {
					username: model.value.username,
					password: model.value.password
				})
				.then(res => {
					authStore.setLogged(res.data)

					axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.token}`
					router.push({ path: "/", replace: true })
				})
				.catch(error => {
					message.error(error.response?.data?.message || error.message)
				})

			loading.value = false
		} else {
			message.error("Username atau Password Salah")
		}
	})
}
</script>
