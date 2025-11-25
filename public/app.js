document.addEventListener('DOMContentLoaded', () => {
    const photoList = document.getElementById('photo-list');
    const mainImage = document.getElementById('main-image');
    const emptyState = document.getElementById('empty-state');
    const metadata = document.getElementById('metadata');
    const clock = document.getElementById('clock');
    
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
            photoList.innerHTML = '<li style="color:red">ERR: CONNECTION LOST</li>';
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
        
        // 更新高亮状态
        const items = photoList.querySelectorAll('li');
        items.forEach(i => i.classList.remove('active'));
        if(items[index]) items[index].classList.add('active');

        // 加载图片
        emptyState.style.display = 'none';
        mainImage.style.display = 'block';
        mainImage.src = `/photos/${filename}`;
        
        // 模拟加载闪烁
        mainImage.style.opacity = 0.5;
        setTimeout(() => mainImage.style.opacity = 1, 100);

        // 更新元数据
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

    // 将函数暴露给全局以供 HTML 按钮调用
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
            btn.style.background = '#333';
            btn.style.color = '#bbb';
        } else {
            nextPhoto();
            autoPlayInterval = setInterval(window.nextPhoto, 3000);
            btn.style.background = 'var(--primary-color)';
            btn.style.color = '#121212';
        }
    };
});