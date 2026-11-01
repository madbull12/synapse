package websocket

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

type MessagePayload struct {
	ChannelID string      `json:"channel_id"`
	Event     string      `json:"event"`
	Data      interface{} `json:"data"`
}

type Client struct {
	Hub       *Hub
	Conn      *websocket.Conn
	Send      chan []byte 
	UserID    string
	ChannelID string      
}

type Hub struct {
	Rooms map[string]map[*Client]bool

	Broadcast chan MessagePayload

	Register chan *Client

	Unregister chan *Client

	Mu sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		Rooms:      make(map[string]map[*Client]bool),
		Broadcast:  make(chan MessagePayload),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.Mu.Lock()
			if h.Rooms[client.ChannelID] == nil {
				h.Rooms[client.ChannelID] = make(map[*Client]bool)
			}
			h.Rooms[client.ChannelID][client] = true
			h.Mu.Unlock()
			log.Printf("Client %s joined channel %s", client.UserID, client.ChannelID)

		case client := <-h.Unregister:
			h.Mu.Lock()
			if clients, ok := h.Rooms[client.ChannelID]; ok {
				if _, ok := clients[client]; ok {
					delete(clients, client)
					close(client.Send)
					if len(clients) == 0 {
						delete(h.Rooms, client.ChannelID)
					}
				}
			}
			h.Mu.Unlock()
			log.Printf("Client %s left channel %s", client.UserID, client.ChannelID)

		case message := <-h.Broadcast:
			h.Mu.RLock()
			if clients, ok := h.Rooms[message.ChannelID]; ok {
				payload, err := json.Marshal(message)
				if err != nil {
					log.Printf("Failed to marshal broadcast payload: %v", err)
					h.Mu.RUnlock()
					continue
				}
				for client := range clients {
					select {
					case client.Send <- payload:
					default:
						close(client.Send)
						delete(clients, client)
					}
				}
			}
			h.Mu.RUnlock()
		}
	}
}