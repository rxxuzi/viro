// pkg/handlers/eval.go
package handlers

import (
    "encoding/json"
    "net/http"
    "os"
    "path/filepath"
    "time"
)

type Evaluation struct {
    Q string `json:"q"`
    A string `json:"a"`
    T int64  `json:"t"`
    I string `json:"i"`
    M string `json:"m"`
}

func saveEvaluation(e Evaluation, dir string) error {
    // ディレクトリが存在しない場合は作成
    if err := os.MkdirAll(dir, 0755); err != nil {
        return err
    }
    // ファイル名を生成（IDとタイムスタンプ）
    filename := filepath.Join(dir, e.I+"_"+time.Now().Format("20060102150405")+".json")
    data, err := json.MarshalIndent(e, "", "  ")
    if err != nil {
        return err
    }
    return os.WriteFile(filename, data, 0644)
}

func EvalGoodHandler(w http.ResponseWriter, r *http.Request) {
    handleEval(w, r, "./out/good/")
}

func EvalBadHandler(w http.ResponseWriter, r *http.Request) {
    handleEval(w, r, "./out/bad/")
}

func ReportHandler(w http.ResponseWriter, r *http.Request) {
    handleEval(w, r, "./out/report/")
}

func handleEval(w http.ResponseWriter, r *http.Request, dir string) {
    EnableCors(&w)

    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    var eval Evaluation
    decoder := json.NewDecoder(r.Body)
    err := decoder.Decode(&eval)
    if err != nil {
        http.Error(w, "Bad request", http.StatusBadRequest)
        return
    }

    err = saveEvaluation(eval, dir)
    if err != nil {
        http.Error(w, "Internal server error", http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
    w.Write([]byte(`{"status":"success"}`))
}
