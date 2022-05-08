# Finance

Finance Web App created with NodeJS, Express and MySQL.

This app is heavily inspired in CS50's Finance: https://cs50.harvard.edu/x/2022/psets/9/

I completed the CS50 course a few months ago. Since then I've been learning web development with JavaScript, using NodeJS and Express.

The original "CS50 Finance" project was made with Python, Flask and SQLite3. It was very challenging, but even then, a significant part of the code was already writen in the starter code. I didn't really understand how to create sessions, make calls to external API services, connect to the database (in a more standard way), flash messages and a lot more stuff that's mostly "ready-made" in the starter files.

So, after a few months of learning NodeJS, I thought it was a good idea (a test of sorts) to try and re-create the project, but using JavaScript + NodeJS instead of Python + Flask. I wanted to build the project from scratch, so I could understand more clearly how a Web App is structured, how are all it's parts connected with each other, what are some if it's important mechanisms, what good practices should be followed, etc.

### Some topics that I understand more clearly:

- RESTful routes
- CRUD operations
- Separation of concerns
    - Got the routes grouped on it's own folder, connected to the main app.js file
    - Got some helper functions to it's own folder, so the routes are less cluttered
- Middleware
- Creating sessions
- Connecting to the database with an ORM
- Pulling the DB models from an already created DB
- Async & Await (async JavaScript)
- Security. Using CSRF Tokens, hashing the passwords

## RESTful routes

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

- **authenticate()**: Checks if a password is correct.

- **lookup()**: Gets stock informations from IEX.

- **parseDateTime()**: Converts the DATE object from the DB into a nice string

- **requireLogin()**: Function to be used as middleware to require a logged in status before entering some routes. If the user is not logged in, this functions redirects to the login page.

- **usd()**: Formats a float as USD currency.


### CHANGES 02-05-2022
- Sessions, register user, login, logout ✔️ Done! But the user is logged out when rebooting the server
- Completed all the missing routes and fixed all the templates
- Need to send context to res.render() calls even if the user is not logged in. The templates need the "user" variable with "undefined" value ✔️

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
- **File structure clean up**: Created **/src** folder and moved there **/helpers**, **/public**, **/routes**. Tried to move **/views** there too, but I get some weird error from VSCode, so I´ll leave it alone for now. VSCode automatically handled most of the connections between the files. Amazing!

### CHANGES 08-05-2022
*Laaaaast batch of changes before Recurse Center begins!!*
- Created **seed.js** file to populate the DB with 3 test users: alice, bob, charle. The passwords are the same as the usernames. Each one gets a few stocks and history entries.
- Show portfolio rows in alphabetical order
- Validate email format using search() and RegEx.
    - Email format validation Regular Expression: https://regexr.com/3e48o
    - **Note to self:** *I know a bit about how to build regular expressions, but it's been easy so far to quickly google the ones I needed. I wonder at what point does it become more necesary to learn how to construct this expressions by myself.*
- Require a password with at least one uppercase letter, one lowercase letter, one number, one special character, and between 8 and 20 characters long ✔️
    - Password Strength Regular Expression: https://www.section.io/engineering-education/password-strength-checker-javascript/
    - **TO IMPROVE:** *An indication of this requirements is needed BEFORE the user tries su submit the register form. For now, this is handled by displaying a flash message after the user tries to register (if the password does not meet the requirements).*

### Wishlist
- More and better error checking
- Clean up **res.render()** context, theres a lot of redundancy.
- Apply the *requireLogin* and *csrfProtection* middlewares in a better way, there's redundancy by putting them in all the routes, exactly the same way.
- Change the design of the page so it doesn't look so similar to the CS50 version, although I should put some notice that the web app is inspired by CS50's Finance
- Buy / Sell stocks directly in the index page
- "Sell Out" button to sell all shares from one stock
- If you click one stock, go to a page with more detailed information
- Filter in the history page (Client side JS?)

### Curiosities
- Even in POST routes, if I return after rendering a template (or calling res.send), then it seems the form data wont be re-submitted if the user reloads the page. That's a simple solution. *Any reason not to do it that way?*
