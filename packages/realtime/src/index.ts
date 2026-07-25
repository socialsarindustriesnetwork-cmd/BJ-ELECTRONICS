export const COMMERCE_EVENT_TYPES = [
  "PRODUCT.CREATED",
  "PRODUCT.UPDATED",
  "PRODUCT.ARCHIVED",
  "INVENTORY.UPDATED",
  "ORDER.CREATED",
  "ORDER.UPDATED",
] as const;

export type CommerceEventType = (typeof COMMERCE_EVENT_TYPES)[number];

export type CommerceEvent = {
  id: number;
  type: CommerceEventType;
  aggregate: "PRODUCT" | "INVENTORY" | "ORDER";
  aggregateId: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export function encodeSseEvent(event: CommerceEvent): string {
  return `id: ${event.id}\nevent: commerce\ndata: ${JSON.stringify(event)}\n\n`;
}

export function encodeSseHeartbeat(): string {
  return `event: heartbeat\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`;
}
