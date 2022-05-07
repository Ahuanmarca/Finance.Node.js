const prisma = require('./client.js');
const bcrypt = require('bcrypt');

const authenticate = async (pack) => {

    const { username, password } = pack;

    // Find the user with this username
    const user = await prisma.users.findUnique({
        where: {
            username: username
        }
    });
    
    // Check if the user exists
    if (!user) {
        return {
            id: undefined,
            username: undefined,
            validation: false
        }
    }

    const validation = await bcrypt.compare(password, user.hash);

    // Return object with: id, username and validation result
    return {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        validation: validation
    }
}

module.exports = authenticate;
