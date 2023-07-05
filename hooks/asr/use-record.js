import {
	ref
} from "vue"
export default function useRecorder(onStartCallback, onStopCallBack) {
	const recording = ref(false)
	const recorderManager = uni.getRecorderManager()
	let showModal = false
	recorderManager.onStart(() => {
		recording.value = true
		onStartCallback()
	})
	recorderManager.onStop((res) => {
		recording.value = false
		onStopCallBack(res)
	})
	recorderManager.onError((err) => {
		if (!showModal && err.errMsg === 'operateRecorder:fail auth deny') {
			showModal = true
			getAuth().then((msg) => {
				if (msg !== 'cancel') {
					uni.showToast({
						title: msg,
						icon: 'none'
					})
				}
				showModal = false
			}).catch(err => {
				uni.showToast({
					title: err,
					icon: 'none'
				})
				showModal = false
			})
		}
	})
	const start = () => {
		recorderManager.start({
			sampleRate: 16000,
			format: 'mp3',
			detectDecibel: true,
		})

	}

	const stop = () => {
		recorderManager.stop()
	}
	return {
		start,
		stop,
		recording
	}
}

function getAuth() {
	return new Promise((resolve, reject) => {
		wx.showModal({
			title: '提示',
			content: '您未授权录音，功能将无法使用',
			showCancel: true,
			confirmText: "授权",
			confirmColor: "#1b9e35",
			success(res) {
				if (res.confirm) {
					wx.openSetting({
						success: (res) => {
							if (!res.authSetting['scope.record']) {
								resolve('授权失败')

							} else {
								resolve('授权成功')
							}
						},
						fail: function () {
							reject("录音授权失败")
						}
					})
				} else if (res.cancel) {
					resolve('cancel')
				}
			}
		})
	})
}