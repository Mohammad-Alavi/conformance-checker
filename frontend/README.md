# Conformance Checker

AI-powered tool to validate objectives and goals against conformance rules. Built with Vue 3, Vuetify 3, and n8n workflows.

## Features

- **Objective Validation**: Check if your objectives meet SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound)
- **Goal Validation**: Validate aspirational goals that should be timeless and outcome-focused
- **Real-time Analysis**: Get instant feedback on conformance scores, violations, and suggestions
- **Quick Fixes**: Apply suggested fixes with one click
- **Type Detection**: Automatic detection if your content is misclassified (e.g., a goal written as an objective)
- **Dark Mode**: Toggle between light and dark themes

## Tech Stack

- **Frontend**: Vue 3 with Composition API
- **UI Framework**: Vuetify 3
- **Build Tool**: Vite 7
- **Backend**: n8n workflows with AI-powered validation

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Mohammad-Alavi/conformance-checker.git
   cd conformance-checker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the API base URL in `.env` if needed:
   ```
   VITE_API_BASE_URL=https://your-n8n-instance.com/webhook
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Deployment

### Vercel (Recommended)

1. Import the repository in Vercel
2. Set the environment variable `VITE_API_BASE_URL` to your n8n webhook URL
3. Deploy!

The `vercel.json` is pre-configured for Vue SPA routing.

### Other Platforms

Build the project and deploy the `dist` folder to any static hosting provider.

## API Endpoints

The app communicates with two n8n webhook endpoints:

- `POST /webhook/conformance/objective` - Validate objectives
- `POST /webhook/conformance/goal` - Validate goals

### Request Body

```json
{
  "title": "Your objective or goal title",
  "description": "Optional description for context"
}
```

### Response Structure

```json
{
  "status": "success",
  "conformance": {
    "is_conformant": true,
    "confidence_score": 0.95,
    "conformance_score": 0.88,
    "distance_to_conformance": 0.12,
    "overall_message": "Content meets conformance requirements"
  },
  "analysis": {
    "type_assessment": {
      "detected_type": "objective",
      "is_mismatch": false,
      "alternatives": []
    },
    "strengths": [...],
    "violations": [...]
  },
  "quick_fixes": [...],
  "suggestions": [...]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- [Vuetify](https://vuetifyjs.com/) - Vue UI Library
- [n8n](https://n8n.io/) - Workflow automation platform
- [Groq](https://groq.com/) - AI inference platform
