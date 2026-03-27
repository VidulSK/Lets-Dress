import { Client } from '@gradio/client';
import fs from 'fs';

const spaces = [
  'y02DSS/IDM-VTON',
  'Alexee/IDM-VTON',
  'Shine123/Virtual-Try-On',
  'Nymbo/Virtual-Try-On',
  'yisol/IDM-VTON'
];

async function run() {
  // Using essentially an empty/invalid token to test if it's completely unprotected
  const token = undefined; 
  
  const bgBlob = new Blob([fs.readFileSync('public/avatars/male-neutral.png')], { type: 'image/png' });
  const garmentBlob = new Blob([fs.readFileSync('public/avatars/male-neutral.png')], { type: 'image/jpeg' });
  
  for (const space of spaces) {
    console.log(`\nTesting ${space}...`);
    try {
      const client = await Client.connect(space, { hf_token: token }).catch(e => {
        if (e.message.includes('Config')) throw e;
        return Client.connect(space); // Try entirely unauthenticated
      });
      
      const result = await client.predict('/tryon', {
        dict: { background: bgBlob, layers: [], composite: null },
        garm_img: garmentBlob,
        garment_des: 'clothing',
        is_checked: true,
        is_checked_crop: false,
        denoise_steps: 30,
        seed: 42,
      }).catch(e => {
        // Fallback positional
        return client.predict('/tryon', [
          { background: bgBlob, layers: [], composite: null },
          garmentBlob,
          'clothing',
          true,
          false,
          30,
          42
        ]);
      });
      console.log(`✅ Success on ${space}!`);
      break;
    } catch (err) {
      console.log(`❌ Failed:`, err?.message || 'Unknown error');
    }
  }
}
run();
