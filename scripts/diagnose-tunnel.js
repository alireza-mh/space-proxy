#!/usr/bin/env node
import { execSync } from 'child_process';
import chalk from 'chalk';

console.log(
	chalk.hex('#FF6600').bold(`
🔍 CLOUDFLARE TUNNEL DIAGNOSTICS
================================
`)
);

async function runDiagnostics() {
	const tests = [
		{
			name: 'DNS Resolution - Google',
			command: 'nslookup google.com',
			description: 'Testing basic DNS functionality'
		},
		{
			name: 'DNS Resolution - Cloudflare',
			command: 'nslookup cloudflare.com',
			description: 'Testing Cloudflare domain resolution'
		},
		{
			name: 'DNS Resolution - Tunnel Service',
			command: 'nslookup v2-origintunneld.cloudflare.com',
			description: 'Testing tunnel service DNS'
		},
		{
			name: 'Current DNS Servers',
			command: 'cat /etc/resolv.conf',
			description: 'Checking configured DNS servers'
		},
		{
			name: 'Ping Cloudflare',
			command: 'ping -c 3 1.1.1.1',
			description: 'Testing connectivity to Cloudflare DNS'
		},
		{
			name: 'HTTPS Connectivity',
			command: 'curl -I https://api.cloudflare.com --max-time 10',
			description: 'Testing HTTPS to Cloudflare API'
		},
		{
			name: 'Check Firewall (UFW)',
			command: 'sudo ufw status',
			description: 'Checking UFW firewall status'
		}
	];

	for (const test of tests) {
		console.log(chalk.cyan(`\n📋 ${test.name}`));
		console.log(chalk.gray(`   ${test.description}`));

		try {
			const result = execSync(test.command, {
				encoding: 'utf8',
				timeout: 15000,
				stdio: 'pipe'
			});
			console.log(chalk.green('   ✅ SUCCESS'));

			// Show relevant parts of output
			const lines = result.trim().split('\n');
			if (lines.length > 5) {
				console.log(
					chalk.gray('   ' + lines.slice(0, 3).join('\n   '))
				);
				console.log(chalk.gray('   ... (truncated)'));
			} else {
				console.log(
					chalk.gray('   ' + result.trim().replace(/\n/g, '\n   '))
				);
			}
		} catch (error) {
			console.log(chalk.red('   ❌ FAILED'));
			console.log(chalk.red('   ' + error.message.split('\n')[0]));
		}
	}

	console.log(
		chalk.yellow(`
\n🔧 POTENTIAL SOLUTIONS:
========================`)
	);

	console.log(
		chalk.white(`
1. 📡 Switch DNS servers (try these commands):
   sudo systemctl stop systemd-resolved
   echo "nameserver 1.1.1.1" | sudo tee /etc/resolv.conf
   echo "nameserver 8.8.8.8" | sudo tee -a /etc/resolv.conf

2. 🔓 Check firewall settings:
   sudo ufw allow out 443
   sudo ufw allow out 53

3. 🌐 Alternative tunnel command (bypasses some DNS):
   cloudflared tunnel --url http://localhost:6060 --region us

4. 🔄 Restart network services:
   sudo systemctl restart networking
   sudo systemctl restart systemd-resolved

5. 📍 Try different region:
   cloudflared tunnel --url http://localhost:6060 --region eu

6. 🏢 If on corporate network, check with IT about:
   - Proxy settings
   - Firewall rules for *.cloudflare.com
   - DNS filtering/blocking
`)
	);

	console.log(
		chalk.cyan(`
💡 QUICK FIXES TO TRY:
======================`)
	);

	console.log(
		chalk.white(`
# Try alternative DNS:
sudo bash -c 'echo "nameserver 1.1.1.1" > /etc/resolv.conf'

# Try tunnel with specific region:
cloudflared tunnel --url http://localhost:6060 --region us

# Or try via IP (if DNS is completely broken):
cloudflared tunnel --url http://localhost:6060 --edge-ip-version 4
`)
	);
}

runDiagnostics().catch(console.error);
