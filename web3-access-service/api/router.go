package api

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nynrathod/distributed-key-auth/web3-access-service/internal/token-info"
)

func SetupRoutes(app *fiber.App) {

	app.Get("/get-token-info", token_info.GetTokenInfo)
}
