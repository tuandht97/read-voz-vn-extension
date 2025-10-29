// Speech Synthesis using Gemini AI

// Biến lưu trữ audio hiện tại
let currentAudio = null;
let isPlaying = false;

// Lấy config - với fallback
function getConfig() {
  if (typeof window.APP_CONFIG !== 'undefined' && window.APP_CONFIG) {
    return window.APP_CONFIG;
  }
  
  // Fallback nếu config chưa load
  console.warn('APP_CONFIG chưa được load, sử dụng config mặc định');
  return {
    GEMINI_API_KEY: '',
    GEMINI_TTS: {
      model: 'gemini-2.0-flash-exp',
      voice: 'Puck',
      language: 'vi',
      maxTextLength: 5000
    }
  };
}

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

// Gọi Gemini API để tạo audio
async function generateSpeechWithGemini(text) {
  const config = getConfig();
  const apiKey = config.GEMINI_API_KEY;
  const ttsConfig = config.GEMINI_TTS;
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${ttsConfig.model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: text
            }]
          }],
          generationConfig: {
            response_modalities: ['AUDIO'],
            speech_config: {
              voice_config: {
                prebuilt_voice_config: {
                  voice_name: ttsConfig.voice
                }
              }
            }
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Lấy audio data từ response
    if (data.candidates && data.candidates[0]?.content?.parts) {
      const audioPart = data.candidates[0].content.parts.find(part => part.inline_data);
      if (audioPart && audioPart.inline_data) {
        return audioPart.inline_data.data; // Base64 audio data
      }
    }
    
    throw new Error('Không tìm thấy dữ liệu audio trong response');
  } catch (error) {
    console.error('Gemini TTS Error:', error);
    throw error;
  }
}

// Chuyển đổi base64 sang blob URL
function base64ToAudioUrl(base64Data) {
  // Decode base64 thành binary
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Tạo blob từ binary data
  const blob = new Blob([bytes], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

// Xử lý nút đọc văn bản với Gemini AI
async function handleSpeak(text, button) {
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
    
    // Lấy config
    const config = getConfig();
    const apiKey = config.GEMINI_API_KEY;
    
    console.log('Config loaded:', {
      hasConfig: !!config,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      apiKeyPreview: apiKey ? apiKey.substring(0, 10) + '...' : 'none'
    });
    
    // Kiểm tra API key
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY' || apiKey.trim() === '') {
      throw new Error('API key không hợp lệ. Vui lòng kiểm tra config.js và đảm bảo GEMINI_API_KEY đã được set đúng.');
    }
    
    // Giới hạn độ dài text (Gemini có giới hạn)
    let processedText = text;
    const maxLength = config.GEMINI_TTS?.maxTextLength || 5000;
    if (text.length > maxLength) {
      processedText = text.substring(0, maxLength) + '...';
      console.warn(`Text quá dài, đã cắt xuống ${maxLength} ký tự`);
    }
    
    // Gọi Gemini API để tạo audio
    const audioBase64 = await generateSpeechWithGemini(processedText);
    
    // Chuyển đổi sang audio URL
    const audioUrl = base64ToAudioUrl(audioBase64);
    
    // Tạo audio element
    currentAudio = new Audio(audioUrl);
    isPlaying = true;
    
    // Cập nhật UI khi bắt đầu phát
    button.textContent = '⏸';
    button.disabled = false;
    
    // Xử lý khi audio kết thúc
    currentAudio.onended = () => {
      button.classList.remove('speaking');
      button.textContent = '🔊';
      isPlaying = false;
      currentAudio = null;
      // Giải phóng blob URL
      URL.revokeObjectURL(audioUrl);
    };
    
    // Xử lý lỗi khi phát audio
    currentAudio.onerror = (error) => {
      console.error('Audio playback error:', error);
      button.classList.remove('speaking');
      button.textContent = '🔊';
      button.disabled = false;
      isPlaying = false;
      currentAudio = null;
      URL.revokeObjectURL(audioUrl);
    };
    
    // Phát audio
    await currentAudio.play();
    
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