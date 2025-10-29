// Main popup script - Event Listeners

// Lấy nội dung từ trang hiện tại
document.getElementById('extractCurrentBtn').addEventListener('click', () => {
  extractFromCurrentTab();
});

// Lấy nội dung từ URL được nhập
document.getElementById('extractUrlBtn').addEventListener('click', () => {
  const url = document.getElementById('urlInput').value.trim();
  extractFromUrl(url);
});

// Copy tất cả nội dung
document.getElementById('copyBtn').addEventListener('click', () => {
  copyAllContent();
});