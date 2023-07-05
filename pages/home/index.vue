<template>
	<view class="home-page" :style="{'padding-top':userStore.accessToken?systemStore.headerTop+'px':'0'}">
		<view v-if="userStore.accessToken" class="card-shadow card-wrap"  @click="enter">
			<image style="width: 100%;" src="../../static/images/ic_shiyong@3x.png" mode="widthFix"></image>
			<view class="title">
				Alo7伴读中心
			</view>
		</view>
		<view v-else  class="auth" >
			<image class="bg" src="../../static/images/img_landing_phone@3x.png" mode="widthFix"></image>
			<view class="auth-btn" @click="auth">
				授权登录
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		generateUniqueUid
	} from '../../utils/tool';
	import useUserStore from '../../store/user.js'
	import useSystemStore from '../../store/system.js'
	const userStore = useUserStore()
	const systemStore = useSystemStore()
	systemStore.getStatusbarHeight()
 

	function enter() {
		uni.navigateTo({
			url: '/pages/chat/index?uid=' + generateUniqueUid()
		})
	}

	function auth() {
		uni.navigateTo({
			url: '/pages/login/index'
		})
	}
</script>

<style scoped>
	.home-page {
		box-sizing: border-box;
		height: 100vh;
		background: linear-gradient(to bottom,#fafafa,#6c5ce7,#1a73e8);
		opacity: 0.8;
	}

	.card-wrap {
		display: flex;
        flex-direction: column;
		justify-content: space-between;
		margin: 0 auto;
		width: 80%;
		height: 50%;
	}

	.title {
		padding: 16px;
		color: #1a73e8;
		text-align: center;
	}

	.bg {
		position: fixed;
		width: 100%;
		margin: 0 auto;
	}

	.auth-btn {
		position: absolute;
		left: 50%;
		bottom: 30px;
		transform: translateX(-50%);
		width: 50%;
		height: 50px;
		text-align: center;
		line-height: 50px;
		color: #fff;
		z-index: 999;
		border-radius: 50px;
		opacity: 1;
		background-color: #10b56d;
	}
	.auth-btn:active{
		opacity: 0.9;
	}
</style>