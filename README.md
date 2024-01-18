# YouTube Video Downloader with Video Cropping

## Overview

This script, is a YouTube video downloader that leverages the YouTube Data API v3. It allows users to search for and download popular YouTube videos, excluding specific categories. The script downloads up to 10 videos, stores them in the 'videos' folder, and crops each video to a 16:9 aspect ratio, saving the cropped versions in the 'videos_cut' folder.

## Features

- Download popular YouTube videos.
- Crop videos to a 16:9 aspect ratio.
- Exclude specific YouTube categories.
- Save downloaded videos in the 'videos' folder.
- Save cropped videos in the 'videos_cut' folder.
- Avoid duplicate downloads using a tracking system.

## Prerequisites

Before using the script, make sure to:

1. Obtain a YouTube Data API key.
2. Install the required Node.js packages by running `npm install` in the terminal.

## Usage

1. Replace 'YOUR_API_KEY' in the script with your YouTube Data API key.
2. Run the script using `node quasar.cjs` in the terminal.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

Feel free to contribute to the project by reporting issues or creating pull requests.

- Nekzerd - Developer of the original script.