# Custom Code Import & Suggestion Helper

## Overview

A VS Code extension that enhances coding efficiency by providing contextual code suggestions and automatic import management.

## Features

- **Insert Imports for Selected Components**: Quickly add imports for selected components or functions directly into your file.
- **Context-Based Suggestions**: Trigger `Ctrl + Space` for intelligent import suggestions based on your cursor’s current context.

## Commands

- **Keyboard Shortcuts**:
  - `Ctrl + Shift + L` - Save selected imports to be reused across your project.
  - `Ctrl + Space` - Show context-based import suggestions, including previously saved imports for quicker access.

## Installation

1. Open _Visual Studio Code_.
2. Go to the _Extensions_ view by clicking on the Extensions icon in the Activity Bar or pressing `Ctrl + Shift + X`.
3. Search for "**RunProject**" and click _Install_.

## Usage

1. **Trigger Import Suggestions**: Place your cursor where you'd like an import suggestion and press `Ctrl + Space` to see a list of relevant imports.
2. **Add Multiple Imports**: Select and add multiple imports at once by using `Ctrl + Shift + L`.
3. **Prevent Duplicate Imports**: The extension will automatically merge imports from the same module into a single import statement if they already exist in the file.
