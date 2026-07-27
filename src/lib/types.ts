export type Tenant = {
  id: string;
  telegramApiId: number;
  telegramPhoneNumber: string;
  name: string;
  personaAge: number | null;
  personaGender: string | null;
  chatStyle: string | null;
  language: string;
  ownerEmail: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type Conversation = {
  id: string;
  tenantId: string;
  externalContactId: string;
  displayName: string | null;
  username: string | null;
  phoneNumber: string | null;
  summary: string | null;
  /** Raw text still sitting in ingestion-service's debounce buffer - not yet a real Message row. */
  pendingBuffer: string | null;
  pendingMessageCount: number;
  totalMessageCount: number;
  status: "PENDING" | "APPROVED" | "BLOCKED";
  createdAt: string;
  updatedAt: string | null;
};

export type Message = {
  id: string;
  conversationId: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
};

export type Analytics = {
  responseRate: {
    totalCount: number;
    quietCount: number;
    activeRate: number | null;
  };
  replyTimes: {
    assistantMedianReplySeconds: number | null;
    contactMedianReplySeconds: number | null;
  };
  messageVolume: {
    day: string;
    userMessageCount: number;
    assistantMessageCount: number;
  }[];
};

export type HourlyActivity = {
  hourlyActivity: { hour: number; messageCount: number }[];
};

export type Page<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type TenantCreateInput = {
  telegramApiId: number;
  telegramApiHash: string;
  telegramPhoneNumber?: string;
  telegramSessionString: string;
  name: string;
  personaAge: number;
  personaGender: string;
  chatStyle: string;
  language: "en" | "pl";
  ownerEmail?: string;
};

export type TenantUpdateInput = Partial<{
  personaAge: number;
  personaGender: string;
  chatStyle: string;
  language: "en" | "pl";
  ownerEmail: string;
  active: boolean;
}>;
