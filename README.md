# 🔖 Tab Title Picker - Chrome Extension

**Tab Title Picker** is a lightweight and elegant Chrome Extension that allows users to instantly fetch and copy the title of the currently active browser tab — all with a single click.

## 🚀 Features

- 🔍 **Get Current Tab Title** instantly with one button click.
- 📋 **Copy Title** to clipboard with a single click.
- ✅ **Real-time Feedback** with animated status indicators (Loading, Success, Error).
- 🎨 **Beautiful, modern UI** built with clean CSS and Font Awesome icons.
- ⚡ **Fast & Responsive** performance with smooth animations.

---

## 🛠️ Built With

- **Chrome Extensions API (Manifest v3)**
- **JavaScript**
- **HTML5**
- **CSS3**
- **Font Awesome** (for icons)

---

## 📦 Folder Structure

tab-title-picker-extension/
│
├── manifest.json # Chrome extension config
├── popup.html # Popup UI layout
├── popup.js # Main logic for fetching and copying title
├── styles.css # Custom styles & animations
├── /images/ # Icons (16x16, 32x32, 48x48)
└── README.md # This file




---

## 📸 How It Works

1. Click the **extension icon** in Chrome.
2. A popup opens with a **"Get Current Tab Title"** button.
3. On click, it fetches the **active tab's title** using the `chrome.tabs.query()` API.
4. The title appears below the button with a **copy** icon.
5. Click the copy button to **save the title to your clipboard** using `navigator.clipboard`.

---

## 🔧 Installation

1. Clone or download this repository:
   ```bash
  [ git clone https://github.com/your-username/tab-title-picker-extension.git](https://github.com/satyam-thakur029/Tab-Title-Picker.git)


2 Open Chrome and go to:

arduino
Copy
Edit
chrome://extensions
3 Enable Developer mode (top right).

4 Click Load unpacked and select the extension folder.

5 Pin the extension in the toolbar and start using it!

🔐 Permissions Used
activeTab: Required to access the current tab’s title.

💡 Future Improvements (Optional Ideas)
Save title history in localStorage

Export tab titles to a .txt file

Auto-fetch title on popup open

Support multiple tabs

Dark mode toggle


🙋‍♂️ Author
Satyam Thakur
🚀 Full-Stack Developer | React Native | MERN Stack
📧 thakursatyam029@gmail.com
