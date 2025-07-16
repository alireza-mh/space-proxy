# SSL Setup Guide

This guide will help you set up SSL certificates for your server when accessing it via IP address.

## Prerequisites

Make sure you have OpenSSL installed on your system:

- **macOS**: `brew install openssl`
- **Ubuntu/Debian**: `sudo apt-get install openssl`
- **Windows**: Download from [Win32OpenSSL](https://slproweb.com/products/Win32OpenSSL.html)

## Quick Setup

1. **Generate SSL Certificate for your IP address:**
   ```bash
   npm run generate-ssl YOUR_SERVER_IP
   ```
   
   Example:
   ```bash
   npm run generate-ssl 192.168.1.100
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

The server will now run on both HTTP and HTTPS:
- HTTP: `http://YOUR_IP:6060`
- HTTPS: `https://YOUR_IP:6443`

## Custom Ports

You can customize the ports using environment variables:

```bash
PORT=8080 HTTPS_PORT=8443 npm start
```

## Browser Security Warnings

Since this is a self-signed certificate, browsers will show security warnings. To bypass these:

### Chrome/Edge
1. Click "Advanced" on the security warning page
2. Click "Proceed to [YOUR_IP] (unsafe)"

### Firefox
1. Click "Advanced"
2. Click "Accept the Risk and Continue"

### Trust the Certificate (Recommended)

#### macOS
```bash
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain certs/server.crt
```

#### Windows
1. Open `certs/server.crt` in Windows Explorer
2. Click "Install Certificate"
3. Choose "Local Machine" → "Place all certificates in the following store"
4. Select "Trusted Root Certification Authorities"

#### Linux
```bash
sudo cp certs/server.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates
```

## Certificate Details

- **Location**: `certs/` directory
- **Certificate**: `server.crt`
- **Private Key**: `server.key`
- **Validity**: 365 days
- **Supported IPs**: Your specified IP + 127.0.0.1 + ::1
- **Supported Names**: localhost

## Troubleshooting

### OpenSSL Not Found
Make sure OpenSSL is installed and available in your PATH.

### Permission Denied
On some systems, you might need to run the certificate generation with elevated privileges:
```bash
sudo npm run generate-ssl YOUR_IP
```

### Certificate Not Working
1. Ensure the IP address matches exactly
2. Clear browser cache and cookies
3. Restart the server after generating certificates
4. Check that both `server.crt` and `server.key` exist in the `certs/` directory

## Security Notes

- These are self-signed certificates for development/internal use
- For production, use certificates from a trusted Certificate Authority
- The private key is not password protected for ease of use
- Keep the `certs/` directory secure and don't commit it to version control 