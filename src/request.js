const utils = require('./utils')
const response = require('./response')

const solveRequest = async (bot, requestBuffer) => {
    // let request = utils.bufferToJson(requestBuffer)
    let request = requestBuffer

    if (request.request_type === 'group' &&
        request.sub_type === 'invite') {
        //如果是加群申请的话
        //当然只有邀请沫纯加群的功能
        //沫纯不会处理其他人加群请求的QAQ
        let blackList = utils.dbWork.findData(
            'bot',
            'blacklistgroup', {}
        )
        let allowed = true

        if (blackList.length > 0) {
            blackList.foreach(li => {
                if (li.groupId.toString() === request.group_id()) {
                    allowed = false
                }
            })
        }

        let res = await bot('set_group_add_request', {
            flag: request.flag,
            approve: allowed,
            reason: allowed ? '' : utils.stringTranslate(response.onBlackListGroup)
        })
        console.log(`处理加群[${request.group_id}]的请求: ${allowed}`)
        console.log(res)
        return;
    } else if (request.request_type === 'friend') {
        //如果是加好友申请的话
        let blackList = utils.dbWork.findData(
            'bot',
            'blacklistuser', {}
        )
        let allowed = true

        if (blackList.length > 0) {
            blackList.foreach(li => {
                if (li.userId.toString() === request.user_id.toString()) {
                    allowed = false
                }
            })
        }

        let res = await bot('set_friend_add_request', {
            flag: request.flag,
            approve: allowed,
        })
        console.log(`处理[${request.user_id}]的加好友请求: ${allowed}`)
        console.log(res)
        return;
    }
}

module.exports = solveRequest