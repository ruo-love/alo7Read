import crypto from 'crypto-js';

function sha256(message, secret = '', hex) {
	const hmac = crypto.HmacSHA256(message, secret);
	let hexHmac = hmac
	if (hex) {
		// 将 HMAC 值转换为十六进制字符串
		hexHmac = hmac.toString(crypto.enc.Hex);
	}
	return hexHmac;
}

function getHash(message) {
	// 计算 SHA-256 哈希值
	const hash = crypto.SHA256(message);

	// 将哈希值转换为十六进制字符串
	const hexHash = hash.toString(crypto.enc.Hex);

	return hexHash;
}


function getDate(timestamp) {
	const date = new Date(timestamp * 1000)
	const year = date.getUTCFullYear()
	const month = ('0' + (date.getUTCMonth() + 1)).slice(-2)
	const day = ('0' + date.getUTCDate()).slice(-2)
	return `${year}-${month}-${day}`
}

/**腾讯云 V3签名
 * @param {Object} config
 * @param {Object} body
 */
export default function V3(config, body) {
	const SECRET_ID = config.SECRET_ID
	const SECRET_KEY = config.SECRET_KEY
	const host = config.HOST
	const service = config.SERVICE
	const region = config.REGION
	const action = config.ACTION
	const version = config.VERSION
	const ContentType = config.ContentType

	const timestamp = Math.floor(Date.now() / 1000)
	//时间处理, 获取世界时间日期
	const date = getDate(timestamp)
	// ************* 步骤 1：拼接规范请求串 *************
	// const payload = "{\"TaskId\":6333894143}";
	const payload = JSON.stringify(body);
	const hashedRequestPayload = getHash(payload);
	const httpRequestMethod = "POST"
	const canonicalUri = "/"
	const canonicalQueryString = ""
	const canonicalHeaders = "content-type:" + ContentType + "\n" +
		"host:" + host + "\n" +
		"x-tc-action:" + action.toLowerCase() + "\n"
	const signedHeaders = "content-type;host;x-tc-action"

	const canonicalRequest = httpRequestMethod + "\n" +
		canonicalUri + "\n" +
		canonicalQueryString + "\n" +
		canonicalHeaders + "\n" +
		signedHeaders + "\n" +
		hashedRequestPayload


	// ************* 步骤 2：拼接待签名字符串 *************
	const algorithm = "TC3-HMAC-SHA256"
	const hashedCanonicalRequest = getHash(canonicalRequest);
	const credentialScope = date + "/" + service + "/" + "tc3_request"
	const stringToSign = algorithm + "\n" +
		timestamp + "\n" +
		credentialScope + "\n" +
		hashedCanonicalRequest


	// ************* 步骤 3：计算签名 *************
	const kDate = sha256(date, 'TC3' + SECRET_KEY)
	const kService = sha256(service, kDate)
	const kSigning = sha256('tc3_request', kService)
	const signature = sha256(stringToSign, kSigning, true)


	// ************* 步骤 4：拼接 Authorization *************
	const authorization = algorithm + " " +
		"Credential=" + SECRET_ID + "/" + credentialScope + ", " +
		"SignedHeaders=" + signedHeaders + ", " +
		"Signature=" + signature


	const curlcmd = 'curl -X POST ' + "https://" + host +
		' -H "Authorization: ' + authorization + '"' +
		` -H "Content-Type: ${ContentType}"` +
		' -H "Host: ' + host + '"' +
		' -H "X-TC-Action: ' + action + '"' +
		' -H "X-TC-Timestamp: ' + timestamp.toString() + '"' +
		' -H "X-TC-Version: ' + version + '"' +
		' -H "X-TC-Region: ' + region + '"' +
		" -d '" + payload + "'"
	return {
		authorization,
		timestamp,
		region,
		action,
		version,
		host
	}
}