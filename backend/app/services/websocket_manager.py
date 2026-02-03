"""
WebSocket manager for real-time order notifications.
"""
from typing import Set
from fastapi import WebSocket
import json
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections for order notifications."""
    
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
    
    async def connect(self, websocket: WebSocket):
        """Accept a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection."""
        self.active_connections.discard(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
    
    async def broadcast_order(self, order_data: dict):
        """Broadcast a new order to all connected clients."""
        if not self.active_connections:
            logger.info("No active WebSocket connections to broadcast to")
            return
        
        message = json.dumps({
            "type": "new_order",
            "data": order_data
        })
        
        # Send to all connected clients
        disconnected = set()
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error sending message to WebSocket: {e}")
                disconnected.add(connection)
        
        # Remove disconnected connections
        for connection in disconnected:
            self.disconnect(connection)
        
        logger.info(f"Broadcasted order to {len(self.active_connections)} clients")


# Global instance
manager = ConnectionManager()
