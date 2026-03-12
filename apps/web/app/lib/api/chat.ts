/**
 * Chat API - Conversation and message management
 */
import { ApiClient } from './client';
import type {
  Conversation,
  ChatMessage,
  SendChatResponse,
} from './types';

export class ChatApi extends ApiClient {
  async listConversations(businessId: string): Promise<Conversation[]> {
    return this.request<Conversation[]>(`/businesses/${businessId}/conversations`);
  }

  async createConversation(businessId: string, title?: string): Promise<Conversation> {
    return this.request<Conversation>(`/businesses/${businessId}/conversations`, {
      method: 'POST',
      body: JSON.stringify({ title: title || 'New Chat' }),
    });
  }

  async updateConversation(
    businessId: string,
    convId: string,
    data: { title?: string; archived?: boolean }
  ): Promise<Conversation> {
    return this.request<Conversation>(`/businesses/${businessId}/conversations/${convId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteConversation(businessId: string, convId: string): Promise<void> {
    await this.request<Record<string, never>>(
      `/businesses/${businessId}/conversations/${convId}`,
      {
        method: 'DELETE',
      }
    );
  }

  async listMessages(businessId: string, convId: string): Promise<ChatMessage[]> {
    return this.request<ChatMessage[]>(
      `/businesses/${businessId}/conversations/${convId}/messages`
    );
  }

  async createMessage(
    businessId: string,
    convId: string,
    data: { role: string; content: string; model?: string }
  ): Promise<ChatMessage> {
    return this.request<ChatMessage>(
      `/businesses/${businessId}/conversations/${convId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async deleteMessage(businessId: string, convId: string, msgId: string): Promise<void> {
    await this.request<Record<string, never>>(
      `/businesses/${businessId}/conversations/${convId}/messages/${msgId}`,
      {
        method: 'DELETE',
      }
    );
  }

  async sendChatMessage(
    message: string,
    businessId: string,
    timezone?: string
  ): Promise<SendChatResponse> {
    const authHeaders = await this.getAuthHeaders();
    const res = await fetch('/gateway/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({ message, business_id: businessId, timezone }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Gateway error' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  async sendChatMessageWithFile(
    message: string,
    file: File,
    businessId: string,
    timezone?: string
  ): Promise<SendChatResponse> {
    const authHeaders = await this.getAuthHeaders();
    const formData = new FormData();
    formData.append('message', message);
    formData.append('files', file);
    formData.append('business_id', businessId);
    if (timezone) formData.append('timezone', timezone);
    const res = await fetch('/gateway/chat', {
      method: 'POST',
      headers: authHeaders,
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Gateway error' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }
}
