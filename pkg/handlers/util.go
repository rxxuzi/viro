// pkg/handlers/util.go
package handlers

import "net/http"

func EnableCors(w *http.ResponseWriter) {
    (*w).Header().Set("Access-Control-Allow-Origin", "*")
}
