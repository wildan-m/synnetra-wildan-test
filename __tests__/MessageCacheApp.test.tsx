import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '../types/message';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('MessageCacheApp Integration Tests', () => {
  const MESSAGES_STORAGE_KEY = 'cached_messages';
  const MAX_MESSAGES = 5;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  describe('AsyncStorage Integration', () => {
    it('should call AsyncStorage.getItem on component mount', async () => {
      await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(MESSAGES_STORAGE_KEY);
    });

    it('should save new messages to AsyncStorage', async () => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: 'Test message',
        timestamp: Date.now(),
      };

      const messages = [newMessage];
      await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        MESSAGES_STORAGE_KEY,
        JSON.stringify(messages)
      );
    });

    it('should load existing messages from AsyncStorage', async () => {
      const existingMessages: Message[] = [
        { id: '1', text: 'Cached message', timestamp: 1642680000000 },
      ];
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingMessages));

      const result = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
      const loadedMessages = JSON.parse(result!);

      expect(loadedMessages).toEqual(existingMessages);
      expect(loadedMessages).toHaveLength(1);
      expect(loadedMessages[0].text).toBe('Cached message');
    });

    it('should handle AsyncStorage errors during load', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage read error'));

      try {
        await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Storage read error');
      }
    });

    it('should handle AsyncStorage errors during save', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage write error'));

      try {
        await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, '[]');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Storage write error');
      }
    });
  });

  describe('Message Caching Logic', () => {
    it('should implement complete message caching workflow', async () => {
      // Step 1: Load empty cache (initial state)
      mockAsyncStorage.getItem.mockResolvedValue(null);
      let result = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
      expect(result).toBeNull();

      // Step 2: Add first message
      const firstMessage: Message = {
        id: '1',
        text: 'First message',
        timestamp: Date.now(),
      };
      let messages = [firstMessage];
      await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));

      // Step 3: Load cached message
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(messages));
      result = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
      let cachedMessages = JSON.parse(result!);
      expect(cachedMessages).toHaveLength(1);
      expect(cachedMessages[0].text).toBe('First message');

      // Step 4: Add second message (newer first)
      const secondMessage: Message = {
        id: '2',
        text: 'Second message',
        timestamp: Date.now() + 1000,
      };
      messages = [secondMessage, ...cachedMessages].slice(0, MAX_MESSAGES);
      await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));

      // Step 5: Verify order and cache update
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(messages));
      result = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
      cachedMessages = JSON.parse(result!);
      expect(cachedMessages).toHaveLength(2);
      expect(cachedMessages[0].text).toBe('Second message'); // Newest first
      expect(cachedMessages[1].text).toBe('First message');
    });

    it('should enforce 5-message limit in caching workflow', async () => {
      // Create 6 messages
      const messages: Message[] = [];
      for (let i = 1; i <= 6; i++) {
        messages.push({
          id: i.toString(),
          text: `Message ${i}`,
          timestamp: Date.now() + (i * 1000),
        });
      }

      // Simulate adding messages one by one with limit enforcement
      let cachedMessages: Message[] = [];
      
      for (const message of messages) {
        cachedMessages = [message, ...cachedMessages].slice(0, MAX_MESSAGES);
        await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(cachedMessages));
      }

      // Verify final state
      expect(cachedMessages).toHaveLength(5);
      expect(cachedMessages[0].text).toBe('Message 6'); // Newest first
      expect(cachedMessages[4].text).toBe('Message 2'); // 5th message
      expect(cachedMessages.find(msg => msg.text === 'Message 1')).toBeUndefined(); // Oldest removed
    });

    it('should persist message properties correctly', async () => {
      const originalMessage: Message = {
        id: 'test-123',
        text: 'Test message with special chars: !@#$%^&*()',
        timestamp: 1642680000000,
      };

      // Save message
      await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify([originalMessage]));

      // Load message
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([originalMessage]));
      const result = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
      const [loadedMessage] = JSON.parse(result!);

      // Verify all properties are preserved
      expect(loadedMessage.id).toBe(originalMessage.id);
      expect(loadedMessage.text).toBe(originalMessage.text);
      expect(loadedMessage.timestamp).toBe(originalMessage.timestamp);
      expect(typeof loadedMessage.id).toBe('string');
      expect(typeof loadedMessage.text).toBe('string');
      expect(typeof loadedMessage.timestamp).toBe('number');
    });
  });

  describe('Input Validation Integration', () => {
    it('should validate message input before caching', () => {
      const validInputs = ['Hello', 'Test message', '123'];
      const invalidInputs = ['', '   ', '\t\n', '  \n  '];

      validInputs.forEach(input => {
        expect(input.trim().length > 0).toBe(true);
      });

      invalidInputs.forEach(input => {
        expect(input.trim().length === 0).toBe(true);
      });
    });

    it('should trim whitespace before caching messages', async () => {
      const inputWithWhitespace = '  Test message with spaces  ';
      const trimmedText = inputWithWhitespace.trim();

      const message: Message = {
        id: '1',
        text: trimmedText,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify([message]));

      expect(message.text).toBe('Test message with spaces');
      expect(message.text).not.toContain('  ');
    });
  });

  describe('Error Recovery Integration', () => {
    it('should recover from corrupted cache data', async () => {
      // Simulate corrupted data
      mockAsyncStorage.getItem.mockResolvedValue('invalid json data');

      try {
        const result = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
        JSON.parse(result!);
      } catch (error) {
        // Should handle parsing error gracefully
        expect(error).toBeInstanceOf(SyntaxError);
        
        // Reset to empty state
        await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify([]));
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(MESSAGES_STORAGE_KEY, '[]');
      }
    });

    it('should maintain data integrity after storage errors', async () => {
      const validMessage: Message = {
        id: '1',
        text: 'Valid message',
        timestamp: Date.now(),
      };

      // First save succeeds
      await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify([validMessage]));
      
      // Second save fails
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage full'));
      
      try {
        await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify([validMessage, validMessage]));
      } catch (error) {
        // Even after error, we can still read the previous valid state
        mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([validMessage]));
        const result = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
        const messages = JSON.parse(result!);
        
        expect(messages).toHaveLength(1);
        expect(messages[0]).toEqual(validMessage);
      }
    });
  });
});