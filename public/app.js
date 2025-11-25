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

    setInterval(() => {
        const now = new Date();
        clock.innerText = now.toLocaleTimeString('en-US', { hour12: false });
    }, 1000);

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
        
        const items = photoList.querySelectorAll('li');
        items.forEach(i => i.classList.remove('active'));
        if(items[index]) items[index].classList.add('active');

        emptyState.style.display = 'none';
        mainImage.style.display = 'block';
        mainImage.src = `/photos/${filename}`;
        
        // 简单闪烁
        mainImage.style.opacity = 0.5;
        setTimeout(() => mainImage.style.opacity = 1, 100);

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

    // --- 放大与 100% 缩放逻辑 ---

    window.openZoom = () => {
        if (photos.length === 0) return;
        const currentFilename = photos[currentIndex];
        
        zoomImg.src = `/photos/${currentFilename}`;
        zoomImg.classList.remove('full-scale'); // 每次打开重置为适应屏幕
        zoomModal.classList.add('active');
    };

    window.closeZoom = () => {
        zoomModal.classList.remove('active');
        setTimeout(() => zoomImg.src = "", 300); 
    };

    window.handleModalClick = (e) => {
        // 点击图片或按钮时不关闭，点击背景关闭
        if (e.target.tagName === 'IMG' || e.target.tagName === 'BUTTON') return;
        window.closeZoom();
    };

    window.toggleZoomScale = (e) => {
        if(e) e.stopPropagation();
        // 切换 full-scale 类，CSS 会处理大小变化
        zoomImg.classList.toggle('full-scale');
    };
    
    // 点击图片本身也切换
    zoomImg.onclick = window.toggleZoomScale;

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && zoomModal.classList.contains('active')) {
            window.closeZoom();
        }
    });
});