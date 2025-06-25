const Anthropic = require('@anthropic-ai/sdk');
const { sanitizeLogData } = require('./middleware/security');

class ClaudeService {
  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    console.log('Claude service initialized successfully');
  }

  async generateCode(prompt) {
    const startTime = Date.now();
    
    try {
      // プロンプトの前処理とログ
      const sanitizedPrompt = prompt.substring(0, 100) + (prompt.length > 100 ? '...' : '');
      console.log(`Sending request to Claude API (prompt length: ${prompt.length})`);
      
      const message = await this.client.messages.create({
        model: "claude-3-sonnet-20240229", // より安全で高速なモデルに変更
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: prompt
        }],
        temperature: 0.7,
      });

      const duration = Date.now() - startTime;
      const responseLength = message.content[0]?.text?.length || 0;
      
      console.log(`Claude API request completed in ${duration}ms (response length: ${responseLength})`);
      
      return message.content[0].text;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // エラーログのサニタイゼーション
      const sanitizedError = sanitizeLogData({
        message: error.message,
        status: error.status,
        type: error.type,
        duration: `${duration}ms`
      });
      
      console.error('Claude API Error:', sanitizedError);
      
      // エラーの詳細を隠して再スロー
      if (error.status === 429) {
        throw new Error('Rate limit exceeded');
      } else if (error.status === 401) {
        throw new Error('Authentication failed');
      } else if (error.status === 400) {
        throw new Error('Invalid request');
      } else {
        throw new Error('Claude API request failed');
      }
    }
  }
}

module.exports = new ClaudeService(); 