// List available models
import { config } from 'dotenv';
config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listAvailableModels() {
    console.log('Checking available models...\n');

    const url = `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`;

    try {
        const response = await fetch(url);
        console.log('Status:', response.status);

        const data = await response.json();

        if (data.models) {
            console.log('\n✅ Available Models:');
            data.models.forEach(model => {
                console.log(`- ${model.name}`);
                console.log(`  Display: ${model.displayName}`);
                console.log(`  Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
                console.log('');
            });
        } else {
            console.log('Response:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

listAvailableModels();
