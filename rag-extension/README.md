# RAG Extension for Plum Web Assistant

This repository provides the **RAG (Retrieval Augmented Generation) extension** for the Plum Web Assistant, built in Python. It integrates retrieval techniques with generative models to process and answer user queries.

## Overview

The extension consists of two primary components:

- **main.py**: Acts as the entry point for the application. It handles receiving a user query via the chrome extension and then invokes the RAG processing logic, and outputs the generated response.
- **rag.py**: Contains the core logic for the Retrieval Augmented Generation process. It is responsible for:
  - Retrieving relevant data based on the input query.
  - Processing and integrating the retrieved information with generative techniques.
  - Producing a cohesive and comprehensive answer that merges both retrieval and generative outputs.

## Environment Variables

This extension requires two environment variables to be set:

- **GROQ_API_KEY**: This API key is necessary for accessing GROQ services, which facilitate the retrieval part of the process.
- **HUGGINGFACE_API_KEY**: This API key is used for connecting with Hugging Face services, enabling the generative aspects.

Ensure that these variables are properly configured in your environment before running the extension.

## Usage

To use the extension, first run the `main.py` script to start the API. Then, navigate to the Plum Extension, where you can interact with a user-friendly interface to get answers to your queries. The script processes each query using the logic in `rag.py`, retrieving relevant information and generating accurate responses.

## Dependencies

The extension requires Python 3 and depends on external services for both data retrieval and generation. Make sure you have all the necessary packages installed. Future enhancements may include a `requirements.txt` file to streamline dependency management.

## Contributing

Contributions are welcome! If you have suggestions, improvements, or bug fixes, please open an issue or submit a pull request. Follow the repository’s contribution guidelines to ensure consistency.

## License

This project is currently provided as-is. If you plan to distribute or open source the project, please include an appropriate license.

---

Happy coding with the RAG Extension for Plum Web Assistant!
