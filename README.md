# Plum Web Assistant

**Plum Web Assistant** is a comprehensive project that combines a powerful backend with a user-friendly browser extension to deliver intelligent, context-aware responses. The system uses a Retrieval-Augmented Generation (RAG) pipeline hosted via FastAPI to process and respond to user queries. A dedicated Chrome extension captures user queries and URLs, sending them to the backend where the content is fetched, processed, and transformed into meaningful answers.

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Backend (RAG Extension)](#backend-rag-extension)
- [Browser Extension (Plum Extension)](#browser-extension-plum-extension)
- [Technologies](#technologies)
- [Installation](#installation)
- [Development](#development)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview

The **Plum Web Assistant** project is designed to bridge the gap between web content and intelligent conversational interfaces. It consists of:

- A **backend** powered by FastAPI that implements a RAG pipeline. This component fetches web content based on provided URLs, processes the data, and generates contextually appropriate responses.
- A **Chrome extension** (Plum Extension) that captures user queries and the associated URL, forwarding these details to the backend for processing.

This unified approach enables users to interact with web content in a conversational manner, getting quick insights and assistance directly through their browser.

---

## System Architecture

1. **User Interaction:** The Chrome extension captures a user’s query and the URL of the current web page.
2. **Data Transmission:** The extension sends the query and URL to the FastAPI backend.
3. **Backend Processing:** The backend fetches data from the URL, processes it using a RAG pipeline, and generates an appropriate response.
4. **Response Delivery:** The generated response is sent back to the extension and displayed to the user.

---

## Backend (RAG Extension)

The **RAG Extension** is responsible for:

- Hosting the FastAPI server.
- Implementing the RAG pipeline to process web data.
- Receiving user queries and URLs, fetching web content, and generating responses.

**Quick Start:**

1. Navigate to the `rag-extension` directory.
2. Install the required dependencies:

   ```bash
   cd rag-extension
   pip install -r requirements.txt
   ```

3. Start the FastAPI server:

   ```bash
   python main.py
   ```

*Note: The current README in the `rag-extension` directory is minimal ("# plum"), so refer to the above for detailed setup instructions.*

---

## Browser Extension (Plum Extension)

The **Plum Extension** is a Chrome extension built with React and TypeScript using the WXT framework. It enables users to:

- Interact with an AI-powered chatbot.
- Capture the URL and query from the current browser tab.
- Send the captured data to the backend for processing.

**Key Features:**

- **Intelligent Chatbot:** Provides context-aware responses based on user queries.
- **Modern UI:** Uses React and Tailwind CSS for a sleek, responsive interface.
- **Cross-Browser Compatibility:** Designed primarily for Chrome with support for Firefox through alternate build commands.

**Quick Start:**

1. Navigate to the `plum-extension` directory:

   ```bash
   cd plum-extension
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. For Firefox-specific development:

   ```bash
   npm run dev:firefox
   ```

For detailed build and packaging instructions, refer to the [Plum Extension README](./plum-extension/README.md).

---

## Technologies

- **FastAPI:** High-performance web framework for building the backend.
- **RAG Pipeline:** Combines retrieval and generative techniques to process web content.
- **React:** Library for building user interfaces.
- **TypeScript:** Enhances JavaScript with strong typing for maintainable code.
- **WXT Framework:** Simplifies the development and packaging of browser extensions.
- **Tailwind CSS:** Utility-first CSS framework for rapid UI development.
- **Webext-Bridge:** Manages communication between the browser extension and the backend.

---

## Installation

To set up the complete project locally, follow these steps:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/sarbaaz0303/plum-web-assistant.git
   cd plum-web-assistant
   ```

2. **Setup the Backend (RAG Extension):**

   ```bash
   cd rag-extension
   pip install -r requirements.txt
   python main.py
   ```

3. **Setup the Browser Extension (Plum Extension):**

   ```bash
   cd ../plum-extension
   npm install
   npm run dev
   ```

*Ensure that you have [Node.js](https://nodejs.org/) and [Python](https://www.python.org/) installed on your system.*

---

## Development

**Backend:**

- Run the FastAPI server in development mode using:

  ```bash
  python main.py
  ```

**Plum Extension:**

- Start the extension development server:

  ```bash
  npm run dev
  ```

- For Firefox-specific development:

  ```bash
  npm run dev:firefox
  ```

- To check for TypeScript errors without outputting files:

  ```bash
  npm run compile
  ```

---

## Project Structure

The repository is organized as follows:

```
plum-web-assistant/
├── rag-extension/           # Backend: FastAPI server with RAG pipeline implementation
│   ├── main.py              # Main FastAPI application
│   ├── rag.py               # Module implementing the RAG pipeline
│   ├── requirements.txt     # Python dependencies
│   └── README.md            # Minimal backend documentation
│
├── plum-extension/          # Browser extension built with React & WXT
│   ├── src/                 # Source code for the extension
│   ├── package.json         # Project metadata and dependencies
│   ├── wxt.config.ts        # WXT framework configuration
│   └── README.md            # Detailed extension documentation
│
└── README.md                # This main README file
```

---

## Contributing

Contributions are welcome! If you have suggestions, improvements, or bug fixes:

- Fork the repository.
- Create a feature branch.
- Commit your changes with clear messages.
- Open a pull request detailing your changes.

Please adhere to the project's code style and guidelines.

---

## License

This project is marked as **public**. Ensure you include an appropriate license if you plan to distribute or open-source your work.

---

## Contact

For questions, support, or further information, please contact:

**Email:** [sarbaaz0303@gmail.com](mailto:sarbaaz0303@gmail.com)

---

Happy coding with **Plum Web Assistant** – bridging intelligent AI responses with seamless web browsing!