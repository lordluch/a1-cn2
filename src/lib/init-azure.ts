import { ensureContainerExists, ensureTableExists } from './azure';

export async function initializeAzureResources() {
  try {
    console.log('🚀 Initializing Azure resources...');
    
    await ensureContainerExists();
    console.log('✅ Container created/verified');
    
    await ensureTableExists();
    console.log('✅ Table created/verified');
    
    console.log('🎉 Azure resources initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing Azure resources:', error);
    throw error;
  }
}
