// Speech Synthesis using Google Translate TTS

// Biến lưu trữ audio hiện tại
let currentAudio = null;
let isPlaying = false;

// Reset tất cả các nút về trạng thái bình thường
function resetAllSpeakButtons() {
  document.querySelectorAll('.speak-btn').forEach(btn => {
    btn.classList.remove('speaking');
    btn.textContent = '🔊';
  });
}

// Dừng đọc hiện tại
function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
    isPlaying = false;
    resetAllSpeakButtons();
  }
}

// Tạo audio URL từ Google Translate
function getGoogleTranslateTTSUrl(text, lang = 'vi') {
  // Encode text để sử dụng trong URL
  const encodedText = encodeURIComponent(text);
  
  // Google Translate TTS API endpoint
  // Lưu ý: Google có thể giới hạn độ dài text (khoảng 200 ký tự)
  return `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodedText}`;
}

// Chia nhỏ văn bản thành các đoạn ngắn hơn
function splitTextIntoChunks(text, maxLength = 200) {
  const chunks = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      // Nếu câu quá dài, cắt theo từ
      if (sentence.length > maxLength) {
        const words = sentence.split(' ');
        let wordChunk = '';
        for (const word of words) {
          if ((wordChunk + ' ' + word).length <= maxLength) {
            wordChunk += (wordChunk ? ' ' : '') + word;
          } else {
            if (wordChunk) {
              chunks.push(wordChunk.trim());
            }
            wordChunk = word;
          }
        }
        if (wordChunk) {
          currentChunk = wordChunk;
        }
      } else {
        currentChunk = sentence;
      }
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Phát audio từng đoạn tuần tự
async function playAudioChunks(chunks, lang, button) {
  for (let i = 0; i < chunks.length; i++) {
    if (!isPlaying) {
      // Người dùng đã dừng
      break;
    }
    
    const audioUrl = getGoogleTranslateTTSUrl(chunks[i], lang);
    
    await new Promise((resolve, reject) => {
      currentAudio = new Audio(audioUrl);
      
      currentAudio.onended = () => {
        resolve();
      };
      
      currentAudio.onerror = (error) => {
        console.error('Audio playback error:', error);
        reject(error);
      };
      
      currentAudio.play().catch(reject);
    });
  }
}

// Xử lý nút đọc văn bản với Google Translate TTS
async function handleSpeak(text, button, lang = 'vi') {
  // Nếu đang đọc, dừng lại
  if (isPlaying) {
    stopSpeaking();
    return;
  }
  
  try {
    // Hiển thị trạng thái loading
    resetAllSpeakButtons();
    button.classList.add('speaking');
    button.textContent = '⏳';
    button.disabled = true;
    
    // Kiểm tra text
    if (!text || text.trim() === '') {
      throw new Error('Không có văn bản để đọc');
    }
    
    // Chia text thành các đoạn nhỏ (Google Translate giới hạn ~200 ký tự)
    const chunks = splitTextIntoChunks(text, 200);
    
    if (chunks.length === 0) {
      throw new Error('Không thể xử lý văn bản');
    }
    
    isPlaying = true;
    
    // Cập nhật UI khi bắt đầu phát
    button.textContent = '⏸';
    button.disabled = false;
    
    // Phát audio từng đoạn
    await playAudioChunks(chunks, lang, button);
    
    // Kết thúc
    button.classList.remove('speaking');
    button.textContent = '🔊';
    isPlaying = false;
    currentAudio = null;
    
  } catch (error) {
    console.error('Speech error:', error);
    button.classList.remove('speaking');
    button.textContent = '🔊';
    button.disabled = false;
    isPlaying = false;
    
    // Hiển thị lỗi cho user
    alert(`Lỗi khi tạo giọng đọc: ${error.message}`);
  }
}

// Export functions để sử dụng
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    speak: handleSpeak,
    stop: stopSpeaking
  };
}