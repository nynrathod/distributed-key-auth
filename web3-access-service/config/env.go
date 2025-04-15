package config

import (
	"fmt"
	"log"

	"github.com/spf13/viper"
)

var EnvConfigs *envConfigs

type envConfigs struct {
	RedisUrl string `mapstructure:"REDIS_URL"`
}

func InitEnvConfigs() *envConfigs {
	EnvConfigs = loadEnvVariables()
	return EnvConfigs
}

func loadEnvVariables() *envConfigs {
	viper.SetConfigFile(".env")
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		log.Fatal("Error reading .env file:", err)
	}

	var config envConfigs
	if err := viper.Unmarshal(&config); err != nil {
		log.Fatal("Failed to unmarshal env config:", err)
	}

	fmt.Println("Environment variables loaded successfully")
	return &config
}
