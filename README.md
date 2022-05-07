## RESTful route

| NAME            | PATH                    | VERB   | PURPOSE                              |
|-----------------|-------------------------|--------|--------------------------------------|
| Index           | /finance/index          | GET    | Display user's portfolio             |
| Register Form   | /finance/register       | GET    | Form to register new user            |
| Register Action | /finance/register       | POST   | Action to register new user          |
| Login Form      | /finance/login          | GET    | Form to login user                   |
| Login Action    | /finance/login          | POST   | Action to login user                 |
| Quote Form      | /finance/quote          | GET    | Form to search stock's information   |
| Quote Action    | /finance/quote          | GET    | Show form's information (result)     |
| Buy Form        | /finance/buy            | GET    | Form to buy stocks                   |
| Buy Action      | /finance/buy            | POST   | Action to buy stocks                 |
| Sell Form       | /finance/sell           | GET    | Form to sell stocks                  |
| Sell Action     | /finance/sell           | POST   | Action to sell stocks                |
| History         | /finance/history        | GET    | Display buy / sell history from user |
| Change Password | /finance/changePassword | GET    | Form to update user's password       |
| Change Password | /finance/changePassword | PUT    | Action to update user's password     |

## Helper Functions

- **lookup.js**: Simplemente se encarga de obtener la información financiera de algún símbolo, la cual obtiene de IEX.

- **usd.jd**: Formatea un float como USD

- **requireLogin.js**: Función para usar como middleware para requerir login en todas las rutas que lo requiran(las "protege")

- **parseDateTime**: Función para convertir objeto DATE de DB en string bonito, para no necesitar toda esa lógica en el template

- **authenticate**: Función que chequea si el password es correcto (login route)

### CHANGES 02-05-2022
- Sessions, register user, login, logout ✔️ Done! But the user is logged out when rebooting the server
- Completed all the missing routes and fixed all the templates
- Fixed: Need to send context to res.render() calls even if the user is not logged in. The templates need the "user" variable with "undefined" value ✔️
- 

### CHANGES 03-05-2022
- Created **authenticate** helper function (for login and change password routes)
    - *Side note: Prisma Client cant't have attached methods like other ORMs. Could work around this by creating a Class that uses the prisma client, then putting the method in there... but I don't really know OOP just yet.*
- **BUG FIX**: The symbols store themselves in lower case or uppercase, should always be in uppercase
- **Security**: CSRF Protection - Implemented with 'csurf' and 'cookie-parser'
- Flash messages with preety Bootstrap alerts
- Login user after registration

### CHANGES 05-05-2022
- **BUG FIX**: Register sells into history - DONE!
    - There where a bunch of bugs in this route, mainly caused by using the wrong IDs on the DB
    - **To improve**: *All ID's columns names should be very explicit, so there's no confusion when querying relational data.*
- Need some indication of which user is currently logged in - DONE!!
    - Added 3 new columns to the "users" table: first_name, last_name, email.
    - Modified the register route and template so this fields are recorder on the DB.
    - Introspect and created Prisma User again,
    - Modified the login route so when the user logs in, first_name and last_name are also added to the session as variables (as firstName and lastName)
    - Pass a string created with `${req.session.firstName} ${req.session.lastName}` to all the res.render() calls, so it's available to show which user is currently logged in
    - **To improve**: *Redundancy keeps getting worse. Now I need to pass this string to every single res render call, because it´s needed even if the user is not logged in, because the variable is called in a partial (view) that's always present, so the variable will always be checked.*


### CHANGES 06-05-2022
- Implemented some error checking in the "buy" route, but there's a ton of error checking that's still needed at every corner.
- Replaced apology pages with flash messages, staying in the same page instead
- Implemented 2 kind of flash messages: success (blue) and failure (yellow). Took me a while to figure out how to make them different!
- Clean up the variable naming convention. After some research I gatter that it's best to use camel case in JavaScript, although it's acceptable to use snake case (which I prefer because is more readable). I'm sticking with camel case for now.

### CHANGES 07-05-2022
- Passing different title to all views
- Favicon
- Using bootstrap from downloaded files instead of link
- 

### TODO
- More and better error checking
- SEED DB - Need to create a file to seed the DB with 3 users, each with at least 8 stocks, and a history that spans at least a few weeks... So I can try some interesting features with the history later
- Clean up structure of the files inside /Finance-Node folder... put stuff in /src folder ??
- Clean up res.render() context, theres a lot of redundancy of the same stuff always being sent. Maybe create an object?
- Apply the *requireLogin* and *csrfProtection* middlewares in a better way, there's redundancy by putting them in all the routes, exactly the same way
- 

### Wishlist
- Change the design of the page so it doesn't look so similar to the CS50 version, although I should put some notice that the web app is inspired by the CS50 one
- Buy / Sell stocks directly in the index page
- Require a password with at least one uppercase letter, one lowercase letter, one number, one special character, and between 8 and 20 characters long
- "Sell Out" button to sell all shares from one stock
- If you click one stock, go to a page with more detailed information
- Filter in the history page (Client side JS?)
- 

### Curiosities
- Even in POST routes, if I return after rendering a template (or calling res.send), then it seems the form data wont be re-submitted if the user reloads the page. That's a simple solution. *Any reason not to do it that way?*
- 
