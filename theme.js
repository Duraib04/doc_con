// Global theme toggle handler
(function(){
  document.addEventListener('DOMContentLoaded',()=>{
    const toggle = document.getElementById('themeToggle');
    try {
      const saved = localStorage.getItem('theme:mode');
      if(saved==='dark') document.body.classList.add('dark-mode');
    } catch(_){}
    if(toggle){
      toggle.addEventListener('click',()=>{
        document.body.classList.toggle('dark-mode');
        try { localStorage.setItem('theme:mode', document.body.classList.contains('dark-mode') ? 'dark' : 'light'); } catch(_){}
      });
    }
  });
})();
