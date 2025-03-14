document.addEventListener('DOMContentLoaded', function() {
  const contentContainer = document.getElementById('content-container');
  const menuItems = document.querySelectorAll('.menu-item');
  
  // 优先从URL获取section，如果没有则从localStorage获取，都没有则默认为home
  function getCurrentSection() {
    // 检查URL hash
    const hash = window.location.hash.substring(1);
    if (hash) {
      localStorage.setItem('selectedSection', hash);
      return hash;
    }
    
    // // 检查localStorage
    // const storedSection = localStorage.getItem('selectedSection');
    // if (storedSection) {
    //   // 更新URL以保持一致性
    //   window.location.hash = storedSection;
    //   return storedSection;
    // }
    
    // 默认值
    window.location.hash = 'home';
    // localStorage.setItem('selectedSection', 'home');
    return 'home';
  }
  
  // 初始化加载
  const currentSection = getCurrentSection();
  loadContent(currentSection);
  updateMenuState(currentSection);
  
  // 监听hash变化
  window.addEventListener('hashchange', function() {
    const section = window.location.hash.substring(1) || 'home';
    // localStorage.setItem('selectedSection', section);
    loadContent(section);
    updateMenuState(section);
  });
  
  // 菜单点击事件
  menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const sectionId = this.getAttribute('data-section');
      
      // 同时更新localStorage和URL
      // localStorage.setItem('selectedSection', sectionId);
      window.location.hash = sectionId;
      
      updateMenuState(sectionId);
      loadContent(sectionId);
    });
  });
  
  // 更新菜单状态
  function updateMenuState(sectionId) {
    menuItems.forEach(menuItem => {
      menuItem.classList.remove('active');
      if (menuItem.getAttribute('data-section') === sectionId) {
        menuItem.classList.add('active');
      }
    });
  }
  
  // 加载内容的函数
  function loadContent(sectionId) {
    fetch(`./pages/${sectionId}.html`)
      .then(response => {
        if (!response.ok) {
          throw new Error('网络响应不正常');
        }
        return response.text();
      })
      .then(html => {
        contentContainer.innerHTML = html;
        loadComponentsForSection(sectionId);
      })
      .catch(error => {
        console.error('加载内容出错:', error);
        contentContainer.innerHTML = `<div class="error-message">加载内容失败: ${error.message}</div>`;
      });
  }
  
  // 根据页面加载相应的组件
  function loadComponentsForSection(sectionId) {
    // 组件映射表
    const componentMap = {
      'button': [
        './modules/button/hover/1.js',
        './modules/button/click/1.js',
      ]
      // 可以添加更多页面和组件的映射
    };
    
    // 获取当前页面需要的组件
    const components = componentMap[sectionId] || [];
    
    // 动态加载组件脚本
    components.forEach(componentPath => {
      // 检查组件是否已加载
      const scriptId = `component-${componentPath.replace(/[\/\.]/g, '-')}`;
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = componentPath;
        script.type = 'text/javascript';
        document.body.appendChild(script);
      }
    });
  }
});