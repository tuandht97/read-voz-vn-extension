// Clipboard Management

// Copy tất cả nội dung vào clipboard
function copyAllContent() {
  const contentList = document.getElementById('contentList');
  const items = contentList.querySelectorAll('.item-content');
  
  let allText = '';
  items.forEach((item, index) => {
    allText += `=== Message #${index + 1} ===\n`;
    allText += item.textContent.trim() + '\n\n';
  });
  
  navigator.clipboard.writeText(allText).then(() => {
    showCopiedMessage();
    setTimeout(hideCopiedMessage, 2000);
  }).catch(error => {
    console.error('Copy failed:', error);
    showError('Không thể copy vào clipboard');
  });
}