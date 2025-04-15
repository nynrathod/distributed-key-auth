package infra

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/nynrathod/distributed-key-auth/web3-access-service/config"
	"github.com/nynrathod/distributed-key-auth/web3-access-service/pkg/constants"
	"github.com/nynrathod/distributed-key-auth/web3-access-service/pkg/entity"
	"github.com/redis/go-redis/v9"
	"strconv"
	"time"
)

func PublishKeyEvent(ctx context.Context, channel string, event entity.KeyRequest) error {
	payload, err := json.Marshal(event)
	if err != nil {
		fmt.Println("Failed to marshal event:", err)
		return err
	}

	client := config.GetInstance()
	if client == nil {
		fmt.Println("Redis client is not initialized")
		return fmt.Errorf("Redis client is nil")
	}

	err = client.Publish(ctx, channel, payload).Err()
	if err != nil {
		fmt.Println("Failed to publish event:", err)
		return err
	}

	fmt.Println("Event published to channel:", channel)
	return nil
}

func SubscribeToSelectedChannels() {
	client := config.GetInstance()
	if client == nil {
		fmt.Println("Redis client is not initialized")
		return
	}

	pubsub := client.Subscribe(context.Background(), constants.ReceiveAccessAction)
	ch := pubsub.Channel()

	channelHandlers := map[string]func(msg *string){
		constants.ReceiveAccessAction: handleRequestAccessAction,
	}

	go func() {
		for msg := range ch {
			var event entity.KeyRequest
			if err := json.Unmarshal([]byte(msg.Payload), &event); err != nil {
				fmt.Println("Invalid event payload:", err)
				continue
			}

			handler, found := channelHandlers[msg.Channel]
			if !found {
				fmt.Println("No handler for channel:", msg.Channel)
				continue
			}

			handler(&msg.Payload)
		}
	}()
}

func handleRequestAccessAction(msg *string) {
	client := config.GetInstance()
	fmt.Println("Received message:", *msg)

	var event entity.KeyResponse
	if err := json.Unmarshal([]byte(*msg), &event); err != nil {
		fmt.Println("Failed to unmarshal message:", err)
		return
	}

	timestamp := time.Now().Format(time.RFC3339)
	fmt.Printf("Request received - Time: %s, AccessKey: %s\n", timestamp, event.AccessKey)

	if time.Now().Unix() > event.Expiration {
		fmt.Printf("Token expired - Time: %s, AccessKey: %s\n", timestamp, event.AccessKey)
		return
	}

	ctx := context.Background()
	rateLimitKey := fmt.Sprintf("rate_limit:%s", event.AccessKey)

	maxRequests, err := client.Get(ctx, rateLimitKey).Result()
	if err == redis.Nil {
		fmt.Println("Rate limit not found in cache. Setting it now...")

		maxRequests = fmt.Sprintf("%d", event.RateLimit)
		err := client.Set(ctx, rateLimitKey, maxRequests, 24*time.Hour).Err()
		if err != nil {
			fmt.Println("Failed to set rate limit in cache:", err)
			return
		}

		fmt.Println("Rate limit set in Redis:", maxRequests)
	} else if err != nil {
		fmt.Println("Error fetching rate limit from Redis:", err)
		return
	}

	maxRequestsInt, err := strconv.Atoi(maxRequests)
	if err != nil {
		fmt.Println("Failed to convert rate limit to int:", err)
		return
	}

	counterKey := fmt.Sprintf("counter:%s", event.AccessKey)

	luaScript := `
	local currentCount = redis.call("GET", KEYS[1])
	if not currentCount then
		redis.call("SET", KEYS[1], 0, "EX", ARGV[2])
		currentCount = 0
	end
	if tonumber(currentCount) < tonumber(ARGV[1]) then
		local newCount = redis.call("INCR", KEYS[1])
		return newCount
	else
		return -1
	end
	`

	result, err := client.Eval(ctx, luaScript, []string{counterKey}, maxRequestsInt, 60).Result()
	if err != nil {
		fmt.Println("Error executing Lua script:", err)
		return
	}

	if result == int64(-1) {
		fmt.Printf("Rate limit exceeded - Time: %s, AccessKey: %s\n", timestamp, event.AccessKey)
		return
	}

	requestCount, ok := result.(int64)
	if !ok {
		fmt.Println("Failed to convert Redis result to int64")
		return
	}

	event.RequestCount = int(requestCount)
	fmt.Println("✅ Token is valid and within rate limit")

	tokenInfo := entity.TokenInfoResponse{
		AccessKey: event.AccessKey,
		TokenInfo: entity.TokenDetails{
			ID:     "bitcoin",
			Symbol: "btc",
			Name:   "Bitcoin",
			MarketData: entity.MarketData{
				CurrentPrice: map[string]float64{"usd": 61500.34},
				MarketCap:    map[string]float64{"usd": 1200000000000},
			},
		},
	}

	tokenInfoJSON, err := json.MarshalIndent(tokenInfo, "", "  ")
	if err != nil {
		fmt.Println("Error generating token response:", err)
		return
	}

	fmt.Printf("Token response:\n%s\n", string(tokenInfoJSON))
}
