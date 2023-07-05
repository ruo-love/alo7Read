import request from '../http/index.js';
import { generateUniqueUid } from '../utils/tool.js';
export function login_API(data){
	return request('POST',"/alo7/chat/login",data,{
		header:{
			uid:generateUniqueUid()
		}
	})
}
export function register_API(data){
	return request('POST',"/alo7_chat/chat/loginOrRegister",data)
}