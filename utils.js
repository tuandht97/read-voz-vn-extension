// Utility functions

// Kiểm tra URL hợp lệ
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Đợi tab load xong
function waitForTabLoad(tabId) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout: Trang web mất quá nhiều thời gian để tải'));
    }, 30000); // 30 giây timeout
    
    chrome.tabs.onUpdated.addListener(function listener(updatedTabId, changeInfo) {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        clearTimeout(timeout);
        chrome.tabs.onUpdated.removeListener(listener);
        // Đợi thêm chút để đảm bảo DOM đã sẵn sàng
        setTimeout(() => resolve(), 1000);
      }
    });
  });
}

// Hàm escape HTML để tránh lỗi khi lưu vào attribute
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML.replace(/"/g, '&quot;');
}

// Hàm lấy nội dung message-userContent (chạy trong context của trang web)
function extractMessageContent() {
  const messageElements = document.querySelectorAll('div.message-userContent');
  const contents = [];
  
  messageElements.forEach((element, index) => {
    contents.push({
      index: index + 1,
      html: element.innerHTML,
      text: element.textContent.trim()
    });
  });
  
  return contents;
}