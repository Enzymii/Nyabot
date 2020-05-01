//这里是实现各种功能的模块~

const http = require('http')
const https = require('https')
const stack = require('./stack')
const querystring = require('querystring')

const config = require('./config')
const db = require('./dbWork')
const prop = require('./propWork')
const response = require('./response')
const rules = require('./rules')

let utils = {}

//先把所有数据库操作整合起来~
utils.dbWork = db
utils.prop = prop
//然后检定的规则也写在这里
utils.rules = rules

//生成一个[l,r)的整数
const randInt = (l, r) => {
    return Math.floor(Math.random() * (r - l)) + l
}
utils.randInt = randInt

//把buffer转成json
//因为https里面get到的数据是buffer格式的json
//所以要转成json就要用这个啦~
const bufferToJson = buffer => {
    //Emmmm这个应该作为板子背过~
    return JSON.parse(
        Buffer.from(
            JSON.parse(
                JSON.stringify(buffer)
            )
        ).toString()
    )
}
utils.bufferToJson = bufferToJson

//将收到的信息进行分类并简单处理
//0 - 普通消息 content表示内容
//1 - 指令消息 params
const msgConvert = text => {

    const order = /^[\.。]/
    const atBot = `[CQ:at,qq=${config.botQ}]`

    //如果是以./。开头的就视为指令串
    if (order.test(text)) {

        //指令串全转为小写
        text = text.toLowerCase()

        //把开头的.或者。替换为.
        text = text.replace(order, '.')

        //v2.0.2: 把.和指令之间的空格去掉w
        text = text.replace(/^.[ ]+/, '.')

        //把串按空格拆开
        let divided = text.split(' ')

        return {
            type: 1,
            order: divided[0],
            params: divided.slice(1)
        }
    }

    if (text.indexOf(atBot) != -1) {
        let newText = text.replace(atBot, '')
        let ret = msgConvert(newText)

        if (ret.type === 0) {
            return {
                type: 2,
                content: ret.content
            }
        } else {
            return ret
        }
    }

    return {
        type: 0,
        content: text
    }
}
utils.msgConvert = msgConvert

//把模板串依次填入数组中的参数 得到目标字符串
const stringTranslate = (responseName, params) => {
    let template = response[responseName]
    template = template.replace(
        '$$',
        config.botName
    )
    if (!params) return template
    for (let i = 0; i < params.length; i++) {
        let tar = '$' + i;
        if (params[i] === undefined) {
            throw 'UNDEFINED PARAM!'
        }
        template = template.replace(
            tar,
            params[i].toString()
        )
    }
    return template
}
utils.stringTranslate = stringTranslate

