import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';

const __dirname = path.resolve();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            frameSrc: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-domain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the dist/client directory
app.use(express.static(path.join(__dirname, '../dist/client')));

// Also serve public files
app.use('/data', express.static(path.join(__dirname, '../public/data')));

// API Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Portfolio data endpoints
app.get('/api/portfolio-config', (req, res) => {
    try {
        // In a real application, this would fetch from a database
        const configPath = path.join(__dirname, '../public/data/portfolio-config.json');
        res.sendFile(configPath);
    } catch (error) {
        console.error('Error serving portfolio config:', error);
        res.status(500).json({ error: 'Failed to load portfolio configuration' });
    }
});

app.get('/api/projects', (req, res) => {
    try {
        const projectsPath = path.join(__dirname, '../public/data/projects.json');
        res.sendFile(projectsPath);
    } catch (error) {
        console.error('Error serving projects data:', error);
        res.status(500).json({ error: 'Failed to load projects data' });
    }
});

// File system simulation endpoint
app.get('/api/files/*', (req: any, res: any) => {
    const filePath = req.params[0] || '';
    
    // Simulate file operations
    // In a real application, this would interact with actual file system or database
    try {
        // For now, redirect to static file serving
        const staticPath = path.join(__dirname, '../public/data', filePath);
        res.sendFile(staticPath, (err: any) => {
            if (err) {
                res.status(404).json({ 
                    error: 'File not found',
                    path: filePath
                });
            }
        });
    } catch (error) {
        console.error('Error serving file:', error);
        res.status(500).json({ error: 'Failed to load file' });
    }
});

// Command execution endpoint
app.post('/api/execute', (req, res) => {
    const { command, path: currentPath } = req.body;
    
    try {
        // Simulate command execution
        // In a real application, this would have proper command parsing and execution
        const response = {
            success: true,
            command,
            path: currentPath,
            output: `Executed: ${command}`,
            timestamp: new Date().toISOString()
        };
        
        res.json(response);
    } catch (error) {
        console.error('Error executing command:', error);
        res.status(500).json({ 
            success: false,
            error: 'Command execution failed'
        });
    }
});

// Contact form endpoint (for future use)
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    try {
        // In a real application, this would send an email or save to database
        console.log('Contact form submission:', { name, email, message });
        
        res.json({
            success: true,
            message: 'Message sent successfully!'
        });
    } catch (error) {
        console.error('Error processing contact form:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send message'
        });
    }
});

// Analytics endpoint (for tracking visits)
app.post('/api/analytics', (req, res) => {
    const { event, data } = req.body;
    
    try {
        // In a real application, this would log to analytics service
        console.log('Analytics event:', { event, data, timestamp: new Date().toISOString() });
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error logging analytics:', error);
        res.status(500).json({ success: false });
    }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    
    res.status(500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message,
        timestamp: new Date().toISOString()
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'API endpoint not found',
        path: req.path,
        timestamp: new Date().toISOString()
    });
});

// Serve the main application for all other routes (SPA support)
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, '../dist/client/index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            res.status(500).send('Failed to load application');
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`
🚀 Kali Linux Portfolio Server Started!
    
📍 Server running on: http://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
⚡ API endpoints available at: http://localhost:${PORT}/api/

🛡️  Security: Helmet configured
🔗 CORS: Enabled for local development
📊 Health check: http://localhost:${PORT}/api/health
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
});

export default app;
