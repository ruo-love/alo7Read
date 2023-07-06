<template>
	<view class="chat-page">
		<scroll-view scroll-y="true" @scroll="socketTarget.scroll" class="scroll-Y"
			:scroll-top="socketTarget.scrollTop">
			<view id="viewCommunicationBody">
				<a7-message-card :recordLoading="currentPlayId === message.id && recordLoading"
					:playing="currentPlayId === message.id && playing" @play="play(message)"
					v-for="message in socketTarget.messageList" :key="message.id" :self="message.self"
					:content="message.value" />
			</view>
		</scroll-view>
		<view class="footer-wrap">
			<view v-show="recording" class="prompt-ani prompt-layer prompt-layer-1">
				<view class="prompt-loader">
					<view class="em" v-for="(item, index) in 15" :key="index"></view>
				</view>
				<text class="p">{{ "剩余：" + second + "s" }}</text>
				<text class="span">松手结束录音</text>
			</view>
			<view class="message-wrap">
				<image @click="
            () => {
              isVoice = !isVoice
            }
          " class="icon-30 left-btn" :src="left_btn_src"></image>
				<view v-if="isVoice" class="voice-wrap right-wrap">
					<view v-if="loadingMode.value" class="loading-input-wrap">
						<text style="color: #666">{{ loadingMode.text }}</text>
						<view class="spinner"></view>
					</view>
					<view v-else class="voice-btn flex-center" :class="{ recording: recording }" @touchstart="start"
						@touchend="stop" @touchcancel="stop">
						<text>{{ recording ? "录音中..." : "长按开始语音转译" }}</text>
						<image style="margin-left: 10px" class="icon-30"
							src="https://web-alo7-com.oss-cn-beijing.aliyuncs.com/wx-teacher-app/alo7-read/mk.png">
						</image>
					</view>
				</view>
				<view v-else class="input-message-wrap right-wrap">
					<input confirm-type="send" @confirm="socketTarget.sendMessage(socketTarget.inputMessage.value)"
						v-model="socketTarget.inputMessage.value" class="message-input" />

					<button class="send-btn" v-if="socketTarget.hasMessage"
						@click="socketTarget.sendMessage(socketTarget.inputMessage.value)">
						发送
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import useRecorder from "../../hooks/asr/use-record.js"
	import useWebsocketChat from "../../hooks/chat/use-websocket-chat.js"
	import V3 from "../../hooks/asr/v3.js"
	import {
		V1
	} from '../../hooks/asr/v1.js'
	import asrConfig from "../../hooks/asr/asr.js"
	import ttsConfig from "../../hooks/asr/tts.js"
	import {
		ref,
		reactive,
		computed,
		onBeforeUnmount
	} from "vue"
	import {
		onLoad,
		onShow
	} from "@dcloudio/uni-app"
	let uid = null
	const socketTarget = ref({
		messageList: [],
		inputMessage: {
			value: ""
		},
		SocketTask: {
			currentStatus: "init"
		}
	})
	const fileMap = new Map()
	const {
		start,
		stop,
		recording
	} = useRecorder(onStartCallback, onStopCallBack)
	const isVoice = ref(false)
	const second = ref(60)
	const playing = ref(false)
	const loadingMode = reactive({
		value: false,
		text: "解析中，请耐心等待"
	})
	const recordLoading = ref(false)
	const left_btn_src = computed(() => {
		return isVoice.value ?
			"https://web-alo7-com.oss-cn-beijing.aliyuncs.com/wx-teacher-app/alo7-read/jp.png" :
			"https://web-alo7-com.oss-cn-beijing.aliyuncs.com/wx-teacher-app/alo7-read/voice.png"
	})
	let timer = null
	let currentPlayId = ref(null)
	const fs = wx.getFileSystemManager()
	const audioContext = wx.createInnerAudioContext()
	onLoad(options => {
		uid = options.uid
	})

	onShow(() => {
		//第一次进入页面 连接socket
		if (socketTarget.value.SocketTask.currentStatus == "init") {
			socketTarget.value = useWebsocketChat(uid, true, timeoutCallback, play)
		}
		// 退至后台socket被中断，再次进入页面重新连接
		if (socketTarget.value.SocketTask.currentStatus === "interrupted") {
			timeoutCallback()
		}
	})

	audioContext.onPlay(() => {
		recordLoading.value = false
		playing.value = true
	})
	audioContext.onEnded(() => {
		playing.value = false
		currentPlayId.value = null
	})

	/**
	 * 当socketl 60s秒内没有传输或者小程序退到后台，socket会自动终端
	 * timeoutCallback用于重新连接socket服务
	 */
	function timeoutCallback() {
		const oldMessageList = socketTarget.value.messageList
		socketTarget.value = useWebsocketChat(uid, false, timeoutCallback, play)
		// 同步之前的会话内容
		socketTarget.value.messageList = oldMessageList
	}

	/**
	 * 开始录音回调
	 */
	function onStartCallback() {
		timer = setInterval(() => {
			second.value -= 1
			if (second.value <= 0) {
				clearInterval(timer)
				second.value = 60
			}
		}, 1000)
	}

	/**
	 * 录音结束后的回调函数
	 * @param {*} file
	 */
	function onStopCallBack(file) {
		clearInterval(timer)
		second.value = 60
		loadingMode.value = true
		loadingMode.text = "解析中，请耐心等待"
		// 转换成base64后，发送到腾讯云服务，获取翻译后的文本
		wx.getFileSystemManager().readFile({
			filePath: file.tempFilePath,
			encoding: "base64", //编码格式
			success: res => {
				//成功的回调
				tencentCloudApi(asrConfig["SentenceRecognition"], {
						EngSerViceType: "16k_en",
						SourceType: 1,
						VoiceFormat: "mp3",
						Data: res.data,
						DataLen: file.fileSize
					})
					.then(result => {
						if (result.data.Response.Error) {
							throw result.data.Response.Error
						}
						if (result.data.Response.Result == "") {
							throw {
								Code: "FailedOperation.ErrorRecognize"
							}
						}
						loadingMode.value = false
						loadingMode.text = "解析完成"
						socketTarget.value.inputMessage.value = result.data.Response.Result
						// 将解析后的文本 作为message发送到gpt 服务
						socketTarget.value.sendMessage(socketTarget.value.inputMessage.value)
					})
					.catch(err => {
						loadingMode.value = false
						switch (err.Code) {
							case "FailedOperation.ErrorRecognize":
								uni.showToast({
									title: "抱歉，我听不太清楚，请声音大一点",
									icon: "none"
								})
						}
						loadingMode.text = "我听不太清楚"
					})
			}
		})
	}

	/**
	 * 将文本合成语音并播放
	 * @param {*} message
	 */
	function play(message) {
		currentPlayId.value = message.id
		recordLoading.value = true
		// 如果之前已经合成过，则直接复用
		if (fileMap.get(message.id)) {
			audioContext.src = fileMap.get(message.id)
			audioContext.play()
		} else {
			//注意 语音合成最多支持1800个英文字符
			const {
				Signature,
				params
			} = V1(
				ttsConfig.TextToStreamAudio, {
					Text:message.value,
					SessionId: message.id
				})
			wx.request({
				method: 'POST',
				url: 'https://tts.cloud.tencent.com/stream',
				header: {
					"Content-Type": "application/json",
					"Authorization": Signature
				},
				responseType: 'arraybuffer', // 设置响应类型为 arraybuffer
				data: params,
				success(res) {
					// 获取到响应的二进制数据
					const arrayBuffer = res.data;
					console.log(res)
					// 将 arrayBuffer 转为 base64 字符串
					const base64String = wx.arrayBufferToBase64(arrayBuffer);

					// 将 base64 字符串转为文件
					const filePath = `${wx.env.USER_DATA_PATH}/${message.id}.mp3`;
					wx.getFileSystemManager().writeFile({
						filePath,
						data: base64String,
						encoding: 'base64',
						success() {
							fileMap.set(message.id, filePath)
							audioContext.src = filePath
							audioContext.play()
							// 可以使用 filePath 进行后续操作，如播放音频或显示图像等
						},
						fail(error) {
							console.error('文件保存失败', error);
						}
					});
				},
				fail(error) {
					console.error('网络请求失败', error);
				}
			});

			// tencentCloudApi(ttsConfig["TextToVoice"], {
			//   Text: message.value,
			//   SessionId: message.id
			// }).then(res => {
			//   const tempFilePath = `${wx.env.USER_DATA_PATH}/${message.id}.mp3`
			//   // base64音频保存为本地文件,获取地址并播放
			//   fs.writeFile({
			//     filePath: tempFilePath,
			//     data: res.data.Response.Audio,
			//     encoding: "base64",
			//     success(res) {
			//       fileMap.set(message.id, tempFilePath)
			//       audioContext.src = tempFilePath
			//       audioContext.play()
			//     },
			//     fail(err) {
			//       console.error("解析失败", err)
			//     }
			//   })
			// })
		}
	}

	/**
	 * 卸载音频和socket
	 */
	onBeforeUnmount(() => {
		socketTarget.value.close()
		audioContext.destroy()
	})

	/**
	 * 腾讯云api服务调用函数
	 */
	function tencentCloudApi(config, data) {
		const {
			authorization,
			timestamp,
			host,
			action,
			version,
			region,
			ContentType
		} = V3(config, data)
		return uni.request({
			url: "https://asr.tencentcloudapi.com",
			method: "POST",
			header: {
				Authorization: authorization,
				"Content-Type": "application/json",
				Host: host,
				"X-TC-Action": action,
				"X-TC-Timestamp": timestamp,
				"X-TC-Version": version,
				"X-TC-Region": region
			},
			data
		})
	}
</script>

<style>
	@import url(../../static/style/record.css);
	@import url(../../static/style/spinner.css);
	@import url(./index.css);
</style>