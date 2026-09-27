import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

// Fallback signature Flat 402 Peacemaker Recipe
function getFallbackMenu(payload: any) {
  const bhavyaCraving = payload?.cravings?.bhavya || 'Crispy cheesy Mexican quesadilla';
  const rahulCraving = payload?.cravings?.rahul || 'Desi Masala 2-minute Maggi';
  const priyaCraving = payload?.cravings?.priya || 'Wholesome home-cooked wheat roti';

  return {
    dishTitle: 'Cheesy Maggi-Stuffed Roti Quesadilla',
    subtitle: 'The Golden Triangle of College Flat Dining: Crispy Whole Wheat Roti Exterior + Gooey Mozzarella + Masala Maggi Core.',
    compromiseLogic: `Satisfies Priya's whole-wheat home food rule, Rahul's spicy masala noodle fix, and Bhavya's molten cheesy crunch craving without ordering takeout!`,
    consensusScore: 98,
    cookTimeMins: 22,
    primaryChef: 'Bhavya',
    chefAnnouncement: 'Aaj ka menu ye hai, Bhavya bana raha hai!',
    otherRoommates: [
      { name: 'Rahul', status: 'Will Clean / Wash Dishes Later', detail: 'Washing tawa, prep pan & cutlery' },
      { name: 'Priya', status: 'Dining Guest', detail: 'Setting plates & wiping dining counter' },
    ],
    recipeSteps: [
      { step: 1, task: 'Mis-en-Place & Pan Heating', instruction: 'Slice onions and fresh green chillies thinly. Warm 4 leftover rotis on a low tawa so they become pliable without cracking.', time: '4 mins' },
      { step: 2, task: 'Spicy Masala Maggi Reduction', instruction: 'In a saucepan, boil 1.5 cups water. Add 2 Maggi cakes with tastemaker and chopped chillies. Cook down until thick and dry-style (zero excess soup).', time: '6 mins' },
      { step: 3, task: 'Stuffing & Quesadilla Folding', instruction: 'Lay warm rotis flat. Spread spicy Maggi across one half, cover with grated Amul Mozzarella & Cheddar blend, and fold over into a crisp half-moon.', time: '4 mins' },
      { step: 4, task: 'Cast-Iron Tawa Toasting & Meltdown', instruction: 'Melt a dab of butter on hot tawa. Toast folded quesadillas for 3 mins per side until golden, crispy, and cheese pulls gooey when cut.', time: '8 mins' },
    ],
    requiredIngredients: [
      { name: 'Maggi Masala 2-Minute Noodles', amount: '2 packs deducted', inPantry: true },
      { name: 'Fresh Leftover Whole Wheat Rotis', amount: '4 Rotis used', inPantry: true },
      { name: 'Mozzarella & Cheddar Blend', amount: '100g melted', inPantry: true },
      { name: 'Green Chillies, Onion & Oregano', amount: 'Spices applied', inPantry: true },
    ],
    satisfactionScores: {
      bhavya: 95,
      rahul: 92,
      priya: 100,
    },
    dutyDivision: [
      { step: 1, roommate: 'Bhavya', task: 'Head Chef Execution', description: 'Preps, cooks dry Maggi, folds quesadillas, and toasts on tawa.' },
      { step: 2, roommate: 'Rahul', task: 'Wash Dishes & Cleanup', description: 'Cleans cast-iron skillet, pots, and prep cutlery.' },
      { step: 3, roommate: 'Priya', task: 'Dining Guest & Table Setup', description: 'Sets table, brings water, and wipes kitchen counter.' },
    ],
  };
}

// Server API proxy route for Gemini menu arbitration
app.post('/api/generate-menu', async (req, res) => {
  try {
    const { date, mealSlot, cravings, pantry } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      console.warn('GEMINI_API_KEY not configured or placeholder detected on server. Returning signature Peacemaker dish.');
      return res.json(getFallbackMenu({ date, mealSlot, cravings, pantry }));
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are RoomieBite AI, an expert peacemaker chef arbitrating meal disputes for 3 roommates in Flat 402:
- Bhavya: Craves "${cravings?.bhavya || 'Cheesy Mexican crunch'}"
- Rahul: Craves "${cravings?.rahul || 'Spicy 2-min instant fix'}"
- Priya: Craves "${cravings?.priya || 'Wholesome home-cooked wheat roti / healthy'}"

Available pantry stock: ${Array.isArray(pantry) ? pantry.join(', ') : 'Whole wheat rotis, Maggi noodles, cheese, onions, chillies, spices'}
Meal slot: ${mealSlot || 'Dinner'} (${date || 'Today'})

Assign ONLY ONE primary head chef (Bhavya, Rahul, or Priya) to cook the entire dish.
The other two roommates do not cook; they are assigned "Will Clean / Wash Dishes Later" or "Dining Guest" status.

Synthesize these conflicting cravings into ONE ingenious, delicious fusion dish that uses available pantry items with zero waste.
Return valid JSON matching this exact structure:
{
  "dishTitle": "Dish name",
  "subtitle": "Short 1-sentence tagline describing the fusion harmony",
  "compromiseLogic": "How this dish honors each roommate's craving and constraints",
  "consensusScore": 98,
  "cookTimeMins": 22,
  "primaryChef": "Bhavya",
  "chefAnnouncement": "Aaj ka menu ye hai, Bhavya bana raha hai!",
  "otherRoommates": [
    { "name": "Rahul", "status": "Will Clean / Wash Dishes Later", "detail": "Washing cooking pots and utensils" },
    { "name": "Priya", "status": "Dining Guest", "detail": "Wiping counter and table setup" }
  ],
  "recipeSteps": [
    { "step": 1, "task": "Prep & Mis-en-place", "instruction": "Chop vegetables and prepare spices.", "time": "4 mins" },
    { "step": 2, "task": "Core Cooking", "instruction": "Cook primary ingredients.", "time": "8 mins" },
    { "step": 3, "task": "Assembly & Finishing", "instruction": "Assemble and toast or bake.", "time": "6 mins" },
    { "step": 4, "task": "Plating & Presentation", "instruction": "Garnish and plate hot.", "time": "4 mins" }
  ],
  "requiredIngredients": [
    { "name": "Ingredient 1", "amount": "e.g. 2 packs deducted", "inPantry": true },
    { "name": "Ingredient 2", "amount": "e.g. 4 rotis used", "inPantry": true },
    { "name": "Ingredient 3", "amount": "e.g. 100g melted", "inPantry": true },
    { "name": "Ingredient 4", "amount": "e.g. Spices applied", "inPantry": true }
  ],
  "satisfactionScores": {
    "bhavya": 95,
    "rahul": 92,
    "priya": 100
  }
}`;

    let responseText = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      responseText = response.text || '';
    } catch (primaryErr) {
      console.warn('gemini-2.5-flash call failed, trying gemini-3.8-flash:', primaryErr);
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      responseText = fallbackResponse.text || '';
    }

    if (!responseText) {
      throw new Error('Empty response received from Gemini API');
    }

    const data = JSON.parse(responseText);
    return res.json(data);
  } catch (error) {
    console.error('Server error generating menu with Gemini:', error);
    return res.json(getFallbackMenu(req.body));
  }
});

// Mount Vite in development or static files in production
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});
