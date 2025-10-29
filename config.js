// Configuration file

// Gemini API Configuration
const CONFIG = {
  // API Key - Lấy từ https://makersuite.google.com/app/apikey
  GEMINI_API_KEY: 'API_KEY',
  
  // Model và cấu hình TTS
  GEMINI_TTS: {
    model: 'gemini-2.0-flash-exp', // Model hỗ trợ audio generation
    voice: 'Puck', // Các giọng có sẵn: Puck, Charon, Kore, Fenrir, Aoede
    language: 'vi',
    maxTextLength: 5000 // Giới hạn độ dài text
  },
  
  // Cấu hình extension
  EXTRACTION: {
    selector: 'div.message-userContent', // CSS selector để lấy nội dung
    timeout: 30000 // Timeout khi load trang (ms)
  }
};

// Export config
window.APP_CONFIG = CONFIG;