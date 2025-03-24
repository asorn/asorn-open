// ---特殊效果
window.addEventListener("mousemove", function (e) {
    document.querySelectorAll(".magical").forEach(element => {
        if (!element.querySelector(".show")) {
            element.insertAdjacentHTML("beforeend", "<div class='show'></div>");
        }
        const rect = element.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        element.style.setProperty("--mouse-x", `${offsetX}px`);
        element.style.setProperty("--mouse-y", `${offsetY}px`);

        const hoverElement = element.querySelector(".show");
        if (hoverElement) {
            hoverElement.style.opacity = (offsetX >= 0 && offsetX <= element.clientWidth && offsetY >= 0 && offsetY <= element.clientHeight) ? 1 : 0;
        }
    });
});


// ---邮箱复制 - 使用现代 Clipboard API
var timeoutId;
document.addEventListener("DOMContentLoaded", function () {
    var Ecopied = document.getElementById('emailCopied');
    if (Ecopied) {
        Ecopied.addEventListener("click", function () {
            clearTimeout(timeoutId);

            // 工具函数：显示复制成功提示
            function showCopiedMessage() {
                var copiedElement = document.getElementsByClassName('copied')[0];
                copiedElement.style.opacity = 1;

                timeoutId = setTimeout(function () {
                    copiedElement.style.opacity = 0;
                }, 1000);
            }

            // 工具函数：回退复制方法
            function fallbackCopy(text) {
                var inputElement = document.createElement("input");
                inputElement.value = text;
                document.body.appendChild(inputElement);
                inputElement.select();
                document.execCommand("copy");
                document.body.removeChild(inputElement);
                showCopiedMessage();
            }

            // 优先使用现代 Clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(this.textContent)
                    .then(() => {
                        showCopiedMessage();
                    })
                    .catch(err => {
                        console.error('复制失败:', err);
                        fallbackCopy(this.textContent);
                    });
            } else {
                fallbackCopy(this.textContent);
            }
        });
    }
});


// ---移动端菜单
document.addEventListener('DOMContentLoaded', function () {
    const mainMenu = document.getElementById("main-menu").innerHTML;
    const menuPanelContent = document.getElementById("menu-panel-content");
    const menuPanel = document.getElementById("menu-panel");
    const menuExpandChild = document.getElementById("menu-expand-child");

    menuPanelContent.innerHTML = mainMenu;

    // 展开菜单
    menuExpandChild.addEventListener("click", function () {
        menuPanel.classList.add("active");
        document.body.classList.add("no-scroll");

        // 为每个菜单项添加新样式并移除原来的类
        const menuItems = menuPanelContent.querySelectorAll('li');
        menuItems.forEach(item => {
            item.classList.remove('magical', 'btn'); // 移除原来的类
            item.classList.add('active-item');       // 添加新的样式类
        });
    });

    // 点击关闭按钮时关闭菜单
    const closeButton = document.querySelector('.menu-close-btn');
    if (closeButton) {
        closeButton.addEventListener('click', function (event) {
            event.stopPropagation(); // 阻止事件冒泡
            closeMenu();  // 绑定关闭事件
        });
    }

    // 点击菜单外部区域时关闭菜单
    menuPanel.addEventListener("click", function (event) {
        // 如果点击的是关闭按钮，不在这里处理（因为已经在上面的事件处理器中处理了）
        if (event.target.classList.contains('menu-close-btn')) {
            return;
        }
        closeMenu();
    });

    // 关闭菜单的函数
    function closeMenu() {
        menuPanel.classList.remove("active");
        document.body.classList.remove("no-scroll");

        // 给菜单项添加一个小的延迟，让过渡动画完成
        setTimeout(() => {
            const menuItems = menuPanelContent.querySelectorAll('li');
            menuItems.forEach(item => {
                item.classList.remove('active-item');  // 移除新的类
                item.classList.add('magical', 'btn');  // 恢复原来的类
            });
        }, 300);  // 300ms 后恢复原样（确保过渡效果完成）
    }

    // 监听窗口宽度变化
    window.addEventListener('resize', function () {
        if (window.innerWidth > 968) {
            // 在宽度大于 968px 时，确保菜单关闭且隐藏
            closeMenu();
        }
    });
});

