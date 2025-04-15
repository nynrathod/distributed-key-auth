package token_info

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/nynrathod/distributed-key-auth/web3-access-service/internal/infra"
	"github.com/nynrathod/distributed-key-auth/web3-access-service/pkg/constants"
	"github.com/nynrathod/distributed-key-auth/web3-access-service/pkg/entity"
)

func GetTokenInfo(c *fiber.Ctx) error {
	var body entity.KeyRequest

	if err := c.BodyParser(&body); err != nil {
		fmt.Println("Failed to parse request body:", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if body.AccessKey == "" {
		fmt.Println("Missing access key in request")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Missing access key"})
	}

	fmt.Println("Received access key:", body.AccessKey)

	testEvent := entity.KeyRequest{
		AccessKey: body.AccessKey,
	}

	err := infra.PublishKeyEvent(c.Context(), constants.RequestAccessAction, testEvent)
	if err != nil {
		fmt.Println("Failed to publish event to Redis:", err)
		return c.Status(500).SendString("Failed to publish event")
	}

	return c.JSON(fiber.Map{"status": "processing"})
}
