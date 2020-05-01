//关于群消息的处理~
const utils = require('./utils')
const response = require('./response')
const config = require('./config')
const generalMsg = require('./generalMsg')

const solveGroupMsg = async (data, msg) => {

    let groupId = data.group_id.toString(),
        status

    //随便初始化一下
    if (global[groupId] === undefined) {
        global[groupId] = {}
    }
    //获取当前群的各种开关信息
    //找一找db里有没有被此群禁用
    let res = await utils.dbWork.findData(groupId, 'bot', {
        bot: 'off'
    })

    //只要不被禁用就是能用
    if (res.length === 0) {
        status = 'on'
    } else {
        status = 'off'
    }

    let name, nameA, nameB
    //查找全局的名字以及群内的名字(逐层覆盖)
    try {
        nameA = await utils.prop.getOne(
            'default', data.sender.user_id, 'name'
        )
    } catch (e) {}
    try {
        nameB = await utils.prop.getOne(
            groupId, data.sender.user_id, 'name'
        )
    } catch (e) {}
    //找不到也不用报错...
    name = nameB || nameA || data.sender.nickname

    if (status === 'on') {
        let generalResult = await generalMsg(data, msg, name)
        if (generalResult !== '') {
            return generalResult
        }
    }

    if (msg.type === 1) {
        //指令消息

        //bot的开关
        if (msg.order === '.bot') {
            if (msg.params[0] === 'on') {
                if (status === 'off') {
                    await utils.dbWork.delData(
                        groupId, 'bot', {
                            bot: 'off'
                        }
                    )
                    return utils.stringTranslate(
                        "statTurnOn"
                    )
                } else {
                    return utils.stringTranslate(
                        "statOn"
                    )
                }
            } else if (msg.params[0] === 'off') {
                if (status === 'on') {
                    await utils.dbWork.addData(
                        groupId, 'bot', {
                            bot: 'off'
                        }
                    )
                    return utils.stringTranslate(
                        "statTurnOff"
                    )
                }
            } else {
                return status != 'on' ? '' :
                    utils.stringTranslate(
                        "botHelp"
                    )
            }
        }

        if (status != 'on') return ''

        if (msg.order === '.rh' || msg.order === '.rhs') {

            const judgeExpression = /^[\+\-\*\/\%\(\)d0-9]+$/
            const judgeBonus = /^([bp])(\d+)$/
            let reason = '',
                res = null,
                flag = (msg.order === '.rhs')

            if (judgeExpression.test(msg.params[0])) {
                res = utils.dice(msg.params[0], 0, flag)
                reason = msg.params[1] || ''
            } else if (judgeBonus.test(msg.params[0])) {
                let a = RegExp.$1,
                    b = parseInt(RegExp.$2)
                if (b > config.maxBonus) {
                    return utils.stringTranslate(
                        "errTooManyBonus"
                    )
                }
                if (a === 'p') b = -b;
                res = utils.dice('1d100', b, flag)
                reason = msg.params[1] || ''
            } else {
                res = utils.dice(config.defaultDice, 0, flag)
                reason = msg.params[0] || ''
            }

            if (isNaN(res.val)) {
                return utils.stringTranslate(res.str)
            }

            return {
                public: utils.stringTranslate(
                    "doHidden",
                    [name]
                ),
                private: utils.stringTranslate(
                    "doHiddenPrivate",
                    [
                        utils.getGroupName(groupId),
                        groupId,
                        reason,
                        res.str
                    ]
                )
            }
        }

        if (msg.order === '.chat') {
            //chat目前先采用白名单制吧_(:з」∠)_
            let isWhite = await utils.dbWork.findData(
                'bot',
                'whitelist', {
                    data: groupId
                }
            )
            if (isWhite.length <= 0) {
                return utils.stringTranslate(
                    "notWhite"
                )
            }

            if (msg.params[0] === 'add') {
                //需要指令、关键词和回复三项！
                if (msg.params.length < 3) {
                    return utils.stringTranslate(
                        "errInvalidParam"
                    )
                }
                //如果存在就不添加
                let findChat = await utils.dbWork.findData(
                    groupId,
                    'chat', {
                        a: msg.params[1],
                        b: msg.params[2]
                    }
                )
                if (findChat.length > 0) {
                    return utils.stringTranslate(
                        "chatExist"
                    )
                }
                //添加数据
                await utils.dbWork.addData(
                    groupId,
                    'chat', {
                        a: msg.params[1],
                        b: msg.params[2]
                    }
                )
                return utils.stringTranslate(
                    "chatAdd",
                    [msg.params[1], msg.params[2]]
                )
            } else if (msg.params[0] === 'del') {
                //需要指令、关键词和回复三项！
                if (msg.params.length < 3) {
                    return utils.stringTranslate(
                        "errInvalidParam"
                    )
                }
                //如果存在才删除
                let findChat = await utils.dbWork.findData(
                    groupId,
                    'chat', {
                        a: msg.params[1],
                        b: msg.params[2]
                    }
                )
                if (findChat.length > 0) {
                    //删除数据
                    await utils.dbWork.delData(
                        groupId,
                        'chat', {
                            a: msg.params[1],
                            b: msg.params[2]
                        }
                    )
                    return utils.stringTranslate(
                        "chatDel",
                        [msg.params[1], msg.params[2]]
                    )
                } else {
                    return utils.stringTranslate(
                        "chatNotExist"
                    )
                }
            } else if (msg.params[0] === 'clr') {
                await utils.dbWork.delData(groupId, 'chat', {})
                return utils.stringTranslate(
                    "chatClr"
                )
            } else if (msg.params[0] === 'list') {
                //查找所有关键词
                let chats = await utils.dbWork.findData(
                    groupId, 'chat', {}
                )

                let resString = ''
                //如果还并没有添加关键词
                if (chats.length <= 0) {
                    resString = utils.stringTranslate(
                        "chatNoList"
                    )
                } else {
                    //否则遍历并输出所有关键词和回复
                    chats.forEach(e => {
                        resString += utils.stringTranslate(
                            "chatList",
                            [e.a, e.b]
                        )
                    });
                }
                return resString

            } else if (msg.params[0] === 'what') {
                //不需要其他参数咯~
                if (global[groupId].lastChat) {
                    return utils.stringTranslate(
                        "chatWhat",
                        [
                            global[groupId].lastChat.a,
                            global[groupId].lastChat.b,
                        ]
                    )
                } else {
                    return utils.stringTranslate(
                        "chatNoWhat"
                    )
                }
            }
        }

    } else {
        if (status !== 'on') return ''
        if (msg.type === 2) {
            //@bot的消息
            return utils.stringTranslate("doAtBot")

        } else {
            //普通消息: 可以触发复读和关键词回复

            //这一段是复读的代码
            //last表示上一条消息
            //repeat表示上次复读的内容(确保只复读一次)
            if (global[groupId].last === msg.content &&
                global[groupId].repeat !== msg.content) {
                global[groupId].repeat = msg.content
                return msg.content
            } else if (global[groupId].repeat != msg.content) {
                global[groupId].repeat = ''
            }
            global[groupId].last = msg.content

            let chats = await utils.dbWork.findData(
                groupId,
                'chat', {}
            )
            //如果这个群存在关键词回复的话
            if (chats.length > 0) {

                let okChats = []
                //遍历所有关键词
                chats.forEach(e => {
                    //如果句子中含有关键词就进行回复
                    if (msg.content.indexOf(e.a) != -1) {
                        okChats.push(e)
                    }
                });

                //如果有合适的回复的话
                if (okChats.length > 0) {
                    //从所有满足的关键词中随机挑一个
                    let id = utils.randInt(0, okChats.length)
                    global[groupId].lastChat = okChats[id]
                    return okChats[id].b
                }
            }
        }
    }

    return ''
}

module.exports = solveGroupMsg