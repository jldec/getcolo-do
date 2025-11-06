package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"
)

func handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Extract colo name from path (e.g., "/lhr" -> "lhr")
	path := strings.TrimPrefix(r.URL.Path, "/")
	if path == "" {
		http.Error(w, `{"error": "colo name required in path"}`, http.StatusBadRequest)
		return
	}

	coloName := path
	url := fmt.Sprintf("https://%s.jldec.me/getcolo", coloName)

	// Time the fetch operation
	start := time.Now()

	resp, err := http.Get(url)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%s: %v"}`, url, err), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		http.Error(w, fmt.Sprintf(`{"error": "Status %d fetching %s"}`, resp.StatusCode, url), http.StatusBadGateway)
		return
	}

	// Parse JSON response
	var colo map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&colo); err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Error parsing JSON from %s: %v"}`, url, err), http.StatusBadGateway)
		return
	}

	// Add URL and timing information
	fetchTime := time.Since(start).Milliseconds()
	colo[coloName] = url
	colo[coloName+"FetchTime"] = fetchTime

	// Return the enriched JSON
	json.NewEncoder(w).Encode(colo)
}

func errorHandler(w http.ResponseWriter, r *http.Request) {
	panic("This is a panic")
}

func main() {
	// Listen for SIGINT and SIGTERM
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)

	router := http.NewServeMux()
	router.HandleFunc("/", handler)

	server := &http.Server{
		Addr:    ":8080",
		Handler: router,
	}

	go func() {
		log.Printf("Server listening on %s\n", server.Addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()

	// Wait to receive a signal
	sig := <-stop

	log.Printf("Received signal (%s), shutting down server...", sig)

	// Give the server 5 seconds to shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatal(err)
	}

	log.Println("Server shutdown successfully")
}
