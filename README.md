<img width="1920" height="1080" alt="Screenshot 2025-07-30 030342" src="https://github.com/user-attachments/assets/8fb3d299-d087-4672-96fb-3f38f41ca7ca" />📌 1. Tab-Title-Picker – Chrome Extension
markdown
Copy
Edit
# Tab Title Picker – Chrome Extension

A simple Chrome Extension that allows users to capture and display the title of the currently active browser tab at the click of a button.

## 🚀 Features

- Detects and displays the title of the current tab
- Clean popup UI
- Built with manifest v3

## 📁 Project Structure

Tab-Title-Picker/
├── popup.html
├── popup.js
├── styles.css
├── manifest.json

bash
Copy
Edit

## 🛠️ Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/satyam-thakur029/Tab-Title-Picker.git
Open Chrome and go to chrome://extensions.

Enable Developer mode.

Click Load unpacked and select the project folder.

The extension icon will appear on the Chrome toolbar.

📸 Usage
Click on the extension icon.

It will fetch and display the current tab title instantly.

📄 License
MIT License

yaml
Copy
Edit

---

## 📌 2. **LinkedIn Profile Scraper – Chrome Extension + Node.js Backend**

```markdown
# LinkedIn Profile Scraper

A Chrome Extension and Node.js backend app that scrapes key data from public LinkedIn profiles and stores it into a database using Sequelize and SQLite.

## 🧠 What It Does

- Scrapes LinkedIn profile data:
  - Name
  - Location
  - About section
  - Bio line
  - Follower count
  - Connection count
- Sends the scraped data to a Node.js backend via POST API
- Automatically opens and scrapes multiple LinkedIn profiles

> ⚠️ **Note:** You must be logged into LinkedIn manually before using the extension.

## 🧩 Technologies Used

- **Frontend:** Chrome Extension (Manifest v3, HTML, JS)
- **Backend:** Node.js + Express + Sequelize + SQLite

## 🧱 Folder Structure

LinkedIn-Profile-Scraper/
├── extension/
│ ├── popup.html
│ ├── popup.js
│ ├── content.js
│ ├── background.js
│ ├── manifest.json
│ └── styles.css
└── server/
├─package-lock.json
│─ profile.sqlite
├── linkedin_profiles.db
├── server.js
└── package.json

bash
Copy
Edit

## 📦 Backend Setup

```bash
cd server
npm install
node server.js
The server will run at http://localhost:3000.

🔌 API
POST /api/profiles
json
Copy
Edit
{
  "name": "John Doe",
  "location": "San Francisco",
  "about": "...",
  "bio": "...",
  "followers": 500,
  "connections": 800,
  "url": "https://linkedin.com/in/..."
}
🛠️ How to Use
Start your backend server.

Manually log into LinkedIn.

Load the Chrome Extension in chrome://extensions.

In the popup, paste at least 3 LinkedIn profile URLs.

Click Start Scraping – It will:

Open each profile in a background tab

Extract data using content.js

Send it to your Node.js API

📸 Screenshot
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/212887b3-4efe-48bd-8f69-332fccb1db66" />

![Uploading Screenshot 2025-07-30 030342.png…]()


📄 License
MIT License

yaml
Copy
Edit

---

Let me know if you want me to add screenshots, badges, or instructions for deploying to production.
