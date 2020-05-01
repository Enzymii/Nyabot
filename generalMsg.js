//处理什么群消息啊 讨论组消息啊 私聊消息啊 都要处理的消息

const utils = require('./utils')
const config = require('./config')
const response = require('./response')
const jrrpResult = require('./jrrp')
const help = require('./help')

const solveGeneralMsg = async (data, msg, name) => {

    status = config.defaultSwitch

    let dbName = data.message_type === 'group' ? data.group_id.toString() : 'default'

    if (msg.type === 1) {

        //hitokoto
        if (msg.order === '.hitokoto' ||
            msg.order === '.htkt') {
            //对hitokoto进行处理
            //hitokoto这个api还是比较稳的
            //不过我担心会超10QPS的QAQ
            {
                let hitokoto = await utils.getHitokoto()
                let translatedString = utils.stringTranslate(
                    "doGetHitokoto",
                    [
                        hitokoto.hitokoto,
                        hitokoto.from,
                    ]
                )
                return translatedString
            }
        }

        //jrrp(原版)
        //虽然通过某些算法算出一个随机数就很简单
        //但是感觉和其他骰娘算出来的jrrp相同的话更有说服力呢~
        //有那么多骰娘在役的话多半不会换API的吧~
        if (msg.order === '.jrrp') {
            let jrrp = await utils.jrrp(data.user_id)
            let translatedString = ''

            //如果获取jrrp失败的话= =
            //当然如果时常失败还是另想办法吧= =
            if (parseInt(jrrp) < 0) {
                translatedString = utils.stringTranslate(
                    "errJrrpErr",
                    [
                        name
                    ]
                )
            } else {
                translatedString = utils.stringTranslate(
                    "doJrrp",
                    [
                        name,
                        jrrp
                    ]
                )

                translatedString += ' ' + jrrpResult(jrrp)
            }
            return translatedString
        }

        //早安和晚安~
        if (msg.order === '.ohy') {
            let translatedString = utils.stringTranslate("doOhy")
            return translatedString
        }
        if (msg.order === '.oysm') {
            let translatedString = utils.stringTranslate("doOysm")
            return translatedString
        }

        //muda ora
        if (msg.order === '.muda' ||
            msg.order === '.ora') {
            let ti = parseInt(msg.params[0])
            if (msg.params.length === 0) {
                ti = 1
            } else if (ti === undefined || ti <= 0) {
                return utils.stringTranslate("errInvalidParam")
            } else if (ti > config.maxRepeatTimes) {
                return utils.stringTranslate("errTooManyTimes")
            }

            switch (msg.order) {
                case '.muda':
                    return utils.repeatWord('むだ', ti)
                case '.ora':
                    return utils.repeatWord('オラ', ti)
            }
        }

        //kokodayo
        if (msg.order === '.kkdy' || msg.order === '.kokodayo') {
            //这个串不如不translate了= =
            return 'こ～こ～だ～よ～☆'
        }

        //COC7人物卡属性
        if (msg.order === '.coc' || msg.order === '.coc7') {
            let times = parseInt(msg.params[0])
            let basic = utils.stringTranslate("doCoc7", [name])

            if (!times || times <= 0) {
                let coc = utils.cocGenerate()
                basic += utils.stringTranslate(
                    "cocSingle",
                    coc
                )
            } else {
                for (let i = 0; i < times; i++) {
                    let coc = utils.cocGenerate()
                    let afff = utils.stringTranslate(
                        "cocPlural",
                        coc
                    )
                    basic += utils.stringTranslate(
                        "cocPlural",
                        coc
                    )

                }
            }
            console.log(basic)
            return basic
        }

        //掷骰
        //暗骰只能用于群
        //普通的掷骰 s表示简化输出
        if (msg.order === '.r' || msg.order === '.rs') {
            const judgeExpression = /^[\+\-\*\/\%\(\)d0-9]+$/
            const judgeBonus = /^([bp])(\d+)$/
            let reason = '',
                res = null,
                flag = (msg.order === '.rs')

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

            return utils.stringTranslate(
                "doDice",
                [
                    name,
                    reason,
                    res.str
                ]
            )
        }

        //显示帮助
        if (msg.order === '.help') {
            //没有具体查询就返回主要的菜单
            if (!msg.params[0]) {
                console.log(help[data.message_type])

                return help.title + help.general +
                    help[data.message_type].toString() + help.text
            } else {
                // 做一些同义替换
                if (msg.params[0] === 'htkt') {
                    msg.params[0] = 'hitokoto'
                }
                if (msg.params[0] === 'kkdy') {
                    msg.params[0] = 'kokodayo'
                }
                if (msg.params[0] === 'coc') {
                    msg.params[0] = 'coc7'
                }
                if (help[msg.params[0]]) {
                    return help[msg.params[0]]
                } else {
                    return utils.stringTranslate(
                        "errHelpNotFound"
                    )
                }
            }
        }

        //关于属性的操作
        //添加 修改 无需操作名
        //删除 del 清空 clr 显示 show
        if (msg.order === '.set') {
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
                        return utils.stringTranslate("propEmpty")
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

        //增强检定(原来是enhance嘛→_→)
        //参数: .en [属性] [数值] [原因]
        //属性值和数值好歹得填一个吧_(:з」∠)_
        if (msg.order === '.en') {
            let prop = "",
                val = -1,
                reason = ""
            propSet = false

            //如果后面不跟任何参数是不行滴
            if (msg.params.length <= 0) {
                return utils.stringTranslate("errInvalidParam")
            }

            //如果紧跟数字那就是没有属性的意思
            if (parseInt(msg.params[0])) {
                prop = "",
                    val = parseInt(msg.params[0])
                propSet = false
                reason = msg.params[1]
            } else { //否则就是有属性咯
                prop = msg.params[0]
                //那就要判断有没有输入的值
                if (parseInt(msg.params[1])) {
                    propSet = false
                    val = parseInt(msg.params[1])
                    reason = msg.params[2]
                } else {
                    propSet = true
                    try {
                        val = await utils.prop.getOne(
                            dbName,
                            data.user_id,
                            prop
                        )
                    } catch (e) {}
                    val = parseInt(val)

                    reason = msg.params[1]
                }
            }

            if (!val || val < 0) {
                return utils.stringTranslate(
                    "errNoProp",
                    [prop]
                )
            }

            let res = utils.calc('1d100').val
            let resString1 = utils.stringTranslate(
                    "doEnhance",
                    [
                        reason ? '由于' + reason : '',
                        name,
                        prop,
                        res,
                        val
                    ]
                ),
                resString2 = ''

            if (res > val) {
                let incVal = utils.calc('1d10').val
                resString2 = utils.stringTranslate(
                    "onEnhanceOk",
                    [
                        prop,
                        incVal,
                        val + incVal
                    ]
                )
                if (propSet) {
                    await utils.prop.setProp(
                        dbName,
                        data.user_id, {
                            [prop]: val + incVal
                        }
                    )
                }
            } else {
                resString2 = utils.stringTranslate(
                    "onEnhanceFail"
                )
            }

            return resString1 + resString2
        }

        //san check (TODO!)
        //参数: .sc 成功值 失败值 [san值] [原因]
        if (msg.order === '.sc') {

            const judgeExpression = /^[\+\-\*\/\%\(\)d0-9]+$/

            let successExp = msg.params[0],
                failExp = msg.params[1],
                san = -1,
                //是否手动输入 如果为true表示手动输入 sc之后无需修改
                sanSet = false,
                reason = ''
            msg.params = msg.params.slice(2)
            //如果成功表达式或失败表达式不合法
            if (!judgeExpression.test(successExp) ||
                !judgeExpression.test(failExp)) {
                return utils.stringTranslate(
                    "errInvalidParam"
                )
            }

            //如果没有填写san值
            if (!parseInt(msg.params[0])) {
                sanSet = false
                try {
                    san = await utils.prop.getOne(
                        dbName,
                        data.user_id,
                        'san'
                    )
                } catch (e) {}
                san = parseInt(san)

                if (!san) {
                    return utils.stringTranslate(
                        "errNoProp", ["SAN"]
                    )
                }

                reason = msg.params[0]
            } else { //如果填写了san值
                sanSet = true
                san = parseInt(msg.params[0])
                reason = msg.params[1]
            }

            let scResult = utils.calc('1d100').val
            let scCheck = utils.check(
                utils.getRule(dbName),
                scResult, san
            )
            let sanDown = 0

            if (scCheck < 0) {
                return utils.stringTranslate(
                    "errOtherErr"
                )
            } else if (scCheck <= 3) { //成功
                sanDown = utils.calc(successExp).val
            } else { //失败
                if (scCheck > 4) {
                    //大失败的话, 理智损失最大值
                    failExp = failExp.replace('d', '*')
                }
                sanDown = utils.calc(failExp).val
            }

            let newSan = san - sanDown < 0 ? 0 : san - sanDown
            let resString = utils.stringTranslate(
                "doSanCheck",
                [
                    reason ? '由于' + reason : '',
                    name,
                    scResult,
                    san,
                    response.checkResult[scCheck],
                    sanDown,
                    newSan
                ]
            )

            if (!sanSet) {
                await utils.prop.setProp(
                    dbName,
                    data.user_id, {
                        'san': newSan
                    }
                )
            }

            return resString
        }

        //检定
        //参数: .rc [奖励骰] [属性名称] [属性值] [原因]
        //奖励骰: b/p X
        //属性值: 数字
        //属性名称和属性值至少填一个
        if (msg.order === '.rc') {

            //选定一个规则 (TODO!)
            // let ruleNum = config.def
            // try {
            //     ruleNum = await utils.dbWork.findData(
            //         dbName, 'general', {}
            //     )['rules']
            // } catch {
            //     ruleNum = config.defaultRule
            // }

            let bonus = 0,
                prop = '',
                val = -1,
                reason = ''

            //判断是否存在奖励骰
            if (/^(b|p)(\d+)$/.test(msg.params[0])) {
                let b = RegExp.$1,
                    v = parseInt(RegExp.$2)
                if (!v || v > config.maxBonus) {
                    return utils.stringTranslate(
                        "errTooManyBonus"
                    )
                }
                bonus = (b === 'b' ? 1 : -1) * v

                //存在的话就把这一项去掉 看后面的参数
                msg.params = msg.params.slice(1)
            }

            //如果后面莫得参数的话
            if (msg.params.length <= 0) {
                return utils.stringTranslate(
                    "errInvalidParam"
                )
            }

            let tmp = parseInt(msg.params[0])
            //如果第一个参数就是数字的话
            //说明没有属性名称 直接给属性值
            if (tmp) {
                prop = ''
                val = tmp
                reason = msg.params[2] //不管有没有都行
            } else {
                //如果第一个参数不是数字 那就是给属性名称了
                prop = msg.params[0]
                let ttmp = parseInt(msg.params[1]) //看看后面有没有给值
                //如果给值了就用给的值 否则再去库里查
                if (ttmp) {
                    val = ttmp
                    reason = msg.params[2]
                } else {
                    reason = msg.params[1]
                    try {
                        ttmp = await utils.prop.getOne(
                            dbName,
                            data.user_id,
                            prop
                        )
                    } catch (e) {}
                    ttmp = parseInt(ttmp)
                    //如果没有查询到指定属性的话
                    if (!ttmp) {
                        return utils.stringTranslate(
                            "errNoProp",
                            [prop]
                        )
                    } else {
                        val = ttmp
                    }
                }
            }

            let res = utils.dice('1d100', bonus, false),
                ret = ''
            if (bonus === 0) {
                ret = res.val.toString()
            } else {
                ret = res.str
            }

            let checkRes = utils.check(
                utils.getRule(dbName),
                res.val,
                val
            )
            if (checkRes < 0) {
                return utils.stringTranslate(
                    "errOtherErr"
                )
            }

            let description = response.checkResult[checkRes]
            return utils.stringTranslate(
                "doCheck",
                [reason ? '由于' + reason : '',
                    name, prop, ret, val, description,
                ]
            )
        }
    }

    return ''
}

module.exports = solveGeneralMsg