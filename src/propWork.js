//关于属性的操作
const db = require('./dbWork')

let propWork = {}

const getOneProperty = async (dbName, userId, propName) => {
    let res = await getProperty(dbName, userId)
    return res[propName]
}
propWork.getOne = getOneProperty

const getProperty = async (dbName, userId) => {
    let res = await db.findData(dbName, 'property', {
        user_id: userId
    })
    return res[0]
}
propWork.getProp = getProperty

const setProperty = async (dbName, userId, obj) => {
    await db.updData(dbName, 'property', {
        user_id: userId
    }, {
        $set: obj
    })
}
propWork.setProp = setProperty

const delProperty = async (dbName, userId, props) => {

    let tmp = {}
    props.forEach(e => {
        tmp[e] = -1
    });

    await db.updData(dbName, 'property', {
        user_id: userId
    }, {
        $unset: tmp
    })
}
propWork.delProp = delProperty

const clrProperty = async (dbName, userId) => {
    await db.delData(dbName, 'property', {
        user_id: userId
    })
}
propWork.clrProp = clrProperty

module.exports = propWork