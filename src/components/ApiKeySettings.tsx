import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Visibility, VisibilityOff, Delete } from "@mui/icons-material";
import { useSettings } from "../hooks/useSettings";
import { chatStorage } from "../utils/chatStorage";

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
  const [clearHistoryStatus, setClearHistoryStatus] = useState<
    "idle" | "clearing" | "success" | "error"
  >("idle");
  const [showClearDialog, setShowClearDialog] = useState(false);

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
      await saveSettings({
        openaiApiKey: apiKey,
        systemPrompt,
        aiModel,
        apiEndpoint,
      });
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  const isValidApiKey = (key: string) => {
    return key.startsWith("sk-") && key.length > 20;
  };

  const handleClearHistory = async () => {
    setClearHistoryStatus("clearing");
    try {
      await chatStorage.clearAllChatHistory();
      setClearHistoryStatus("success");
      setTimeout(() => setClearHistoryStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to clear chat history:", error);
      setClearHistoryStatus("error");
      setTimeout(() => setClearHistoryStatus("idle"), 2000);
    }
    setShowClearDialog(false);
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
        placeholder="sk-..."
        margin="normal"
        disabled={loading}
        error={apiKey.length > 0 && !isValidApiKey(apiKey)}
        helperText={
          loading
            ? "Loading settings..."
            : apiKey.length > 0 && !isValidApiKey(apiKey)
              ? "API key should start with 'sk-' and be at least 20 characters long"
              : "Get your API key from https://platform.openai.com/api-keys"
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
        placeholder="google/gemma-3-4b"
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
        placeholder="http://127.0.0.1:1234/v1/chat/completions"
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
        placeholder="System prompt that will be sent at the start of each new conversation..."
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
          !apiKey ||
          !isValidApiKey(apiKey) ||
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

      <Button
        variant="outlined"
        color="error"
        onClick={() => setShowClearDialog(true)}
        disabled={loading || clearHistoryStatus === "clearing"}
        sx={{ mt: 1 }}
        fullWidth
        startIcon={<Delete />}
      >
        {clearHistoryStatus === "clearing"
          ? "Clearing..."
          : "Clear Chat History"}
      </Button>

      <Dialog
        open={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        aria-labelledby="clear-history-dialog-title"
        aria-describedby="clear-history-dialog-description"
      >
        <DialogTitle id="clear-history-dialog-title">
          Clear Chat History
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="clear-history-dialog-description">
            Are you sure you want to clear all chat history? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowClearDialog(false)}>Cancel</Button>
          <Button
            onClick={handleClearHistory}
            color="error"
            variant="contained"
            autoFocus
          >
            Clear History
          </Button>
        </DialogActions>
      </Dialog>

      {clearHistoryStatus === "success" && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Chat history cleared successfully!
        </Alert>
      )}

      {clearHistoryStatus === "error" && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to clear chat history. Please try again.
        </Alert>
      )}

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
