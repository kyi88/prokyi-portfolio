// アクセスカウンター機能
document.addEventListener('DOMContentLoaded', function() {
    // LocalStorageからアクセス数を取得
    let accessCount = localStorage.getItem('accessCount');
    if (accessCount === null) {
        accessCount = 0;
    } else {
        accessCount = parseInt(accessCount) + 1;
    }
    
    // LocalStorageに保存
    localStorage.setItem('accessCount', accessCount);
    
    // カウンターを表示
    document.getElementById('counter').textContent = accessCount.toLocaleString();
    
    // キリ番チェック
    checkKiribang(accessCount);
    
    console.log('🎉 アクセス数: ' + accessCount);
});

// キリ番判定関数
function checkKiribang(count) {
    const kiribangElement = document.getElementById('kiribang');
    
    // ぞろ目チェック (100, 1000, 10000, etc.)
    if (isKiribang(count)) {
        kiribangElement.classList.add('active');
        kiribangElement.textContent = '★ キリ番GET! ★';
        
        // 画面中央にポップアップ表示
        showKiribangPopup(count);
    }
}

// ぞろ目判定
function isKiribang(num) {
    const str = String(num);
    
    // 全て同じ数字か確認
    if (/^(\d)\1+$/.test(str)) return true;
    
    // 末尾が0が複数ある (100, 1000, 10000など)
    if (/0{2,}$/.test(str)) return true;
    
    // その他の特別な数字
    const specialNumbers = [111, 222, 333, 444, 555, 666, 777, 888, 999, 1111, 2222, 3333];
    if (specialNumbers.includes(num)) return true;
    
    return false;
}

// キリ番ポップアップ表示
function showKiribangPopup(num) {
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(90deg, #ff6b35, #f7931e);
        color: white;
        padding: 2rem;
        border-radius: 10px;
        font-size: 1.5rem;
        font-weight: bold;
        text-align: center;
        z-index: 10000;
        box-shadow: 0 0 30px rgba(255, 107, 53, 0.8);
        animation: popupBounce 0.5s ease-out;
    `;
    
    popup.innerHTML = `
        <div>🎉 キリ番GET! 🎉</div>
        <div style="font-size: 2rem; margin: 1rem 0;">${num.toLocaleString()}</div>
        <div>おめでとうございます！</div>
    `;
    
    document.body.appendChild(popup);
    
    // 3秒後に消える
    setTimeout(() => {
        popup.style.animation = 'popupFadeOut 0.5s ease-out';
        setTimeout(() => popup.remove(), 500);
    }, 3000);
}

// CSSアニメーション追加
const style = document.createElement('style');
style.textContent = `
    @keyframes popupBounce {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.1);
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
    
    @keyframes popupFadeOut {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0);
        }
    }
`;
document.head.appendChild(style);
