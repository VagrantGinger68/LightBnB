const { query } = require("express");
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

const getAllReservations = function (guest_id, limit = 10) {
  const queryString = `
  SELECT reservations.*, properties.*, avg(rating) as average_rating
  FROM reservations
  JOIN properties ON properties.id = reservations.property_id
  JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1
  GROUP BY properties.id, reservations.id
  ORDER BY reservations.start_date
  LIMIT $2;
  `;

  const values = [guest_id, limit];

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

/// Properties

const getAllProperties = (options, limit = 10) => {

  const values = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  if (options.city) {
    values.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${values.length} `;
  }

  if (options.owner_id) {
    values.push(options.owner_id);
    if (options.city) {
      queryString += ` AND owner_id = $${values.length}`;
    } else {
      queryString += ` WHERE owner_id = $${values.length}`;
    }
  }

  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    const minPriceDollars = options.minimum_price_per_night * 100;
    const maxPriceDollars = options.maximum_price_per_night * 100;

    values.push(`${minPriceDollars}`);
    values.push(`${maxPriceDollars}`);

    if (options.city || options. owner_id) {
      queryString += ` AND (properties.cost_per_night > $${values.length - 1} AND properties.cost_per_night < $${values.length})`;
    } else {
      queryString += ` WHERE (properties.cost_per_night > $${values.length - 1} AND properties.cost_per_night < $${values.length})`;
    }
  }

  queryString += `GROUP BY properties.id`;

  if (options.minimum_rating) {
    values.push(options.minimum_rating);
    queryString += ` HAVING AVG(property_reviews.rating) >= $${values.length}`;
  }

  values.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${values.length};
  `;

  console.log(queryString, values);
 
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

const addProperty = function (property) {
  const queryString = `
  INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
  RETURNING *
  `;

  const values = [
    property.owner_id,
    property.title,
    property.description,
    property.thumbnail_photo_url,
    property.cover_photo_url,
    property.cost_per_night,
    property.street,
    property.city,
    property.province,
    property.post_code,
    property.country,
    property.parking_spaces,
    property.number_of_bathrooms,
    property.number_of_bedrooms
  ];

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

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
