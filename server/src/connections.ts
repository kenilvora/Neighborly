import { WebSocket } from "ws";

const clients = new Map<string, WebSocket>();

export default clients;
