//本来确实是写成json好一些的
//但是json不能加注释QAQ
//所以还是写成了js的形式~

const config = {

    //监听的主机
    host: "0.0.0.0",
    //监听的端口W
    recvPort: 8848,
    //httpAPI发送端口
    sendPort: 8488,

    //mongodb的url
    dbUrl: "mongodb://127.0.0.1",

    //bot自己的QQ
    botQ: 999999999,
    //给bot起一个可爱的名字好了QAQ
    botName: "bot",
    //bot管理(不是群管理呀QAQ)们的QQ
    suQ: [999999996, ],

    //muda ora最大的重复次数
    maxRepeatTimes: 255,

    //dice
    maxCoc: 10,                 //人物作成最大值
    maxDigit: 100,              //骰子的个数和面数的最大值
    maxBonus: 5,                //奖励骰的最大值
    maxExpressionLength: 50,    //掷骰表达式的最大长度
    defaultDice: '1d100',       //默认掷骰表达式

    //切换规则这事属于TODO
    defaultRule: 0,             //默认规则的编号(参见rules.js)

    version: '2.0.2',           //版本号
}

module.exports = config
