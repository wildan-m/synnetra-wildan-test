import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, MessageCache } from '@/types/message';

const MESSAGES_STORAGE_KEY = 'cached_messages';
const MAX_MESSAGES = 5;

export default function MessageCacheApp() {
  const [messages, setMessages] = useState<MessageCache>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessagesFromStorage();
  }, []);

  const loadMessagesFromStorage = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
      if (storedMessages) {
        const parsedMessages: MessageCache = JSON.parse(storedMessages);
        setMessages(parsedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveMessagesToStorage = async (messagesToSave: MessageCache) => {
    try {
      await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messagesToSave));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const addMessage = async () => {
    if (!newMessage.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [message, ...messages].slice(0, MAX_MESSAGES);
    setMessages(updatedMessages);
    setNewMessage('');
    
    await saveMessagesToStorage(updatedMessages);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Message Cache Demo</Text>
      <Text style={styles.subtitle}>Last {MAX_MESSAGES} messages are cached</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Enter your message..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={addMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No messages yet. Send your first message!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  messagesList: {
    flex: 1,
  },
  messageContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 32,
  },
});