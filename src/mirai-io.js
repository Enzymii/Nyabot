const axios = require('axios');

const groupMsg = require('./groupMsg');
const privateMsg = require('./privateMsg');
const utils = require('./utils');
const saucenao = require('saucenao');
const config = require('./config');

class NyabotMirai {

    constructor(
        host,
        authKey,
        qq,
        work,
        enableWebSocket = false,
        fetchInterval = 1000,
    ) {
        this.host = host;
        this.authKey = authKey;
        this.qq = qq;
        this.enableWebSocket = enableWebSocket;
        this.fetchInterval = fetchInterval;
        // this.work = work;
    }

    async init() {
        let { data } = await axios.post(`http://${this.host}/auth`, {
            "authKey": this.authKey
        });

        let { code, session } = data;

        if (code != 0) {
            console.log("Authorize Failed!");
            console.log(code);
            return;
        } else {
            console.log("Authorize Success!");
            console.log("SessionId: " + session);
            this.session = session;
        }

        data = (await axios.post(`http://${this.host}/verify`, {
            "sessionKey": session,
            "qq": this.qq
        })).data

        console.log(data);

        this.verified = true;
    }

    async sendFriendMessage(target, messageChain) {
        let { data } = await axios.post(`http://${this.host}/sendFriendMessage`, {
            "sessionKey": this.session,
            "target": target,
            "messageChain": messageChain
        });

        console.log(data);
    }

    async sendGroupMessage(target, messageChain) {

        let { data } = await axios.post(`http://${this.host}/sendGroupMessage`, {
            "sessionKey": this.session,
            "target": target,
            "messageChain": messageChain
        });

        console.log(data);
    }

    async work(obj) {
        if (obj.type === 'GroupMessage') {
            let response = await groupMsg(obj.data, utils.msgConvert(obj.msg));
            console.log(response, typeof response);
            if (typeof response === 'object') {
                if (response.public) {
                    await this.sendGroupMessage(obj.data.sender.group.id, [{
                        type: 'Plain',
                        text: response.public,
                    }]);
                    await this.sendFriendMessage(obj.data.sender.id, [{
                        type: 'Plain',
                        text: response.private,
                    }]);
                } else {
                    await this.sendGroupMessage(obj.data.sender.group.id, [{
                        type: 'Plain',
                        text: response.text,
                    }, {
                        type: "Image",
                        url: response.img,
                    }]);
                }
            } else {
                if (response.length) {
                    await this.sendGroupMessage(obj.data.sender.group.id, [{
                        type: 'Plain',
                        text: response
                    }]);
                }
            }
        } else if (obj.type === 'FriendMessage') {
            let response = await privateMsg(obj.data, utils.msgConvert(obj.msg));
            console.log(obj.data);
            if (response.length) {
                await this.sendFriendMessage(obj.data.sender.id, [{
                    type: 'Plain',
                    text: response
                }]);
            }
        }
    }

    listen() {

        if (!this.verified) return;

        if (this.enableWebSocket) {

        } else {
            setInterval(async () => {
                const { data } = await axios.get(
                    `http://${this.host}/fetchMessage?sessionKey=${this.session}&count=${10}`
                );

                let fetchedMessage = data.data;
                if (fetchedMessage.length > 0) {
                    console.log(JSON.stringify(fetchedMessage));
                }
                const validMsgType = ['GroupMessage', 'FriendMessage', 'TempMessage'];
                if (fetchedMessage.length > 0) {
                    for (let cnt in fetchedMessage) {
                        let message = fetchedMessage[cnt];
                        if (validMsgType.indexOf(message.type) != -1) {
                            for (let chainCnt in message.messageChain) {
                                let chain = message.messageChain[chainCnt];
                                if (chain.type == 'Plain') {
                                    console.log(chain.text);
                                    await this.work({
                                        type: message.type,
                                        data: message,
                                        msg: chain.text,
                                    });
                                } else if (chain.type == 'Image') {
                                    //                 let { url } = chain;
                                    //                 let sauce = (await saucenao(url)).json;
                                    //                 // console.log(JSON.stringify(sauce));
                                    //                 let { results } = sauce
                                    //                 let { header, data } = results[0]
                                    //                 if (header.similarity > 90) {
                                    //                     if (message.type == 'GroupMessage') {
                                    //                         await this.sendGroupMessage(message.sender.group.id, [{
                                    //                             type: 'Plain',
                                    //                             text: `Origin Link:${data.ext_urls}\nAvailable At:${url}`,
                                    //                         }])
                                    //                     }
                                    //                 } else {
                                    // console.log(`Sauce: No Match Found for ${url}`);
                                    // }
                                }
                            }
                        }
                    }
                }
            }, this.fetchInterval);
        }
    }
}

module.exports = NyabotMirai;