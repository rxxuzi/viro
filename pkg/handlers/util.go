// pkg/handlers/util.go
package handlers

import "net/http"

func EnableCors(w http.ResponseWriter) {
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

var Prompts []string
var Debug bool
var InitModel string
