// Set the port number, defaulting to 5001 if not specified in environment variables
const { PORT = 5001 } = process.env;

const app = require("./app");
const knex = require("./db/connection");

// Run the latest database migrations
knex.migrate
  .latest()
  .then((migrations) => {
    console.log("migrations", migrations);
    app.listen(PORT, listener);
  })
  .catch((error) => {
    console.error(error);
    knex.destroy();
  });

// Callback function to log when the server starts listening
function listener() {
  console.log(`Listening on Port ${PORT}!`);
}
