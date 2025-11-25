const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
// 修正：合并 PORT 定义，优先使用环境变量（适配 Vercel），本地则用 3000
const PORT = process.env.PORT || 3000;

// 设置静态文件目录
app.use(express.static('public'));

// API Endpoint: 获取照片列表
app.get('/api/photos', (req, res) => {
    const photoDir = path.join(__dirname, 'public', 'photos');
    
    // 确保目录存在
    if (!fs.existsSync(photoDir)){
        try {
            fs.mkdirSync(photoDir);
        } catch (e) {
            // 在 Vercel 等只读环境可能会报错，但这通常不影响读取，忽略即可
            console.log('Skipping mkdir in readonly env');
        }
    }

    fs.readdir(photoDir, (err, files) => {
        if (err) {
            console.error(err);
            // 如果文件夹不存在或无法读取，返回空数组防止前端崩坏
            return res.json([]); 
        }
        // 过滤文件，只保留图片
        const images = files.filter(file => 
            ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(path.extname(file).toLowerCase())
        );
        res.json(images);
    });
});

// 核心修正点：
// 只有在本地直接运行时（node server.js）才启动监听
// Vercel 会自动处理监听，不需要这里的 app.listen
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`
        SYSTEM ONLINE...
        TERMINAL ACCESS: http://localhost:${PORT}
        LOAD PHOTOS INTO: /public/photos/
        `);
    });
}

// 必须导出 app 实例供 Vercel 使用
module.exports = app;