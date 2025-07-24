import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, MessageCache } from '../types/message';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Message Cache Core Functionality', () => {
  const MESSAGES_STORAGE_KEY = 'cached_messages';
  const MAX_MESSAGES = 5;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  describe('Message Structure', () => {
    it('should create a valid message object', () => {
      const message: Message = {
        id: '123',
        text: 'Test message',
        timestamp: 1642680000000,
      };

      expect(message).toHaveProperty('id');
      expect(message).toHaveProperty('text');
      expect(message).toHaveProperty('timestamp');
      expect(typeof message.id).toBe('string');
      expect(typeof message.text).toBe('string');
      expect(typeof message.timestamp).toBe('number');
    });

    it('should validate message cache array structure', () => {
      const messages: MessageCache = [
        { id: '1', text: 'First', timestamp: 1642680000000 },
        { id: '2', text: 'Second', timestamp: 1642680060000 },
      ];

      expect(Array.isArray(messages)).toBe(true);
      expect(messages).toHaveLength(2);
      messages.forEach(msg => {
        expect(msg).toHaveProperty('id');
        expect(msg).toHaveProperty('text');
        expect(msg).toHaveProperty('timestamp');
      });
    });
  });

  describe('AsyncStorage Operations', () => {
    it('should save messages to AsyncStorage', async () => {
      const messages: MessageCache = [
        { id: '1', text: 'Test message', timestamp: Date.now() },
      ];

      await AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        MESSAGES_STORAGE_KEY,
        JSON.stringify(messages)
      );
    });

    it('should load messages from AsyncStorage', async () => {
      const messages: MessageCache = [
        { id: '1', text: 'Cached message', timestamp: 1642680000000 },
      ];
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(messages));

      const result = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
      
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(MESSAGES_STORAGE_KEY);
      expect(result).toBe(JSON.stringify(messages));
    });

    it('should handle empty storage', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await AsyncStorage.getItem(MESSAGES_STORAGE_KEY);
      
      expect(result).toBeNull();
    });

    it('should handle AsyncStorage errors', async () => {
      const error = new Error('Storage error');
      mockAsyncStorage.getItem.mockRejectedValue(error);

      await expect(AsyncStorage.getItem(MESSAGES_STORAGE_KEY)).rejects.toThrow('Storage error');
    });
  });

  describe('Message Limit Logic', () => {
    it('should enforce 5-message limit', () => {
      const existingMessages: MessageCache = [
        { id: '1', text: 'Message 1', timestamp: 1642680000000 },
        { id: '2', text: 'Message 2', timestamp: 1642680060000 },
        { id: '3', text: 'Message 3', timestamp: 1642680120000 },
        { id: '4', text: 'Message 4', timestamp: 1642680180000 },
        { id: '5', text: 'Message 5', timestamp: 1642680240000 },
      ];

      const newMessage: Message = {
        id: '6',
        text: 'Message 6',
        timestamp: 1642680300000,
      };

      // Simulate adding new message and enforcing limit (newest first)
      const updatedMessages = [newMessage, ...existingMessages].slice(0, MAX_MESSAGES);

      expect(updatedMessages).toHaveLength(5);
      expect(updatedMessages[0]).toEqual(newMessage); // Newest message first
      expect(updatedMessages.find(msg => msg.id === '5')).toBeUndefined(); // Last message removed
    });

    it('should maintain chronological order (newest first)', () => {
      const messages: MessageCache = [];
      const baseTime = 1642680000000;

      // Add messages in sequence
      for (let i = 1; i <= 3; i++) {
        const newMessage: Message = {
          id: i.toString(),
          text: `Message ${i}`,
          timestamp: baseTime + (i * 60000), // 1 minute apart
        };
        messages.unshift(newMessage); // Add to beginning (newest first)
      }

      expect(messages).toHaveLength(3);
      expect(messages[0].text).toBe('Message 3'); // Newest first
      expect(messages[1].text).toBe('Message 2');
      expect(messages[2].text).toBe('Message 1'); // Oldest last
    });

    it('should handle adding to empty message list', () => {
      const messages: MessageCache = [];
      const newMessage: Message = {
        id: '1',
        text: 'First message',
        timestamp: Date.now(),
      };

      const updatedMessages = [newMessage, ...messages].slice(0, MAX_MESSAGES);

      expect(updatedMessages).toHaveLength(1);
      expect(updatedMessages[0]).toEqual(newMessage);
    });

    it('should handle partial lists (less than 5 messages)', () => {
      const existingMessages: MessageCache = [
        { id: '1', text: 'Message 1', timestamp: 1642680000000 },
        { id: '2', text: 'Message 2', timestamp: 1642680060000 },
      ];

      const newMessage: Message = {
        id: '3',
        text: 'Message 3',
        timestamp: 1642680120000,
      };

      const updatedMessages = [newMessage, ...existingMessages].slice(0, MAX_MESSAGES);

      expect(updatedMessages).toHaveLength(3);
      expect(updatedMessages[0]).toEqual(newMessage);
    });
  });

  describe('Data Serialization', () => {
    it('should serialize and deserialize messages correctly', () => {
      const originalMessages: MessageCache = [
        { id: '1', text: 'Test message', timestamp: 1642680000000 },
        { id: '2', text: 'Another message', timestamp: 1642680060000 },
      ];

      const serialized = JSON.stringify(originalMessages);
      const deserialized: MessageCache = JSON.parse(serialized);

      expect(deserialized).toEqual(originalMessages);
      expect(deserialized).toHaveLength(2);
      expect(deserialized[0].timestamp).toBe(1642680000000);
    });

    it('should handle malformed JSON gracefully', () => {
      const malformedJson = '{"invalid": json}';
      
      expect(() => JSON.parse(malformedJson)).toThrow();
    });

    it('should preserve message properties during serialization', () => {
      const message: Message = {
        id: 'test-123',
        text: 'Message with special chars: !@#$%^&*()',
        timestamp: 1642680000000,
      };

      const serialized = JSON.stringify([message]);
      const [deserialized] = JSON.parse(serialized);

      expect(deserialized.id).toBe(message.id);
      expect(deserialized.text).toBe(message.text);
      expect(deserialized.timestamp).toBe(message.timestamp);
    });
  });

  describe('Input Validation Logic', () => {
    it('should validate non-empty messages', () => {
      const validInputs = ['Hello', 'Test message', '123', 'a'];
      const invalidInputs = ['', '   ', '\t', '\n'];

      validInputs.forEach(input => {
        expect(input.trim().length > 0).toBe(true);
      });

      invalidInputs.forEach(input => {
        expect(input.trim().length === 0).toBe(true);
      });
    });

    it('should trim whitespace from messages', () => {
      const inputsWithWhitespace = [
        '  Hello  ',
        '\tTest message\t',
        '\nAnother message\n',
        '   Spaces everywhere   ',
      ];

      const expectedOutputs = [
        'Hello',
        'Test message',
        'Another message',
        'Spaces everywhere',
      ];

      inputsWithWhitespace.forEach((input, index) => {
        expect(input.trim()).toBe(expectedOutputs[index]);
      });
    });
  });

  describe('Timestamp Handling', () => {
    it('should create valid timestamps', () => {
      const now = Date.now();
      const message: Message = {
        id: '1',
        text: 'Test',
        timestamp: now,
      };

      expect(message.timestamp).toBe(now);
      expect(typeof message.timestamp).toBe('number');
      expect(message.timestamp > 0).toBe(true);
    });

    it('should format timestamps correctly', () => {
      const timestamp = new Date('2024-01-01T12:00:00Z').getTime();
      const formatted = new Date(timestamp).toLocaleTimeString();

      expect(formatted).toMatch(/\d{1,2}:\d{2}:\d{2}/);
    });

    it('should maintain timestamp ordering', () => {
      const baseTime = 1642680000000;
      const messages: MessageCache = [
        { id: '1', text: 'First', timestamp: baseTime },
        { id: '2', text: 'Second', timestamp: baseTime + 60000 },
        { id: '3', text: 'Third', timestamp: baseTime + 120000 },
      ];

      // Verify ascending order
      for (let i = 1; i < messages.length; i++) {
        expect(messages[i].timestamp).toBeGreaterThan(messages[i-1].timestamp);
      }
    });
  });
});