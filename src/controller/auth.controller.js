const db = require('../modules/database.module');
const passwordHash = require('password-hash');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
  let { email, password, fullName, displayName } = req.body;
  try {
    const hash = passwordHash.generate(password);

    const createUsersQuery = {
      text: `
          INSERT INTO users ("email", "password", "fullname", "displayname")
          VALUES ($1, $2, $3, $4)
      `,
      values: [email, hash, fullName, displayName]
    }
    await db.query(createUsersQuery);

    return res.status(201).send({
      message: 'registration success'
    });
  } catch (err) {
    return res.status(500).send({
      message: JSON.stringify(err)
    });
  }
}

const signin = async (req, res) => {
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

    if (!accurateUser) {
      return res.status(404).send({ message: 'invalid email or password' });
    }

    const isPasswordCorrect = passwordHash.verify(password, accurateUser.password);

    if(!isPasswordCorrect) {
      return res.status(500).send({ message: 'username or password are not correct' });
    }

    const payload = { id: accurateUser.id, email: accurateUser.email };

    return res.status(200).send({
      userData: {
        displayName: accurateUser.displayname,
        fullName: accurateUser.fullname
      },
      authData: {
        accessToken: jwt.sign(payload, '' + process.env.SECRET, { expiresIn: '24h' }),
        refreshToken: jwt.sign(payload, '' + process.env.SECRET, { expiresIn: '30m' })
      }
    });
  } catch (err) {
    return res.status(500).send({
      message: JSON.stringify(err)
    });
  }
}

module.exports = {
  signup,
  signin
}
