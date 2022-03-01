const { login, registration } = require('../controller/user.controller');
jest.mock('password-hash', () => ({
  generate: (password) => {
    return 'hash';
  },
  verify: (password, hash) => {
    return password === 'paSsw0rd';
  }
}));
jest.mock('jsonwebtoken', () => ({
  sign: (payload, secret, options) => {
    return 'token'
  }
}));
jest.mock('../modules/database.module', () => ({
  query: (query) => {
    const replacedQuery = query.text.replace(/\s+/gi,'');
    const stringValues = query.values.toString();

    if(replacedQuery === 'SELECT*FROMusersWHEREemail=$1LIMIT1') {
      if(stringValues === 'email@mail.com') {
        return { rows: [{
          id: 1,
          email: 'email@mail.com',
          password: 'hash',
          fullname: 'John Doe',
          displayname: 'John'
        }] }
      }

      if(stringValues === 'notemail@mail.com') {
        return { rows: [] }
      }
    }
    if(replacedQuery === 'INSERTINTOusers("email","password","fullname","displayname")VALUES(1$,$2,3$,$4)') {
      if(stringValues === 'email@mail.com,hash,,') {
        return { rows: [] };
      }
    }

    console.log("LOOOG", replacedQuery, stringValues);
  }
}));

const res = {
  text: '',
  statusCode: 200,
  status: (status) => {
    res.statusCode = status;
    return {
      send: (input) => {
        res.text = input;
      }
    }
  }
};

describe('login', () => {
  it('should return token and user data', async () => {
    const req = {
      query: {
        email: 'email@mail.com',
        password: 'paSsw0rd'
      }
    };

    res.text = '';
    res.statusCode = 200;

    await login(req, res);

    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual({
        jwt: "token",
        userData: { name: "John" }
    });
  });
  it('should return error "no such user"', async () => {
    const req = {
      query: {
        email: 'notemail@mail.com',
        password: 'paSsw0rd'
      }
    };

    res.text = '';
    res.statusCode = 200;

    await login(req, res);

    expect(res.statusCode).toEqual(404);
    expect(res.text).toEqual({
      message: 'no such user'
    });
  });
  it('should return error "username or password are not correct"', async () => {
    const req = {
      query: {
        email: 'email@mail.com',
        password: 'NOTpaSsw0rd'
      }
    };

    res.text = '';
    res.statusCode = 500;

    await login(req, res);

    expect(res.statusCode).toEqual(500);
    expect(res.text).toEqual({
      message: 'username or password are not correct'
    });
  });
});

describe('registration', () => {
  it('should return token and user data', async () => {
    const req = {
      body: {
        email: 'email@mail.com',
        password: 'paSsw0rd',
        fullname: 'John Doe',
        displayname: 'John'
      }
    };

    res.text = '';
    res.statusCode = 200;

    await registration(req, res);

    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual({ message: "registration success" });
  });
});
