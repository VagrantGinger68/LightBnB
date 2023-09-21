const properties = require("./json/properties.json");
const users = require("./json/users.json");
const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});


/// Users

const getUserWithEmail = (email) => {
  const queryString = `
    SELECT * FROM users
    WHERE email = $1
  `;
  const values = [email || null];

  return pool
    .query(queryString, values)
    .then((result) => {
      console.log(result.rows[0]);
      return (result.rows[0]);
    })
    .catch((err) => {
      console.log(err.message);
    });
};

const getUserWithId = (id) => {
  const queryString = `
  SELECT * FROM users
  WHERE id = $1
`;
  const values = [id || null];

  return pool
    .query(queryString, values)
    .then((result) => {
      console.log(result.rows[0]);
      return (result.rows[0]);
    })
    .catch((err) => {
      console.log(err.message);
    });
};

const addUser = (user) => {
  const queryString = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const values = [user.name, user.email, user.password];

  return pool
    .query(queryString, values)
    .then((result) => {
      console.log(result.rows[0]);
      return (result.rows[0]);
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return getAllProperties(null, 2);
};

/// Properties

const getAllProperties = (options, limit = 10) => {

  const queryString = `
    SELECT * FROM properties LIMIT $1
  `;
  const values = [limit];

  return pool
    .query(queryString, values)
    .then((result) => {
      console.log(result.rows);
      return (result.rows);
    })
    .catch((err) => {
      console.log(err.message);
    });
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
