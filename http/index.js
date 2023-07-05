import server, {
	Env
} from '../config/api_server.js'
const request = function(method, url, data, options) {
	return new Promise((resolve, reject) => {
		uni.showLoading({
			title: '加载中'
		})
		uni.request({
			method,
			url: server[Env].api_server.base + url,
			data,
			success(res) {
				uni.hideLoading()
				if (res.statusCode >= 400) {
					uni.showToast({
						title: res.data,
						icon: "none"
					})
					reject(res.data)
				} else {
					resolve(res.data)
				}

			},
			fail(err) {
				uni.hideLoading()
				reject(err)
			},
			...options,

		})
	})
}

export default request