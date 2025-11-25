document.addEventListener('DOMContentLoaded', () => {
    const photoList = document.getElementById('photo-list');
    const mainImage = document.getElementById('main-image');
    const emptyState = document.getElementById('empty-state');
    const metadata = document.getElementById('metadata');
    const clock = document.getElementById('clock');
    
    // 放大功能相关 DOM
    const zoomModal = document.getElementById('zoom-modal');
    const zoomImg = document.getElementById('zoom-img');
    
    let photos = [];
    let currentIndex = 0;
    let autoPlayInterval = null;

    // 实时时钟
    setInterval(() => {
        const now = new Date();
        clock.innerText = now.toLocaleTimeString('en-US', { hour12: false });
    }, 1000);

    // 获取照片数据
    fetch('/api/photos')
        .then(res => res.json())
        .then(data => {
            photos = data;
            renderList();
        })
        .catch(err => {
            console.error(err);
            photoList.innerHTML = '<li style="color:var(--secondary-color)">ERR: CONNECTION LOST</li>';
        });

    function renderList() {
        photoList.innerHTML = '';
        if (photos.length === 0) {
            photoList.innerHTML = '<li>NO DATA FOUND</li>';
            return;
        }

        photos.forEach((photo, index) => {
            const li = document.createElement('li');
            li.innerText = `> ${photo}`;
            li.onclick = () => loadPhoto(index);
            photoList.appendChild(li);
        });
    }

    function loadPhoto(index) {
        if (index < 0 || index >= photos.length) return;
        
        currentIndex = index;
        const filename = photos[index];
        
        // 更新高亮
        const items = photoList.querySelectorAll('li');
        items.forEach(i => i.classList.remove('active'));
        if(items[index]) items[index].classList.add('active');

        // 加载图片
        emptyState.style.display = 'none';
        mainImage.style.display = 'block';
        mainImage.src = `/photos/${filename}`;
        mainImage.style.opacity = 0.5;
        setTimeout(() => mainImage.style.opacity = 1, 100);

        // 元数据
        const imgObj = new Image();
        imgObj.src = `/photos/${filename}`;
        imgObj.onload = function() {
            metadata.innerHTML = `
                FILE: ${filename}<br>
                DIM: ${this.width}x${this.height}<br>
                IDX: ${index + 1}/${photos.length}
            `;
        }
    }

    // --- 全局控制 ---

    window.prevPhoto = () => {
        let newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = photos.length - 1;
        loadPhoto(newIndex);
    };

    window.nextPhoto = () => {
        let newIndex = currentIndex + 1;
        if (newIndex >= photos.length) newIndex = 0;
        loadPhoto(newIndex);
    };

    window.toggleAuto = () => {
        const btn = document.getElementById('auto-btn');
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
            btn.style.background = '#222';
            btn.style.color = 'var(--primary-color)';
        } else {
            nextPhoto();
            autoPlayInterval = setInterval(window.nextPhoto, 3000);
            btn.style.background = 'var(--primary-color)';
            btn.style.color = 'var(--bg-color)';
        }
    };

    // --- 放大逻辑 ---

    window.openZoom = () => {
        if (photos.length === 0) return;
        const currentFilename = photos[currentIndex];
        
        zoomImg.src = `/photos/${currentFilename}`;
        // 每次打开重置为适应屏幕状态
        zoomImg.classList.remove('full-scale'); 
        zoomModal.classList.add('active');
    };

    window.closeZoom = () => {
        zoomModal.classList.remove('active');
        setTimeout(() => zoomImg.src = "", 300); 
    };

    // 点击背景关闭，点击图片不关闭
    window.handleModalClick = (e) => {
        // 如果点击的是图片本身，或者点击的是顶部按钮，不关闭
        if (e.target.tagName === 'IMG' || e.target.tagName === 'BUTTON') return;
        // 否则（点击背景黑色区域），关闭
        window.closeZoom();
    };

    // 切换 1:1 和 适应屏幕
    window.toggleZoomScale = (e) => {
        // 阻止冒泡，防止触发背景关闭
        if(e) e.stopPropagation();
        
        // 切换 class
        zoomImg.classList.toggle('full-scale');
    };
    
    // 点击放大图本身也可以切换缩放
    zoomImg.onclick = window.toggleZoomScale;

    // ESC 关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && zoomModal.classList.contains('active')) {
            window.closeZoom();
        }
    });
});