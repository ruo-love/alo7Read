// import MarkdownIt from "markdown-it"


export function debounce(func, delay) {
	// 设置定时器标识
	let timer
	// 难点返回事件绑定函数
	return function () {
		// func指定this
		let context = this
		// func参数
		let args = arguments
		// 先清除定时器
		clearTimeout(timer)
		//设置定时器
		timer = setTimeout(() => {
			// 调用函数
			func.apply(context, args)
		}, delay)
		return timer
	}
}
export function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

export function generateUniqueUid(length = 36) {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const timestamp = Date.now().toString();
	const uidArray = [...timestamp];

	while (uidArray.length < length) {
		const randomCharacter = characters.charAt(Math.floor(Math.random() * characters.length));
		uidArray.push(randomCharacter);
	}

	const uid = uidArray.slice(0, length).join('');
	return uid;
}



// export function mdRender() {
// 	const mdi = new MarkdownIt()

// 	return mdi
// }