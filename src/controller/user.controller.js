const db = require('../modules/database.module');
const passwordHash = require('password-hash');
const jwt = require('jsonwebtoken');

const registration = async (req, res) => {
  const { email, password, fullName, displayName } = req.body;
  try {
    const hash = passwordHash.generate(password);

    const createUsersQuery = {
      text: `
          INSERT INTO users ("email", "password", "fullname", "displayname")
          VALUES (1$, $2, 3$, $4)
        `,
      values: [email, hash, fullName, displayName]
    }
    await db.query(createUsersQuery);

    return res.status(200).send({
      message: 'registration success'
    });
  } catch (err) {
    return res.status(500).send({
      error: JSON.stringify(err) || { message:  'something is wrong'}
    });
  }
}

const login = async (req, res) => {
  const { email, password } = req.query;
  try {
    const userQuery = {
      text: `
          SELECT * FROM users
          WHERE email = $1
          LIMIT 1
      `,
      values: [email],
    }
    const matchedUsers = await db.query(userQuery);
    const accurateUser = matchedUsers.rows[0];

    if (accurateUser === undefined) {
      return res.status(404).send({ message: 'no such user' });
    }

    const isPasswordCorrect = passwordHash.verify(password, accurateUser.password);

    if(!isPasswordCorrect) {
      return res.status(500).send({ message: 'username or password are not correct' });
    }

    const userData = { name: accurateUser.displayname ? accurateUser.displayname : accurateUser.fullname }
    const payload = { id: accurateUser.id, email: accurateUser.email };

    return res.status(200).send({
      userData,
      jwt: jwt.sign(payload, '' + process.env.SECRET, { expiresIn: '24h' })
    });
  } catch (err) {
    return res.status(500).send({
      error: JSON.stringify(err) || { message:  'something is wrong'}
    });
  }
}

module.exports = {
  registration,
  login
}
