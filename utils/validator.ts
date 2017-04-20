/* 手机号码验证 */
const isValidPhoneNum = function (str: String) {
    // 手机号以13, 15, 17, 18开头, 第3位不固定, 再尾随8位数字
    const reg = new RegExp(/^((13[0-9])|(147)|(15[^4,\D])|(17[0-9])|(18[0,0-9]))\d{8}$/)
    if (typeof str === 'string') return reg.test(str)
    return reg.test(str.toString())
}

/* 用户名验证 */
const isValidUserName = function (str: String) {
    var reg = /^[A-Za-z][A-Za-z0-9_]{4,}$/ // 用户名以字母开头,只能包含英文/数字/下划线,长度5及5以上
    return reg.test(str.toString())
}

/* 邮箱地址验证 */
const isValidEmail = function (str: String) {
    const reg = new RegExp(/[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}/)
    if (typeof str === 'string') return reg.test(str)
    return reg.test(str.toString())
}

/* 网址验证 */
const isValidUrl = function (str: String) {
    // http或https协议类型网址
    const reg = new RegExp(/^((http)|(https))+:[^\s]+\.[^\s]*$/)
    if (typeof str === 'string') return reg.test(str)
    return reg.test(str.toString())
}

/* 汉字验证 */
const isValidChinese = function (str: String) {
    const reg = new RegExp(/^[\u4e00-\u9fa5]+$/)
    if (typeof str === 'string') return reg.test(str)
    return reg.test(str.toString())
}

/* IP地址验证 */
const isValidIP = function (str: String) {
    const reg = new RegExp(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
    if (typeof str === 'string') return reg.test(str)
    return reg.test(str.toString())
}

export default {
    isValidPhoneNum,
    isValidUserName,
    isValidEmail,
    isValidUrl,
    isValidChinese,
    isValidIP
}