//计算表达式的值 (含d的那种)
//计算表达式的值, 同时记录结果
//支持+ - * / % d几种
//如果flag为0则简化输出
const calculate = (src, isSimplified) => {

    src = src.toString()

    if (src.length > config.maxExpressionLength) {
        return {
            str: "errTooLongExpression",
            val: NaN
        }
    }

    let curNum = 0
    let numStack = new stack(1024)
    let strStack = new stack(1024)
    let signStack = new stack(1024)

    for (let i = 0; i < src.length; i++) {
        //TODO: 逐字符处理

        if (src[i] === '(') {
            //如果出现括号的话:
            let brace = 1,
                j
            for (j = i + 1; j < src.length; j++) {
                if (src[j] === '(') brace++;
                else if (src[j] === ')') brace--;
                if (brace === 0) {
                    let srcSeg = src.slice(i + 1, j)
                    let recRes = calculate(srcSeg, isSimplified)

                    if (isNaN(recRes.val)) {
                        return recRes
                    }
                    numStack.push(recRes.val)
                    strStack.push('(' + recRes.str + ')')
                    break;
                }
            }
            if (j >= src.length) {
                return {
                    str: "errInvalidExpression",
                    val: NaN
                }
            }
            i = j + 1
            if (i >= src.length) break;
        }

        if (src[i] >= '0' && src[i] <= '9') {
            //如果是数字的话
            curNum = curNum * 10 + parseInt(src[i])
            if (curNum > 255) {
                return {
                    str: "errTooLargeNumber",
                    val: NaN
                }
            }
            if (!(src[i + 1] >= '0' && src[i + 1] <= '9')) {
                //如果下一位不是数字
                numStack.push(curNum)
                strStack.push(curNum.toString())
                curNum = 0
            }
        } else { //否则就是运算符了

            //如果符号已经比操作数多了的话
            if (signStack.size() >= numStack.size()) {
                return {
                    str: "errInvalidExpression",
                    val: NaN
                }
            }

            //如果遇到优先级低的运算符 就把优先级高的算掉
            if (src[i] === '+' || src[i] === '-') {
                while (signStack.tope() === '*' ||
                    signStack.tope() === '/' ||
                    signStack.tope() === '%' ||
                    signStack.tope() === 'd') {
                    let tmp = 0
                    let y = numStack.pop(),
                        x = numStack.pop(),
                        o = signStack.pop()

                    //与此同时strStack也要弹两个
                    let yy = strStack.pop(),
                        xx = strStack.pop(),
                        tmpStr = ''
                    if (o === '*') {
                        tmp = x * y;
                        tmpStr = xx + ' * ' + yy
                    } else if (o === '/') {
                        tmp = x / y;
                        tmpStr = xx + ' / ' + yy
                    } else if (o === '%') {
                        tmp = x % y;
                        tmpStr = xx + ' % ' + yy
                    } else {
                        if (!parseInt(xx) || !parseInt(yy)) {
                            return {
                                str: "errInvalidExpression",
                                val: NaN
                            }
                        }
                        tmpStr = '['
                        for (let j = 0; j < x; j++) {
                            let dice = utils.randInt(1, y + 1)
                            if (j > 0) tmpStr += ' + '
                            tmpStr += dice.toString()
                            tmp += dice
                        }
                        tmpStr += ']'

                        if (isSimplified) {
                            tmpStr = '{' + tmp.toString() + '}'
                        }
                    }
                    numStack.push(tmp)
                    strStack.push(tmpStr)
                }
            } else if (src[i] === '*' || src[i] === '/' || src[i] === '%') {
                while (signStack.tope() === 'd') {
                    let tmp = 0
                    let y = numStack.pop(),
                        x = numStack.pop(),
                        o = signStack.pop()

                    let yy = strStack.pop(),
                        xx = strStack.pop()

                    if (parseInt(yy) === NaN || parseInt(xx) === NaN) {
                        return {
                            str: "errInvalidExpression",
                            val: NaN
                        }
                    }

                    tmpStr = '['
                    for (let j = 0; j < x; j++) {
                        let dice = utils.randInt(1, y + 1)
                        if (j > 0) tmpStr += ' + '
                        tmpStr += dice.toString()
                        tmp += dice
                    }
                    tmpStr += ']'

                    if (isSimplified) {
                        tmpStr = '{' + tmp.toString() + '}'
                    }

                    numStack.push(tmp)
                    strStack.push(tmpStr)
                }
            }

            signStack.push(src[i])
        }
    }

    while (signStack.size() > 0) {
        let tmp = 0
        let y = numStack.pop(),
            x = numStack.pop(),
            o = signStack.pop()
        let yy = strStack.pop(),
            xx = strStack.pop(),
            tmpStr = ''
        if (o === '+') {
            tmp = x + y
            tmpStr = xx + ' + ' + yy
        } else if (o === '-') {
            tmp = x - y
            tmpStr = xx + ' - ' + yy
        } else if (o === '*') {
            tmp = x * y;
            tmpStr = xx + ' * ' + yy
        } else if (o === '/') {
            tmp = x / y;
            tmpStr = xx + ' / ' + yy
        } else if (o === '%') {
            tmp = x % y;
            tmpStr = xx + ' % ' + yy
        } else {
            if (!parseInt(xx) || !parseInt(yy)) {
                return {
                    str: "errInvalidExpression",
                    val: NaN
                }
            }
            tmpStr = '['
            for (let j = 0; j < x; j++) {
                let dice = utils.randInt(1, y + 1)
                if (j > 0) tmpStr += ' + '
                tmpStr += dice.toString()
                tmp += dice
            }
            tmpStr += ']'

            if (isSimplified) {
                tmpStr = '{' + tmp.toString() + '}'
            }
        }

        numStack.push(tmp)
        strStack.push(tmpStr)
    }

    return {
        str: strStack.pop(),
        val: numStack.pop()
    }
}
utils.calc = calculate
//一个辣鸡计算表达式我竟然写了200行QAQ
//果然还是码力太弱QAQ
/* w */

