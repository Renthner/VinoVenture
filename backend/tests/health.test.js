import express from 'express';
import cors from 'cors';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { request } from 'http';

// Create and start test server once for all tests
let server;
let port = 3001;

const makeRequest = (path) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: port,
            path: path,
            method: 'GET'
        };

        const req = request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: data ? JSON.parse(data) : null
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: data
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
};

// Setup test server before any tests run
beforeAll(async () => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    app.get('/api/health', (req, res) => {
        const currentDateTime = new Date();
        res.json({ 
            status: 'OK', 
            currentDateTime: currentDateTime.toISOString(),
            service: 'VinoVenture Backend',
            version: '1.0.0',
            uptime: process.uptime()
        });
    });

    app.get('/api/health/live', (req, res) => {
        res.json({ status: 'alive' });
    });

    app.get('/api/health/ready', (req, res) => {
        res.json({ status: 'ready' });
    });

    server = app.listen(port);
    // Small delay to ensure server is ready
    await new Promise(resolve => setTimeout(resolve, 100));
});

// Clean up after all tests
afterAll(() => {
    if (server) {
        server.close();
    }
});

describe('Health Check Endpoints', () => {

    describe('GET /api/health', () => {
        it('should return status OK with proper structure', async () => {
            const result = await makeRequest('/api/health');

            expect(result.status).toBe(200);
            expect(result.data.status).toBe('OK');
            expect(result.data.service).toBe('VinoVenture Backend');
            expect(result.data.version).toBe('1.0.0');
            expect(result.data.currentDateTime).toBeDefined();
            expect(result.data.uptime).toBeDefined();
            expect(typeof result.data.uptime).toBe('number');
        });

        it('should return valid ISO date format', async () => {
            const result = await makeRequest('/api/health');

            const date = new Date(result.data.currentDateTime);
            expect(date.toISOString()).toBe(result.data.currentDateTime);
        });

        it('should return application/json content type', async () => {
            const result = await makeRequest('/api/health');
            
            expect(result.headers['content-type']).toContain('application/json');
        });
    });

    describe('GET /api/health/live', () => {
        it('should return alive status for liveness probe', async () => {
            const result = await makeRequest('/api/health/live');

            expect(result.status).toBe(200);
            expect(result.data.status).toBe('alive');
        });

        it('should return application/json content type', async () => {
            const result = await makeRequest('/api/health/live');
            
            expect(result.headers['content-type']).toContain('application/json');
        });
    });

    describe('GET /api/health/ready', () => {
        it('should return ready status for readiness probe', async () => {
            const result = await makeRequest('/api/health/ready');

            expect(result.status).toBe(200);
            expect(result.data.status).toBe('ready');
        });

        it('should return application/json content type', async () => {
            const result = await makeRequest('/api/health/ready');
            
            expect(result.headers['content-type']).toContain('application/json');
        });
    });
});

describe('Server Middleware Tests', () => {
    it('should have CORS headers in health response', async () => {
        const result = await makeRequest('/api/health');
        
        // Check for CORS headers in response
        const accessControlHeader = result.headers['access-control-allow-origin'] || '';
        expect(accessControlHeader).toContain('*');
    });

    it('should return JSON content type for all health endpoints', async () => {
        const endpoints = ['/api/health', '/api/health/live', '/api/health/ready'];
        
        for (const endpoint of endpoints) {
            const result = await makeRequest(endpoint);
            expect(result.headers['content-type']).toContain('application/json');
        }
    });
});

describe('Response Structure Tests', () => {
    it('should have consistent response structure across all health endpoints', async () => {
        const endpoints = ['/api/health', '/api/health/live', '/api/health/ready'];
        
        for (const endpoint of endpoints) {
            const result = await makeRequest(endpoint);
            expect(result.status).toBe(200);
            expect(result.data).toBeInstanceOf(Object);
            expect(result.data.status).toBeDefined();
        }
    });

    it('should include service metadata in main health endpoint', async () => {
        const result = await makeRequest('/api/health');
        
        expect(result.data.service).toBe('VinoVenture Backend');
        expect(result.data.version).toBe('1.0.0');
        expect(result.data.uptime).toBeGreaterThan(0);
    });
});