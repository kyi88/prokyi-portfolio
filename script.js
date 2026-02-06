// ページ読み込み時のアニメーション
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎉 ぷろきぃのポートフォリオへようこそ！');
    
    // スムーズスクロール
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // スクロールアニメーション
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'all 0.6s ease-out';
        observer.observe(section);
    });
});

// マウス追跡効果（背景グロー）
document.addEventListener('mousemove', function(e) {
    const x = e.clientX;
    const y = e.clientY;
    
    // グロー効果を追加したい場合はここに記述
});

// ボタンやカードのクリック効果
document.querySelectorAll('.skill-card, .profile-card').forEach(card => {
    card.addEventListener('click', function() {
        this.style.animation = 'pulse 0.6s ease-out';
    });
});
