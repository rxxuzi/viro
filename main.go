// main.go
package main

import (
    "flag"
    "fmt"
    "log"
    "net/http"
    "os"

    "github.com/gorilla/mux"
    "github.com/rxxuzi/viro/pkg/handlers"
)

const version = "0.2.0"

var (
    initModel    string
    debug        bool
    port         string
    showVersion  bool
    defaultModel = "viro:durian"
)

func main() {
    flag.StringVar(&initModel, "m", defaultModel, "Model name")
    flag.BoolVar(&debug, "d", false, "Enable debug mode")
    flag.StringVar(&port, "p", "9200", "Port to run the server on")
    flag.BoolVar(&showVersion, "v", false, "Show version and exit")
    flag.Parse()

    if showVersion {
        fmt.Println("Version:", version)
        os.Exit(0)
    }

    if debug {
        log.Println("Debug mode enabled")
    }

    // Initialize handlers package variables
    handlers.Prompts = []string{""}
    handlers.Debug = debug
    handlers.InitModel = initModel

    // Create a new router
    r := mux.NewRouter()

    // Register handlers
    r.HandleFunc("/api/ask", handlers.HandleAsk).Methods("POST")
    r.HandleFunc("/api/eval/good", handlers.EvalGoodHandler).Methods("POST")
    r.HandleFunc("/api/eval/bad", handlers.EvalBadHandler).Methods("POST")
    r.HandleFunc("/api/report", handlers.ReportHandler).Methods("POST")
    r.HandleFunc("/license", func(w http.ResponseWriter, r *http.Request) {
        http.ServeFile(w, r, "./www/license.html")
    }).Methods("GET")

    // Serve static files with custom 404
    r.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        path := r.URL.Path
        filePath := "./www" + path
        _, err := os.Stat(filePath)
        if os.IsNotExist(err) {
            http.ServeFile(w, r, "./www/404.html")
            return
        }
        http.FileServer(http.Dir("./www")).ServeHTTP(w, r)
    })

    // Start the server
    addr := fmt.Sprintf(":%s", port)
    log.Printf("Starting server on %s", addr)
    log.Printf("Model: %s", initModel)
    log.Fatal(http.ListenAndServe(addr, r))
}
