package config

import (
	"context"
	"fmt"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

func SetupRedis() {
	RedisClient = redis.NewClient(&redis.Options{
		Addr: EnvConfigs.RedisUrl,
		DB:   0,
	})

	_, err := RedisClient.Ping(context.Background()).Result()
	if err != nil {
		fmt.Println("Could not connect to Redis:", err)
	} else {
		fmt.Println("Connected to Redis successfully")
	}
}

func GetInstance() *redis.Client {
	if RedisClient == nil {
		fmt.Println("Redis client is not initialized")
	}
	return RedisClient
}
