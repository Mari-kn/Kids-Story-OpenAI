# Kids Story Generator 🎨📖🎤

This project is a web application that generates short, creative stories for kids aged 2-6, converts the story into voice-over, and creates an illustration based on the story. It uses the OpenAI GPT, ElevenLabs API, and OpenAI Image API.

## Features
- **Story Generation**: Provide 5 words, and the app will generate a short story incorporating them.
- **Voice-Over**: Converts the generated story into a realistic voice-over.
- **Image Generation**: Generates a children's storybook-style illustration based on the story.

## Technologies Used
- [Node.js](https://nodejs.org/) with [Express](https://expressjs.com/)
- [OpenAI GPT API](https://platform.openai.com/docs/)
- [ElevenLabs Text-to-Speech API](https://elevenlabs.io/)
- [OpenAI Image Generation API](https://platform.openai.com/docs/api-reference/images)
- [dotenv](https://www.npmjs.com/package/dotenv) for environment variable management
- [axios](https://www.npmjs.com/package/axios) for HTTP requests
- [fs](https://nodejs.org/api/fs.html) for file system operations

## Installation

###1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/kids-story-generator.git
   cd kids-story-generator
```

- Go to the project directory:

```
cd week-2/js-project-1-poetry-vocalizer
```

### 1. Install dependencies:
```bash
npm install
```
### 2. Create a .env file in the project root and add your API keys:
```
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```
### 3. Start the server:
```
npm start
```
