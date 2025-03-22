# Plum - AI Web Assistant Extension

**Plum** is an intelligent chatbot extension that helps you understand and interact with web content. Built with modern web technologies, Plum leverages **React**, **TypeScript**, and the **WXT framework** to provide a seamless, cross-browser experience.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Development](#development)
- [Build & Packaging](#build--packaging)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Intelligent Chatbot:** Interact with an AI-powered chatbot to better understand and navigate web content.
- **Modern UI:** Enjoy a responsive, contemporary user interface built with React and styled using Tailwind CSS.
- **Cross-Browser Support:** Use the extension seamlessly in Chrome, Firefox, and other supported browsers.
- **Type-Safe Code:** Benefit from robust, maintainable code developed in TypeScript.

## Technologies

- **React** – A library for building dynamic and interactive user interfaces.
- **TypeScript** – A typed superset of JavaScript that enhances code quality and maintainability.
- **WXT** – A powerful framework for creating cross-browser extensions with ease.
- **Tailwind CSS** – A utility-first CSS framework for rapid and customizable UI development.
- **Webext-Bridge** – Simplifies communication between different parts of the extension.
- **PostCSS & Autoprefixer** – Tools for processing, optimizing, and ensuring CSS compatibility.

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/sarbaaz0303/plum-web-assistant.git
   cd plum-web-assistant/plum-extension
   ```

2. **Install Dependencies:**

   Ensure you have [Node.js](https://nodejs.org/) installed, then run:

   ```bash
   npm install
   ```

## Development

Enjoy a smooth development experience with live reloading and integrated tools provided by WXT.

### Start Development Server:

```bash
npm run dev
```

For Firefox-specific development:

```bash
npm run dev:firefox
```

### Compile TypeScript:

To check for type errors without generating output:

```bash
npm run compile
```

## Build & Packaging

Prepare your extension for production or distribution.

### Build for Production:

```bash
npm run build
```

For Firefox:

```bash
npm run build:firefox
```

### Create a Zip Package:

```bash
npm run zip
```

For Firefox:

```bash
npm run zip:firefox
```

## Project Structure

An overview of the key folders and files in the **plum-extension** directory:

```
plum-extension/
├── src/                   # Source code for the extension (React components, scripts, etc.)
├── .gitignore             # Git ignore rules
├── README.md              # Project documentation
├── components.json        # Component configuration (if used by WXT)
├── package.json           # Project metadata, scripts, and dependencies
├── package-lock.json      # Auto-generated dependency tree lock file
├── postcss.config.mjs     # PostCSS configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript compiler configuration
└── wxt.config.ts          # WXT framework configuration
```

## Contributing

Contributions are welcome! If you have ideas for improvements or encounter any issues, please:

- Open an issue for bug reports or feature requests.
- Fork the repository and submit a pull request with your enhancements.

Please follow the repository guidelines for contributing.

## License

This project is marked as **public**. If you plan to open source it or share it publicly, be sure to include an appropriate license.

---

Happy coding with **Plum** – your AI Web Assistant Extension!
