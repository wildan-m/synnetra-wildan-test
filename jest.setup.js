// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  default: {
    call: () => {},
  },
}));

// Mock expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {},
  easConfig: {},
}));

// Set up jsdom environment
require('jest-environment-jsdom');