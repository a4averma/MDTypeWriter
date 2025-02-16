# MDTypeWriter

A modern Markdown editor with folder management capabilities, built with Tauri and React. Designed for technical writing and note-taking with enhanced formatting support.

## Features ✨

### Core Functionality
- **Folder Management**  
  Open and manage folders with persistent recent folder history
- **File Tree Navigation**  
  Interactive sidebar with collapsible directory structure
- **Dual Mode Editing**  
  - Monaco Editor with Markdown syntax highlighting
  - Rich preview rendering with KaTeX math and Mermaid diagrams 

### Editing Features
- **Floating Formatting Toolbar**  
  Context-aware toolbar for quick Markdown formatting
- **Smart Formatting Shortcuts**  
  One-click headers, lists, bold/italic, and link insertion
- **Real-time Preview**  
  Instant rendering of Markdown content with scroll sync

### Technical Capabilities
- **Cross-platform File Handling**  
  Secure filesystem access through Tauri plugins
- **Persistent Settings**  
  Store recent folders and preferences using Tauri store plugin
- **Performance Optimized**  
  Virtualized rendering for large documents and efficient file tree handling

### Specialized Rendering
- **Math Support**  
  LaTeX equations with KaTeX rendering
- **Diagram Support**  
  Mermaid.js integration for flowcharts and diagrams 
- **Syntax Highlighting**  
  Prism.js code blocks with dark/light themes

## Planned Features 🚧

### Immediate Roadmap
- [x] Generate Presentation from Markdown
- [x] Split-screen live preview mode
- [ ] Table of Contents generation
- [ ] Dark/light theme toggle
- [ ] Image drag-and-drop support
- [ ] Custom CSS styling support
- [x] AI-assisted writing tools

### Future Vision
- [ ] Version control integration
- [ ] Multi-document search
- [ ] Export to PDF/HTML
- [ ] Collaborative editing
- [ ] Plugin system for extended functionality
- [ ] Mobile-responsive layout


## Installation ⚙️

```bash
pnpm install
pnpm tauri dev
```

## Tech Stack 🔧

**Frontend**  
- React 18 + TypeScript
- Tailwind CSS v4 + Shadcn/ui canary
- Monaco Editor
- Remark/Rehype ecosystem

**Backend**  
- Tauri v2
- Rust file system operations
- Tauri Store plugin

**Build**  
- Vite
- pnpm

## Development Setup 🛠️

### Prerequisites
1. **Node.js & pnpm**
   - Install Node.js (v18 or later)
   - Install pnpm: `npm install -g pnpm`

2. **Rust Development Environment**
   - Install Rust via rustup: [https://rustup.rs/](https://rustup.rs/)
   - Required version: 1.79.0 or later
   - Run: `rustup update stable`

3. **System Dependencies**
   - Follow Tauri's system requirements: [https://v2.tauri.app/start/prerequisites/](https://v2.tauri.app/start/prerequisites/)
   - Windows: Microsoft Visual Studio C++ Build Tools
   - Install webview2: [https://developer.microsoft.com/en-us/microsoft-edge/webview2/](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) for Windows
   - Use Rustup MSVC toolchain for Windows: `rustup install stable-x86_64-pc-windows-msvc`
   - macOS: Xcode Command Line Tools
   - Linux: `build-essential` package

### Quick Start
```bash
# Clone the repository
git clone https://github.com/yourusername/mdtypewriter
cd mdtypewriter

# Install dependencies
pnpm install

# Start development server
pnpm tauri dev
```

**Contributing**  
- Fork the repository
- Make your changes and test locally
- Create a pull request



