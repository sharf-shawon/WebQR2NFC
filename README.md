# QR to NFC Writer

## Overview
The QR to NFC Writer is a single html page that application allows users to scan QR codes and write the decoded information onto NFC tags, immediately. This page was designed with efficiency and speed in mind. This tool is particularly useful for transferring mass quantity of data from QR codes to NFC-enabled devices (For example, Digital NFC Business Cards) quickly and seamlessly. 

## Features
- **QR Code Scanning**: Uses the device's (back) camera to scan QR codes.
- **NFC Writing**: Writes the scanned QR code data to NFC tags.
- **Permission Management**: Handles camera and NFC permissions gracefully.
- **Scan History**: Maintains a history of scanned QR codes, saved to local storage.
- **Theme Selector**: Allows users to switch between light and dark themes.

## How It Works
1. **QR Code Scanning**:
   - The application uses the `Html5Qrcode` library to scan QR codes via the device's camera.
   - Once a QR code is scanned, the decoded text is displayed and prepared for NFC writing.

2. **NFC Writing**:
   - The application uses the Web NFC API to write the scanned QR code data to an NFC tag.
   - If NFC is not supported on the device, the application notifies the user.

3. **Permissions**:
   - The application checks and requests permissions for the camera and NFC functionalities.
   - If permissions are denied, the user is notified with appropriate messages.

4. **User Interface**:
   - The application provides a clean and responsive interface with status updates, scan history, and a theme selector.

## Getting Started

### Requirements
- An android device with a camera and NFC support. 
- A modern web browser that supports the Web NFC API (e.g., Chrome on Android).
- HTTPS required if serving over the internet.

### Running the Application
1. Open the `index.html` file in a supported web browser.
2. Grant camera and NFC permissions when prompted.
3. Use the application to scan QR codes and write the data to NFC tags.

### Controls
- **QR Scanner**: The scanner area is displayed on the main page. Point your camera at a QR code to scan it.
- **NFC Writing**: After scanning a QR code, approach an NFC tag to write the data.
- **Reset Button**: Clears the scan history and resets the counter.
- **Theme Selector**: Located in the navbar, allows switching between light and dark themes.

## Running with Docker

To quickly set up and run the application using Docker, follow these steps:

1. **Build the Docker Image**:
   ```bash
   docker build -t webqr2nfc .
   ```

2. **Run the Docker Container**:
   ```bash
   docker run -d -p 8080:80 webqr2nfc
   ```

   This will start the application and make it accessible at `http://localhost:8080`.

## Running with Docker Compose

Alternatively, you can use Docker Compose for setup:

1. **Start the Application**:
   ```bash
   docker-compose up -d
   ```

   This will build the image (if not already built) and start the application.

2. **Access the Application**:
   Open your browser and navigate to `http://localhost:8080`.

## File Structure
- `index.html`: The main HTML file for the application.
- `asset/qr2nfc.js`: Contains the JavaScript logic for QR scanning, NFC writing, and permission management.
- `asset/html5-qrcode.min.js`: Library for QR code scanning.
- `asset/success.mp3`: Audio file played on successful NFC writing.
- `asset/waiting.mp3`: Audio file played while waiting for NFC interaction.

## Limitations
- The Web NFC API is not supported on all devices and browsers. NFC supported Android phone is required, as iOS devices don't support Web NFC API.
- Requires user permissions for camera and NFC functionalities.


## License
This project is licensed under the MIT License. See the LICENSE file for details.