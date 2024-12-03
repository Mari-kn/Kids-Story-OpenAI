// Import necessary modules
const express = require('express'); // Framework for building web applications
const fetch = require('node-fetch'); // Used for making HTTP requests
const fs = require('fs'); // File system module to handle file operations
const path = require('path'); // Module for handling and transforming file paths
const dotenv = require('dotenv'); // Load environment variables from .env file
dotenv.config(); // Configure dotenv to read .env file
const axios = require('axios'); // HTTP client for making requests

// Initialize the Express app
const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.static('public')); // Serve static files from the "public" directory

// API keys and voice ID (replace with actual keys or load from environment variables)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = 'CwhRBWXzGAHq8TQ4Fs17'; // Replace with your ElevenLabs Voice ID

// Endpoint to generate a story based on five words
app.post('/generate-story', async (req, res) => {
  const { words } = req.body;

  // Validate input: ensure exactly 5 words are provided
  if (!words || words.length !== 5) {
    return res.status(400).json({ error: 'Please provide exactly 5 words.' });
  }

  // Construct the prompt for OpenAI API
  const prompt = `Write a story for kids between 2-6 ages that includes the following words: ${words.join(
    ', '
  )}. It must be about 4-6 lines and creatively incorporate the words provided. It must be completely positive and promising.`;

  try {
    // Make a request to OpenAI API for generating the story
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
      }),
    });

    const data = await response.json();

    // Return the generated story if available
    if (data.choices && data.choices.length > 0) {
      const lyrics = data.choices[0].message.content.trim();
      return res.json({ lyrics });
    } else {
      return res.status(500).json({ error: 'Invalid response from OpenAI API.' });
    }
  } catch (error) {
    console.error('Error generating story:', error);
    return res.status(500).json({ error: 'Failed to generate story.' });
  }
});

// Endpoint to generate a voice-over for the story
app.post('/voice-over', async (req, res) => {
  const { lyrics } = req.body;

  // Validate input: ensure lyrics are provided
  if (!lyrics) {
    return res.status(400).json({ error: 'No lyrics provided.' });
  }

  try {
    // Make a request to ElevenLabs API for generating voice-over
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        text: lyrics,
        output_format: 'mp3_22050', // Output format for audio
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.75,
          style: 0.2,
        },
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer', // Response format
      }
    );

    // Save the audio file locally
    const filePath = './public/generated_audio.mp3';
    fs.writeFileSync(filePath, response.data);

    console.log('Audio file saved as generated_audio.mp3');
    res.json({ audioUrl: '/generated_audio.mp3' });
  } catch (error) {
    console.error('Error generating voice-over:', error.response ? error.response.data : error.message);
    return res.status(500).json({ error: 'Failed to generate voice-over.' });
  }
});

// Endpoint to generate an image based on the story
app.post('/generate-image', async (req, res) => {
  const { lyrics } = req.body;

  // Validate input: ensure lyrics are provided
  if (!lyrics) {
    return res.status(400).json({ error: 'No lyrics provided.' });
  }

  // Construct the prompt for OpenAI Image API
  const imagePrompt = `Create a children's story illustration based on this story: ${lyrics}`;

  try {
    // Make a request to OpenAI Image API
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: imagePrompt,
        n: 1, // Number of images to generate
        size: '1024x1024', // Image resolution
      }),
    });

    const data = await response.json();

    // Download and save the generated image locally
    if (data.data && data.data.length > 0) {
      const imageUrl = data.data[0].url;

      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imagePath = './public/generated_image.png';
      fs.writeFileSync(imagePath, imageResponse.data);

      console.log('Image file saved as generated_image.png');
      res.json({ imageUrl: '/generated_image.png' });
    } else {
      return res.status(500).json({ error: 'Invalid response from OpenAI Image API.' });
    }
  } catch (error) {
    console.error('Error generating image:', error);
    return res.status(500).json({ error: 'Failed to generate image.' });
  }
});

// Start the server on the specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
