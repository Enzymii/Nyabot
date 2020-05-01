//关于群消息的处理~
const utils = require('./utils')
const response = require('./response')
const config = require('./config')
const generalMsg = require('./generalMsg')

const solvePrivateMsg = async (data, msg) => {

    // let userId = data.user_id.toString()

    let name = data.sender.nickname
    try {
        name = await utils.prop.getOne(
            'default', data.user_id, 'name'
        )
    } catch (e) {} //找不到也不用报错...

    let generalResult = await generalMsg(data, msg, name)
    if (generalResult !== '') {
        return generalResult
    }

    if (msg.type === 1) {

        // 私聊添加某个群的属性(主要是为了避免大规模刷屏)
        if (msg.order === '.gset') {

            //先查看一下是否在这个群里..
            let flag = false
            for (let i = 0; i < global.groupList.length; i++) {
                let obj = global.groupList[i.toString()]
                if (obj.group_id.toString() === msg.params[0]) {
                    flag = true
                    break
                }
            }
            if (!flag) {
                return utils.stringTranslate("errGroupNotFound")
            }
            let dbName = msg.params[0]
            msg.params = msg.params.slice(1)

            let property = await utils.prop.getProp(
                dbName,
                data.user_id
            )
            //显示已设置的属性
            //可以指定显示若干 不指定则默认全部
            if (msg.params[0] === 'show') {
                let str = ''

                if (msg.params.length > 1) {
                    for (let i = 1; i < msg.params.length; i++) {
                        str += msg.params[i] + ': ' +
                            property[msg.params[i]] + '\t'
                    }
                } else {
                    if (!property || Object.keys(property).length < 3) {
                        return utils.stringTranslate("errNoProp")
                    }
                    for (let i in property) {
                        if (i != '_id' && i != 'user_id') {
                            str += i + ': ' + property[i] + '\t'
                        }
                    }
                }

                return utils.stringTranslate(
                    "propShow",
                    [str]
                )
            }

            //删除若干指定属性
            if (msg.params[0] === 'del') {
                let propList = msg.params.slice(1)
                if (propList.length <= 0) {
                    //如果后面没有属性的话 mongodb会报错哒!
                    return utils.stringTranslate("errInvalidParam")
                }

                await utils.prop.delProp(dbName, data.user_id, propList)

                return utils.stringTranslate("propDel")
            }

            if (msg.params[0] === 'clr') {
                await utils.prop.clrProp(dbName, data.user_id)

                return utils.stringTranslate("propClr")
            }

            let p = msg.params.slice(0),
                np = {}
            if (p.length <= 0) {
                //如果后面没有属性的话 mongodb会报错哒!
                return utils.stringTranslate("errInvalidParam")
            }
            for (let i = 0; i < p.length; i += 2) {
                np[p[i]] = p[i + 1]
            }
            await utils.prop.setProp(dbName, data.user_id, np)
            return utils.stringTranslate("propSet")
        }

        ///////////////////////////////////////
        // 只有Bot Admin才可以使用的sudo指令! //
        ///////////////////////////////////////
        // 其实好像只写了操作数据库...
        
        if (msg.order === '.sudo') {

            if (config.suQ.indexOf(data.user_id) < 0) {
                return 'Error: Permission Denied!'
            }

            if (msg.params[0] === 'add') {
                await utils.dbWork.addData(
                    msg.params[1], msg.params[2],
                    utils.bufferToJson(msg.params[3])
                )
                return `添加${msg.params[3]}到${msg.params[1]}.${msg.params[2]}`
            }
            if (msg.params[0] === 'del') {
                await utils.dbWork.delData(
                    msg.params[1], msg.params[2],
                    utils.bufferToJson(msg.params[3])
                )
                return `删除${msg.params[3]}从${msg.params[1]}.${msg.params[2]}`
            }
            if (msg.params[0] === 'find') {
                let w = await utils.dbWork.findData(
                    msg.params[1], msg.params[2],
                    utils.bufferToJson(msg.params[3])
                )
                return JSON.stringify(w)
            }
        }
    }

    return ''
}

module.exports = solvePrivateMsg