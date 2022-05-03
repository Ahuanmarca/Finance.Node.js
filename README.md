## RESTful route

| NAME            | PATH               | VERB   | PURPOSE                            |
|-----------------|--------------------|--------|------------------------------------|
| Index           | /finance/index     | GET    | Display user's portfolio           |
| Register Form   | /finance/register  | GET    | Form to register new user          |
| Register Action | /finance/register  | POST   | Action to register new user        |
| Login Form      | /finance/login     | GET    | Form to login user                 |
| Login Action    | /finance/login     | POST   | Action to login user               |
| Quote Form      | /finance/quote     | GET    | Details for one specific comment   |
| Quote Action    | /finance/quote     | GET    | Details for one specific comment   |
| Buy Form        | /finance/buy       | GET    | Form to edit specific comment      |
| Buy Action      | /finance/buy       | POST   | Form to edit specific comment      |
| Sell Form       | /finance/sell      | GET    | Updates specific comment on server |
| Sell Action     | /finance/sell      | POST   | Updates specific comment on server |
| History         | /finance/history   | GET    | Deletes specific item on server    |

## Helper Functions

- **lookup.js**: Simplemente se encarga de obtener la información financiera de algún símbolo, la cual obtiene de IEX.

- **usd.jd**: Formatea un float como USD

- **requireLogin.js**: Función para usar como middleware para requerir login en todas las rutas que lo requiran(las "protege")

- **parseDateTime**: Función para convertir objeto DATE de DB en string bonito, para no necesitar toda esa lógica en el template

### TODO 02-05-2022
- Sessions, register user, login, logout ✔️
    - Done! But the user is logged out when rebooting the server ✔️
- The nav bar needs "user" variable, even if it's undefined ✔️
- Need helper function to call apology, but using **redirect** please!! ❌
- Need some indication of which user is currently logged in 
- Need flash messages with preety Bootstrap alerts
- Need to create a file to seed the DB with 3 users, each with at least 8 stocks, and a history that spans at least a few weeks... So I can try some interesting features with the history later
- **BUG FIX**: The symbols store themselves in lower case or uppercase, should always be in uppercase
- Clean up de structure of the files inside /Finance-Node folder... put stuff in /src folder
- Render Apology page instead of res.render() calls - better: just flash a message !!

### Features Wishlist
- Buy / Sell stocks directly in the index page
- Require a password with at least one uppercase letter, one lowercase letter, one unmber, one special character, and between 8 and 20 characters long
- "Sell Out" button to sell all shares from one stock
- More information in the INDEX page
- Change the design of the page so it doesn't look so similar to the CS50 version, although I should put some notice that the web app is inspired by the CS50 one
-
