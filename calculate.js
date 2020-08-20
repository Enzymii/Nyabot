const stack = require('./stack')
const utils = require('./utils')

//计算表达式的值, 同时记录结果
//支持+ - * / % d几种
//如果flag为0则简化输出
const calculate = (src, isSimplified) => {
    
    src = src.toString()

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
                    let recRes = calculate(srcSeg)

                    numStack.push(recRes.val)
                    strStack.push('(' + recRes.str + ')')
                    break;
                }
            }
            if (j >= src.length) {
                return {
                    str: 'error',
                    val: NaN
                }
            }
            i = j + 1
            if (i >= src.length) break;
        }

        if (src[i] >= '0' && src[i] <= '9') {
            //如果是数字的话
            curNum = curNum * 10 + src[i] - '0'
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
                    str: 'error',
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
                                str: 'error',
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
                            tmpStr = tmp.toString()
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
                            str: 'error',
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
                        tmpStr = tmp.toString()
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
                    str: 'error',
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
                tmpStr = tmp.toString()
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

module.exports = calculate