const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 【修复点 1】使用绝对路径定义 public 目录
// Vercel 环境下，相对路径 '.' 有时会找不到，必须用 __dirname 拼接
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// 【修复点 2】显式添加根路由
// 如果 express.static 没生效，这个路由会强制发送 index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// API Endpoint: 获取照片列表
app.get('/api/photos', (req, res) => {
    const photoDir = path.join(publicPath, 'photos');
    
    // 确保目录存在
    if (!fs.existsSync(photoDir)){
        try {
            fs.mkdirSync(photoDir);
        } catch (e) {
            console.log('Skipping mkdir in readonly env');
        }
    }

    fs.readdir(photoDir, (err, files) => {
        if (err) {
            console.error("Error reading photo dir:", err);
            return res.json([]); 
        }
        
        const images = files.filter(file => 
            ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(path.extname(file).toLowerCase())
        );
        res.json(images);
    });
});

// 本地启动监听
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`System Online at http://localhost:${PORT}`);
    });
}

module.exports = app;