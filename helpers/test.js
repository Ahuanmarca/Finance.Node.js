const lookup = require('./lookup.js');

async function main() {
    data = await lookup("AAPL");
    console.log(data);
}

main();
