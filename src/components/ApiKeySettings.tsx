import React, { useState } from "react";
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
  const { settings, updateApiKey, updateSystemPrompt } = useSettings();
  const [apiKey, setApiKey] = useState(settings.openaiApiKey);
  const [systemPrompt, setSystemPrompt] = useState(settings.systemPrompt);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [clearHistoryStatus, setClearHistoryStatus] = useState<
    "idle" | "clearing" | "success" | "error"
  >("idle");
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      await updateApiKey(apiKey);
      await updateSystemPrompt(systemPrompt);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
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

  const isValidApiKey = (key: string) => {
    return key.startsWith("sk-") && key.length > 20;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        OpenAI Settings
      </Typography>

      <TextField
        fullWidth
        label="OpenAI API Key"
        type={showApiKey ? "text" : "password"}
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="sk-..."
        margin="normal"
        error={apiKey.length > 0 && !isValidApiKey(apiKey)}
        helperText={
          apiKey.length > 0 && !isValidApiKey(apiKey)
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
        label="System Prompt"
        multiline
        minRows={4}
        maxRows={8}
        value={systemPrompt}
        onChange={(e) => setSystemPrompt(e.target.value)}
        placeholder="System prompt that will be sent at the start of each new conversation..."
        margin="normal"
        helperText="This prompt will be sent to the AI at the beginning of each new conversation to set the context and behavior."
      />

      <Button
        variant="contained"
        onClick={handleSave}
        disabled={
          !apiKey ||
          !isValidApiKey(apiKey) ||
          !systemPrompt.trim() ||
          saveStatus === "saving"
        }
        sx={{ mt: 2 }}
        fullWidth
      >
        {saveStatus === "saving" ? "Saving..." : "Save Settings"}
      </Button>

      <Button
        variant="outlined"
        color="error"
        onClick={() => setShowClearDialog(true)}
        disabled={clearHistoryStatus === "clearing"}
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
