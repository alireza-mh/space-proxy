# 🚀 Cloudflare Tunnel Integration for Space

**Get your Space app online instantly with FREE HTTPS!**

No domain needed - get automatic `.trycloudflare.com` URLs with valid SSL certificates that work perfectly with proxy pages.

---

## ✨ **What's Included**

✅ **Automatic HTTPS** - Valid SSL certificates, no browser warnings  
✅ **No Domain Required** - Free `.trycloudflare.com` subdomains  
✅ **Proxy Compatible** - Works with all proxy scenarios (no more cert failures!)  
✅ **Zero Firewall Config** - Outbound-only connections  
✅ **Auto-Installation** - Installs `cloudflared` automatically  
✅ **One-Command Setup** - Start app + tunnel together  

---

## 🎯 **Quick Start (30 seconds)**

### **Option 1: Start Everything Together (Recommended)**
```bash
npm run start-tunnel
```

This will:
1. Start your Space app on `http://localhost:6060`
2. Auto-install `cloudflared` (if needed)
3. Create a tunnel with URL like `https://abc123.trycloudflare.com`
4. Show you the live URL to share

### **Option 2: Separate Commands**
```bash
# Terminal 1: Start your app
npm start

# Terminal 2: Start tunnel only
npm run tunnel
```

---

## 📱 **Usage Examples**

### **For Development**
```bash
# Start with default port (6060)
npm run start-tunnel

# Start with custom port
PORT=8080 npm run start-tunnel
```

### **For Sharing with Clients**
```bash
npm run start-tunnel
# Share the https://xyz.trycloudflare.com URL - it's secure and works everywhere!
```

### **For Webhook Testing**
```bash
npm run start-tunnel
# Use the tunnel URL for webhook endpoints - no more ngrok needed!
```

---

## 🔧 **Supported Platforms**

- ✅ **Linux** (Ubuntu, Debian, CentOS, etc.) - Auto-installs via wget
- ✅ **macOS** - Auto-installs via Homebrew
- ❌ **Windows** - Manual installation required ([Download here](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/))

---

## 🛠️ **Manual Setup (if auto-install fails)**

### **Ubuntu/Debian**
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

### **macOS**
```bash
brew install cloudflared
```

### **Other Linux Distributions**
```bash
# Download binary
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
```

---

## 🔍 **What Happens Behind the Scenes**

1. **App Starts** → Your Space app runs on `localhost:6060`
2. **Tunnel Connects** → `cloudflared` creates secure connection to Cloudflare
3. **URL Generated** → You get `https://random-name.trycloudflare.com`
4. **Traffic Routes** → Internet → Cloudflare → Your App

### **Security Model**
- ✅ **Only specified port tunneled** (6060) - everything else stays private
- ✅ **Outbound connections only** - no firewall ports opened
- ✅ **HTTPS encryption** - all traffic encrypted end-to-end
- ✅ **Your server IP unchanged** - other services work exactly the same

---

## 📋 **Troubleshooting**

### **Tunnel won't start**
```bash
# Check if cloudflared is installed
cloudflared --version

# Manual installation if needed
npm run tunnel --help
```

### **App not accessible through tunnel**
```bash
# Verify app is running locally first
curl http://localhost:6060

# Check if trust proxy is enabled (should be automatic)
grep "trust proxy" index.js
```

### **Permission denied during installation**
```bash
# Run with elevated privileges
sudo npm run start-tunnel
```

### **Port already in use**
```bash
# Use different port
PORT=8080 npm run start-tunnel
```

---

## 🌟 **Advanced Usage**

### **Environment Variables**
```bash
# Custom port
PORT=3000 npm run start-tunnel

# Custom tunnel arguments (if you know what you're doing)
TUNNEL_ARGS="--loglevel debug" npm run tunnel
```

### **Multiple Tunnels**
```bash
# Terminal 1: Main app
PORT=6060 npm run start-tunnel

# Terminal 2: Admin panel  
PORT=8080 npm run tunnel

# Terminal 3: API server
PORT=3000 npm run tunnel
```

Each gets its own `.trycloudflare.com` URL!

---

## 🚫 **Limitations of Free Tunnels**

- ⚠️ **Random URLs** - Changes each time you restart
- ⚠️ **No uptime guarantee** - For testing/development only  
- ⚠️ **Session based** - Tunnel stops when you close terminal

### **For Production Use:**
Consider [Cloudflare Tunnel with named domains](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/create-tunnel/) for:
- Fixed URLs that don't change
- Better uptime guarantees  
- Custom domain names
- Team management features

---

## 💡 **Tips & Best Practices**

### **For Development**
- Use `npm run start-tunnel` for quick testing
- Share tunnel URLs with team members instantly
- Perfect for webhook development and testing

### **For Demos**
- Tunnel URL works immediately - no DNS propagation wait
- HTTPS works out of the box - no certificate warnings
- Share with clients without exposing your real IP

### **For Proxy Testing**
- All proxy functionality now works (no more cert errors!)
- WebSocket connections supported
- CORS issues resolved with valid SSL

---

## 🔗 **Useful Commands**

```bash
# Start everything (app + tunnel)
npm run start-tunnel

# Start tunnel only (app must be running)
npm run tunnel

# Start app only (traditional way)
npm start

# Check if cloudflared is installed
cloudflared --version

# Stop tunnel (Ctrl+C in tunnel terminal)
# Stop everything (Ctrl+C in start-tunnel terminal)
```

---

## 🆘 **Need Help?**

1. **Check the logs** - The tunnel script shows helpful error messages
2. **Verify local app works** - Visit `http://localhost:6060` first
3. **Check firewall** - Make sure outbound HTTPS (443) is allowed
4. **Try manual installation** - If auto-install fails, install cloudflared manually

---

## 🎉 **You're Ready!**

Run `npm run start-tunnel` and start sharing your Space app with the world! 

Your proxy pages will now work perfectly with valid HTTPS certificates. No more browser warnings, no more mixed content errors, and no more certificate validation failures! 🚀 