/**
 * Secure Runtime Configuration Service
 * Loads configuration at runtime to prevent API keys from being embedded in build
 */

interface AppConfig {
  API_KEY: string;
  API_KEY_DeepSeek: string;
  API_KEY_GEMINI: string;
  AES_SECRET_KEY: string;
  API_URL: string;
  Live_URL: string;
}

class ConfigService {
  private config: AppConfig | null = null;
  private configPromise: Promise<AppConfig> | null = null;
  private isProduction: boolean;

  constructor() {
    this.isProduction = import.meta.env.PROD || false;
  }

  private async loadRuntimeConfig(): Promise<AppConfig> {
    if (this.config) return this.config;
    if (this.configPromise) return this.configPromise;

    this.configPromise = this.fetchConfig();
    this.config = await this.configPromise;
    return this.config;
  }

  private async fetchConfig(): Promise<AppConfig> {
    // Force local config if running on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return {
        API_KEY: import.meta.env.VITE_API_KEY || '',
        API_KEY_DeepSeek: import.meta.env.VITE_API_KEY_DEEPSEEK || '',
        API_KEY_GEMINI: import.meta.env.VITE_API_KEY_GEMINI || '',
        AES_SECRET_KEY: import.meta.env.VITE_AES_SECRET_KEY || '',
        API_URL: 'http://localhost/patientport-latest/api/',
        Live_URL: 'http://localhost/patientport-latest',
        //API_URL: 'https://umahospital.obwebsite.in/api/',
        //Live_URL: 'https://umahospital.obwebsite.in',
      };
    }

    try {
      const response = await fetch('/api/config.php', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        const serverConfig = await response.json();
        return {
          API_KEY: serverConfig.VITE_API_KEY || '',
          API_KEY_DeepSeek: serverConfig.VITE_API_KEY_DEEPSEEK || '',
          API_KEY_GEMINI: serverConfig.VITE_API_KEY_GEMINI || '',
          AES_SECRET_KEY: serverConfig.VITE_AES_SECRET_KEY || '',
          API_URL: 'http://localhost/patientport-latest/api',
          Live_URL: 'http://localhost/patientport-latest',
          //API_URL: 'https://umahospital.obwebsite.in/api/',
          //Live_URL: 'https://umahospital.obwebsite.in',
        };
      }
    } catch (error) {
      console.warn('Failed to load server configuration:', error);
    }

    // fallback in dev mode
    if (!this.isProduction) {
      return {
        API_KEY: '', // Secure: Moved to backend
        API_KEY_DeepSeek: '', // Secure: Moved to backend
        API_KEY_GEMINI: '', // Secure: Moved to backend
        AES_SECRET_KEY: import.meta.env.VITE_AES_SECRET_KEY || '',
        API_URL: 'http://localhost/patientport-latest/api/',
        Live_URL: 'http://localhost/patientport-latest',
        //API_URL: 'https://umahospital.obwebsite.in/api/',
        //Live_URL: 'https://umahospital.obwebsite.in',
      };
    }

    throw new Error('Configuration not available. Please ensure server-side configuration is properly set up.');
  }

  private validateConfig(config: AppConfig): void {
    const requiredKeys: (keyof AppConfig)[] = ['AES_SECRET_KEY'];
    const missing = requiredKeys.filter(key => !config[key]);

    if (missing.length > 0) {
      if (this.isProduction) {
        console.warn(`Missing required configuration keys: ${missing.join(', ')}`);
      } else {
        console.warn(`Warning: Missing configuration keys: ${missing.join(', ')}`);
      }
    }
  }

  async getApiKey() { return ''; /* Secure: Only available on backend */ }
  async getDeepSeekApiKey() { return ''; /* Secure: Only available on backend */ }
  async getGeminiApiKey() { return ''; /* Secure: Only available on backend */ }
  async getAesSecretKey() { return (await this.loadRuntimeConfig()).AES_SECRET_KEY; }
  async getApiUrl() { return (await this.loadRuntimeConfig()).API_URL; }
  async getLiveUrl() { return (await this.loadRuntimeConfig()).Live_URL; }

  get isProductionMode() { return this.isProduction; }

  async getConfig(): Promise<AppConfig> {
    if (this.isProduction) throw new Error('Config access denied in production mode');
    return { ...(await this.loadRuntimeConfig()) };
  }

  async initialize(): Promise<void> {
    const config = await this.loadRuntimeConfig();
    this.validateConfig(config);
    console.log('Configuration loaded successfully');
  }
}

export const configService = new ConfigService();
export default configService;
