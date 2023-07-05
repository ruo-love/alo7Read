import {
	ref,
	reactive,
	computed,
	nextTick
} from "vue";
// import {pro} from '../../envConfig.js'
import {
	debounce
} from "../../utils/tool.js"
import {
	generateUniqueUid
} from '../../utils/tool.js'

/**
 * 
 * @param {*} uid socket 连接必须携带一个uid
 * @param {boolean} first 是否为第一次连接
 * @param {function} timeoutCallback 连接超时中断回调
 * @param {function} play pgt回复之后，需要将其内容语音播放
 * @returns {
 * }
 * sendMessage,发送消息函数
 * inputMessage,当前输入框内容存储对象
 * messageList,消息历史存储数组
 * loading,消息发送=》结束loading
 * continueVisible,gpt消息是否未响应完毕，可以继续
 * close,关闭socket
 * scroll,监听scroll-view 滚动,更新scrollTop
 * scrollTop,当前scrollTop值
 * SocketTask,socket连接对象
 * hasMessage，当前输入框是否有值
 * 
 */
export default function useWebsocketChat(uid, first = true, timeoutCallback, play) {

	const inputMessage = reactive({
		value: "",
		self: true,
		id: ''
	})
	const messageList = ref([])
	const loading = ref(false)
	const scrollTop = ref(0)
	const continueVisible = ref(false)
	let msg = ""
	let completed = false
	let init = first
	let index = messageList.value.length
	let oldScrollTop = 0
	const hasMessage = computed(() => {
		return inputMessage.value.trim().length > 0
	})

	function scroll(e) {
		oldScrollTop = e.detail.scrollTop
	}

	function scrollToTop(v) {
		scrollTop.value = oldScrollTop
		nextTick(() => {
			scrollTop.value = v
		})
	}
	const token = uni.getStorageSync('accessToken')
	let SocketTask = wx.connectSocket({
		url: "wss://" + 'chat-websocket-server.beta.saybot.net' + "/websocket/" + uid,
		protocols: [token],

		success: (e) => {
			console.log('success,', e)
		},
		fail: (fail) => {
			console.log('fail', fail)
		},
	})

	console.log('SocketTask', SocketTask)

	// 连接成功
	SocketTask.onOpen((e) => {
		SocketTask.currentStatus = 'open'
		console.log("😄您已成功接入ALO7_GPT websocket服务,开始解决你的问题", e)
		scrollBottom()
		if (!init) return false
		msg = ""
		SocketTask.send({
			data: msg,
			success: () => {
				messageList.value[index] = {
					value: msg,
					self: false,
					id: generateUniqueUid()
				}
				scrollBottom()
			}
		})
	})
	SocketTask.onMessage((event) => {
		try {
			const content = JSON.parse(event.data).content
			if (!!content) {
				if (init) {
					messageList.value[index].value += content
				} else {
					messageList.value[index + 1].value += content
				}
			}

		} catch (err) {
			switch (event.data) {
				case "[INTERRUPTED]":
				case "[MODEL_TIMEOUT]":
				case "TEMPERATURE_THRESHOLD":
				case "[TOKENS]":
					completed = false
					if (!completed) {
						continueVisible.value = true
					}

					loading.value = false
					break
				case "[DONE]":
					if (init) {
						play(messageList.value[index])
						console.log('play(messageList.value[index])')
					} else {
						play(messageList.value[index + 1])
					}
					completed = true
					if (!completed) {
						continueVisible.value = true
					}
					scrollBottom()
					init = false
					console.log(messageList)
					break
				default:
					console.log("😄message error", err)
					break
			}
		}
	})

	function scrollBottom() {
		wx.createSelectorQuery().select('#viewCommunicationBody').boundingClientRect(function (rect) {
			console.log('rect.height', rect.height)
			scrollToTop(rect.height)
		}).exec();
	}

	//连接关闭事件
	SocketTask.onClose((err) => {
		console.log("😄您已断开ALO7_GPT websocket服务", err)
		inputMessage.value = ""
		loading.value = false
		if (err.code == 1006) {
			SocketTask.currentStatus = 'timeout'
			timeoutCallback(err)
		} else if (err.reason === 'interrupted') {
			SocketTask.currentStatus = 'interrupted'
		} else {
			SocketTask.currentStatus = 'close'
		}

	})
	wx.onSocketError((err) => {
		console.log('err', err)
	})
	//发生了错误事件
	SocketTask.onError((err) => {
		console.log("连接错误，请联系ALO7-GPT开发者", err)
	})
	const sendMessage = debounce(async (content) => {
		msg = content
		if (!hasMessage.value) return
		loading.value = true
		index = messageList.value.length
		console.log('send', content)
		SocketTask.send({
			data: msg,
			success: (e) => {
				console.log('send', e)
				continueVisible.value = false
				messageList.value[index] = {
					value: inputMessage.value,
					self: true,
					id: generateUniqueUid()
				}
				messageList.value[index + 1] = {
					value: "",
					self: false,
					id: generateUniqueUid()
				}
				inputMessage.value = ""
				scrollBottom()
			},
			fail: (e) => {
				console.log('send', e)
			}
		})


	})

	function close() {
		SocketTask.close()
	}
	return {
		sendMessage,
		inputMessage,
		messageList,
		loading,
		continueVisible,
		close,
		scroll,
		scrollTop,
		SocketTask,
		hasMessage
	}
}