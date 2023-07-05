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
				<input v-model="formData.password" placeholder="请输入密码" class="input" type="text">
			</view>
		</view>
		<!-- <view class="register" @click="toRegister">
			没有账号，前往注册
		</view> -->
		<view class="desc">
			请使用爱乐奇学生账号和密码登录
		</view>

		<view class="login-btn" :class={disabled:disabled} @click="toLogin">
			登录
		</view>
	</view>
</template>

<script setup>
	import useUserStore from '../../store/user.js'
	import {
		computed,
		reactive
	} from "vue";
	import {
		sleep
	} from '../../utils/tool.js';
	const userStore = useUserStore()
	const formData = reactive({
		mobilePhone: '',
		password: ''
	})
	const disabled = computed(() => !(formData.mobilePhone.length === 11 && formData.password.length > 0))
	async function toRegister() {
		uni.navigateTo({
			url: '/pages/register/index'
		})
	}

	async function toLogin() {
		if (disabled.value) return
		userStore.login(formData).then(async() => {
			uni.showToast({
				title: '登录成功',
				icon: "none"
			})
			await sleep(800)
			uni.switchTab({
				url: '/pages/home/index'
			})
		}).catch((err)=>{
			console.log(err)
		})
	}
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