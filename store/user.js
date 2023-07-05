import {
	defineStore
} from 'pinia';
import {
	login_API,
	register_API
} from '../api/user';

export default defineStore('user', {
	state: () => {
		return {
			accessToken: uni.getStorageSync('accessToken') || null,
			mobilePhone: uni.getStorageSync('mobilePhone') || null,
		};
	},
	// 也可以这样定义
	// state: () => ({ count: 0 })
	actions: {
		async login(data) {
			const params = {
				"serviceName": "axt-api",
				"userType": "USER"
			}
			try {
				const res = await login_API({
					...params,
					...data
				})
				this.accessToken = res.meta.accessToken
				this.mobilePhone = data.mobilePhone
				uni.setStorageSync('accessToken', res.meta.accessToken)
				uni.setStorageSync('mobilePhone', data.mobilePhone)
				return res
			}catch(err){
				console.log(err)
				return Promise.reject(err)
			}
		},
		async register(data) {
			const params = {
				serviceName: "axt-api",
				userRole: "TEACHER"
			}
			const res = await register_API({
				...params,
				...data
			})
			if (res.statusCode === 200) {
				uni.showToast({
					title: '注册成功',
					icon: "none"
				})
				return Promise.resolve(res)
			} else {
				uni.showToast({
					title: res.data,
					icon: "none"
				})
				return Promise.reject(res)
			}
		},
		logout() {
			this.accessToken = null,
				this.mobilePhone = null
			uni.removeStorageSync('accessToken');
			uni.removeStorageSync('mobilePhone');
			uni.navigateTo({
				url: '/pages/login/index'
			})
		}
	}
});