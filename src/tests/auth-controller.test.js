const { signin, signup, authWithRefToken } = require('../controller/auth.controller');
const { errorsCodes } = require('../consts/server-codes');
const jwt = require('jsonwebtoken');
const {values} = require('pg/lib/native/query');
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
    return 'token';
  },
  verify: (token, secret) => {
    if (token === 'ref') {
      return { id: 1, isRefreshToken: true };
    }
    if (token === 'ref2') {
      return { id: 2, isRefreshToken: true };
    }
    if (token === 'acc') {
      return { id: 3, isRefreshToken: false };
    }
  }
}));
jest.mock('../modules/database.module', () => ({
  query: (query) => {
    const replacedQuery = query.text.replace(/\s+/gi,'');
    const stringValues = query.values.toString();

    if (replacedQuery === 'SELECT*FROMusersWHEREemail=$1LIMIT1') {
      if (stringValues === 'email@mail.com') {
        return { rows: [{
            id: 1,
            email: 'email@mail.com',
            password: 'hash',
            fullname: 'John Doe',
            displayname: 'John'
          }] }
      }
      if (stringValues === 'email2@mail.com') {
        return { rows: [{
            id: 2,
            email: 'email2@mail.com',
            password: 'hash',
            fullname: 'John Doe',
            displayname: 'John2'
          }] }
      }
      if (stringValues === 'notemail@mail.com') {
        return { rows: [] }
      }
    }
    if (replacedQuery === 'INSERTINTOusers("email","password","fullname","displayname")VALUES($1,$2,$3,$4)RETURNINGid') {
      if (stringValues === 'email@mail.com,hash,,') {
        return { rows: [{
            id: 1
          }] };
      }
    }
    if (replacedQuery === 'SELECT*FROMuser_profile_photoWHEREuser_id=$1LIMIT1') {
      if (stringValues === '1') {
        return { rows: [{
            miniature: 'photo',
            original: 'photo'
          }] }
      }
      if (stringValues === '2') {
        return { rows: [] }
      }
    }
    if (replacedQuery === 'INSERTINTOuser_profile_photo("original","miniature","user_id")VALUES($1,$2,$3)') {
      return { rows: [] }
    }
    if (replacedQuery === 'UPDATEusersSETaccess_token=$1,refresh_token=$2WHEREid=$3') {
      return { rows: [] }
    }
    if (replacedQuery === 'SELECTrefresh_tokenas"refreshToken"FROMusersWHEREid=$1LIMIT1') {
      if (stringValues === '1') {
        return { rows: [{
            refreshToken: 'ref'
        }] }
      }
      if (stringValues === '2') {
        return { rows: [{
            refreshToken: ''
          }] }
      }
    }

    console.log('Query', replacedQuery, 'Values', stringValues)
  }
}));
jest.mock('fs', () => ({
  promises: {
    writeFile: () => {},
    rm:  () => {}
  }
}));
jest.mock('sharp', () => (
  (str) => {
    {
      return {
        resize: (num) => {
          return {
            toBuffer: () => {
              return {
                toString: (str) => {
                  return 'photo'
                }
              }
            }
          }
        }
      }
    }
  }
));

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

describe('signin', () => {
  beforeEach(() => {
    res.text = '';
    res.statusCode = 200;
  });

  it('should return tokens and user data with avatars', async () => {
    const req = {
      query: {
        email: 'email@mail.com',
        password: 'paSsw0rd'
      }
    };

    await signin(req, res);

    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual({
      userData: {
        displayName: 'John',
        fullName: 'John Doe',
        email: 'email@mail.com',
        miniatureAvatar: 'photo',
        originalAvatar: 'photo'
      },
      authData: {
        accessToken: 'token',
        refreshToken: 'token'
      }
    });
  });
  it('should return tokens and user data without avatars', async () => {
    const req = {
      query: {
        email: 'email2@mail.com',
        password: 'paSsw0rd'
      }
    };

    await signin(req, res);

    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual({
      userData: {
        displayName: 'John2',
        email: 'email2@mail.com',
        fullName: 'John Doe',
        miniatureAvatar: '',
        originalAvatar: ''
      },
      authData: {
        accessToken: 'token',
        refreshToken: 'token'
      }
    });
  });
  it('should return error "no such user"', async () => {
    const req = {
      query: {
        email: 'notemail@mail.com',
        password: 'paSsw0rd'
      }
    };

    await signin(req, res);

    expect(res.statusCode).toEqual(404);
    expect(res.text).toEqual({
      code: errorsCodes.invalidUser,
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

    await signin(req, res);

    expect(res.statusCode).toEqual(500);
    expect(res.text).toEqual({
      code: errorsCodes.invalidUser,
      message: 'invalid email or password'
    });
  });
});

describe('registration', () => {
  beforeEach(() => {
    res.text = '';
    res.statusCode = 200;
  });

  it('should return "registration success" without avatar', async () => {
    const req = {
      body: {
        email: 'email@mail.com',
        password: 'paSsw0rd',
        fullname: 'John Doe',
        displayname: 'John'
      }
    };

    await signup(req, res);

    expect(res.statusCode).toEqual(201);
    expect(res.text).toEqual({
      message: 'registration success'
    });
  });
  it('should return "registration success" with avatar', async () => {
    const req = {
      body: {
        email: 'email@mail.com',
        password: 'paSsw0rd',
        fullname: 'John Doe',
        displayname: 'John',
        avatarImage: 'data:image/png;base64, BASE64CODE=='
      }
    };

    await signup(req, res);

    expect(res.statusCode).toEqual(201);
    expect(res.text).toEqual({
      message: 'registration success'
    });
  });
});

describe('jwt flow', () => {
  beforeEach(() => {
    res.text = '';
    res.statusCode = 200;
  });

  it('should return code 200 and new tokens', async () => {
    const req = {
      body: {
        refreshToken: 'ref'
      }
    };

    await authWithRefToken(req, res);

    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual({
      authData: {
        accessToken: 'token',
        refreshToken: 'token'
      }
    });
  });
  it('should return status code 403 and message "not a refresh token"', async () => {
    const req = {
      body: {
        refreshToken: 'acc'
      }
    };

    await authWithRefToken(req, res);

    expect(res.statusCode).toEqual(403);
    expect(res.text).toEqual({
      code: errorsCodes.invalidToken,
      message: 'not a refresh token'
    });
  });
  it('should return status code 403 and message "incorrect token"', async () => {
    const req = {
      body: {
        refreshToken: 'ref2'
      }
    };

    await authWithRefToken(req, res);

    expect(res.statusCode).toEqual(403);
    expect(res.text).toEqual({
      code: errorsCodes.invalidToken,
      message: 'incorrect token'
    });
  });
});
