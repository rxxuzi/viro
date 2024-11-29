// main.go
package main

import (
    "bufio"
    "encoding/json"
    "flag"
    "fmt"
    "io"
    "log"
    "net/http"
    "os"
    "path/filepath"
    "strings"
)

const version = "0.1.4"
const maxsize = 10 << 20 // 10MB
var model string
var prompts []string
var debug bool
var port string
var showVersion bool

func main() {
    flag.StringVar(&model, "m", "viro:70b", "Model name")
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

    prompts = []string{
        "",
    }

    http.HandleFunc("/api/ask", handleAsk)

    http.HandleFunc("/license", func(w http.ResponseWriter, r *http.Request) {
        http.ServeFile(w, r, "./www/license.html")
    })
    
    fs := http.FileServer(http.Dir("./www"))
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        path := r.URL.Path
        filePath := "./www" + path
        _, err := os.Stat(filePath)
        if os.IsNotExist(err) {
            http.ServeFile(w, r, "./www/404.html")
            return
        }
        fs.ServeHTTP(w, r)
    })

    log.Printf("Start the server on port -> %s\n", port)
    log.Printf("Model : %s", model)
    log.Fatal(http.ListenAndServe(":"+port, nil))
}

func enableCors(w *http.ResponseWriter) {
    (*w).Header().Set("Access-Control-Allow-Origin", "*")
}

func handleAsk(w http.ResponseWriter, r *http.Request) {
    enableCors(&w)

    if debug {
        log.Println("Request received")
    }

    err := r.ParseMultipartForm(maxsize)
    if err != nil {
        http.Error(w, "Failed to parse request", http.StatusBadRequest)
        return
    }

    question := r.FormValue("question")
    language := r.FormValue("language")
    mode := r.FormValue("mode")

    if debug {
        log.Printf("Query : %s", question)
        log.Printf("Lang  : %s", language)
        log.Printf("Mode  : %s", mode)
    }

    var fileContent string
    var fileName string

    file, header, err := r.FormFile("file")
    if err == nil {
        defer file.Close()

        fileName = header.Filename

        if debug {
            log.Printf("Received files: %s", fileName)
        }

        ext := filepath.Ext(header.Filename)
        allowedExtensions := []string{".c", ".py", ".java", ".js", ".cpp", ".go", ".txt", ".md", ".html", ".php",".tsx"}
        allowed := false
        for _, allowedExt := range allowedExtensions {
            if ext == allowedExt {
                allowed = true
                break
            }
        }
        if !allowed {
            http.Error(w, "Illegal file format.", http.StatusBadRequest)
            return
        }

        content, err := io.ReadAll(file)
        if err != nil {
            http.Error(w, "Failed to load file", http.StatusInternalServerError)
            return
        }
        fileContent = string(content)
    } else {
        if debug {
            log.Println("No files have been uploaded")
        }
    }

    custom_prompt := strings.Join(prompts, ",")

    var prompt string
    switch mode {
    case "ask":
        prompt = fmt.Sprintf("%s, %s", question, custom_prompt)
    case "code":
        if fileContent != "" {
            prompt = fmt.Sprintf("Analyze the following code: %s\n\n%s, %s", fileContent, question, custom_prompt)
        } else {
            prompt = fmt.Sprintf("%s, %s, computer language should be %s", question, custom_prompt, language)
        }
    case "docs":
        prompt = fmt.Sprintf("Generate documentation (Markdown and MathJax) for the following code: %s\n\n%s, %s", fileContent, question, custom_prompt)
    case "fix":
        prompt = fmt.Sprintf("Fix the following code and explain the changes: %s\n\n%s, %s", fileContent, question, custom_prompt)
    default:
        prompt = fmt.Sprintf("%s, %s", question, custom_prompt)
    }

    if debug {
        log.Printf("Constructed prompts: %s", prompt)
    }

    ollamaReq := map[string]interface{}{
        "model":  model,
        "prompt": prompt,
    }

    client := &http.Client{}
    ollamaReqBody, err := json.Marshal(ollamaReq)
    if err != nil {
        http.Error(w, "Failed to marshal request.", http.StatusInternalServerError)
        return
    }

    ollamaReqReader := strings.NewReader(string(ollamaReqBody))
    ollamaResp, err := client.Post("http://localhost:12345/api/generate", "application/json", ollamaReqReader)
    if err != nil {
        http.Error(w, "Failed to connect to API", http.StatusInternalServerError)
        return
    }
    defer ollamaResp.Body.Close()

    if debug {
        log.Println("Successfully connected to Ollama API")
    }

    w.Header().Set("Content-Type", "application/json")
    w.Header().Set("Transfer-Encoding", "chunked")
    w.Header().Set("Connection", "keep-alive")
    w.Header().Set("Access-Control-Allow-Origin", "*")

    flusher, ok := w.(http.Flusher)
    if !ok {
        http.Error(w, "Streaming is not supported", http.StatusInternalServerError)
        return
    }

    scanner := bufio.NewScanner(ollamaResp.Body)
    for scanner.Scan() {
        line := scanner.Text()
        _, err := w.Write([]byte(line + "\n"))
        if err != nil {
            log.Println("Error writing to client:", err)
            break
        }
        flusher.Flush()
    }

    if err := scanner.Err(); err != nil {
        log.Println("Read error from API:", err)
    }
}
