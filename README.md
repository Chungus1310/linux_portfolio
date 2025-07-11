# 🐧 Linux Portfolio Terminal

<div align="center">

```
 ██████╗██╗  ██╗██╗   ██╗███╗   ██╗    ██████╗  ██████╗ ██████╗ ████████╗
██╔════╝██║  ██║██║   ██║████╗  ██║    ██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝
██║     ███████║██║   ██║██╔██╗ ██║    ██████╔╝██║   ██║██████╔╝   ██║   
██║     ██╔══██║██║   ██║██║╚██╗██║    ██╔═══╝ ██║   ██║██╔══██╗   ██║   
╚██████╗██║  ██║╚██████╔╝██║ ╚████║    ██║     ╚██████╔╝██║  ██║   ██║   
 ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝    ╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   
```

**🚀 A customizable Linux-themed portfolio terminal for developers**

[![License: MIT](https://img.shields.io/badge/License-MIT-00FF41.svg?style=for-the-badge&logo=opensource&logoColor=white)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

[📖 Documentation](https://github.com/chungus1310/linux_portfolio/wiki) • [🐛 Report Bug](https://github.com/chungus1310/linux_portfolio/issues) • [💡 Request Feature](https://github.com/chungus1310/linux_portfolio/issues)

</div>

---

## 🎯 Overview

Transform your portfolio into an **authentic Linux terminal experience**! This template provides a fully functional terminal-style portfolio website that's perfect for developers, cybersecurity professionals, and tech enthusiasts who want to showcase their skills with style.

<div align="center">

### ✨ **What Makes This Special?**

</div>

<table>
<tr>
<td width="50%">

**🖥️ Authentic Terminal UI**
- Real-time typing effects
- Command execution
- File navigation

**🛡️ Kali Linux Theme**
- Matrix background
- Green terminal colors
- Hacker aesthetics

</td>
<td width="50%">

**📁 File System Navigation**
- Browse portfolio like Linux directory
- Interactive file exploration

**⚡ Lightning Fast**
- Optimized TypeScript + Webpack
- Hot reloading support

</td>
</tr>
</table>

> **🎨 Fully Customizable** - Change everything by editing simple JSON files  
> **📱 Responsive Design** - Works perfectly on desktop, tablet, and mobile

---

## 🚀 Quick Start

<details>
<summary><strong>📋 Prerequisites</strong></summary>

- Node.js (v14 or higher)
- npm or yarn package manager
- Modern web browser

</details>

```bash
# 📥 Clone the repository
git clone https://github.com/chungus1310/linux_portfolio.git
cd linux_portfolio

# 📦 Install dependencies
npm install

# 🚀 Start development server
npm run dev

# 🌐 Visit your portfolio
open http://localhost:3000
```

<div align="center">

**🎉 That's it! Your terminal portfolio is now running!**

</div>

---

## 🛠️ Customization Made Easy

<div align="center">

### 🔧 **Four Simple Steps to Make It Yours**

</div>

<details>
<summary><strong>📋 Step 1: Update Your Information</strong></summary>

Edit `public/data/portfolio-config.json` to customize the file structure:

```json
{
  "navigation": {
    "about": {
      "type": "directory",
      "children": {
        "bio.txt": {
          "content": {
            "type": "text",
            "data": "Your awesome bio here!"
          }
        }
      }
    }
  }
}
```

</details>

<details>
<summary><strong>🎨 Step 2: Add Your Projects</strong></summary>

Update `public/data/projects.json` with your actual projects:

```json
{
  "project_awesome_app": {
    "title": "My Awesome App",
    "description": "A game-changing application that...",
    "technologies": ["React", "Node.js", "MongoDB"],
    "github": "https://github.com/yourusername/awesome-app",
    "demo": "https://awesome-app.example.com"
  }
}
```

</details>

<details>
<summary><strong>🎯 Step 3: Customize Theme Colors</strong></summary>

Modify CSS variables in `src/styles/main.scss`:

```scss
:root {
  --color-primary: #00FF41;    // Matrix green
  --color-secondary: #39FF14;  // Bright green
  --color-background: #0D1117; // Dark background
  // ... customize any color you want!
}
```

</details>

<details>
<summary><strong>🖼️ Step 4: Change the ASCII Art</strong></summary>

You can personalize the terminal header by editing the ASCII art in `src/components/PortfolioApp.ts`. Replace the default ASCII block with your own design to make your portfolio unique.

</details>

---

## 📁 Project Structure

```
linux_portfolio/
├── 🗂️ public/data/          # Your portfolio data (JSON files)
│   ├── portfolio-config.json # File structure & navigation
│   └── projects.json         # Projects, skills, experience
├── 🎨 src/
│   ├── components/           # UI components
│   ├── animations/           # Terminal effects & typing
│   ├── services/            # Data loading & API calls
│   └── styles/              # SCSS styling
├── 🖥️ server/               # Express.js backend
└── 📦 dist/                 # Built files
```

---

## 🎮 Terminal Commands

<div align="center">

**Your portfolio supports real terminal commands:**

</div>

| Command | Description | Example |
|---------|-------------|---------|
| `ls` | 📂 List directory contents | `ls /home/user/projects` |
| `cd` | 🔀 Change directory | `cd projects/web-development` |
| `cat` | 📄 Display file contents | `cat about/bio.txt` |
| `find` | 🔍 Search for content | `find react` |
| `help` | ❓ Show available commands | `help` |
| `clear` | 🧹 Clear terminal | `clear` |

---

## 🔧 Development

<div align="center">

### **Available Scripts**

</div>

| Command | Description |
|---------|-------------|
| `npm run dev` | 🚀 Start development servers |
| `npm run build` | 📦 Build for production |
| `npm run dev:client` | 🖥️ Client-only development |
| `npm run dev:server` | 🖧 Server-only development |

<div align="center">

### **Tech Stack**

</div>

<div align="center">

![Frontend](https://img.shields.io/badge/Frontend-TypeScript%20%7C%20Webpack%20%7C%20SCSS-blue?style=for-the-badge)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express.js-green?style=for-the-badge)
![Features](https://img.shields.io/badge/Features-Animations%20%7C%20Matrix%20Background-purple?style=for-the-badge)

</div>

---

## 🎨 Customization Examples

<details>
<summary><strong>➕ Add a New Section</strong></summary>

1. **Update portfolio-config.json:**
```json
"certifications": {
  "type": "directory",
  "name": "certifications",
  "children": {
    "aws-solutions-architect.pdf": {
      "type": "file",
      "content": { "type": "text", "data": "AWS Certified Solutions Architect" }
    }
  }
}
```

2. **Add data to projects.json if needed**

3. **Restart dev server** - Changes are automatically detected!

</details>

<details>
<summary><strong>🎨 Change Terminal Colors</strong></summary>

```scss
// Make it blue-themed instead of green
:root {
  --color-primary: #0099FF;
  --color-secondary: #00CCFF;
  --color-accent: #FF6B35;
}
```

</details>

<details>
<summary><strong>🔗 Add Your Social Links</strong></summary>

Update the social-links section in `portfolio-config.json`:

```json
"social-links.json": {
  "content": {
    "type": "json",
    "data": {
      "github": {
        "url": "https://github.com/yourusername",
        "display": "@yourusername"
      },
      "linkedin": {
        "url": "https://linkedin.com/in/yourprofile",
        "display": "Your Name"
      }
    }
  }
}
```

</details>

---

## 🚀 Deployment

<div align="center">

### **Choose Your Deployment Strategy**

</div>

<details>
<summary><strong>🌐 Static Hosting (Recommended)</strong></summary>

```bash
# Build for production
npm run build

# Deploy the dist/ folder to:
# - Vercel, Netlify, GitHub Pages
# - Any static hosting service
```

**Perfect for:** GitHub Pages, Vercel, Netlify

</details>

<details>
<summary><strong>🖥️ Full-Stack Deployment</strong></summary>

```bash
# For platforms like Heroku, Railway, or VPS
# Both client and server are included
npm start
```

**Perfect for:** Heroku, Railway, DigitalOcean

</details>

---

## 🤝 Contributing

<div align="center">

**Found a bug? Want to add a feature? Contributions are welcome!**

[![Contributors](https://img.shields.io/github/contributors/chungus1310/linux_portfolio?style=for-the-badge)](https://github.com/chungus1310/linux_portfolio/graphs/contributors)
[![Issues](https://img.shields.io/github/issues/chungus1310/linux_portfolio?style=for-the-badge)](https://github.com/chungus1310/linux_portfolio/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/chungus1310/linux_portfolio?style=for-the-badge)](https://github.com/chungus1310/linux_portfolio/pulls)

</div>

```bash
# Fork the repo, make changes, then:
git checkout -b feature/awesome-addition
git commit -m "Add awesome feature"
git push origin feature/awesome-addition
# Create a Pull Request
```

---

## 📄 License

<div align="center">

[![License](https://img.shields.io/badge/License-MIT-00FF41.svg?style=for-the-badge&logo=opensource&logoColor=white)](https://opensource.org/licenses/MIT)

**MIT License** - feel free to use this template for your own portfolio!

</div>

---

## 🙏 Credits

<div align="center">

**Created with ❤️ by [Chun](https://github.com/chungus1310)**

*Special thanks to the Matrix digital rain inspiration, Linux terminal aesthetics, and the amazing open source community*

</div>

---

## 🆘 Need Help?

<div align="center">

| Resource | Description |
|----------|-------------|
| 📖 **[Examples](public/data/)** | Check reference files for guidance |
| 🐛 **[Issues](https://github.com/chungus1310/linux_portfolio/issues)** | Report bugs and problems |
| 💬 **[Discussions](https://github.com/chungus1310/linux_portfolio/discussions)** | Get community support |
| ⭐ **[Star this repo](https://github.com/chungus1310/linux_portfolio)** | Show your support! |

</div>

---

<div align="center">

**🚀 Ready to build your terminal masterpiece?**

[![Get Started](https://img.shields.io/badge/Get%20Started-00FF41?style=for-the-badge&logo=github&logoColor=white)](https://github.com/chungus1310/linux_portfolio/fork)

*Made with 💚 and lots of ☕*

</div>
