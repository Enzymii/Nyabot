//本来确实是写成json好一些的
//但是json不能加注释QAQ
//所以还是写成了js的形式~
const response = {
    //以下所有$$都会被替换成骰娘的名字
    //(就是config里面那个botName啦~)
    startUp: 'bot[$$]启动, 正在监听$0:$1\n等待接收消息...', //启动bot时
    
    //错误信息
    errInvalidParam: '$$似乎接收到了错误的参数呢喵w~', //参数错误
    errTooLongExpression: '这样的表达式对$$来说太长了喵w!!', //表达式过长
    errInvalidExpression: '$$不认识这个表达式呢喵w~ 请再检查一下喵w~', //表达式错误
    errGroupNameNotFound: '[获取群名失败]', //没获取到群名
    errGroupNotFound: '$$不知道是哪个群喵w~', //未找到群
    errHelpNotFound: '并没有找到相应的帮助喵w~', //没有对应的帮助  
    errJrrpErr: '喵呜呜 获取$0的今日人品似乎失败了喵w~', //jrrp获取失败 $0用户名
    errTooManyTimes: '说那么多遍的话... $$会累坏的喵w~', //muda ora次数太多
    errTooManyCoc: '要作成的人物太多了喵w~', //人物作成次数太多
    errTooLargeNumber: '呀——数字太大,$$数不过来了喵w~', //数字太大
    errTooManyBonus: '唔——扔太多也没什么意义呀喵w~', //奖励(惩罚)骰太多
    errNoProp: '呜喵w~ 似乎还没有设置$0喵w~', //未设置指定属性 $0属性名
    errNoDeck: '$$这里并没有这个牌堆喵w~', //未找到牌堆
    errTooManyDraw: '1,2,3,... 太多了喵w~', //抽卡太多
    errOtherErr: '诶.. $$感觉哪里不太对喵w~', //其他错误

    //bot的状态(.bot消息)
    statOn: '$$在的喵w~',
    statTurnOn: '$$来了喵w~',
    statTurnOff: '唔喵w~ 不要忘记$$喵w~',
    botHelp: '可以使用.help查看说明哦~',

    //...............................各种操作...................................
    doAtBot: '唔喵www~', //当@骰娘时
    doVerInfo: '当前版本: v$0\n\
版本说明请见: https://github.com/Enzymii/Nyabot/blob/master/ver$1.md',
    //hitokoto的消息
    //$0 hitokoto内容
    //$1 hitokoto出处
    doGetHitokoto: '锵~ 看看$$这次找到的一句话是什么喵w~\n $0——$1',
    //jrrp的消息
    //$0 查询人的name
    //$1 jrrp值
    //根据jrrp高低作回复的情况请看jrrp.js
    doJrrp: '$$猜测$0的今日人品值应该是$1喵w~',
    //早安
    doOhy: 'おはよう~ 新的一天就让$$来陪伴你喵w~',
    //晚安
    doOysm: 'おやすみなさい~ $$祝你做个好梦喵w~',
    //人物作成
    doCoc7: '来看看$0的COC7版人物作成结果是什么喵w~\n',
    cocSingle: '外貌(APP): $0 体质(CON): $1 敏捷(DEX): $2\n\
教育(EDU): $3 智力(INT): $4 意志(POW): $5\n\
体型(SIZ): $6 力量(STR): $7 幸运(LUK): $8\n\
总和: $9 不含幸运: $10',
    cocPlural: 'APP$0 CON$1 DEX$2 EDU$3 INT$4 \
POW$5 SIZ$6 STR$7 LUK$8 总和$9 不含幸运$10\n',
    //掷骰结果
    doDice: '来看看$0骰$1的结果喵w~ $2', //骰
    doHidden: '$0进行了一次暗骰喵w~', //暗骰の群聊
    doHiddenPrivate: '来看看你在群[$0]($1)中骰$2的结果喵w~ $3', //暗骰の私聊
    //san check
    doSanCheck: '$0 $1进行了一次SAN CHECK喵w~\n\
$2/$3 $4\n\
SAN减少了$5点, 还剩$6点喵w~',
    //检定
    doCheck: '$0 $1进行$2检定的结果喵w~: $3/$4 $5',
    checkResult: [
        '大成功喵w~~',
        '极难成功喵w~',
        '困难成功喵w~',
        '成功喵w~',
        '失败喵w~',
        '大失败喵www'
    ],
    //增强 or 成长
    //请将doEnhance和后面两个拼接使用..
    doEnhance: '$0 $1进行$2增强/成长检定喵w~: 1d100=$3/$4 ',
    onEnhanceOk: '成功喵w~\n$0提高了1d10=$1点, 当前值为$2点喵w~',
    onEnhanceFail: '失败喵w~\n属性值并没有发生变化喵w~',
    //抽卡结果
    doDraw: '来看看$0抽$1的结果喵w:\n $2',

    //属性相关
    propSet: '$$已经把属性记下来了喵w~', //设置属性
    propClr: '$$已经把属性清空了喵w~', //清空属性
    propDel: '$$已经把属性删除了喵w~', //删除属性
    propEmpty: '$$这里似乎并没有记录任何属性喵w~', //无属性
    propShow: '已经记录的属性如下喵w~:\n$0', //展示属性

    //关键词回复相关
    chatExist: '$$已经会说这个了喵w~',
    chatAdd: '你说 $0, 我说 $1 喵w~',
    chatNotExist: '$$本来就不会说这个喵w~',
    chatDel: '你说 $0, 我也不说 $1 喵w~',
    chatWhat: '有人说 $0, 我就说了 $1 喵w~',
    chatNoWhat: '$$没说什么呀喵w~',
    chatClr: '成功执行[I级记忆清除]喵w~',
    chatNoList: '还没有教过$$说什么喵w~',
    chatList: '你说 $0, 我说 $1 喵w~\n', //emm..有点眼熟?

    //驳回来自黑名单群的邀请
    notWhite: 'ごめんね。介个是测试功能喵w~ 目前只能在指定群使用喵w~',
    isBlack: 'えっと。。Master把这个群写在黑名单上了喵w~\n\
$$要好好听Master的话, 不可以加进去喵w~'
}

module.exports = response