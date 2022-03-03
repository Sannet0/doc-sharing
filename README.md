## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test
```

## Database

On this project used [postgreSQL](https://www.postgresql.org/). To use this project you need create database and create some tables.

```bash
# create database

    CREATE DATABASE doc_sharing;

# users table

    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        fullname VARCHAR(100) NOT NULL,
        displayname VARCHAR(100)
    );
      
# user_profile_photo  table
  
    CREATE TABLE user_profile_photo (
        id SERIAL PRIMARY KEY,
        original BYTEA NOT NULL,
        miniature BYTEA NOT NULL,
        user_id INT REFERENCES users (id) NOT NULL
    );
  
# files table

    CREATE TABLE files (
        id SERIAL PRIMARY KEY,
        path VARCHAR(100) NOT NULL,
        displayname VARCHAR(100) NOT NULL,
        type VARCHAR(100) NOT NULL,
        creator_user_id INT REFERENCES users (id) NOT NULL
    );
  
# shared-files table

    CREATE TABLE shared_files (
        file_id INT REFERENCES files (id) NOT NULL,
        user_id INT REFERENCES users (id) NOT NULL
    );
  
# folders table
    
    CREATE TABLE folders (
        id SERIAL PRIMARY KEY,
        name varchar(100) NOT NULL,
        origin_forler_id INT REFERENCES folders (id)
    ); 
      
# folder_hierarchy table

    CREATE TABLE folder_hierarchy (
        folders_id INT REFERENCES folders (id) NOT NULL,
        file_id INT REFERENCES files (id) NOT NULL
    );
```
