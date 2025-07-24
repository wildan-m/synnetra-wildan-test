# Synnetra Expo App

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app), featuring a modern React Native architecture with TypeScript, testing, and message caching functionality.

## Tech Stack

- **Expo SDK 53** with React Native 0.79.5 and React 19
- **expo-router 5.1.4** for file-based routing
- **TypeScript** with strict mode enabled
- **Jest 30** with React Native Testing Library
- **AsyncStorage** for persistent data storage

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm start
   # or
   npx expo start
   ```

3. **Open the app**
   - [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
   - [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/) - `npm run android`
   - [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/) - `npm run ios`
   - [Web browser](https://docs.expo.dev/workflow/web/) - `npm run web`
   - [Expo Go](https://expo.dev/go) mobile app

## Available Scripts

### Development
- `npm start` - Start development server with QR code
- `npm run android` - Start on Android emulator
- `npm run ios` - Start on iOS simulator  
- `npm run web` - Start web version
- `npm run reset-project` - Reset to blank project (moves current code to app-example/)

### Code Quality
- `npm run lint` - Run ESLint with Expo configuration

### Testing
- `npm test` - Run Jest test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Project Structure

```
├── app/                    # Screens and routing (expo-router)
│   ├── (tabs)/            # Tab navigation screens
│   ├── _layout.tsx        # Root layout with theme provider
│   └── +not-found.tsx     # 404 error screen
├── components/            # Reusable UI components
│   └── ui/               # Platform-specific components
├── constants/            # Colors and app constants
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── assets/              # Images, fonts, and static assets
├── __tests__/           # Jest test files
└── CLAUDE.md           # Development guidance for Claude Code
```

## Key Features

### File-Based Routing
Uses expo-router for automatic route generation based on file structure in the `app/` directory.

### Theming System
- **ThemedText** and **ThemedView** components adapt to light/dark themes
- Centralized theme configuration in `constants/Colors.ts`
- Custom hooks: `useThemeColor`, `useColorScheme`

### Cross-Platform Support
- **iOS**: SF Symbols, haptic feedback, blur effects
- **Android**: Material Icons, edge-to-edge design, adaptive icons
- **Web**: Static output via Metro bundler, favicon support

### Message Caching
- Persistent message storage using AsyncStorage
- Comprehensive test suite covering caching logic
- Type-safe Message interface

## Development Notes

- Uses new React Native architecture (`newArchEnabled: true`)
- TypeScript paths configured with `@/*` alias for imports
- ESLint configured with Expo's flat config
- Custom fonts loaded via expo-font (SpaceMono)
- Jest configured with jsdom environment for React Native testing

## Learn More

- [Expo documentation](https://docs.expo.dev/) - Learn fundamentals and advanced topics
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/) - Step-by-step tutorial
- [expo-router documentation](https://docs.expo.dev/router/introduction/) - File-based routing

## Community

- [Expo on GitHub](https://github.com/expo/expo) - Open source platform
- [Discord community](https://chat.expo.dev) - Chat with Expo users
