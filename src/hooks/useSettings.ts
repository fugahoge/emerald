import { useState, useEffect } from "react";

interface Settings {
  openaiApiKey: string;
  systemPrompt: string;
  aiModel: string;
  apiEndpoint: string;
}

export const DEFAULT_SETTINGS: Settings = {
  openaiApiKey: "",
  systemPrompt:
    "Please answer in Japanese and make sure to think in Japanese while reasoning.You are a helpful AI assistant integrated into a Chrome extension called Emerald. You can help users with various tasks while they browse the web. When users provide page content, use it to give more contextual and relevant responses. Be concise but helpful, and adapt your responses to the context of what the user is doing.",
  aiModel: "google/gemma-3-4b",
  apiEndpoint: "http://127.0.0.1:1234/v1/chat/completions",
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await chrome.storage.local.get("settings");
      if (result.settings) {
        const mergedSettings = { ...DEFAULT_SETTINGS, ...result.settings };
        console.log("Merged settings:", mergedSettings);
        setSettings(mergedSettings);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Partial<Settings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      console.log("Saving to storage:", updatedSettings);
      await chrome.storage.local.set({ settings: updatedSettings });
      setSettings(updatedSettings);
      console.log("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const updateApiKey = async (apiKey: string) => {
    await saveSettings({ openaiApiKey: apiKey });
  };

  const updateSystemPrompt = async (systemPrompt: string) => {
    await saveSettings({ systemPrompt });
  };

  const updateAiModel = async (aiModel: string) => {
    await saveSettings({ aiModel });
  };

  const updateApiEndpoint = async (apiEndpoint: string) => {
    await saveSettings({ apiEndpoint });
  };

  return {
    settings,
    loading,
    updateApiKey,
    updateSystemPrompt,
    updateAiModel,
    updateApiEndpoint,
    saveSettings,
  };
};
