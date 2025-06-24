# LDoLens – LDo Forum Comment Filter

<p align="center">   <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">&nbsp;&nbsp;   <a href="README.md">     <img src="https://img.shields.io/badge/切换语言-中文-blue" alt="Switch Language">   </a> </p>

------

## Introduction

**LDoLens** is a Chrome extension specifically designed for the LinuxDo forum. It allows you to filter and focus on comments from users you care about within forum threads, so you “see only what you want,” making browsing more efficient.

- Filter all comments by user(s) of your choice on LDo topics (https://linux.do/).
- Customize the user filter list; turn filtering on/off at any time.
- Simple setup, lightweight UI, and automatic settings saving.

------

## Installation

### Method 1: Download the Release Package (Recommended)

1. Go to the [GitHub Releases page](https://github.com/YumingMa-CN/LDoLens/releases) and download the `.crx` file (or get the [latest release here](https://github.com/YumingMa-CN/LDoLens/releases/latest)).
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode**
4. Drag and drop the downloaded `.crx` file into the extensions page to install.
5. Once installed, you'll see the LDoLens icon in your browser toolbar.

> **Note:**
>  On some Chrome versions you might see a warning about extensions not from the Chrome Web Store. Confirm the source is safe and proceed if you trust it.

------

### Method 2: Build Your Own `.crx` from Source

1. Clone or download this repository to your local machine.
2. *(Optional)* Edit or customize the code as you like.
3. Package your own `.crx` file:
   1. Open `chrome://extensions/` and enable **Developer mode**.
   2. Click "Pack extension" in the upper left.
   3. Set the "Extension root directory" to your project folder.
   4. If you don't have a private key, leave the key field blank. Chrome will automatically generate a `.pem` private key. **Keep this key safe:** use it for future updates to keep your extension ID unchanged.
   5. Install the generated `.crx` file just as described in [Method 1](#method-1-download-the-release-package-recommended), or distribute it as you like.

> After successful installation, visiting any topic page on LinuxDo will automatically show a floating panel on the right.

------

## Usage

1. On any LinuxDo topic page (`https://linux.do/t/xxxx`), click the LDoLens icon in your browser toolbar.
2. In the popup settings panel, check the usernames you want to "filter for" (supports multiple selections). **If none selected, filtering is disabled.**
3. After confirming, only comments from those users will be shown on that page; all others will be hidden.
4. You can turn filtering on/off or change the filter at any time; changes take effect immediately.

------

## Permissions

- `storage`: For saving your filter settings locally.
- `scripting`: For dynamically modifying the page content to filter comments.
- `https://linux.do/t/*`: Only runs on topic pages of the LinuxDo forum.

------

## Project Structure

```
LDoLens
├── background.js
├── content.js
├── icons
│   ├── filter-icon-128.png
│   ├── filter-icon-16.png
│   ├── filter-icon-48.png
│   └── funnel-icon.svg
├── manifest.json
├── popup.css
├── popup.html
├── popup.js
├── style.css
├── README.md
├── README-en.md
└── LICENSE
```

------

## FAQ

- Can't find the floating panel?
   Make sure you are on a topic page under `https://linux.do/t/`.
- To report bugs or give feedback, please use the [GitHub issues page](https://github.com/YumingMa-CN/LDoLens/issues) or contact the maintainer.

------

## License

MIT License

------

## Credits

Thanks to all the LinuxDo (LDo) community members for their help and testing!

------

**You can name this file `README-en.md` and link to it from the Chinese version (as you already have), so users can easily switch between languages.**
 Let me know if you want more naturalized descriptions, technical tweaks, or anything else!