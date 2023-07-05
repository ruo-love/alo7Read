<template>
	<view class="login-page">
		<view class="header flex-center">
			<view class="title">
				Alo7 伴读
			</view>
		</view>
		<view class="form">
			<view class="input-wrap">
				<input v-model="formData.mobilePhone" placeholder="请输入手机号" type="number" class="input">
			</view>
			<view class="input-wrap">
				<input disabled v-model="formData.predefinedPassword" placeholder="密码默认手机号后6位" class="input"
					type="text">
			</view>
		</view>
		<view class="desc">
			请使用报名的手机号码注册；如该号码已注册过爱乐奇老师，请直接使用此账号和密码登录
		</view>

		<view class="login-btn" :class={disabled:disabled} @click="register">
			注册
		</view>
		<view class="back-btn" @click="back">
			取消
		</view>
	</view>
</template>

<script setup>
	import useUserStore from '../../store/user.js'
	import {sleep} from '../../utils/tool.js'
	import {
		reactive,
		watch,
		computed
	} from "vue";
	const userStore = useUserStore()
	const formData = reactive({
		gender: 1,
		mobilePhone: "",
		predefinedPassword: "",
	})

	

	function back() {
		uni.navigateBack()
	}

	function register() {
		userStore.register(formData).then(async res => {
			uni.showToast({
				title: '密码默认手机后六位，可以去爱乐奇老师app修改密码',
				icon: "none"
			})
			await sleep(800)
			uni.navigateBack()
		})
	}
	const disabled = computed(() => !(formData.mobilePhone.length === 11))
	watch(
		() => formData.mobilePhone,
		val => {
			formData.predefinedPassword = val.slice(-6)
		}
	)
</script>

<style>
	.login-page {
		height: 100vh;
		background-color: #fff;
	}

	.header {
		position: relative;
		height: 30%;
		/* opacity: 0.1; */
	}

	.header::after {
		position: absolute;
		top: -10%;
		right: 0%;
		display: block;
		width: 100%;
		height: 100%;
		content: '';
		background-color: #1a73e8;
		border-bottom-right-radius: 300px;
	}

	.title {
		position: relative;
		font-size: 30px;
		color: #fff;
		z-index: 999;

	}

	.form {

		padding: 16px;
		background-color: #fff;
	}

	.input-wrap {
		display: flex;
		align-items: center;
		margin-bottom: 10px;
		border-radius: 10px;
		overflow: hidden;
	}

	.input {
		box-sizing: border-box;
		padding: 6px 16px;
		height: 50px;
		line-height: 38px;
		flex: 1;
		background-color: #f5f6fa;
	}

	.desc {
		margin: 20px;
		text-align: center;
		font-size: 13px;
		line-height: 24px;
		color: #999;
	}

	.back-btn {
		margin: 20px auto;
		width: 80%;
		height: 50px;
		text-align: center;
		line-height: 50px;
		color: #1a73e8;
		background-color: #f5f6fa;
		border-radius: 10px;
	}

	.login-btn {
		margin: 0 auto;
		width: 80%;
		height: 50px;
		text-align: center;
		line-height: 50px;
		color: #fff;
		background-color: #10b56d;
		border-radius: 10px;
	}
.login-btn:active{
		opacity: 0.9;
	}
	.disabled {
		opacity: 0.5;
	}

	.register {
		margin: 0 auto;
		padding: 16px 0;
		width: 50%;
		color: #ffba15;
		text-align: center;
		font-size: 13px;
	}
</style>