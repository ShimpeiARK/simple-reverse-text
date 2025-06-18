const Anthropic = require('@anthropic-ai/sdk');

class ClaudeService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateCode(prompt) {
    try {
      const message = await this.client.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: prompt
        }],
        temperature: 0.7,
      });

      return message.content[0].text;
    } catch (error) {
      console.error('Claude API Error:', error);
      throw error;
    }
  }
}

module.exports = new ClaudeService(); 