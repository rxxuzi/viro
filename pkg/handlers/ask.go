// pkg/handlers/ask.go
package handlers

import (
    "bufio"
    "encoding/json"
    "fmt"
    "io"
    "log"
    "net/http"
    "path/filepath"
    "strings"
)

const maxsize = 10 << 20 // 10MB

var (
    prompts    []string
    debug      bool
    initModel  string
    defaultModel = "viro:durian"
)


// HandleAsk processes the /api/ask requests
func HandleAsk(w http.ResponseWriter, r *http.Request) {
    EnableCors(w)

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
    model := r.FormValue("model")

    if debug {
        log.Printf("Query : %s", question)
        log.Printf("Lang  : %s", language)
        log.Printf("Mode  : %s", mode)
        log.Printf("Model : %s", model)
    }

    var fileContent string
    var fileName string

    file, header, err := r.FormFile("file")
    if err == nil {
        defer file.Close()

        fileName = header.Filename

        if debug {
            log.Printf("Received file: %s", fileName)
        }

        ext := filepath.Ext(header.Filename)
        allowedExtensions := []string{".c", ".py", ".java", ".js", ".cpp", ".go", ".txt", ".md", ".html", ".php", ".tsx"}
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

    customPrompt := strings.Join(prompts, ",")

    var prompt string
    switch mode {
    case "ask":
        prompt = fmt.Sprintf("%s, %s", question, customPrompt)
    case "code":
        if fileContent != "" {
            prompt = fmt.Sprintf("Analyze the following code: %s\n\n%s, %s", fileContent, question, customPrompt)
        } else {
            prompt = fmt.Sprintf("%s, %s, computer language should be %s", question, customPrompt, language)
        }
    case "docs":
        prompt = fmt.Sprintf("Generate documentation (Markdown and MathJax) for the following code: %s\n\n%s, %s", fileContent, question, customPrompt)
    case "fix":
        prompt = fmt.Sprintf("Fix the following code and explain the changes: %s\n\n%s, %s", fileContent, question, customPrompt)
    default:
        prompt = fmt.Sprintf("%s, %s", question, customPrompt)
    }

    if debug {
        log.Printf("Constructed prompt: %s", prompt)
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

    ollamaResp, err := client.Post("http://localhost:12345/api/generate", "application/json", strings.NewReader(string(ollamaReqBody)))
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
