// UI Management functions

// Hiển thị nội dung
function showContent(contents, url) {
  const section = document.getElementById('contentSection');
  const contentList = document.getElementById('contentList');
  const countBadge = document.getElementById('countBadge');
  const urlInfo = document.getElementById('urlInfo');
  
  countBadge.textContent = `${contents.length} phần tử`;
  urlInfo.textContent = url;
  
  if (contents.length === 0) {
    contentList.innerHTML = '<div class="content-empty">Không tìm thấy thẻ div.message-userContent</div>';
    document.getElementById('copyBtn').style.display = 'none';
  } else {
    contentList.innerHTML = contents.map(item => `
      <div class="content-item">
        <button class="speak-btn" data-text="${escapeHtml(item.text)}" title="Đọc đoạn văn này">🔊</button>
        <div class="item-header">Message #${item.index}</div>
        <div class="item-content">${item.html}</div>
      </div>
    `).join('');
    
    // Thêm event listener cho các nút đọc
    const speakButtons = contentList.querySelectorAll('.speak-btn');
    speakButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = button.getAttribute('data-text');
        handleSpeak(text, button);
      });
    });
    
    document.getElementById('copyBtn').style.display = 'block';
  }
  
  section.classList.add('show');
}

// Ẩn nội dung
function hideContent() {
  document.getElementById('contentSection').classList.remove('show');
}

// Hiển thị lỗi
function showError(message) {
  const errorEl = document.getElementById('error');
  errorEl.textContent = message;
  errorEl.classList.add('show');
}

// Ẩn lỗi
function hideError() {
  document.getElementById('error').classList.remove('show');
}

// Hiển thị loading
function showLoading() {
  document.getElementById('loading').classList.add('show');
}

// Ẩn loading
function hideLoading() {
  document.getElementById('loading').classList.remove('show');
}

// Hiển thị thông báo đã copy
function showCopiedMessage() {
  document.getElementById('copiedMessage').classList.add('show');
}

// Ẩn thông báo đã copy
function hideCopiedMessage() {
  document.getElementById('copiedMessage').classList.remove('show');
}