# Google Generative AI API - Node.js Express Server

This project provides a Node.js Express server that integrates with Google's Generative AI (Gemini) API to generate text, images, audio, and video-based content. The API supports both synchronous and streaming text generation.

## Features

- Generate text responses from Google's Gemini AI
- Stream text responses
- Generate content based on images, audio, and video
- Secure API key handling

## Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- A Google API Key with Generative AI access

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/bhavinslnki/geminiai-node-api.git
   cd geminiai-node-api
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add your API key:
   ```env
   GEMINI_API_KEY=your-google-api-key-here
   ```

## Running the Server

Start the server using:

```sh
npm start
```

The server will run at:

```
http://localhost:7001
```

## API Endpoints

### 1. Generate Text

**POST /generate-text**

```json
{
  "prompt": "Write a short story about AI."
}
```

Response:

```json
{
  "text": "Once upon a time..."
}
```

### 2. Stream Text

**POST /generate-text-streaming**

```json
{
  "prompt": "Tell me a joke."
}
```

Response:

```
Why did the AI cross the road?...
```

### 3. Generate with an Image

**POST /generate-with-image**

```json
{
  "prompt": "Describe this image."
}
```

Ensure `public/jetpack.jpg` exists before using this endpoint.

### 4. Generate with Multiple Images

**POST /generate-with-images**

```json
{
  "prompt": "Describe these images."
}
```

Ensure `public/jetpack.jpg`, `piranha.jpg`, and `firefighter.jpg` exist.

### 5. Generate with Audio

**POST /generate-with-audio**

```json
{
  "prompt": "Describe this audio file."
}
```

Ensure `public/samplesmall.mp3` exists.

### 6. Generate with Video

**POST /generate-with-video**

```json
{
  "prompt": "Summarize this video."
}
```

Ensure `public/Big_Buck_Bunny.mp4` exists.

## Environment Variables

| Variable       | Description                       |
| -------------- | --------------------------------- |
| GEMINI_API_KEY | Your Google Generative AI API key |

## Author

[Bhavin Solanki](https://github.com/bhavinslnki)
