# Contributing to Scaleway Generative AI Extension

Thank you for considering contributing to this project! Here are some guidelines:

## Development Setup

```bash
# Clone the repository
git clone https://github.com/andersea/pi-scaleway-provider.git
cd pi-scaleway-provider

# Install dependencies
npm install

# Build (optional — jiti loads TypeScript directly, build is for IDE/editor convenience)
npm run build

# Lint
npm run lint
```

## Testing with Pi

```bash
# Set your Scaleway API key
export SCW_SECRET_KEY="scw_..."

# Load the extension in Pi
pi -e ./extensions/index.ts
```

## Code Style

- Follow the existing ESLint configuration
- Use 2-space indentation (enforced by .editorconfig)\- Add TypeScript types for all functions and variables

## Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
