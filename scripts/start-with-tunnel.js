#!/usr/bin/env node
import { spawn } from 'child_process';
import chalk from 'chalk';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(
	chalk.hex('#8F00FF').bold(`
███████╗██████╗  █████╗  ██████╗███████╗    ████████╗██╗   ██╗███╗   ██╗███╗   ██╗███████╗██╗     
██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝    ╚══██╔══╝██║   ██║████╗  ██║████╗  ██║██╔════╝██║     
███████╗██████╔╝███████║██║     █████╗         ██║   ██║   ██║██╔██╗ ██║██╔██╗ ██║█████╗  ██║     
╚════██║██╔═══╝ ██╔══██║██║     ██╔══╝         ██║   ██║   ██║██║╚██╗██║██║╚██╗██║██╔══╝  ██║     
███████║██║     ██║  ██║╚██████╗███████╗       ██║   ╚██████╔╝██║ ╚████║██║ ╚████║███████╗███████╗
╚══════╝╚═╝     ╚═╝  ╚═╝ ╚═════╝╚══════╝       ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝╚══════╝
`)
);

console.log(chalk.cyan.bold('🚀 Starting Space with Cloudflare Tunnel\n'));

const PORT = process.env.PORT || 6060;
let appProcess, tunnelProcess;

// Start the Node.js application
function startApp() {
	console.log(chalk.blue('📱 Starting Node.js application...'));

	appProcess = spawn('node', ['index.js'], {
		stdio: ['inherit', 'pipe', 'pipe'],
		env: { ...process.env, PORT }
	});

	appProcess.stdout.on('data', data => {
		const output = data.toString();
		if (
			output.includes('Local System:') ||
			output.includes('On Your Network:')
		) {
			console.log(chalk.green('  ✅ Node.js app started successfully!'));
			console.log(chalk.gray(`     Running on http://localhost:${PORT}`));

			// Start tunnel after app is ready
			setTimeout(startTunnel, 2000);
		}
		// Forward other app output
		process.stdout.write(chalk.gray('[APP] ') + output);
	});

	appProcess.stderr.on('data', data => {
		process.stderr.write(chalk.red('[APP] ') + data);
	});

	appProcess.on('close', code => {
		if (code !== 0) {
			console.log(chalk.red(`❌ Node.js app exited with code ${code}`));
		}
	});
}

// Start the Cloudflare tunnel
function startTunnel() {
	console.log(chalk.cyan('\n🌐 Starting Cloudflare Tunnel...'));

	tunnelProcess = spawn(
		'node',
		[path.join(__dirname, 'setup-tunnel.js'), PORT],
		{
			stdio: ['inherit', 'pipe', 'pipe']
		}
	);

	let foundUrl = false;

	tunnelProcess.stdout.on('data', data => {
		const output = data.toString();

		// Look for success message and URL
		if (output.includes('SUCCESS! Your app is now live at:')) {
			foundUrl = true;
		}

		// Forward tunnel output with prefix
		if (output.trim()) {
			process.stdout.write(output);
		}
	});

	tunnelProcess.stderr.on('data', data => {
		const output = data.toString();
		if (!output.includes('Thank you for trying')) {
			process.stderr.write(chalk.yellow('[TUNNEL] ') + output);
		}
	});

	tunnelProcess.on('close', code => {
		if (code !== 0) {
			console.log(chalk.red(`❌ Tunnel exited with code ${code}`));
		}
	});
}

// Graceful shutdown
function cleanup() {
	console.log(chalk.yellow('\n🛑 Shutting down...'));

	if (tunnelProcess) {
		console.log(chalk.gray('  → Stopping tunnel...'));
		tunnelProcess.kill('SIGINT');
	}

	if (appProcess) {
		console.log(chalk.gray('  → Stopping app...'));
		appProcess.kill('SIGINT');
	}

	setTimeout(() => {
		console.log(chalk.green('✅ Cleanup complete'));
		process.exit(0);
	}, 1000);
}

// Handle process signals
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Handle uncaught exceptions
process.on('uncaughtException', error => {
	console.error(chalk.red('❌ Uncaught exception:'), error);
	cleanup();
});

// Start the application
console.log(chalk.blue('🔄 Initializing...'));
console.log(chalk.gray(`   Port: ${PORT}`));
console.log(chalk.gray('   Press Ctrl+C to stop both app and tunnel\n'));

startApp();
