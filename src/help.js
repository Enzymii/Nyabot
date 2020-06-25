const cf = require('./config')

const helpText = {
    title: "操作菜单如下喵w~(参数请一定以**空格**分隔开喵w~):\n",
    general: ".hitokoto/htkt 一言\n.jrrp 今日人品\n\
.ohy/.oysm 早/晚安\n\.muda/.ora/.meow むだ/オラ/喵w~\n\
.kokodayo/kkdy ここだよ\n.coc/coc7 coc7th人物作成\n\
.r 掷骰\n.rs 简化输出\n\.set 设置属性\n.en 技能成长\n\
.sc SAN CHECK\n.rc 检定\n.help 显示帮助\n\.v/ver 查看版本信息\n\
.draw 抽卡\n\.sauce 搜图源\n",
    group: `.bot 控制${cf.botName}开关\n\
.rh 暗骰\n.rhs 简化输出\n.chat 聊天功能(测试版)\n`,
    private: ".gset 设置群属性\n",
    text: "可以使用.help [指令]的方式查看更具体的信息喵w~\n\
更详细可以见: https://github.com/Enzymii/Nyabot/blob/master/README.md",

    /////////////////////////////////////////////////
    hitokoto: "无参数 生成一句随机的名言或者什么的喵w~",
    jrrp: "无参数 就是测一下今天的人品喵w~",
    ohy: "无参数お早うにゃw~",
    oysm: "无参数 お休みにゃw~",
    muda: `[次数] 输出指定次数むだ 默认1次 最多${cf.maxRepeatTimes}次`,
    ora: `[次数] 输出指定次数オラ 默认1次 最多${cf.maxRepeatTimes}次`,
    meow: `[次数] 输出指定次数オラ 默认1次 最多${cf.maxRepeatTimes}次`,
    kokodayo: "无参数 输出こ～こ～だ～よ～☆",
    coc7: `[次数] coc7版人物作成 默认1次 最多${cf.maxCoc}次`,
    r: `[表达式/奖励骰(bX)/惩罚骰(pX)][掷骰原因] 掷骰.\n\
默认1d100,最大数字${cf.maxDigit}, 表达式最大长度${cf.maxExpressionLength},\
 奖励/惩罚骰最多${cf.maxBonus}个`,
    rs: `[表达式/奖励骰(bX)/惩罚骰(pX)] [掷骰原因] 掷骰, 不显示多个骰子和奖励/惩罚骰的具体点数.\n\
默认1d100, 最大数字${cf.maxDigit}, 表达式最大长度${cf.maxExpressionLength}, 奖励/惩罚骰最多${cf.maxBonus}个`,
    set: "进行属性相关的操作喵w~\n\
设置属性: 属性 值 [属性 值] ...\n\
删除属性: del 属性 [属性] [属性] ...\n\
显示属性: show [属性] [属性] [属性] ... 不填则全显示\n\
清空属性: clr 会清空所有属性喵w~",
    en: "[属性] [数值] [原因] 增强/成长检定..属性和数值请至少填一个喵w~\n\
不填写数值的话会使用设置的属性, 检定后会自动修改, 否则不会修改",
    sc: "成功表达式 失败表达式 [san值] [原因] san值检定\n\
不填写数值的话会使用设置的san值, 检定后会自动修改, 否则不会修改",
    rc: "[奖励骰bX/惩罚骰pX] [属性] [数值] [原因] 使用指定规则(目前是规则书规则..TODO: 自定义规则)进行技能的检定\n\
属性和数值请至少填写其中一个喵w~",
    help: "[指令] 查看指定功能的说明喵w~ (其实能看到这条肯定知道怎么用了喵w~)",
    draw: `牌堆名 [次数] 不要超过${cf.maxDraw}次喵w~ 目前支持的牌堆如下喵w~\n`,
    sauce: "一张图 查找这张图片的原链接喵w~",
    //
    bot: `on/off 开启/关闭${cf.botName}`,
    rh: `[表达式/奖励骰(bX)/惩罚骰(pX)][掷骰原因] 暗骰,结果私聊发送\n\
默认1d100,最大数字${cf.maxDigit}, 表达式最大长度${cf.maxExpressionLength},\
奖励/惩罚骰最多${cf.maxBonus}个`,
    chat: "关键词回复相关功能喵w~:\n\
add 关键词 回复 添加一个回复\n\
del 关键词 回复 删除一个回复\n\
clr 清空所有关键词和回复\n\
list 列举所有关键词和回复\n\
what 查询上一次进行回复的关键词和回复\n\
当出现多种可能的回复的时候, 会等概率随机挑选一个\n\
因为技术和其他原因, 此功能处于测试阶段, 仅部分群可以使用..\n\
可以联系Master获取权限喵w~",
    //
    gset: "[群号] 后续参数请见.set\n\
对指定群中的属性进行操作 详情也请见.set",
}
module.exports = helpText