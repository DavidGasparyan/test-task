# TEST APP

Test project is listening to port 3000. You will an API platform like Postman to test the project.

## Installation

Use the package manager Docker Compose to build the project

```bash
docker compose up -d
```

## Usage

You will need to get the token from  login route
```
http://localhost:3000/login
```
Then use acquired token in Authorization field as ``Bearer {token}`` in api route
```
http://localhost:3000/api
```

## Logs

You can find logs located in Docker MongoDB under logs collection.
