# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm install` - Install dependencies
- `npm start` or `npx expo start` - Start development server with QR code
- `npm run android` - Start on Android emulator
- `npm run ios` - Start on iOS simulator  
- `npm run web` - Start web version
- `npm run lint` - Run ESLint with Expo configuration
- `npm run reset-project` - Reset to blank project (moves current code to app-example/)

### Testing
- `npm test` - Run Jest test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- **Framework**: Jest 30 with React Native Testing Library
- **Setup**: Configured for React Native with jsdom environment
- **Type support**: @types/jest installed for TypeScript integration

### TypeScript
- Uses strict TypeScript configuration extending `expo/tsconfig.base`
- Path alias `@/*` maps to project root
- All `.ts` and `.tsx` files are included
- Jest types configured for test files

## Architecture Overview

This is an **Expo React Native application** using:
- **Expo SDK 53** with React Native 0.79.5 and React 19
- **expo-router 5.1.4** for file-based routing
- **react-native-reanimated** for animations
- **TypeScript** with strict mode enabled

### Routing Structure (expo-router)
- **File-based routing** - Files in `app/` directory automatically become routes
- **Root layout**: `app/_layout.tsx` - Theme provider, font loading, stack navigation
- **Tab navigation**: `app/(tabs)/` - Bottom tabs with Home and Explore screens
  - `app/(tabs)/index.tsx` - Home/welcome screen
  - `app/(tabs)/explore.tsx` - Documentation screen
- **Error handling**: `app/+not-found.tsx` - 404 screen

### Component Architecture
- **Themed Components**: `ThemedText` and `ThemedView` automatically adapt to light/dark themes
- **Advanced UI**: `ParallaxScrollView` (animated header), `Collapsible` (expandable sections)
- **Platform-specific**: `IconSymbol` (SF Symbols on iOS, Material Icons elsewhere), `HapticTab`
- **Theme system**: Centralized in `constants/Colors.ts` with custom hooks (`useThemeColor`, `useColorScheme`)

### Key Patterns
- **Composition-based components** - Accept children and compose functionality
- **Theme provider pattern** - React Navigation theme integration
- **Platform abstraction** - Single API with iOS/Android/web implementations
- **Custom hooks** for reusable theme logic

### File Organization
- `app/` - Screens and routing (expo-router convention)
- `components/` - Reusable UI components with `ui/` subfolder for platform-specific
- `constants/` - Colors and other app constants
- `hooks/` - Custom React hooks
- `assets/` - Images, fonts, and static assets
- `types/` - TypeScript type definitions
- `__tests__/` - Jest test files

### Cross-Platform Features
- iOS: SF Symbols, haptic feedback, blur effects, tab bar transparency
- Android: Material Icons, edge-to-edge design, adaptive icons
- Web: Static output via Metro bundler, favicon support

## Development Notes
- Uses new React Native architecture (`newArchEnabled: true`)
- TypeScript paths configured with `@/*` alias for imports
- ESLint configured with Expo's flat config
- Custom fonts loaded via expo-font (SpaceMono)
- Supports typed routes experiment for better navigation types