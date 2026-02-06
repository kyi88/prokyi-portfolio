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
    document.getElementById('counter').textContent = accessCount;
    
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
        kiribangElement.textContent = '🎉 キリ番GET!! 🎉';
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
