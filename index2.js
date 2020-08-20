const NyabotMirai = require('./mirai-io');

const main = async () => {
    let x = new NyabotMirai(
        'localhost:8080',
        'kafuuchino',
        2490434826,
    );

    await x.init();
    x.listen();
}

main();