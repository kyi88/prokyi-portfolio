// Holographic Portfolio - Interactive JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // スクロールトリガーアニメーション
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // アニメーション対象を観察
    document.querySelectorAll('.section, .skill-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });

    // アバター差し替え: プロジェクトルートに avatar.jpg があれば SVG を置換
    (function trySwapAvatar() {
        const avatarFrame = document.querySelector('.avatar-frame');
        if (!avatarFrame) return;

        const testImg = new Image();
        testImg.src = 'avatar.jpg';
        testImg.className = 'avatar-img custom-avatar';
        testImg.alt = 'prokyi avatar';
        testImg.style.width = '100%';
        testImg.style.height = '100%';
        testImg.style.borderRadius = '50%';
        testImg.style.objectFit = 'cover';

        testImg.onload = function() {
            // 読み込み成功 -> 既存の SVG を置換
            const existing = avatarFrame.querySelector('svg, img');
            if (existing) {
                existing.replaceWith(testImg);
            } else {
                avatarFrame.appendChild(testImg);
            }
            // 軽いアニメーションを付与
            testImg.style.animation = 'rotate 20s linear infinite';
            console.log('✅ avatar.jpg を読み込み、SVG を差し替えました');
        };

        testImg.onerror = function() {
            // 存在しないか読み込めない場合は何もしない（SVG をそのまま使う）
            console.log('ℹ️ avatar.jpg は見つかりません。SVG アバターを使用します');
        };
    })();

    // スムーズスクロール
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // マウスムーブで背景エフェクト
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // ヘッダーの光エフェクト
        const header = document.querySelector('.header');
        if (header) {
            header.style.boxShadow = `0 0 30px rgba(0, 255, 255, ${0.1 + (Math.sin(mouseX / 100) * 0.1)}), 0 ${mouseY > window.innerHeight / 2 ? -5 : 5}px 20px rgba(0, 255, 255, 0.1)`;
        }
    });

    // スキルカード - ホバーで3Dっぽく
    document.querySelectorAll('.skill-card').forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const angleX = (y - centerY) / centerY * 5;
            const angleY = -(x - centerX) / centerX * 5;
            
            this.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateZ(20px)`;
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = `perspective(1000px) rotateX(0) rotateY(0) translateZ(0)`;
        });
    });

    // コンタクトボタン - ホバーでグロー増幅
    document.querySelectorAll('.contact-btn').forEach(btn => {
        btn.addEventListener('mouseover', function() {
            this.style.boxShadow = `0 0 40px rgba(0, 255, 255, 0.8), 0 0 80px rgba(255, 0, 255, 0.6), inset 0 0 30px rgba(0, 255, 255, 0.2)`;
        });

        btn.addEventListener('mouseout', function() {
            this.style.boxShadow = `0 0 20px rgba(0, 255, 255, 0.6), inset 0 0 20px rgba(0, 255, 255, 0.1)`;
        });
    });

    // スクロール位置に応じたナビゲーションリンク色変更
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('.section');
        const navLinks = document.querySelectorAll('.nav-link');

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.style.color = '#e0e8ff';
                });
                const activeLink = document.querySelector(`a[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.style.color = '#00ffff';
                    activeLink.style.textShadow = '0 0 10px rgba(0, 255, 255, 0.7)';
                }
            }
        });
    });

    // パーティクル効果（オプション）
    function createParticle(x, y) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '5px';
        particle.style.height = '5px';
        particle.style.background = '#00ffff';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.boxShadow = '0 0 10px #00ffff';
        particle.style.zIndex = '0';
        
        document.body.appendChild(particle);

        let velocityX = (Math.random() - 0.5) * 4;
        let velocityY = (Math.random() - 0.5) * 4 - 2;
        let opacity = 1;
        let life = 30;

        const animate = () => {
            x += velocityX;
            y += velocityY;
            opacity -= 0.033;
            velocityY += 0.1; // 重力

            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.opacity = opacity;

            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };

        animate();
    }

    // ページ読み込み時にパーティクル発生
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            createParticle(
                window.innerWidth / 2 + (Math.random() - 0.5) * 100,
                window.innerHeight / 2 + (Math.random() - 0.5) * 100
            );
        }, i * 50);
    }

    // タグホバーエフェクト
    document.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('mouseover', function() {
            this.style.transform = 'scale(1.1) translateY(-5px)';
            this.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.8), 0 0 60px rgba(255, 0, 255, 0.5)';
        });

        tag.addEventListener('mouseout', function() {
            this.style.transform = 'scale(1) translateY(0)';
            this.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.5)';
        });
    });

    console.log('%c🌌 Welcome to prokyi\'s Holographic Portfolio', 'color: #00ffff; font-size: 16px; font-weight: bold; text-shadow: 0 0 10px #00ffff;');
});
