const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// 设置静态文件目录
app.use(express.static('public'));

// API Endpoint: 获取照片列表
app.get('/api/photos', (req, res) => {
    const photoDir = path.join(__dirname, 'public', 'photos');
    
    // 确保目录存在
    if (!fs.existsSync(photoDir)){
        fs.mkdirSync(photoDir);
    }

    fs.readdir(photoDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to scan photos' });
        }
        // 过滤文件，只保留图片
        const images = files.filter(file => 
            ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(path.extname(file).toLowerCase())
        );
        res.json(images);
    });
});

// ...前面的代码保持不变...

// 修改底部启动逻辑
const PORT = process.env.PORT || 3000;

// 只有在本地直接运行时才启动监听（为了兼容本地开发）
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`
        SYSTEM ONLINE...
        TERMINAL ACCESS: http://localhost:${PORT}
        `);
    });
}

// 必须导出 app，这一步是为了 Vercel
module.exports = app;