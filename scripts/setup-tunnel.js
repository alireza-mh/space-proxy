#!/usr/bin/env node
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(
	chalk.hex('#FF6600').bold(`
╔═══════════════════════════════════════════════════════════╗
║              🚀 CLOUDFLARE TUNNEL SETUP                 ║
║                                                           ║
║  Get your app online instantly with FREE HTTPS!          ║
║  No domain needed - automatic .trycloudflare.com URL     ║
╚═══════════════════════════════════════════════════════════╝
`)
);

const PORT = process.argv[2] || process.env.PORT || 6060;

// Check if cloudflared is installed
function isCloudflaredInstalled() {
	try {
		execSync('cloudflared --version', { stdio: 'pipe' });
		return true;
	} catch {
		return false;
	}
}

// Install cloudflared
function installCloudflared() {
	console.log(chalk.yellow('📦 Installing cloudflared...'));

	try {
		const platform = process.platform;

		if (platform === 'darwin') {
			console.log('  → Using Homebrew for macOS...');
			execSync('brew install cloudflared', { stdio: 'inherit' });
		} else if (platform === 'linux') {
			console.log('  → Downloading for Linux...');
			execSync(
				'wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -O /tmp/cloudflared.deb',
				{ stdio: 'inherit' }
			);
			execSync('sudo dpkg -i /tmp/cloudflared.deb', { stdio: 'inherit' });
			execSync('rm /tmp/cloudflared.deb', { stdio: 'pipe' });
		} else if (platform === 'win32') {
			console.log(
				chalk.red('  ❌ Windows detected. Please install manually:')
			);
			console.log(
				chalk.white(
					'     https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/'
				)
			);
			process.exit(1);
		} else {
			console.log(chalk.red(`  ❌ Unsupported platform: ${platform}`));
			console.log(
				chalk.white('     Please install cloudflared manually from:')
			);
			console.log(
				chalk.white(
					'     https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/'
				)
			);
			process.exit(1);
		}

		console.log(chalk.green('  ✅ cloudflared installed successfully!'));
	} catch (error) {
		console.error(
			chalk.red('  ❌ Failed to install cloudflared:'),
			error.message
		);
		console.log(chalk.yellow('\n📖 Manual installation instructions:'));
		console.log(
			chalk.white(
				'  Linux: wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb && sudo dpkg -i cloudflared-linux-amd64.deb'
			)
		);
		console.log(chalk.white('  macOS: brew install cloudflared'));
		console.log(
			chalk.white(
				'  Windows: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/'
			)
		);
		process.exit(1);
	}
}

// Start the tunnel
function startTunnel() {
	console.log(chalk.cyan('\n🌐 Starting Cloudflare Tunnel...'));
	console.log(chalk.gray(`   Tunneling http://localhost:${PORT}`));
	console.log(chalk.gray('   Press Ctrl+C to stop the tunnel\n'));

	try {
		// Start tunnel with better output handling
		const tunnel = spawn(
			'cloudflared',
			['tunnel', '--url', `http://localhost:${PORT}`],
			{
				stdio: ['inherit', 'pipe', 'pipe']
			}
		);

		let foundUrl = false;

		tunnel.stdout.on('data', data => {
			const output = data.toString();

			// Look for the tunnel URL
			const urlMatch = output.match(
				/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/
			);
			if (urlMatch && !foundUrl) {
				foundUrl = true;
				const url = urlMatch[0];
				console.log(
					chalk.green.bold('\n🎉 SUCCESS! Your app is now live at:')
				);
				console.log(chalk.hex('#FF6600').bold(`\n   ${url}\n`));
				console.log(
					chalk.gray('   → Valid HTTPS certificate included')
				);
				console.log(chalk.gray('   → Works with all proxy scenarios'));
				console.log(chalk.gray('   → Share this URL with anyone!\n'));
				console.log(
					chalk.yellow(
						'⚠️  Keep this terminal open to maintain the tunnel'
					)
				);
				console.log(chalk.gray('   Press Ctrl+C to stop\n'));
			}

			// Show other important messages
			if (output.includes('ERR') || output.includes('WARN')) {
				console.log(chalk.red(output.trim()));
			}
		});

		tunnel.stderr.on('data', data => {
			const output = data.toString();
			if (!output.includes('Thank you for trying')) {
				console.log(chalk.red(output.trim()));
			}
		});

		tunnel.on('close', code => {
			if (code === 0) {
				console.log(chalk.green('\n✅ Tunnel closed successfully'));
			} else {
				console.log(chalk.red(`\n❌ Tunnel closed with code ${code}`));
			}
		});

		// Handle graceful shutdown
		process.on('SIGINT', () => {
			console.log(chalk.yellow('\n🛑 Stopping tunnel...'));
			tunnel.kill('SIGINT');
			process.exit(0);
		});
	} catch (error) {
		console.error(chalk.red('\n❌ Failed to start tunnel:'), error.message);
		console.log(chalk.yellow('\n🔧 Troubleshooting:'));
		console.log(
			chalk.white('  1. Make sure your app is running on port', PORT)
		);
		console.log(
			chalk.white('  2. Try running: npm start (in another terminal)')
		);
		console.log(
			chalk.white(
				'  3. Check if cloudflared is installed: cloudflared --version'
			)
		);
		process.exit(1);
	}
}

// Main execution
async function main() {
	console.log(chalk.blue(`🔍 Checking if cloudflared is installed...`));

	if (!isCloudflaredInstalled()) {
		console.log(chalk.yellow('  → cloudflared not found, installing...'));
		installCloudflared();
	} else {
		console.log(chalk.green('  ✅ cloudflared is already installed!'));
	}

	console.log(chalk.blue(`\n🚀 Starting tunnel for port ${PORT}...`));
	console.log(chalk.gray('   Make sure your Node.js app is running first!'));

	// Check if local server is responding
	try {
		const { default: fetch } = await import('node-fetch');
		const response = await fetch(`http://localhost:${PORT}`, {
			timeout: 3000
		});
		console.log(chalk.green('  ✅ Local server is responding'));
	} catch (error) {
		console.log(chalk.yellow('  ⚠️  Cannot reach local server'));
		console.log(
			chalk.gray(
				'     Starting tunnel anyway - make sure to start your app!'
			)
		);
	}

	startTunnel();
}

main().catch(console.error);
