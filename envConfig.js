// 导出的环境请求地址
//本地环境

export const dev = {
  ENV: "dev",
  api:{
	base:'https://chat-port.alo7.com',
	socket:'chat-websocket-server.beta.saybot.net'
  }
};
 
//正式环境
export const pro = {
  ENV: "pro",
  api:{
  	base:'https://chat-port.alo7.com',
  	socket:'chat-websocket-server.beta.saybot.net'
  }  
};

 
