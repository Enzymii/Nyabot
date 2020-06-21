// 不想使用jrrp结果的话就用这个叭
// const jrrpResult = (jrrp) => ""

//这个自己根据实际情况修改即可
const jrrpResult = (jrrp) => {
    if (jrrp === 1) {
        return '今天印堂发黑喵w~ 注意安全喵w~'
    } else if (jrrp < 20) {
        return '不太妙呢喵w~'
    } else if (jrrp < 50) {
        return '一般般啦喵w~'
    } else if (jrrp < 90) {
        return '还不错呀喵w~'
    } else if (jrrp < 100) {
        return '还抽卡干嘛, 快去愣着喵w~'
    } else {
        return '今天你就是天选之人喵w!!'
    }
}

module.exports = jrrpResult