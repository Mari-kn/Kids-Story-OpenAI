const express = require('express')
const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
dotenv.config()
const axios = require('axios')
const app = express()
app.use(express.json())
app.use(express.static('public'))
const OPENAI_API_KEY = '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'
const ELEVENLABS_API_KEY = 'sk_e19d43f9d779b363fc14a47f4579983627e7604a73438ac0'
const VOICE_ID = 'CwhRBWXzGAHq8TQ4Fs17'

app.post('/generate-story', async (req, res) => {
  const { words } = req.body
  if (!words || words.length !== 5) {
    return res.status(400).json({ error: 'Please provide exactly 5 words.' })
  }

  const prompt = `Write a story for kids between 2-6 ages that includes the following words: ${words.join(
    ', '
  )}. It must be about 4-6 lines and creatively incorporate the words provided. It must be completely positive and promising.`

  try {
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
    })

    const data = await response.json()
    if (data.choices && data.choices.length > 0) {
      const lyrics = data.choices[0].message.content.trim()
      return res.json({ lyrics })
    } else {
      return res.status(500).json({ error: 'Invalid response from OpenAI API.' })
    }
  } catch (error) {
    console.error('Error generating story:', error)
    return res.status(500).json({ error: 'Failed to generate story.' })
  }
})

app.post('/voice-over', async (req, res) => {
  const { lyrics } = req.body

  if (!lyrics) {
    return res.status(400).json({ error: 'No lyrics provided.' })
  }

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        text: lyrics,
        output_format: 'mp3_22050',
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
        responseType: 'arraybuffer',
      }
    )

    const filePath = './public/generated_audio.mp3'
    fs.writeFileSync(filePath, response.data)

    console.log('Audio file saved as generated_audio.mp3')
    res.json({ audioUrl: '/generated_audio.mp3' })
  } catch (error) {
    console.error('Error generating voice-over:', error.response ? error.response.data : error.message)
    return res.status(500).json({ error: 'Failed to generate voice-over.' })
  }
})

// Generate Image from Lyrics Endpoint
app.post('/generate-image', async (req, res) => {
  const { lyrics } = req.body;

  if (!lyrics) {
    return res.status(400).json({ error: 'No lyrics provided.' });
  }

  const imagePrompt = `Create a children's story illustration based on this story: ${lyrics}`;

  try {
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
    if (data.data && data.data.length > 0) {
      const imageUrl = data.data[0].url;

      // Fetch the image and save it locally
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

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
