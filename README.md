# Distributed key authentication

2 microservice communicate via redis pub sub to get token info via access key

## 🔧 Environment Variables

Set the following environment variables before running the service:

### For auth-key-service

| Variable      | Description                 |
|---------------|-----------------------------|
| `JWT_SECRET`  | JWT token secrete key       |
| `PORT`        | Server port  |

### For web3-access-service

| Variable     | Description          |
|--------------|----------------------|
| `REDIS_URL`  | URL for redis server |

---

## 🚀 Running the App

### Start Nestjs

```bash
$ cd auth-key-service

npm run dev:start
```

### Start Golang

```bash
$ cd web3-access-service

# Option 1: Using Air (recommended for dev)
air

# Option 2: Using go run
go run main.go
```


