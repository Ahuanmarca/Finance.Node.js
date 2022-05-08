const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const users = [
    {
        username: 'alice',
        hash: '$2b$12$.39.AI/Yhe3xu1VD633YS.83g/g9rN8acOjQpiWf5jkUOXHTdUhuq',
        firstName: 'Alice',
        lastName: 'Cooper',
        email: 'alice.cooper@finance.com',
        portfolio: {
            MTCH: {
                symbol: "MTCH",
                name: "Match Group Inc. - New",
                bought: new Date(2019, 3, 6, 10, 0, 0),
                qty: 20,
                price: 67.79
            },
            TTWO: {
                symbol: "TTWO",
                name: " Take-Two Interactive Software, Inc.",
                bought: new Date(2019, 4, 15, 8, 15, 0),
                qty: 20,
                price: 99.45
            },
            ETSY: {
                symbol: "ETSY",
                name: "Etsy Inc",
                bought: new Date(2019, 5, 3, 9, 30, 0),
                qty: 20,
                price: 61.95
            }
        } 
    },
    {
        username: 'bob',
        hash: '$2b$12$ETcv8KPFtc.PktySy39Jy.prR3jLPDdDOGQad1C21Av/3nZd7hwM6',
        firstName: 'Bob',
        lastName: 'Marley',
        email: 'bob.marley@finance.com',
        portfolio: {
            OXY: {
                symbol: "OXY",
                name: "Occidental Petroleum Corp.",
                bought: new Date(2018, 5, 1, 4, 10, 0),
                qty: 20,
                price: 84.65
            },
            COTY: {
                symbol: "COTY",
                name: "Coty Inc - Class A",
                bought: new Date(2018, 6, 1, 5, 20, 0),
                qty: 200,
                price: 14.05
            },
            MRO: {
                symbol: "MRO",
                name: "Marathon Oil Corporation",
                bought: new Date(2019, 4, 1, 6, 15, 0),
                qty: 100,
                price: 28.15
            }
        }
    },
    {
        username: 'charlie',
        hash: '$2b$12$fX/1jtHdcQbDsxCCHSH9guqbCn1LfyROWiYFxFqNEDA8pX7iH3jNy',
        firstName: 'Charlie',
        lastName: 'Sheen',
        email: 'charlie.sheen@finance.com',
        portfolio: {
            IBM: {
                symbol: "IBM",
                name: "International Business Machines Corp.",
                bought: new Date(2021, 5, 1, 5, 10, 0),
                qty: 10,
                price: 138.62
            },
            TWTR: {
                symbol: "TWTR",
                name: "Twitter Inc",
                bought: new Date(2021, 10, 1, 8, 25, 0),
                qty: 20,
                price: 53.56
            },
            AMZN: {
                symbol: "AMZN",
                name: "Amazon.com Inc.",
                bought: new Date(2021, 11, 1, 10, 45, 0),
                qty: 1,
                price: 3545.00
            }
        }
    }
]
    
const symbols = [
    ...Object.keys(users[0].portfolio), 
    ...Object.keys(users[1].portfolio), 
    ...Object.keys(users[2].portfolio)
];

async function main() {
    
    console.log("Seeding 'finance' database.")

    // Clean all tables
    const clear1 = await prisma.transacciones.deleteMany({});
    const clear2 = await prisma.portfolios.deleteMany({});
    const clear3 = await prisma.stocks.deleteMany({});
    const clear4 = await prisma.users.deleteMany({});

    if (clear1 && clear2 && clear3 && clear4) {
        console.log('Succesfully cleaned data from tables.')
    }

    // Populate tables
    for (user of users) {

        // Step 1: Create user
        const newUser = await prisma.users.create({
            data: {
                username: user.username,
                hash: user.hash,
                first_name: user.firstName,
                last_name: user.lastName,
                email: user.email
            }
        });

        let spending = 0.0;
        const userID = newUser.id;

        for (stock in user.portfolio) {
            // Have variables at hand
            const symbol = user.portfolio[stock].symbol; 
            const name = user.portfolio[stock].name;
            const bought = user.portfolio[stock].bought;
            const qty = user.portfolio[stock].qty;
            const price = user.portfolio[stock].price;
            
            // Step 2: Add stock to "stocks" table
            const newStock = await prisma.stocks.create({
                data: {
                    symbol: symbol,
                    name: name
                }
            });

            const stockID = newStock.id;

            // Step 3: Add stock to "portfolios" table
            const newPortfolioRow = await prisma.portfolios.create({
                data: {
                    user_id: userID,
                    stock_id: stockID,
                    shares: qty
                }
            });

            // Step 4: Add transaction to "transacciones" table
            const newTransaction = await prisma.transacciones.create({
                data: {
                    user_id: userID,
                    stock_id: stockID,
                    shares: qty,
                    price: price,
                    p_datetime: bought
                }
            });
            
            // Step 5: Update spending
            spending += qty * price;
        }

        // Step 6: Update user´s cash
        const updatedCash = await prisma.users.update({
            where: {
                id: userID
            },
            data: {
                cash: {
                    decrement: spending
                }
            }
        });
    }

    console.log("Succesfully populated the database!")
}

main();
