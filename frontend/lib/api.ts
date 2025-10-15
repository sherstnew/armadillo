import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserProfile,
  UpdateProfileRequest,
} from "@/types/api";
import { Conversation, HistoryResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append("username", data.username);
    formData.append("password", data.password);

    return this.request<LoginResponse>("/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>("/user/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  async getProfile(token: string): Promise<UserProfile> {
    console.log(token);
    return this.request<UserProfile>("/user/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateProfile(
    token: string,
    data: UpdateProfileRequest
  ): Promise<UserProfile> {
    return this.request<UserProfile>("/user/", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  async deleteAccount(token: string): Promise<void> {
    return this.request<void>("/user/", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  async getHistory(token: string): Promise<HistoryResponse> {
    return this.request<HistoryResponse>("/user/history", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async clearHistory(token: string): Promise<void> {
    return this.request<void>("/user/history", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getConversation(
    token: string,
    conversationId: string
  ): Promise<Conversation> {
    return this.request<Conversation>(`/user/history/${conversationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const apiService = new ApiService();
