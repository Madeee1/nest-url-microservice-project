# Simple NestJS Backend with JWT authentication and a sqlite database

**Objective:** Create a URL shortener backend with a redirection service

## Requirements:

1. The shortened link must be unique and have an expiration of 5 years. - FULFILLED
2. The system should implement authentication guard with email password using jwt token for creating token. - FULFILLED
3. Allow the user to customize the URL with a maximum of 16 characters. - FULFILLED
4. The system-generated short URL should be 6 characters. - FULFILLED
5. The system should not have any downtime and must operate as fast as possible.
6. The system should effectively handle thousands of requests per second for generating unique short URLs.
7. Rate limiter to prevent abuse - FULFILLED
8. Unit tests to test functionality - FULFILLED
9. API Endpoint Documentation - FULFILLED - at bottom of Readme
10. Migration File for MySQL - PARTIALLY FULFILLED - use of sqlite instead through TypeORM
11. API Documentation using Postman or Swagger

## Setup Instructions:
1. Run ```npm install``` in the terminal, using Node 20.12.1
2. Make sure .env file is filled properly. Use .env.example for an example
3. Run ```npm run start``` to run the backend locally at localhost:3000

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# Hot Module Reloading (HMR) mode
$ npm run start:dev
```

## Run Unit Tests

```bash
# unit tests
$ npm run test
```

## API Endpoints

### Authentication

#### Register a New User

- **Endpoint:** `POST /v1/auth/register`
- **Description:** Registers a new user with an email and password.
- **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "yourpassword"
    }
    ```
- **Response:**
    ```json
    {
      "id": 1,
      "email": "user@example.com"
    }
    ```

#### Login

- **Endpoint:** `POST /v1/auth/login`
- **Description:** Authenticates a user and returns a JWT token.
- **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "yourpassword"
    }
    ```
- **Response:**
    ```json
    {
      "access_token": "YOUR_JWT_TOKEN"
    }
    ```

### URL Shortening

#### Create a Short URL

- **Endpoint:** `POST /v1/url`
- **Description:** Creates a new short URL for a given long URL. No custom URL means that a random one will be created
- **Headers:**
    - `Authorization: Bearer <YOUR_JWT_TOKEN>`
- **Request Body:**
    ```json
    {
      "longUrl": "https://www.example.com",
      "customShortUrl": "optionalCustom"
    }
    ```
- **Response:**
    ```json
    {
      "longUrl": "https://www.example.com",
      "shortUrl": "abc123",
      "expiresAt": "2024-12-31T23:59:59.999Z"
    }
    ```

#### Redirect to Original URL

- **Endpoint:** `GET /v1/url/:shortUrl`
- **Description:** Redirects to the original long URL based on the provided short URL.
- **Parameters:**
    - `shortUrl` (path parameter): The short URL identifier.
- **Response:** Redirects to the original URL.

#### Update an Expired URL

- **Endpoint:** `PUT /v1/url`
- **Description:** Updates an expired URL with a new short URL and expiration date.
- **Headers:**
    - `Authorization: Bearer <YOUR_JWT_TOKEN>`
- **Request Body:**
    ```json
    {
      "longUrl": "https://www.example.com",
      "customShortUrl": "optionalCustom"
    }
    ```
- **Response:**
    ```json
    {
      "longUrl": "https://www.example.com",
      "shortUrl": "newAbc123",
      "expiresAt": "2025-12-31T23:59:59.999Z"
    }
    ```

### Rate Limiting

- **Description:** Rate limiting is implemented to prevent abuse. Each user is limited to 10 requests per 20 seconds.