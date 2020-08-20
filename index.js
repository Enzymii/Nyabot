const cq = require('cqhttp')
const config = require('./config')
const utils = require('./utils')
const response = require('./response')

const groupMsg = require('./groupMsg')
const privateMsg = require('./privateMsg')
const request = require('./request')

const bot = new cq({
    apiRoot: 'http://' + config.host + ':' + config.sendPort
})

const main = async () => {
    bot.on('message', async data => {
        let msg = utils.msgConvert(data.message)
        try {
            global.groupList = await bot('get_group_list')
            if (data.message_type === 'group') {
                //收到群消息的时候刷新一下群的列表 
                let message = await groupMsg(data, msg)
                if (typeof message === 'object') {
                    //害 不知道暗骰咋处理了就这样写吧
                    sendGroupMessage(data.group_id, message.public)
                    sendPrivateMessage(data.user_id, message.private)
                } else {
                    sendGroupMessage(
                        data.group_id,
                        message
                    )
                }
            } else if (data.message_type === 'private') {
                let message = await privateMsg(data, msg)
                sendPrivateMessage(
                    data.user_id,
                    message
                )
            } else {
                console.log(data)
            }
        } catch (e) {
            console.log(e)
        }
    })

    bot.on('request', async data => {
        request(bot, data)
    })

    console.log(utils.stringTranslate(
        "startUp",
        [
            config.host,
            config.recvPort
        ]
    ))

    bot.listen(config.recvPort, config.host)
}

const sendGroupMessage = async (groupId, msg) => {
    if (msg === '') return
    let ret = await bot('send_group_msg', {
        group_id: groupId,
        message: msg
    })
    console.log(`向群[${groupId}]发送消息: ${msg}`)
    console.log(ret)
}

const sendPrivateMessage = async (userId, msg) => {
    if (msg === '') return
    let ret = await bot('send_private_msg', {
        user_id: userId,
        message: msg
    })
    console.log(`向用户[${userId}]发送消息: ${msg}`)
    console.log(ret)
}

//========================================================
main()