import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Collapse,
  Divider,
  Chip,
  Grid,
  Button,
  Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatPanelProps {
  storeId?: number;
  serviceId?: number;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ storeId, serviceId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [height, setHeight] = useState(300); // Initial height in pixels
  const [isResizing, setIsResizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resizeStartY = useRef(0);
  const originalHeight = useRef(0);

  // Sample initial message for the agent
  useEffect(() => {
    setMessages([
      {
        id: '1',
        content: 'Hello! I\'m your Saloon & SPA Reservation Agent. I can help you:\n\n• Find saloons and spas near you\n• Check available services\n• View pricing and duration\n• Book appointments\n• Get directions to locations\n• Answer questions about policies\n\nHow can I assist you today?',
        role: 'assistant',
        timestamp: new Date(),
      }
    ]);
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare conversation history for the AI
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call the AI API - Use Python AI agent
      const apiUrl = import.meta.env.VITE_AI_AGENT_URL || `${import.meta.env.VITE_API_URL.replace('/api', '')}/api/ai/chat`;
      console.log('AI API URL:', apiUrl); // Debug logging
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          history: history,
        }),
      });

      console.log('Response status:', response.status); // Debug logging
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText); // Debug logging
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('AI Response:', data); // Debug logging

      // Add AI response to the chat
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Function to handle chat panel size adjustment
  const adjustHeight = (direction: 'up' | 'down') => {
    if (direction === 'up' && height < 600) {
      setHeight(prev => Math.min(prev + 100, 600));
    } else if (direction === 'down' && height > 200) {
      setHeight(prev => Math.max(prev - 100, 200));
    }
  };

  // Drag-based resizing functionality
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStartY.current = e.clientY;
    originalHeight.current = height;
    
    // Add event listeners for mouse movement and release
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
  }, [height]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const heightDiff = e.clientY - resizeStartY.current;
    const newHeight = originalHeight.current - heightDiff;
    
    // Set bounds for the height (200px to 600px)
    if (newHeight >= 200 && newHeight <= 600) {
      setHeight(newHeight);
    }
  }, [isResizing]);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
  }, [handleMouseMove]);

  // Clean up event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopResizing);
    };
  }, [handleMouseMove, stopResizing]);

  // Format message content - convert newlines to line breaks for better formatting
  const formatMessageContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // Quick action buttons for common agent tasks
  const quickActions = [
    { label: 'Find saloons', action: "Show me saloons near me" },
    { label: 'Book appointment', action: "I want to book an appointment" },
    { label: 'Check services', action: "What services do you offer?" },
    { label: 'View prices', action: "Show me pricing information" },
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        height: `${height}px`,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid #e0e0e0',
        bgcolor: 'background.paper',
        transition: 'height 0.3s ease',
        cursor: isResizing ? 'row-resize' : 'default',
      }}
    >
      {/* Chat Agent Header */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ChatIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Saloon & SPA Agent</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Height adjustment buttons */}
          <Tooltip title="Expand">
            <IconButton 
              size="small" 
              onClick={() => adjustHeight('up')}
              sx={{ color: 'white' }}
            >
              <ArrowUpwardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Collapse">
            <IconButton 
              size="small" 
              onClick={() => adjustHeight('down')}
              sx={{ color: 'white' }}
            >
              <ArrowDownwardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {/* Toggle expand/collapse */}
          <IconButton 
            size="small" 
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{ color: 'white' }}
          >
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* Quick Actions - only show when not expanded */}
      {!isExpanded && (
        <Collapse in={!isExpanded}>
          <Box sx={{ p: 1, bgcolor: 'background.paper', borderBottom: '1px solid #e0e0e0' }}>
            <Grid container spacing={1}>
              {quickActions.map((action, index) => (
                <Grid item key={index}>
                  <Chip
                    label={action.label}
                    size="small"
                    onClick={() => setInputMessage(action.action)}
                    sx={{ 
                      bgcolor: 'primary.light', 
                      color: 'primary.contrastText',
                      '&:hover': { bgcolor: 'primary.main' }
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Collapse>
      )}

      {/* Messages Container */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          bgcolor: 'background.default',
        }}
      >
        <List>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              alignItems="flex-start"
              sx={{
                justifyContent:
                  message.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 1,
              }}
            >
              <ListItemAvatar
                sx={{
                  alignSelf: 'flex-start',
                  display: message.role === 'user' ? 'none' : 'flex',
                }}
              >
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <ChatIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Paper
                    sx={{
                      p: 1.5,
                      bgcolor:
                        message.role === 'user' ? 'primary.main' : 'grey.100',
                      color: message.role === 'user' ? 'white' : 'text.primary',
                      borderRadius: 2,
                      maxWidth: '80%',
                      boxShadow: 1,
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      component="div" // So that our formatted content renders properly
                    >
                      {formatMessageContent(message.content)}
                    </Typography>
                  </Paper>
                }
                secondary={
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                }
                sx={{
                  alignItems:
                    message.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              />
              <ListItemAvatar
                sx={{
                  alignSelf: 'flex-start',
                  display: message.role === 'assistant' ? 'none' : 'flex',
                }}
              >
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  {message.role === 'user' ? 'U' : 'A'}
                </Avatar>
              </ListItemAvatar>
            </ListItem>
          ))}
          {isLoading && (
            <ListItem alignItems="flex-start" sx={{ justifyContent: 'flex-start', mb: 1 }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <ChatIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Paper
                    sx={{
                      p: 1.5,
                      bgcolor: 'grey.100',
                      borderRadius: 2,
                      maxWidth: '80%',
                      boxShadow: 1,
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      <Typography variant="body1">Agent is thinking...</Typography>
                    </Box>
                  </Paper>
                }
              />
            </ListItem>
          )}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      <Divider />

      {/* Resizer Handle */}
      <Box
        sx={{
          height: '4px',
          bgcolor: 'primary.main',
          cursor: 'row-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        }}
        onMouseDown={startResizing}
      >
        <Box
          sx={{
            width: '40px',
            height: '2px',
            bgcolor: 'white',
            borderRadius: '1px',
          }}
        />
      </Box>

      {/* Input Area */}
      <Collapse in={isExpanded}>
        <Box sx={{ p: 1.5, borderTop: '1px solid #e0e0e0', bgcolor: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              variant="outlined"
              size="small"
              disabled={isLoading}
              InputProps={{
                sx: { 
                  borderRadius: 2,
                  backgroundColor: '#f9f9f9',
                }
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                borderRadius: 2,
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Collapse>

      {/* Collapsed input area - just shows a single line input */}
      {!isExpanded && (
        <Box sx={{ p: 1, borderTop: '1px solid #e0e0e0', bgcolor: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              fullWidth
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about saloons, services, or bookings..."
              variant="outlined"
              size="small"
              disabled={isLoading}
              InputProps={{
                sx: { 
                  borderRadius: 2,
                  backgroundColor: '#f9f9f9',
                }
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                borderRadius: 2,
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default ChatPanel;