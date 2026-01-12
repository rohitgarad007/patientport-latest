import configService from '../services/configService.ts';

class ConfigManager {
  private initialized = false;
  private config = {
    API_URL: 'https://inventoryapi.obwebsite.in',
    Live_URL: 'https://docwrito.com',
    API_KEY: '',
    API_KEY_DeepSeek: '',
    API_KEY_GEMINI: '',
    AES_SECRET_KEY: ''
  };

  async initialize() {
    if (this.initialized) return this.config;

    try {
      await configService.initialize();
      this.config = {
        API_URL: await configService.getApiUrl(),
        Live_URL: await configService.getLiveUrl(),
        API_KEY: await configService.getApiKey(),
        API_KEY_DeepSeek: await configService.getDeepSeekApiKey(),
        API_KEY_GEMINI: await configService.getGeminiApiKey(),
        AES_SECRET_KEY: await configService.getAesSecretKey(),
      };

      this.initialized = true;
      console.log('Configuration initialized successfully');
      return this.config;
    } catch (error) {
      console.error('Failed to initialize configuration:', error);
      throw new Error('Configuration initialization failed. Please check your server setup.');
    }
  }

  get(key: keyof typeof this.config) {
    if (!this.initialized) {
      throw new Error(`Configuration not initialized. Call Config.initialize() first before accessing ${key}`);
    }
    return this.config[key];
  }

  isInitialized() { return this.initialized; }

  get API_URL() { return this.get('API_URL'); }
  get Live_URL() { return this.get('Live_URL'); }
  get API_KEY() { return this.get('API_KEY'); }
  get API_KEY_DeepSeek() { return this.get('API_KEY_DeepSeek'); }
  get API_KEY_GEMINI() { return this.get('API_KEY_GEMINI'); }
  get AES_SECRET_KEY() { return this.get('AES_SECRET_KEY'); }
}

const Config = new ConfigManager();
export default Config;
