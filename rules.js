let rules = {}
//上面这句不要管啦...

//这里存放各种形式的检定规则 (TODO!)
//嘛 因为房规不同嘛~
//像有人喜欢1~3大成功, 98~100大失败之类的..
//这些规则之间以函数名互相区分
//
//在这里完全可以定制自己的规则
//只要……不 会 报 错~

//-------------------------------
//函数接受两个参数dice和prop
//dice 表示骰出来的点数
//prop 表示要检定的属性值
//-------------------------------

//[ruleBook](规则书) <-建议打个注释像这样写上[名字]和(规则的简要阐释)
const ruleBook = (dice, prop) => {
    let result = -1
    //你可以像这样叠一摞if语句
    //也可以采用别的方式
    if (dice == 1) {
        result = 0 //大成功
    } else if (dice <= prop / 5) {
        result = 1 //极难成功
    } else if (dice <= prop / 2) {
        result = 2 //困难成功
    } else if (dice <= prop) {
        result = 3 //成功
    } else if (dice < 96 || (prop > 50 && dice < 100)) {
        result = 4 //失败
    } else {
        result = 5 //大失败
    }
    return result
}

//把以上的所有规则都声明一下
rules = [ruleBook, ]

//下面的就不要动了...
module.exports = rules