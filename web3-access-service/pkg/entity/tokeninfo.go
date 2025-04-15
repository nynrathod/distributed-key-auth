package entity

type KeyResponse struct {
	AccessKey    string `json:"accessKey"`
	RateLimit    int    `json:"rateLimit"`
	Expiration   int64  `json:"expiration"`
	RequestCount int    `json:"requestCount"`
}

type KeyRequest struct {
	AccessKey string `json:"accessKey"`
}

type MarketData struct {
	CurrentPrice map[string]float64 `json:"current_price"`
	MarketCap    map[string]float64 `json:"market_cap"`
}

type TokenDetails struct {
	ID         string     `json:"id"`
	Symbol     string     `json:"symbol"`
	Name       string     `json:"name"`
	MarketData MarketData `json:"market_data"`
}

type TokenInfoResponse struct {
	AccessKey string       `json:"access_key"`
	TokenInfo TokenDetails `json:"token_info"`
}
