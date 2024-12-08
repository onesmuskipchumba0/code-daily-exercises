# Code Daily

A CLI tool that generates daily coding exercises using Google's Gemini AI. Get personalized coding exercises for different programming languages and domains.

## Features

- Generate 5 coding exercises for different programming languages
- Choose from various domains/sections for each language
- Get detailed problem descriptions and requirements
- Option to generate solutions with explanations
- Automatic file and folder creation for exercises

## Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file in the root directory and add your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```

## Usage

Run the CLI tool:
```bash
npm start
```

Or install globally:
```bash
npm install -g .
code-daily
```

Follow the interactive prompts to:
1. Choose a programming language
2. Select a specific domain/section
3. Get generated exercises
4. Optionally view solutions

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

### Java
- Core Java
- Spring Boot
- Android
- Data Structures
- Algorithms

## Output

The tool will create:
- A new folder for each session with the format: `{language}-{section}-{date}`
- `exercises.md` containing all generated exercises
- `solution-{number}.md` files when solutions are requested

## Requirements

- Node.js >= 14
- Google Gemini API key
