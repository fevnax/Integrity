import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Your API is running',
        timestamp: new Date().toISOString()
    });
});

app.use(express.static(join(__dirname, 'dist'), {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

app.use((req, res, next) => {
    if (req.path.includes('.')) {
        return res.status(404).send('Not found');
    }
    res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
