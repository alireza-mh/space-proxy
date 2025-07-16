#!/usr/bin/env node
import { spawn } from 'child_process';
import chalk from 'chalk';

const PORT = process.argv[2] || process.env.PORT || 6060;

console.log(
	chalk.hex('#FF6600').bold(`
🚀 SIMPLE CLOUDFLARE TUNNEL (DNS Workaround)
============================================`)
);

console.log(chalk.cyan(`Starting tunnel for http://localhost:${PORT}`));
console.log(
	chalk.gray(
		'This version includes DNS workarounds for problematic networks\n'
	)
);

// Try different tunnel configurations in order
const configs = [
	{
		name: 'US Region with IPv4',
		args: [
			'tunnel',
			'--url',
			`http://localhost:${PORT}`,
			'--region',
			'us',
			'--edge-ip-version',
			'4'
		]
	},
	{
		name: 'EU Region with IPv4',
		args: [
			'tunnel',
			'--url',
			`http://localhost:${PORT}`,
			'--region',
			'eu',
			'--edge-ip-version',
			'4'
		]
	},
	{
		name: 'Basic tunnel',
		args: ['tunnel', '--url', `http://localhost:${PORT}`]
	}
];

async function tryTunnel(config, index) {
	return new Promise((resolve, reject) => {
		console.log(chalk.blue(`\n🔄 Attempt ${index + 1}: ${config.name}`));

		const tunnel = spawn('cloudflared', config.args, {
			stdio: ['inherit', 'pipe', 'pipe']
		});

		let foundUrl = false;
		let timeout;

		// Set timeout for this attempt
		timeout = setTimeout(() => {
			console.log(
				chalk.yellow('   ⏱️  Timeout - trying next configuration...')
			);
			tunnel.kill('SIGINT');
			reject(new Error('Timeout'));
		}, 30000); // 30 second timeout

		tunnel.stdout.on('data', data => {
			const output = data.toString();

			const urlMatch = output.match(
				/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/
			);
			if (urlMatch && !foundUrl) {
				foundUrl = true;
				clearTimeout(timeout);
				const url = urlMatch[0];

				console.log(
					chalk.green.bold('\n🎉 SUCCESS! Tunnel established:')
				);
				console.log(chalk.hex('#FF6600').bold(`\n   ${url}\n`));
				console.log(chalk.gray('   → Press Ctrl+C to stop'));
				console.log(chalk.gray('   → Keep this terminal open\n'));

				resolve(tunnel);
				return;
			}
		});

		tunnel.stderr.on('data', data => {
			const output = data.toString();
			if (
				output.includes('DNS query failed') ||
				output.includes('lookup')
			) {
				console.log(chalk.red('   ❌ DNS resolution failed'));
				tunnel.kill('SIGINT');
				reject(new Error('DNS failed'));
			}
		});

		tunnel.on('close', code => {
			clearTimeout(timeout);
			if (!foundUrl) {
				reject(new Error(`Tunnel closed with code ${code}`));
			}
		});

		// Handle successful connection
		tunnel.on('spawn', () => {
			console.log(chalk.gray('   → Connecting...'));
		});
	});
}

async function startTunnel() {
	console.log(chalk.blue('🔍 Checking if local server is running...'));

	// Check if local server is up
	try {
		const { default: fetch } = await import('node-fetch');
		await fetch(`http://localhost:${PORT}`, { timeout: 3000 });
		console.log(chalk.green('   ✅ Local server is responding\n'));
	} catch (error) {
		console.log(chalk.yellow('   ⚠️  Cannot reach local server'));
		console.log(
			chalk.gray('     Make sure to start your app first: npm start\n')
		);
	}

	// Try each configuration
	for (let i = 0; i < configs.length; i++) {
		try {
			const tunnel = await tryTunnel(configs[i], i);

			// If we get here, tunnel is working
			process.on('SIGINT', () => {
				console.log(chalk.yellow('\n🛑 Stopping tunnel...'));
				tunnel.kill('SIGINT');
				process.exit(0);
			});

			return; // Success, exit the loop
		} catch (error) {
			if (i === configs.length - 1) {
				// Last attempt failed
				console.log(
					chalk.red('\n❌ All tunnel configurations failed!')
				);
				console.log(chalk.yellow('\n🔧 Try these solutions:'));
				console.log(chalk.white('   1. Run: npm run diagnose-tunnel'));
				console.log(
					chalk.white('   2. Check DNS: nslookup cloudflare.com')
				);
				console.log(
					chalk.white(
						'   3. Switch DNS: echo "nameserver 1.1.1.1" | sudo tee /etc/resolv.conf'
					)
				);
				console.log(
					chalk.white('   4. Check firewall: sudo ufw status')
				);
				process.exit(1);
			}
			// Continue to next configuration
		}
	}
}

startTunnel().catch(console.error);