// ---其他
document.addEventListener("DOMContentLoaded", () => {

    // ---工具函数：节流函数，用于限制函数执行频率
    function throttle(func, delay) {
        let lastCall = 0;
        return function (...args) {
            const now = new Date().getTime();
            if (now - lastCall >= delay) {
                lastCall = now;
                func.apply(this, args);
            }
        };
    }

    // ---首页眼睛
    const eyes = document.querySelectorAll('.eye');
    document.addEventListener('mousemove', throttle((event) => {
        eyes.forEach(eye => {
            const boundingBox = eye.getBoundingClientRect();
            const eyeCenterX = boundingBox.left + boundingBox.width / 2;
            const eyeCenterY = boundingBox.top + boundingBox.height / 2;
            const angle = Math.atan2(event.clientY - eyeCenterY, event.clientX - eyeCenterX);
            const distance = Math.min(boundingBox.width / 4, boundingBox.height / 4);
            const pupil = eye.querySelector('.pupil');
            pupil.style.transform = `translate(-50%, -50%) translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
        });
    }, 16));

    // ---导航栏滚动时背景模糊
    const navbar = document.getElementById('headscrollbg');
    window.onscroll = function () {
        if (window.scrollY > 0) {
            // 页面滚动超过 0px 时，设置背景模糊
            navbar.style.backdropFilter = 'blur(4px)';
            navbar.style.webkitBackdropFilter = 'blur(4px)'; // Safari 支持
        } else {
            // 页面回到顶部时，移除背景模糊
            navbar.style.backdropFilter = 'blur(0px)';
            navbar.style.webkitBackdropFilter = 'blur(0px)'; // Safari 支持
        }
    };

    // 工具函数：处理 IntersectionObserver 回调
    function handleIntersection(entries, observer, callback) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                callback(entry.target, observer);
            }
        });
    }

    // ---公共数据滚动渐进加载
    const blogObserver = new IntersectionObserver((entries, observer) => {
        handleIntersection(entries, observer, (target, obs) => {
            // 当元素进入视口时，添加 'visible' 类
            target.classList.add('visible');

            // 停止观察当前元素，防止重复应用动画
            obs.unobserve(target);
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.02 // 进入视口时触发
    });

    const items = document.querySelectorAll('.load-pro');

    items.forEach(item => {
        blogObserver.observe(item);
    });

    // ---书籍页封面懒加载
    const bookObserver = new IntersectionObserver((entries, observer) => {
        handleIntersection(entries, observer, (bookItem, obs) => {
            const coverUrl = bookItem.getAttribute('data-cover-url');  // 获取自定义的封面 URL
            const front = bookItem.querySelector('.b-front');

            if (front && coverUrl) {
                // 使用 Image 对象预加载封面图
                const img = new Image();
                img.src = coverUrl;

                // 在封面图加载完成后，替换占位图
                img.onload = () => {
                    front.style.backgroundImage = `url('${coverUrl}')`;  // 替换为实际封面图
                };

                // 停止观察当前元素，防止重复加载
                obs.unobserve(bookItem);
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // 当 10% 的元素进入视口时触发
    });

    const bookItems = document.querySelectorAll('.book-item');

    bookItems.forEach(item => {
        bookObserver.observe(item);
    });

    // ---tool数据滚动倾斜
    const timelineNodes = document.querySelectorAll('.tool-list-item');

    function checkCards() {
        const viewportHeight = window.innerHeight;

        timelineNodes.forEach(node => {
            const rect = node.getBoundingClientRect();
            if (rect.top <= viewportHeight * 0.6 && rect.bottom >= 0) {
                node.classList.add('active');
            } else {
                node.classList.remove('active');
            }
        });
    }
    window.addEventListener('DOMContentLoaded', checkCards);
    window.addEventListener('scroll', checkCards);

    // ---blog页左侧滚动条
    const scrollThumb = document.querySelector('.scroll-thumb');
    window.addEventListener('scroll', throttle(() => {
        const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        scrollThumb.style.height = `${scrollPercentage}%`;
    }, 16));


    // ---work页评价
    const track = document.getElementById("rowScroll");
    let isPaused = false;

    track.innerHTML += track.innerHTML;

    let scrollAmount = 0;
    function scrollCards() {
        if (!isPaused) {
            scrollAmount -= 1; // 控制滚动速度
            if (scrollAmount <= -track.scrollWidth / 2) {
                scrollAmount = 0; // 回到起点，形成无缝循环
            }
            track.style.transform = `translateX(${scrollAmount}px)`;
        }
        requestAnimationFrame(scrollCards);
    }
    scrollCards();

    document.querySelectorAll(".review-item").forEach(card => {
        card.addEventListener("mouseenter", () => {
            isPaused = true;
            card.classList.add("hovered"); // 添加新类
        });
        card.addEventListener("mouseleave", () => {
            isPaused = false;
            card.classList.remove("hovered"); // 移除新类
        });
    });
});