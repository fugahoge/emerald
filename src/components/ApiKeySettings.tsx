import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useSettings, DEFAULT_SETTINGS } from "../hooks/useSettings";

const ApiKeySettings: React.FC = () => {
  const { settings, saveSettings, loading } = useSettings();
  const [apiKey, setApiKey] = useState(settings.openaiApiKey);
  const [systemPrompt, setSystemPrompt] = useState(settings.systemPrompt);
  const [aiModel, setAiModel] = useState(settings.aiModel);
  const [apiEndpoint, setApiEndpoint] = useState(settings.apiEndpoint);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");

  // 設定が読み込まれたときに状態を更新
  useEffect(() => {
    if (!loading) {
      setApiKey(settings.openaiApiKey);
      setSystemPrompt(settings.systemPrompt);
      setAiModel(settings.aiModel);
      setApiEndpoint(settings.apiEndpoint);
    }
  }, [
    settings.openaiApiKey,
    settings.systemPrompt,
    settings.aiModel,
    settings.apiEndpoint,
    loading,
  ]);

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      const settingsToSave = {
        openaiApiKey: apiKey,
        systemPrompt,
        aiModel,
        apiEndpoint,
      };
      console.log("Saving settings:", settingsToSave);
      await saveSettings(settingsToSave);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        AI Settings
      </Typography>

      <TextField
        fullWidth
        label="API Key"
        type={showApiKey ? "text" : "password"}
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder={DEFAULT_SETTINGS.openaiApiKey}
        margin="normal"
        disabled={loading}
        helperText={
          loading
            ? "Loading settings..."
            : "Get your API key from https://platform.openai.com/api-keys (optional for local LLMs)"
        }
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle api key visibility"
                onClick={() => setShowApiKey(!showApiKey)}
                edge="end"
              >
                {showApiKey ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        label="AI Model"
        value={aiModel}
        onChange={(e) => setAiModel(e.target.value)}
        placeholder={DEFAULT_SETTINGS.aiModel}
        margin="normal"
        disabled={loading}
        helperText={
          loading
            ? "Loading settings..."
            : "Model name to use for API requests (e.g., google/gemma-3-4b, gpt-4o)"
        }
      />

      <TextField
        fullWidth
        label="API Endpoint"
        value={apiEndpoint}
        onChange={(e) => setApiEndpoint(e.target.value)}
        placeholder={DEFAULT_SETTINGS.apiEndpoint}
        margin="normal"
        disabled={loading}
        helperText={
          loading
            ? "Loading settings..."
            : "API endpoint URL to use for requests (e.g., http://127.0.0.1:1234/v1/chat/completions for local LLM)"
        }
      />

      <TextField
        fullWidth
        label="System Prompt"
        multiline
        minRows={4}
        maxRows={8}
        value={systemPrompt}
        onChange={(e) => setSystemPrompt(e.target.value)}
        placeholder={DEFAULT_SETTINGS.systemPrompt}
        margin="normal"
        disabled={loading}
        helperText={
          loading
            ? "Loading settings..."
            : "This prompt will be sent to the AI at the beginning of each new conversation to set the context and behavior."
        }
      />

      <Button
        variant="contained"
        onClick={handleSave}
        disabled={
          loading ||
          !systemPrompt.trim() ||
          !aiModel.trim() ||
          !apiEndpoint.trim() ||
          saveStatus === "saving"
        }
        sx={{ mt: 2 }}
        fullWidth
      >
        {saveStatus === "saving"
          ? "Saving..."
          : loading
            ? "Loading..."
            : "Save Settings"}
      </Button>

      {saveStatus === "success" && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Settings saved successfully!
        </Alert>
      )}

      {saveStatus === "error" && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to save settings. Please try again.
        </Alert>
      )}
    </Box>
  );
};

export default ApiKeySettings;
