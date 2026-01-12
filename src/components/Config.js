import configService from '../services/configService.ts';

/**
 * Secure Runtime Configuration
 * Configuration is loaded at runtime to prevent API keys from being embedded in build
 * 
 * IMPORTANT: Call Config.initialize() before using any configuration values
 */

class ConfigManager {
  constructor() {
    this.initialized = false;
    this.config = {
      API_URL: 'https://umahospital-api.obwebsite.in',
      Live_URL: 'https://umahospital.obwebsite.in',
      API_KEY: '',
      API_KEY_DeepSeek: '',
      API_KEY_GEMINI: '',
      AES_SECRET_KEY: ''
    };
  }

  /**
   * Initialize configuration by loading from secure runtime service
   * This must be called before accessing any configuration values
   */
  async initialize() {
    if (this.initialized) {
      return this.config;
    }

    try {
      await configService.initialize();
      
      this.config = {
        API_URL: await configService.getApiUrl(),
        Live_URL: await configService.getLiveUrl(),
        API_KEY: await configService.getApiKey(),
        API_KEY_DeepSeek: await configService.getDeepSeekApiKey(),
        API_KEY_GEMINI: await configService.getGeminiApiKey(),
        AES_SECRET_KEY: await configService.getAesSecretKey()
      };
      
      this.initialized = true;
      console.log('Configuration initialized successfully');
      return this.config;
    } catch (error) {
      console.error('Failed to initialize configuration:', error);
      throw new Error('Configuration initialization failed. Please check your server setup.');
    }
  }

  /**
   * Get configuration value
   * Throws error if configuration is not initialized
   */
  get(key) {
    if (!this.initialized) {
      throw new Error(`Configuration not initialized. Call Config.initialize() first before accessing ${key}`);
    }
    return this.config[key];
  }

  /**
   * Check if configuration is initialized
   */
  isInitialized() {
    return this.initialized;
  }

  // Getter methods for backward compatibility
  get API_URL() {
    return this.get('API_URL');
  }

  get Live_URL() {
    return this.get('Live_URL');
  }

  get API_KEY() {
    return this.get('API_KEY');
  }

  get API_KEY_DeepSeek() {
    return this.get('API_KEY_DeepSeek');
  }

  get API_KEY_GEMINI() {
    return this.get('API_KEY_GEMINI');
  }

  get AES_SECRET_KEY() {
    return this.get('AES_SECRET_KEY');
  }
}

// Export singleton instance
const Config = new ConfigManager();
export default Config;
