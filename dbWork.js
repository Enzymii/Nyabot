const config = require('./config')
const mongoClient = require('mongodb').MongoClient

const db = {}

const addData = (dbName, dbCollection, dbData) => {
    let dbAddData = new Promise((resolve, reject) => {
        mongoClient.connect(config.dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }, (err, db) => {
            if (err) {
                reject(err)
            }

            db.db(dbName).collection(dbCollection).insertOne(dbData,
                (err, res) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(res)
                })

            db.close();
        })
    })

    dbAddData.catch(err => console.log(err))

    return dbAddData
}
db.addData = addData

//这里的update是upsert的说~(感觉所有的操作都upsert好解决一些)
const updData = (dbName, dbCollection, dbQuery, dbData) => {
    let dbUpdData = new Promise((resolve, reject) => {
        mongoClient.connect(config.dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, db) => {
            db.db(dbName).collection(dbCollection).updateOne(dbQuery,
                dbData, {
                    upsert: true
                }, (err, res) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(res)
                }
            )

            db.close();
        })
    })
    dbUpdData.catch(e => console.log(e))

    return dbUpdData
}
db.updData = updData

const delData = (dbName, dbCollection, dbData) => {
    let dbDelData = new Promise((resolve, reject) => {
        mongoClient.connect(config.dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }, (err, db) => {
            if (err) {
                reject(err)
            }

            db.db(dbName).collection(dbCollection).deleteMany(
                dbData, (err, res) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(res)
                }
            )

            db.close();
        })
    })

    dbDelData.catch(err => console.log(err))

    return dbDelData
}
db.delData = delData

//这里的findData是findAll的说~
const findData = (dbName, dbCollection, dbData) => {
    let dbFindData = new Promise((resolve, reject) => {
        let db = mongoClient.connect(config.dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, db) => {
            if (err) {
                reject(err)
            }
            db.db(dbName).collection(dbCollection).find(dbData).toArray((err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res)
            })

            db.close();
        })
    })

    dbFindData.catch(err => console.log(err))

    return dbFindData
}
db.findData = findData

module.exports = db