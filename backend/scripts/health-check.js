#!/usr/bin/env node

/**
 * Simple health check script for VinoVenture backend
 * Can be used for manual health checks or in CI/CD pipelines
 */

import { request } from 'http';

const DEFAULT_PORT = process.env.PORT || 3000;
const DEFAULT_HOST = process.env.HOST || 'localhost';

const makeRequest = (host, port, path) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: host,
            port: port,
            path: path,
            method: 'GET',
            timeout: 5000
        };

        const startTime = Date.now();
        const req = request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                const endTime = Date.now();
                try {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: data ? JSON.parse(data) : null,
                        responseTime: endTime - startTime
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: data,
                        responseTime: endTime - startTime
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error(`Request timeout after 5000ms`));
        });

        req.end();
    });
};

const checkHealth = async (host, port) => {
    console.log(`🏥 Running health checks for ${host}:${port}...\n`);

    const checks = [
        { name: 'Main Health', path: '/api/health' },
        { name: 'Liveness', path: '/api/health/live' },
        { name: 'Readiness', path: '/api/health/ready' }
    ];

    let allPassed = true;

    for (const check of checks) {
        try {
            console.log(`⏳ Checking ${check.name} (${check.path})...`);
            const result = await makeRequest(host, port, check.path);
            
            if (result.status === 200 && result.data && result.data.status) {
                console.log(`  ✅ ${check.name}: ${result.data.status}`);
                if (result.data.service) {
                    console.log(`     Service: ${result.data.service}`);
                }
                if (result.data.version) {
                    console.log(`     Version: ${result.data.version}`);
                }
                if (result.data.uptime) {
                    console.log(`     Uptime: ${result.data.uptime.toFixed(2)}s`);
                }
                if (result.data.currentDateTime) {
                    console.log(`     Time: ${new Date(result.data.currentDateTime).toLocaleString()}`);
                }
                console.log(`     Response time: ${result.responseTime}ms`);
            } else {
                console.log(`  ❌ ${check.name}: Expected 200, got ${result.status}`);
                allPassed = false;
            }
        } catch (error) {
            console.log(`  ❌ ${check.name}: ${error.message}`);
            allPassed = false;
        }
        console.log('');
    }

    console.log(allPassed ? '🎉 All health checks passed!' : '💥 Some health checks failed!');
    return allPassed;
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    host: DEFAULT_HOST,
    port: DEFAULT_PORT,
    help: false
};

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--host' && args[i + 1]) {
        options.host = args[i + 1];
        i++;
    } else if (args[i] === '--port' && args[i + 1]) {
        options.port = parseInt(args[i + 1]);
        i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
        options.help = true;
    }
}

if (options.help) {
    console.log(`
Usage: node health-check.js [options]

Options:
  --host <host>    Server host (default: ${DEFAULT_HOST})
  --port <port>    Server port (default: ${DEFAULT_PORT})
  --help, -h       Show this help message

Examples:
  node health-check.js
  node health-check.js --host localhost --port 3000
  node health-check.js --port 8080
`);
    process.exit(0);
}

// Run health checks
checkHealth(options.host, options.port)
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error(`💥 Error running health checks: ${error.message}`);
        process.exit(1);
    });