import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create certs directory if it doesn't exist
const certsDir = path.join(__dirname, '..', 'certs');
if (!fs.existsSync(certsDir)) {
	fs.mkdirSync(certsDir, { recursive: true });
}

const certPath = path.join(certsDir, 'server.crt');
const keyPath = path.join(certsDir, 'server.key');
const configPath = path.join(certsDir, 'openssl.conf');

// Get server IP address (you can modify this to your specific IP)
const serverIP = process.argv[2] || '127.0.0.1';

console.log(`Generating SSL certificate for IP: ${serverIP}`);

// Create OpenSSL configuration file
const opensslConfig = `[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = State
L = City
O = Organization
OU = IT Department
CN = ${serverIP}

[v3_req]
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
IP.1 = ${serverIP}
IP.2 = 127.0.0.1
IP.3 = ::1
DNS.1 = localhost
`;

// Write OpenSSL configuration
fs.writeFileSync(configPath, opensslConfig);

try {
	// Generate private key
	console.log('Generating private key...');
	execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'inherit' });

	// Generate certificate
	console.log('Generating certificate...');
	execSync(
		`openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -config "${configPath}" -extensions v3_req`,
		{ stdio: 'inherit' }
	);

	console.log('✅ SSL certificate generated successfully!');
	console.log(`Certificate: ${certPath}`);
	console.log(`Private Key: ${keyPath}`);
	console.log(
		`\nTo trust the certificate, you may need to add it to your browser or system trust store.`
	);
} catch (error) {
	console.error('❌ Error generating SSL certificate:', error.message);
	console.log('\nPlease make sure OpenSSL is installed on your system.');
	console.log('On macOS: brew install openssl');
	console.log('On Ubuntu/Debian: sudo apt-get install openssl');
	console.log(
		'On Windows: Download from https://slproweb.com/products/Win32OpenSSL.html'
	);
}
