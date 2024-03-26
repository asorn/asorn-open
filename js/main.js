//特殊效果
window.addEventListener("mousemove", function(e) {
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

//邮箱复制
var timeoutId;
document.addEventListener("DOMContentLoaded", function() {
    var Ecopied = document.getElementById('emailCopied');
    if(Ecopied){
        Ecopied.addEventListener("click", function() {
            clearTimeout(timeoutId);
            
            var inputElement = document.createElement("input");
            inputElement.value = this.textContent;
            document.body.appendChild(inputElement);
            inputElement.select();
            document.execCommand("copy");
            document.body.removeChild(inputElement);
            
            var copiedElement = document.getElementsByClassName('copied')[0];
            copiedElement.style.opacity = 1;
    
            timeoutId = setTimeout(function() {
                copiedElement.style.opacity = 0;
            }, 1000);
        });
    }
});

//移动端菜单
const menuExpand = document.getElementById("menu-expand");
    const menuExpandChild = document.getElementById("menu-expand-child");
    const menuPanel = document.getElementById("menu-panel");
    let isMenuOpen = false;

    menuExpand.addEventListener("click", function(event) {
        event.stopPropagation();

        if (!isMenuOpen) {
            menuPanel.style.left = "40px";
            menuPanel.style.transition = "left .5s";
        } else {
            menuPanel.style.left = "100vw";
            menuPanel.style.transition = "left .5s";
        }
        isMenuOpen = !isMenuOpen;

        menuExpand.classList.toggle("active");

        // 添加旋转动画
        menuExpandChild.children[0].style.transition = "transform .5s";
        menuExpandChild.children[0].style.transform = isMenuOpen ? "rotate(45deg)" : "rotate(0deg)";

        // 防止在动画期间再次点击
        menuExpand.style.pointerEvents = "none";

        // 监听动画结束事件
        menuPanel.addEventListener("transitionend", function() {
            menuExpand.style.pointerEvents = "auto";
            menuPanel.style.transition = "none";
        }, { once: true });
    });

    // 点击文档其他部分来关闭菜单
    document.addEventListener("click", function(event) {
        if (isMenuOpen && event.target !== menuExpand && event.target !== menuPanel) {
            menuPanel.style.left = "100vw";
            menuPanel.style.transition = "left .5s";
            isMenuOpen = false;
            menuExpand.classList.remove("active");

            // 添加反向旋转动画
            menuExpandChild.children[0].style.transition = "transform .5s";
            menuExpandChild.children[0].style.transform = "rotate(0deg)";
        }
    });