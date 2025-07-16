import express from 'express';
import cors from 'cors';
import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { hostname } from 'node:os';
import chalk from 'chalk';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { epoxyPath } from '@mercuryworkshop/epoxy-transport';
import { libcurlPath } from '@mercuryworkshop/libcurl-transport';
import { baremuxPath } from '@mercuryworkshop/bare-mux/node';
import { server as wisp } from '@mercuryworkshop/wisp-js/server';
import routes from './src/routes.js';

const app = express();
const __dirname = process.cwd();
const PORT = process.env.PORT || 6060;
const HTTPS_PORT = process.env.HTTPS_PORT || 6443;

// SSL Certificate paths
const certPath = path.join(__dirname, 'certs', 'server.crt');
const keyPath = path.join(__dirname, 'certs', 'server.key');

// Trust Cloudflare proxy - REQUIRED for trycloudflare.com
app.set('trust proxy', true);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/epoxy/', express.static(epoxyPath));
app.use('/@/', express.static(uvPath));
app.use('/libcurl/', express.static(libcurlPath));
app.use('/baremux/', express.static(baremuxPath));

app.use('/', routes);

// Create HTTP server
const httpServer = http.createServer();

httpServer.on('request', (req, res) => {
	app(req, res);
});

httpServer.on('upgrade', (req, socket, head) => {
	if (req.url.endsWith('/wisp/')) {
		wisp.routeRequest(req, socket, head);
	} else {
		socket.end();
	}
});

// Create HTTPS server if SSL certificates exist
let httpsServer = null;
if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
	try {
		const sslOptions = {
			key: fs.readFileSync(keyPath),
			cert: fs.readFileSync(certPath)
		};

		httpsServer = https.createServer(sslOptions);

		httpsServer.on('request', (req, res) => {
			app(req, res);
		});

		httpsServer.on('upgrade', (req, socket, head) => {
			if (req.url.endsWith('/wisp/')) {
				wisp.routeRequest(req, socket, head);
			} else {
				socket.end();
			}
		});

		httpsServer.on('listening', () => {
			const address = httpsServer.address();
			const theme = chalk.hex('#8F00FF');
			const host = chalk.hex('0d52bd');
			const secure = chalk.hex('#00FF00');

			console.log(
				`  ${chalk.bold(secure('🔒 HTTPS Local:'))}          https://${address.family === 'IPv6' ? `[${address.address}]` : address.address}${address.port === 443 ? '' : ':' + chalk.bold(address.port)}`
			);

			console.log(
				`  ${chalk.bold(secure('🔒 HTTPS Localhost:'))}      https://localhost${address.port === 443 ? '' : ':' + chalk.bold(address.port)}`
			);

			try {
				console.log(
					`  ${chalk.bold(secure('🔒 HTTPS Network:'))}        https://${hostname()}${address.port === 443 ? '' : ':' + chalk.bold(address.port)}`
				);
			} catch (err) {
				// can't find LAN interface
			}
		});

		httpsServer.listen(HTTPS_PORT);
	} catch (error) {
		console.error(
			chalk.red('❌ Failed to start HTTPS server:'),
			error.message
		);
		console.log(
			chalk.yellow(
				'⚠️ Running HTTP only. Generate SSL certificates to enable HTTPS.'
			)
		);
	}
}

httpServer.on('listening', () => {
	const address = httpServer.address();
	const theme = chalk.hex('#8F00FF');
	const host = chalk.hex('0d52bd');
	console.log(
		chalk.bold(
			theme(`
	███████╗██████╗  █████╗  ██████╗███████╗
	██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝
	███████╗██████╔╝███████║██║     █████╗  
	╚════██║██╔═══╝ ██╔══██║██║     ██╔══╝  
	███████║██║     ██║  ██║╚██████╗███████╗
	╚══════╝╚═╝     ╚═╝  ╚═╝ ╚═════╝╚══════╝
											
	`)
		)
	);
	console.log(
		`  ${chalk.bold(host('Local System:'))}            http://${address.family === 'IPv6' ? `[${address.address}]` : address.address}${address.port === 80 ? '' : ':' + chalk.bold(address.port)}`
	);

	console.log(
		`  ${chalk.bold(host('Local System:'))}            http://localhost${address.port === 8080 ? '' : ':' + chalk.bold(address.port)}`
	);

	try {
		console.log(
			`  ${chalk.bold(host('On Your Network:'))}  http://${hostname()}${address.port === 8080 ? '' : ':' + chalk.bold(address.port)}`
		);
	} catch (err) {
		// can't find LAN interface
	}

	if (process.env.REPL_SLUG && process.env.REPL_OWNER) {
		console.log(
			`  ${chalk.bold(host('Replit:'))}           https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
		);
	}

	if (process.env.HOSTNAME && process.env.GITPOD_WORKSPACE_CLUSTER_HOST) {
		console.log(
			`  ${chalk.bold(host('Gitpod:'))}           https://${PORT}-${process.env.HOSTNAME}.${process.env.GITPOD_WORKSPACE_CLUSTER_HOST}`
		);
	}

	if (
		process.env.CODESPACE_NAME &&
		process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
	) {
		console.log(
			`  ${chalk.bold(host('Github Codespaces:'))}           https://${process.env.CODESPACE_NAME}-${address.port === 80 ? '' : address.port}.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`
		);
	}

	if (!httpsServer) {
		console.log(
			chalk.yellow('\n⚠️  SSL certificates not found. To enable HTTPS:')
		);
		console.log(chalk.white('   npm run generate-ssl [YOUR_IP_ADDRESS]'));
		console.log(
			chalk.white('   Example: npm run generate-ssl 192.168.1.100')
		);
	}
});

httpServer.listen(PORT);