//掷骰
//参数: 表达式 奖励骰 是否简化输出
//返回值 {str: 代表结果的字符串 val: 掷骰的数值}
const dice = (exp, bonus, isSimplified) => {
    let res = calculate(exp, isSimplified)

    if (isNaN(res.val)) {
        return res
    }

    bonus = parseInt(bonus) || 0
    if (Math.abs(bonus) > config.maxBonus) {
        return {
            str: 'error',
            res: NaN,
        }
    }

    if (bonus !== 0) {
        let bDice = new Array(config.maxBonus)
        let bStr = bonus > 0 ? '<奖励骰:' : '<惩罚骰:'
        //>0奖励骰 <0惩罚骰
        for (let i = 0; i < Math.abs(bonus); i++) {
            bDice[i] = randInt(0, 10)
            bStr += ' ' + bDice[i].toString()
            if (res.val % 10 === 0) {
                bDice[i] = bDice[i] || 10
            }
            if (bonus > 0) {
                if (bDice[i] < res.val / 10) {
                    res.val = (res.val % 10) + bDice[i] * 10
                }
            } else {
                if (bDice[i] > res.val / 10) {
                    res.val = (res.val % 10) + bDice[i] * 10
                }
            }
        }
        bStr += '>'

        if (!isSimplified) {
            res.str += bStr
        }
    }

    if (bonus !== 0) res.str += ' -> ' + res.val
    else res.str += ' = ' + res.val

    return res
}
utils.dice = dice

//检定
//因为san check和属性检定有相同的地方
//而且要进行相似的非法值判断 所以写在一起
//curVal
//返回结果的数字(出错也就是onCheckResult的编号)
const check = (rule, curVal, maxVal) => {
    maxVal = parseInt(maxVal)
    if (!maxVal || maxVal < 0) {
        return -1
    }
    return rules[rule](curVal, maxVal)
}
utils.check = check

//人物作成
//为了和response统一, 返回一个数组
//[APP, CON, DEX, EDU, INT, POW, SIZ, STR, LUK, SUM9, SUM8]
const cocGenerate = () => {
    let sum8 = sum9 = 0,
        res = []

    for (let i = 0; i < 9; i++) {
        let val = 0
        //如果是CON EDU和SIZ的话是2d6+6
        if (i == 1 || i == 3 || i == 6) {
            val = calculate('5*(2d6+6)').val
            res.push(val)
        } else { //其它是3d6 (嗯 这都是规则书写的)
            val = calculate('5*3d6').val
            res.push(val)
        }
        if (i < 8) {
            sum8 += val
        }
        sum9 += val
    }
    res.push(sum9)
    res.push(sum8)
    return res
}
utils.cocGenerate = cocGenerate

//获得当前群(默认的)规则
const getRule = (dbName) => {
    return 0
}
utils.getRule = getRule

//从群列表里挑出指定群的名字
const getGroupName = id => {
    for (let i = 0; i < global.groupList.length; i++) {
        let obj = global.groupList[i.toString()]
        if (obj.group_id.toString() === id) {
            return obj.group_name
        }
    }
    return ''
}
utils.getGroupName = getGroupName

//HITOKOTO
const getHitokoto = async () => {
    let res = new Promise((resolve, reject) => {
        let dataBuffer = ''
        https.get('https://v1.hitokoto.cn', res => {
            res.on('data', data => dataBuffer += data)
            res.on('end', () => {
                let json = bufferToJson(dataBuffer)
                resolve(json)
            })
        }).on('err', e => reject(e))
    })
    res.catch(e => console.log(e))
    return res
}
utils.getHitokoto = getHitokoto

//JRRP
const jrrp = async qq => {

    let postData = {
        QQ: config.botQ,
        v: '20190114',
        QueryQQ: qq,
    }
    let postBuffer = querystring.stringify(postData)

    let res = new Promise((resolve, reject) => {
        let dataBuffer = ''

        let req = http.request({
            host: 'api.kokona.tech',
            port: 5555,
            method: 'POST',
            path: '/jrrp',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Content-Length': postBuffer.length
            }
        }, res => {
            console.log(res.statusCode)
            if (res.statusCode != 200) {
                resolve('-1')
            }
            res.on('data', data => dataBuffer += data)
            res.on('end', () => resolve(dataBuffer))
        }).on('err', e => reject(e))
        req.write(postBuffer)
        req.end()
    })
    res.catch(e => console.log(e))
    return res
}
utils.jrrp = jrrp

//把一个word重复times遍
const repeatWord = (word, times) => {
    let res = ''
    for (let i = 0; i < times; i++) {
        res += word
    }
    return res
}
utils.repeatWord = repeatWord


module.exports = utils