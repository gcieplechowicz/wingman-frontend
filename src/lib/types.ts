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
  summary: string | null;
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
