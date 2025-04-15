package main

import (
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/nynrathod/distributed-key-auth/web3-access-service/api"
	cfg "github.com/nynrathod/distributed-key-auth/web3-access-service/config"
	"github.com/nynrathod/distributed-key-auth/web3-access-service/internal/infra"
)

func main() {

	cfg.InitEnvConfigs()

	cfg.SetupRedis()

	go infra.SubscribeToSelectedChannels()

	app := fiber.New()
	app.Use(cors.New())
	app.Use(logger.New())

	api.SetupRoutes(app)

	fmt.Println("Server listening on :4000")
	if err := app.Listen(":4000"); err != nil {
		log.Fatal("Server failed to start: ", err)
	}
}
