// Content Extraction functions

// Lấy nội dung từ tab hiện tại
async function extractFromCurrentTab() {
  try {
    hideError();
    hideContent();
    hideCopiedMessage();
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractMessageContent
    });
    
    const contents = results[0].result;
    showContent(contents, tab.url);
  } catch (error) {
    showError('Lỗi: ' + error.message);
  }
}

// Lấy nội dung từ URL
async function extractFromUrl(url) {
  if (!url) {
    showError('Vui lòng nhập URL');
    return;
  }
  
  if (!isValidUrl(url)) {
    showError('URL không hợp lệ. Vui lòng nhập URL đầy đủ (ví dụ: https://example.com)');
    return;
  }
  
  try {
    hideError();
    hideContent();
    hideCopiedMessage();
    showLoading();
    
    // Tạo tab mới để load URL
    const tab = await chrome.tabs.create({ url: url, active: false });
    
    // Đợi tab load xong
    await waitForTabLoad(tab.id);
    
    // Lấy nội dung
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractMessageContent
    });
    
    const contents = results[0].result;
    
    // Đóng tab
    await chrome.tabs.remove(tab.id);
    
    hideLoading();
    showContent(contents, url);
  } catch (error) {
    hideLoading();
    showError('Lỗi: ' + error.message);
  }
}