export type EntityType = "property" | "tour360" | "request" | "message";
export type ActionType = "view" | "tour_view" | "create" | "update" | "delete";

export interface ActivityLog {
  id: string;
  userId: string | null;
  entityType: EntityType;
  entityId: string | null;
  action: ActionType;
  description: string;
  metadata?: Record<string, any> | null;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
}


