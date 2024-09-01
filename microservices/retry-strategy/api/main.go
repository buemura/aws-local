package main

import (
	"fmt"
	"net/http"
	"time"

	"math/rand"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /", handleGet)
	mux.HandleFunc("POST /", handlePost)

	fmt.Println("Server running...")
	http.ListenAndServe(":8080", mux)
}

func handleGet(w http.ResponseWriter, r *http.Request) {
	rand.Seed(time.Now().UnixNano())

	if rand.Intn(2) == 0 {
		http.Error(w, "Random error occurred", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("GET Successfully"))
}

func handlePost(w http.ResponseWriter, r *http.Request) {
	rand.Seed(time.Now().UnixNano())

	if rand.Intn(2) == 0 {
		http.Error(w, "Random error occurred", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("POST Successfully"))
}
