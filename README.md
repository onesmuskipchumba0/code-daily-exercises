# Code Daily

🚀 A CLI tool that generates daily coding exercises using Google's Gemini AI. Get personalized coding exercises for different programming languages and domains.

## Features

- Generate 5 coding exercises for different programming languages
- Choose from various domains/sections for each language
- Get detailed problem descriptions and requirements
- Option to generate solutions with explanations
- Automatic file and folder creation for exercises
- Beautiful CLI interface with syntax highlighting

## Supported Languages and Sections

### JavaScript
- Frontend
- Backend
- Fullstack
- Data Structures
- Algorithms

### Python
- Backend
- Data Science
- Algorithms
- Machine Learning
- Web Development

### TypeScript
- Frontend
- Backend
- Fullstack
- React
- Node.js

### Rust
- CLI
- Web Server
- Systems Programming
- Data Structures
- Algorithms

### Go
- Backend
- CLI
- Web Services
- Data Structures
- Algorithms

## Installation

```bash
npm install -g code-daily-exercises
```

## Configuration

1. Get a Gemini API key from Google AI Studio
2. Create a `.env` file in your working directory:
```bash
GEMINI_API_KEY=your_api_key_here
```

## Usage

1. Run the CLI:
```bash
code-daily
```

2. Follow the interactive prompts to:
   - Choose a programming language
   - Select a specific domain/section
   - Get generated exercises
   - Optionally view solutions

## Output

The tool will create:
- A new folder for each session with the format: `{language}-{section}-{date}`
- `exercises.md` containing all generated exercises
- Language-specific template files based on your selection
- Individual exercise folders with starter files
- `solution-{number}.md` files when solutions are requested

## Requirements

- Node.js >= 14
- Google Gemini API key

## Author

**Onesmus Bett**
- GitHub: [@onesmuskipchumba0](https://github.com/onesmuskipchumba0)
- Email: onesmuskipchumba5@gmail.com

## License

MIT
