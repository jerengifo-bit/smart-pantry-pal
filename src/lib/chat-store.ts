import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Recipe } from "./pantry-types";

export type ChatMessage = {
  id: string;
  role: "user" | "agent";
  content: string;
  recipes?: Recipe[];
};

type ChatStore = {
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: "chef-chat-storage",
    },
  ),
);
