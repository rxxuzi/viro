#!/bin/bash

# スクリプトがエラーで終了した場合、即座に終了する
set -e

go build -o bin/viro

# ディレクトリの定義
REACT_DIR="./react"
BUILD_DIR="./www"

# react ディレクトリの存在を確認
if [ ! -d "$REACT_DIR" ]; then
  echo "Error: react directory does not exist."
  exit 1
fi

# www ディレクトリが存在しない場合は作成
if [ ! -d "$BUILD_DIR" ]; then
  echo "Creating www directory..."
  mkdir "$BUILD_DIR"
fi

# npm 依存関係のインストール
echo "Installing npm dependencies in react/"
cd "$REACT_DIR"
npm install

# 環境変数を設定してビルド
echo "Building React app into www directory..."
VITE_BUILD_OUT_DIR="../www" npm run build

# ビルド完了のメッセージ
echo "Build completed. Static files are available in the 'www/' directory."
