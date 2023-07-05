<template>
	<view class="user-page">
		<image class="bg" src="../../static/images/topbg@3x.png" mode=""></image>
		<view class="info">
			<div class="header flex-center ">
				<image class="icon-56" src="../../static/images/portrait_boy@3x.png" style="border-radius: 50%;">
				</image>
			</div>
			<view v-if="userStore.accessToken" class="">
				<view class="card-shadow">
					<text>用户:</text><text style="padding: 0 20px;">{{userStore.mobilePhone}}</text>
				</view>
				<view class="card-shadow logout" @click="userStore.logout">
					<text>退出登录</text>
				</view>
			</view>
			<view v-else style="margin: 60px 0;">
				<view @click="auth" class="card-shadow logout auth-btn">
					<text>授权登录</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import useUserStore from '../../store/user.js'

	const userStore = useUserStore()

	function auth() {
		uni.navigateTo({
			url: '/pages/login/index'
		})
	}
	
</script>

<style>
	.user-page {
		height: 100vh;
		background-color: #f5f6fa;
		/* background: linear-gradient(to bottom, #fafafa, #6c5ce7, #1a73e8); */
	}

	.header {
		padding: 0px 16px;
	}

	.bg {
		position: relative;
		width: 100%;
	}

	.logout {
		text-align: center;
		color: red;
	}

	.auth-btn {

		color: #10b56d;
	}
	.auth-btn:active{
		opacity: 0.9;
	}
</style>