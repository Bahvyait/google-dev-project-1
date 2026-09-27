import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Sparkles,
  CheckCircle2,
  Clock,
  Flame,
  Scale,
  Calendar,
  ChefHat,
  Share2,
  Bell,
  Plus,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Check,
  AlertTriangle,
  Send,
  FileCode,
  X,
  Printer,
  Copy,
  Download,
  CalendarPlus,
  MessageSquare,
  CheckSquare
} from 'lucide-react';
import { generateMenu } from './services/gemini.js';

// Hotlinked media assets from Flat 402 RoomieBite screens
const ASSETS = {
  logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGv8bFZ92Z1thuWOUVnFlm-N72JGMjqgUQIpulWwynAMYKdmpvV7Q9kGeE0gv8jDK81CETioOFAHQGn0Zvi-kC8x4ZaUJrVsm-Or2tZ0di3P-iIzwZVU3BKFSLBwB82NdghtRwOq939mm_4cWzT68EdYM-JUkvRoi7UyexOYT9fQ0vKrh8NQasVmmQlnpXWqe3_1vG84GBpn-Ov44pn2htRBY84IxIl-2MRWMCfnFbVMGDdVYqrqc',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCeNjBFrTb8S_qMdXKj66gJxQrBdmucaJpclEJeJDsvVRfBC0frM5_US1HtyXOzxOGNOmTiHvuOEjFDuxyfwrgdvvNDTNNT_OXF2le-gCuOMJlFOo9rS4xk5u-SGdZH-z4fJ0j8wtFaHcVSu-PQdb9rmheWzL9xXU-ZAC9I-NGX_KBTFZIHGvpUvdWhyePrBJt3JnJokeB3eyN8XGUaLZP7ZnSEGxBWJK8Gr5jJzRjEXEXDMIrBg0',
  dishPhoto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZFTDZkKGX2d3pk6pn0Lhgn4Y3ftw6SRSr3G5F9bhy4dRn3I6I18TYEvL79ErgG0MEyDULTupx78SmVgxisiOVFOkCder7Ao-E6pL70M_mdWNXcJ7i4chL412flq-Di4psy00-wRFD_E_GmH_GKHIhRiw8EqE4d-ay7SGcKxcE8gFLocCH_dknr8l-RIM2NzW5JugGtpaZ5R2t7aOHsLrBfQvmIJoiQNVVRv8JWfIcLE0msRRWmnw',
  weeklyDishPhoto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcDT43Hv_IWiUMjUIfDuXHI8RzXxOONupvDqg847xI_mxAgD8FIk-Oqub9sq6ENBkSiWnno32BQJG5ucKy6H8EczO10B4zRddyNKWQH7oNdshd5XkCEuIehGSazQoVHsWvbM9S7EotFis1TgcrewDyfPznxfAUvm67dQvZY_08HgKZVuAJoAZjjxpseNpUECrjahdGLF5PUVgZLh1pE-4s3pfT9gZVGXsL-2MQKOcgX9sog5UVmJ8',
  kitchenPrepPhoto: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDy6s5BPxO5axBY0r6rIKMvMlCdY9ePQ79nzXetFI_Y_2DWRJTgMQ2r7QGxyHJWBm6JVlUwQBr26gh5adczCAkgwsOvtDYgc4nbS2T51VcmguGtgSYzhrWSnrkgRQPVBc-dtq6KhjMJLbqHViFcTaCL-fDOmyGRAQjM1ZyUX9DE9BGI9m3JaKtArS-rAV8VWGJEKuJ4GR7WyOm6McfzFtRQLok-rIBPv9jbEpNYREbtKSsYmcvIOyU',
};

export default function App() {
  // Navigation tabs: 'cravings-and-pantry' | 'meal-resolver' | 'weekly-menu'
  const [activeTab, setActiveTab] = useState('cravings-and-pantry');

  // Input states
  const [date, setDate] = useState('Sunday, 27 Sep 2026');
  const [mealSlot, setMealSlot] = useState('Dinner');
  const [cravings, setCravings] = useState({
    bhavya: 'Crispy cheesy Mexican quesadilla or spicy tacos. Needs serious crunch, jalapeños, and lots of melted cheese!',
    rahul: 'Desi Masala 2-minute Maggi with butter and extra fresh green chillies, fast & spicy! My brain is done after work.',
    priya: "Wholesome home-cooked wheat roti or roll wrap. Don't want heavy junk or ordering out oily curries again this week.",
  });

  // Pantry items state (checkboxes)
  const [pantryItems, setPantryItems] = useState([
    { id: '1', name: 'Whole Wheat Atta & Fresh Roti', detail: 'Plenty • 12 pre-rolled discs in box', inStock: true },
    { id: '2', name: 'Maggi 2-Minute Masala Noodles', detail: 'Pantry shelf #2 • 3 packets', inStock: true },
    { id: '3', name: 'Amul Mozzarella & Cheddar Blend', detail: 'Crisper drawer • 250g sealed block', inStock: true },
    { id: '4', name: 'Onions, Green Chillies & Cilantro', detail: 'Fresh basket • Freshly washed', inStock: true },
    { id: '5', name: 'Chaat Masala & Kitchen Spices', detail: 'Full spice box • Jeera, chilli powder', inStock: true },
  ]);

  const [newIngredient, setNewIngredient] = useState('');

  // Loading & Result state from Gemini AI
  const [loading, setLoading] = useState(false);
  const [menuResult, setMenuResult] = useState(null);

  // Single Head Chef State (Defaults to Bhavya, switchable among flatmates)
  const [selectedChef, setSelectedChef] = useState('Bhavya');

  // Modals for Export, Calendar, Dispatch, and JSON inspection
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  // In-app Toast message
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // 20-min Cooking Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(1320); // 22 mins default

  useEffect(() => {
    let interval = null;
    if (timerActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setTimerActive(false);
      clearInterval(interval);
      triggerToast('🎉 Dinner is Ready! Time for Flat 402 to feast.');
    }
    return () => clearInterval(interval);
  }, [timerActive, secondsRemaining]);

  // Initial load: populate with default arbitrated dish matching screenshot
  useEffect(() => {
    setMenuResult({
      dishTitle: 'Cheesy Maggi-Stuffed Roti Quesadilla',
      subtitle: 'The Golden Triangle of College Flat Dining: Crispy Whole Wheat Roti Exterior + Gooey Mozzarella + Masala Maggi Core.',
      compromiseLogic: '“Satisfies Priya’s whole-wheat home food rule, Rahul’s spicy masala noodle fix, and Bhavya’s molten cheesy crunch craving without ordering takeout!”',
      consensusScore: 98,
      cookTimeMins: 22,
      primaryChef: 'Bhavya',
      chefAnnouncement: 'Aaj ka menu ye hai, Bhavya bana raha hai!',
      recipeSteps: [
        {
          step: 1,
          task: 'Mis-en-Place & Pan Heating',
          instruction: 'Slice fresh green chillies and onions thinly. Warm 4 leftover rotis on a low tawa so they become pliable without cracking.',
          time: '4 mins',
        },
        {
          step: 2,
          task: 'Spicy Masala Maggi Reduction',
          instruction: 'In a saucepan, boil 1.5 cups water. Add 2 Maggi cakes with tastemaker and chopped chillies. Cook down until thick and dry-style (zero excess soup).',
          time: '6 mins',
        },
        {
          step: 3,
          task: 'Stuffing & Quesadilla Folding',
          instruction: 'Lay warm rotis flat. Spread spicy Maggi across one half, cover with grated Amul Mozzarella & Cheddar blend, and fold over into a crisp half-moon.',
          time: '4 mins',
        },
        {
          step: 4,
          task: 'Cast-Iron Tawa Toasting & Meltdown',
          instruction: 'Melt a dab of butter on hot tawa. Toast folded quesadillas for 3 mins per side until golden, crispy, and cheese pulls gooey when cut.',
          time: '8 mins',
        },
      ],
      otherRoommates: [
        { name: 'Rahul', status: 'Will Clean / Wash Dishes Later', detail: 'Washing tawa, prep pan & cutlery' },
        { name: 'Priya', status: 'Dining Guest', detail: 'Setting plates & wiping dining counter' },
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
    });
  }, []);

  // Handle Gemini AI Arbitration
  const handleGenerate = async () => {
    setLoading(true);
    const activePantry = pantryItems.filter((i) => i.inStock).map((i) => i.name);
    const payload = {
      date,
      mealSlot,
      cravings,
      pantry: activePantry,
    };

    try {
      const result = await generateMenu(payload);
      if (result) {
        setMenuResult(result);
        if (result.primaryChef) {
          setSelectedChef(result.primaryChef);
        }
      }
      setActiveTab('meal-resolver');
      triggerToast('✨ Peacemaker Menu Arbitrated Successfully!');
    } catch (err) {
      console.error('Arbitration notice:', err);
      setActiveTab('meal-resolver');
      triggerToast('✨ Peacemaker Menu Synthesized for Flat 402!');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (!newIngredient.trim()) return;
    setPantryItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: newIngredient.trim(),
        detail: 'User added item • In stock',
        inStock: true,
      },
    ]);
    triggerToast(`Added "${newIngredient.trim()}" to Flat 402 inventory!`);
    setNewIngredient('');
  };

  const togglePantryStock = (id) => {
    setPantryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, inStock: !item.inStock } : item))
    );
  };

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Export & Calendar Sync Handlers
  const handleDownloadICS = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//RoomieBite AI//Flat 402 Food Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:flat402-sun-dinner@roomiebite.ai
DTSTAMP:20260927T140000Z
DTSTART:20260927T143000Z
DTEND:20260927T153000Z
SUMMARY:🥘 Flat 402 Dinner: Cheesy Maggi-Stuffed Roti Quesadilla
DESCRIPTION:Chef: Bhavya | Sous-Chef: Rahul | Clean-up: Priya\\nArbitrated by RoomieBite AI (98% Harmony).
LOCATION:Flat 402 Kitchen
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:flat402-mon-lunch@roomiebite.ai
DTSTAMP:20260927T140000Z
DTSTART:20260928T080000Z
DTEND:20260928T090000Z
SUMMARY:🌯 Flat 402 Lunch: Paneer Bhurji Kathi Rolls
DESCRIPTION:Chef: Rahul | Clean-up: Bhavya\\nPantry: Atta + Paneer in Fridge.
LOCATION:Flat 402 Kitchen
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:flat402-mon-dinner@roomiebite.ai
DTSTAMP:20260927T140000Z
DTSTART:20260928T150000Z
DTEND:20260928T160000Z
SUMMARY:🍝 Flat 402 Dinner: Creamy Tomato Masala Pasta
DESCRIPTION:Chef: Priya | Clean-up: Rahul\\nGrocery Alert: Buy Pasta Sauce.
LOCATION:Flat 402 Kitchen
STATUS:CONFIRMED
END:VEVENT
BEGIN:VEVENT
UID:flat402-tue-dinner@roomiebite.ai
DTSTAMP:20260927T140000Z
DTSTART:20260929T150000Z
DTEND:20260929T160000Z
SUMMARY:🍛 Flat 402 Dinner: Tawa Pulao with Boondi Raita
DESCRIPTION:Chef: Bhavya | Clean-up: Priya\\nPantry: Rice & Veggies Ready.
LOCATION:Flat 402 Kitchen
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Flat402_Meal_Schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('📅 Calendar (.ics) downloaded! Ready to import into Google or Apple Calendar.');
  };

  const handleDownloadRosterTxt = () => {
    const content = `======================================================
  FLAT 402 MEAL SCHEDULE & CHORE ROSTER
  Week of Sunday, 27 Sep 2026 - Saturday, 03 Oct 2026
  RoomieBite AI Arbitrated • 96% Chore & Cook Equity
======================================================

TODAY'S SPECIAL (Sun 27 Sep • Dinner):
- Dish: Cheesy Maggi-Stuffed Roti Quesadilla
- Cook Time: 22 Mins | Style: Zero-Waste Fusion
- Lead Cook: Bhavya
- Sous-Chef: Rahul (Prep & Chillies Chopping)
- Plating & Dishes: Priya
- Ingredients: 4 Whole Wheat Rotis, 2 Maggi pkts, 100g Mozzarella, Chillies & Butter

UPCOMING ROADMAP:
1. Mon 28 Sep (Lunch): Paneer Bhurji Kathi Rolls
   - Chef: Rahul | Cleanup: Bhavya
   - Pantry: Atta + Paneer ready in fridge

2. Mon 28 Sep (Dinner): Creamy Tomato Masala Pasta
   - Chef: Priya | Cleanup: Rahul
   - Shopping Alert: Buy Pasta Sauce (Blinkit)

3. Tue 29 Sep (Dinner): Tawa Pulao with Boondi Raita
   - Chef: Bhavya | Cleanup: Priya
   - Pantry: Rice & Veggies ready

PEACEFUL KITCHEN RULE:
Rotate who picks the wildcard side dish to keep dinner democracy thriving!
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Flat402_Menu_Roster.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('📄 Flat Menu Roster (.txt) saved for offline fridge printing!');
  };

  const weeklySummaryText = `🍽️ Flat 402 Weekly Meal & Chore Dispatch 🍲

• Sun Dinner: Cheesy Maggi-Stuffed Roti Quesadilla
  👨‍🍳 Lead Cook: Bhavya | Prep: Rahul | Cleanup: Priya
• Mon Lunch: Paneer Bhurji Kathi Rolls
  👨‍🍳 Chef: Rahul | Cleanup: Bhavya
• Mon Dinner: Creamy Tomato Masala Pasta
  👨‍🍳 Chef: Priya | Cleanup: Rahul
• Tue Dinner: Tawa Pulao with Boondi Raita
  👨‍🍳 Chef: Bhavya | Cleanup: Priya

🛒 Pantry Alert: Buy Pasta Sauce & Capsicum
✨ Arbitrated with 98% Consensus by RoomieBite AI!`;

  const handleCopySummary = () => {
    navigator.clipboard.writeText(weeklySummaryText);
    triggerToast('📋 Weekly summary copied to clipboard!');
  };

  const handlePrint = () => {
    setShowPrintModal(false);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Helper for post-meal duties of other flatmates
  const getOtherRoommates = (chef) => {
    const all = [
      { name: 'Bhavya', initial: 'B', badgeColor: 'bg-[#ffdbca] text-[#341100]', cleanTask: 'Soaking tawa, prep pan & sink dish duty' },
      { name: 'Rahul', initial: 'R', badgeColor: 'bg-[#ffdbd0] text-[#390c00]', cleanTask: 'Washing tawa, cooking pots & cutlery' },
      { name: 'Priya', initial: 'P', badgeColor: 'bg-[#6cf8bb] text-[#002113]', cleanTask: 'Setting dining table & wiping kitchen counters' },
    ];
    return all
      .filter((r) => r.name !== chef)
      .map((r, idx) => ({
        ...r,
        statusBadge: idx === 0 ? 'Will Clean / Wash Dishes Later' : 'Dining Guest',
        statusIcon: idx === 0 ? '🧹' : '🍽️',
      }));
  };

  // Step-by-step recipe steps for single chef
  const currentRecipeSteps = (menuResult?.recipeSteps && menuResult.recipeSteps.length > 0)
    ? menuResult.recipeSteps
    : [
        {
          step: 1,
          task: 'Mis-en-Place & Pan Heating',
          instruction: 'Slice fresh green chillies and onions thinly. Warm 4 leftover rotis on a low tawa so they become pliable without cracking.',
          time: '4 mins',
        },
        {
          step: 2,
          task: 'Spicy Masala Maggi Reduction',
          instruction: 'In a saucepan, boil 1.5 cups water. Add 2 Maggi cakes with tastemaker and chopped chillies. Cook down until thick and dry-style (zero excess soup).',
          time: '6 mins',
        },
        {
          step: 3,
          task: 'Stuffing & Quesadilla Folding',
          instruction: 'Lay warm rotis flat. Spread spicy Maggi across one half, cover with grated Amul Mozzarella & Cheddar blend, and fold over into a crisp half-moon.',
          time: '4 mins',
        },
        {
          step: 4,
          task: 'Cast-Iron Tawa Toasting & Meltdown',
          instruction: 'Melt a dab of butter on hot tawa. Toast folded quesadillas for 3 mins per side until golden, crispy, and cheese pulls gooey when cut.',
          time: '8 mins',
        },
      ];

  return (
    <div className="bg-[#f9f9ff] text-[#111c2d] min-h-screen flex flex-col justify-between selection:bg-[#ffdbca] selection:text-[#341100]">
      {/* 1. Global Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-[#f0f3ff] shadow-[0_1px_8px_rgba(0,0,0,0.04)] no-print">
        <div className="h-20 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between gap-4">
          {/* Logo & Peacemaker Status */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('cravings-and-pantry')}>
              <img
                src={ASSETS.logo}
                alt="RoomieBite AI Logo"
                className="h-10 w-auto object-contain hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="font-['Epilogue'] font-bold text-xl text-[#9d4300] leading-tight flex items-center gap-1">
                  RoomieBite AI
                </span>
                <span className="text-[11px] font-semibold text-[#584237] tracking-normal">
                  AI Roommate Meal Arbitrator
                </span>
              </div>
            </div>

            <div className="hidden xl:flex items-center gap-2 pl-2">
              <div className="inline-flex items-center gap-1.5 bg-[#6cf8bb]/40 text-[#00714d] px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-[#006c49] animate-pulse"></span>
                PEACEMAKER ONLINE
              </div>
              <div className="inline-flex items-center gap-1.5 bg-[#f0f3ff] text-[#584237] px-3 py-1 rounded-full text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f97316]"></span>
                Flat 402 • 3 Roomies Active
              </div>
            </div>
          </div>

          {/* Navigation Pill Switcher */}
          <nav className="flex items-center gap-1 bg-[#f0f3ff] p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('cravings-and-pantry')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'cravings-and-pantry'
                  ? 'bg-[#f97316] text-white shadow-sm'
                  : 'text-[#584237] hover:text-[#111c2d] hover:bg-[#e7eeff]'
              }`}
            >
              Cravings & Pantry
            </button>
            <button
              onClick={() => setActiveTab('meal-resolver')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'meal-resolver'
                  ? 'bg-[#f97316] text-white shadow-sm'
                  : 'text-[#584237] hover:text-[#111c2d] hover:bg-[#e7eeff]'
              }`}
            >
              Meal Resolver
            </button>
            <button
              onClick={() => setActiveTab('weekly-menu')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'weekly-menu'
                  ? 'bg-[#f97316] text-white shadow-sm'
                  : 'text-[#584237] hover:text-[#111c2d] hover:bg-[#e7eeff]'
              }`}
            >
              Weekly Menu
            </button>
          </nav>

          {/* Action Button & Avatar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveTab('cravings-and-pantry');
                window.scrollTo({ top: 300, behavior: 'smooth' });
              }}
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#f97316] hover:bg-[#ea580c] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Bite</span>
            </button>
            <button
              onClick={() => triggerToast('🔔 Flat 402: All 3 roomies confirmed dinner availability!')}
              className="relative p-2 rounded-full text-[#584237] hover:text-[#111c2d] hover:bg-[#f0f3ff] transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ac3400] rounded-full ring-2 ring-white"></span>
            </button>
            <div className="flex items-center pl-1">
              <img
                src={ASSETS.avatar}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-[#ffdbca]"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full pt-24 pb-12 flex-1">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Loading View Spinner with clean text */}
          {loading && (
            <div className="min-h-[460px] flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-md border border-[#f0f3ff] my-6">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-[#ffdbca] border-t-[#f97316] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <ChefHat className="w-7 h-7 text-[#9d4300]" />
                </div>
              </div>
              <h2 className="font-['Epilogue'] font-bold text-2xl text-[#111c2d] mb-2 text-center">
                Arbitrating Flat 402 Cravings...
              </h2>
              <p className="text-sm text-[#584237] max-w-md text-center leading-relaxed">
                Consulting RoomieBite AI Peacemaker logic to synthesize crunchy Tex-Mex, spicy instant Maggi, and wholesome rotis into a zero-waste harmony!
              </p>
            </div>
          )}

          {/* TAB 1: Cravings & Pantry (Input View) */}
          {!loading && activeTab === 'cravings-and-pantry' && (
            <div className="flex flex-col gap-6">
              {/* Context Bar */}
              <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-[#f0f3ff]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#f97316]/15 flex items-center justify-center text-[#f97316]">
                    <UtensilsCrossed className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs uppercase tracking-wider text-[#9d4300] font-bold">
                        Apartment Collective
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#006c49]"></span>
                      <span className="text-xs text-[#584237] font-medium">Synced 3m ago</span>
                    </div>
                    <h1 className="font-['Epilogue'] font-semibold text-2xl text-[#111c2d] tracking-tight">
                      What's Cooking Tonight, Flat 402? 🍲
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <div className="flex -space-x-2 overflow-hidden items-center py-1 pl-1 pr-3 rounded-full bg-[#f0f3ff]">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-white bg-[#f97316] text-white font-bold text-xs">
                      BH
                    </span>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-white bg-[#006c49] text-white font-bold text-xs">
                      RH
                    </span>
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-white bg-[#ac3400] text-white font-bold text-xs">
                      PR
                    </span>
                    <span className="text-xs text-[#584237] pl-3 font-semibold">3 In Sync</span>
                  </div>
                </div>
              </section>

              {/* Date & Meal Slot Selector */}
              <section className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-[#f0f3ff]">
                <div className="flex items-center gap-3 bg-[#f0f3ff] px-4 py-2 rounded-lg text-[#111c2d]">
                  <Calendar className="w-5 h-5 text-[#9d4300]" />
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#584237] font-semibold">Scheduled Arbitration</span>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="bg-transparent font-bold text-sm focus:outline-none text-[#111c2d]"
                    />
                  </div>
                </div>

                {/* Meal Slots */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-[#f0f3ff] p-1 rounded-xl">
                  {['Breakfast', 'Lunch', 'Dinner', 'Late Munchies'].map((slot) => {
                    const isSelected = mealSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => {
                          setMealSlot(slot);
                          triggerToast(`Switched slot to ${slot}`);
                        }}
                        className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#f97316] text-white shadow-sm'
                            : 'text-[#584237] hover:bg-white/80'
                        }`}
                      >
                        {slot === 'Dinner' && <Flame className="w-3.5 h-3.5" />}
                        <span>{slot} {slot === 'Dinner' ? '🔥' : ''}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 2-Column Core: Roommate Cravings (Left) vs. Kitchen & Pantry Stock (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Declared Cravings Form (Span 7) */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <h2 className="font-['Epilogue'] font-semibold text-xl text-[#111c2d] tracking-tight">
                        Declared Cravings
                      </h2>
                      <p className="text-xs text-[#584237]">
                        Housemates submit their honest desires before the 7:30 PM deadline
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-[#006c49] bg-[#6cf8bb]/40 px-3 py-1 rounded-full font-bold">
                      <Check className="w-3.5 h-3.5" /> All Submitted
                    </span>
                  </div>

                  {/* Roommate 1: Bhavya */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-[#f0f3ff] relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl bg-[#ffdbca] flex items-center justify-center font-['Epilogue'] text-lg text-[#341100] font-bold shadow-inner">
                            BH
                          </div>
                          <span className="absolute -bottom-1 -right-1 bg-white text-xs p-0.5 rounded-full shadow-sm">
                            🧀
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-['Epilogue'] font-semibold text-lg text-[#111c2d]">Bhavya</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#ffdbca] text-[#783200] font-bold">
                              Craving Master
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] px-2 py-0.5 rounded bg-[#e7eeff] text-[#584237] font-medium">Vegetarian</span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-[#e7eeff] text-[#584237] font-medium">Cheesy</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#ac3400] bg-[#ffdbd0] px-2.5 py-1 rounded-full">
                        8.5 / 10 • Ravenous
                      </span>
                    </div>

                    <div className="w-full bg-[#e7eeff] rounded-full h-2 mb-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-[#f97316] to-[#ac3400] h-full rounded-full" style={{ width: '85%' }}></div>
                    </div>

                    <div className="relative">
                      <textarea
                        value={cravings.bhavya}
                        onChange={(e) => setCravings({ ...cravings, bhavya: e.target.value })}
                        rows={2}
                        className="w-full bg-[#f0f3ff] p-3 rounded-lg text-sm text-[#111c2d] italic focus:outline-none focus:ring-2 focus:ring-[#f97316] resize-none border border-transparent"
                        placeholder="What is Bhavya craving?"
                      />
                    </div>
                  </div>

                  {/* Roommate 2: Rahul */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-[#f0f3ff] relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl bg-[#ffdbd0] flex items-center justify-center font-['Epilogue'] text-lg text-[#390c00] font-bold shadow-inner">
                            RH
                          </div>
                          <span className="absolute -bottom-1 -right-1 bg-white text-xs p-0.5 rounded-full shadow-sm">
                            🌶️
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-['Epilogue'] font-semibold text-lg text-[#111c2d]">Rahul</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#ffdbd0] text-[#832600] font-bold">
                              Midnight Chef
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] px-2 py-0.5 rounded bg-[#e7eeff] text-[#584237] font-medium">High Spice</span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-[#e7eeff] text-[#584237] font-medium">Speed: &lt;10m</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#ba1a1a] bg-[#ffdad6] px-2.5 py-1 rounded-full">
                        9.0 / 10 • Critical
                      </span>
                    </div>

                    <div className="w-full bg-[#e7eeff] rounded-full h-2 mb-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-[#9d4300] to-[#ba1a1a] h-full rounded-full" style={{ width: '90%' }}></div>
                    </div>

                    <div className="relative">
                      <textarea
                        value={cravings.rahul}
                        onChange={(e) => setCravings({ ...cravings, rahul: e.target.value })}
                        rows={2}
                        className="w-full bg-[#f0f3ff] p-3 rounded-lg text-sm text-[#111c2d] italic focus:outline-none focus:ring-2 focus:ring-[#f97316] resize-none border border-transparent"
                        placeholder="What is Rahul craving?"
                      />
                    </div>
                  </div>

                  {/* Roommate 3: Priya */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-[#f0f3ff] relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl bg-[#6cf8bb] flex items-center justify-center font-['Epilogue'] text-lg text-[#002113] font-bold shadow-inner">
                            PR
                          </div>
                          <span className="absolute -bottom-1 -right-1 bg-white text-xs p-0.5 rounded-full shadow-sm">
                            🥗
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-['Epilogue'] font-semibold text-lg text-[#111c2d]">Priya</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#6cf8bb]/40 text-[#00714d] font-bold">
                              Health Guard
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] px-2 py-0.5 rounded bg-[#e7eeff] text-[#584237] font-medium">Whole Grain</span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-[#e7eeff] text-[#584237] font-medium">No Takeout</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#006c49] bg-[#6cf8bb]/40 px-2.5 py-1 rounded-full">
                        7.0 / 10 • Moderate
                      </span>
                    </div>

                    <div className="w-full bg-[#e7eeff] rounded-full h-2 mb-3 overflow-hidden">
                      <div className="bg-[#006c49] h-full rounded-full" style={{ width: '70%' }}></div>
                    </div>

                    <div className="relative">
                      <textarea
                        value={cravings.priya}
                        onChange={(e) => setCravings({ ...cravings, priya: e.target.value })}
                        rows={2}
                        className="w-full bg-[#f0f3ff] p-3 rounded-lg text-sm text-[#111c2d] italic focus:outline-none focus:ring-2 focus:ring-[#f97316] resize-none border border-transparent"
                        placeholder="What is Priya craving?"
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Kitchen & Pantry Stock (Span 5) */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-[#f0f3ff]">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h2 className="font-['Epilogue'] font-semibold text-xl text-[#111c2d] flex items-center gap-2">
                          Kitchen & Pantry Stock 🧺
                        </h2>
                        <p className="text-xs text-[#584237]">Live synced fridge & dry storage</p>
                      </div>
                      <RefreshCw className="w-4 h-4 text-[#006c49] animate-spin" />
                    </div>

                    {/* Stock Meter */}
                    <div className="my-3 p-3 bg-[#f0f3ff] rounded-lg flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold uppercase text-[#584237]">Pantry Readiness</span>
                        <span className="text-sm font-bold text-[#111c2d]">82% Meal Ready</span>
                      </div>
                      <svg className="w-24 h-7 text-[#006c49]" fill="none" viewBox="0 0 100 30">
                        <path d="M0 24 L20 18 L40 22 L60 8 L80 12 L100 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                        <path d="M0 24 L20 18 L40 22 L60 8 L80 12 L100 4 L100 30 L0 30 Z" fill="currentColor" fillOpacity="0.1" />
                      </svg>
                    </div>

                    {/* Stock Checkboxes */}
                    <div className="flex flex-col gap-2 mt-3">
                      {pantryItems.map((item) => (
                        <label
                          key={item.id}
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#f0f3ff] cursor-pointer transition-colors border border-transparent hover:border-[#dee8ff]"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={item.inStock}
                              onChange={() => togglePantryStock(item.id)}
                              className="w-4 h-4 rounded text-[#f97316] focus:ring-[#f97316] cursor-pointer"
                            />
                            <div className="flex flex-col">
                              <span className={`text-sm font-semibold ${item.inStock ? 'text-[#111c2d]' : 'text-gray-400 line-through'}`}>
                                {item.name}
                              </span>
                              <span className="text-xs text-[#584237]">{item.detail}</span>
                            </div>
                          </div>
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                              item.inStock
                                ? 'text-[#006c49] bg-[#6cf8bb]/40'
                                : 'text-gray-400 bg-gray-100'
                            }`}
                          >
                            {item.inStock ? 'Ready' : 'Out'}
                          </span>
                        </label>
                      ))}

                      {/* Missing stock alert */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[#ffdad6]/30 border border-[#ffdad6] mt-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-[#ba1a1a]" />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-[#111c2d]">Bell Peppers (Capsicum)</span>
                            <span className="text-[11px] text-[#ba1a1a] font-medium">0 left • Needed for Quesadilla crunch</span>
                          </div>
                        </div>
                        <a
                          href="https://blinkit.com"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] px-2.5 py-1 rounded bg-[#ffdad6] text-[#93000a] font-bold hover:bg-[#ffdad6]/80 transition-colors flex items-center gap-1"
                        >
                          <span>Quick-Blinkit</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Quick Add Ingredient Input */}
                    <form onSubmit={handleAddIngredient} className="mt-4 pt-3 border-t border-[#f0f3ff]">
                      <label className="block text-xs text-[#584237] mb-1 font-semibold">
                        Add Quick Ingredient
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newIngredient}
                          onChange={(e) => setNewIngredient(e.target.value)}
                          placeholder="e.g. Sriracha sauce, paneer, curd..."
                          className="flex-1 bg-[#f0f3ff] px-3 py-2 rounded-lg text-xs text-[#111c2d] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                        />
                        <button
                          type="submit"
                          className="bg-[#e7eeff] hover:bg-[#dee8ff] text-[#111c2d] px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
                        >
                          + Add Item
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Roommate Synergy Banner */}
                  <div className="rounded-xl overflow-hidden shadow-sm relative h-40 bg-[#f0f3ff] flex flex-col justify-end p-4 group">
                    <img
                      src={ASSETS.kitchenPrepPhoto}
                      alt="Kitchen prep"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                    <div className="relative z-10 text-white">
                      <span className="text-[11px] font-bold tracking-widest uppercase text-[#6ffbbe]">
                        Roommate Synergy Score
                      </span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-['Epilogue'] text-lg font-bold">68% Ingredient Overlap</span>
                        <span className="text-xs bg-[#6cf8bb]/90 text-[#002113] px-2.5 py-0.5 rounded-full font-bold">
                          Fusable Meal
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Arbitration Bar & Prominent CTA */}
              <section className="bg-white rounded-2xl p-6 shadow-md border border-[#f0f3ff] relative overflow-hidden mt-2">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="flex items-start gap-4 w-full lg:w-auto">
                    <div className="w-12 h-12 rounded-xl bg-[#ffdbd0] text-[#390c00] flex-shrink-0 flex items-center justify-center">
                      <Scale className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#111c2d]">3/3 Roommates Submitted Cravings</span>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] font-bold animate-pulse">
                          ⚡ High Conflict Potential
                        </span>
                      </div>
                      <p className="text-xs text-[#584237] mt-1 leading-relaxed">
                        AI Clash Analysis: <strong className="text-[#111c2d]">Mexican Cheesy Crunch</strong> vs.{' '}
                        <strong className="text-[#111c2d]">Spicy Desi Instant</strong> vs.{' '}
                        <strong className="text-[#111c2d]">Wholesome Clean Diet</strong>. Peacemaker required!
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setCravings({
                          bhavya: 'Loaded cheesy Mexican nachos with jalapenos and salsa',
                          rahul: 'Fiery garlic schezwan noodles with chillies',
                          priya: 'Steamed vegetable wheat paratha with curd',
                        });
                        triggerToast('Rolled fresh craving combination! 🎲');
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#f0f3ff] hover:bg-[#e7eeff] text-[#9d4300] text-sm px-4 py-3 rounded-xl transition-all font-bold"
                    >
                      <span>Quick Roll Dice 🎲</span>
                    </button>

                    {/* Prominent Generate Peacemaker Menu Button */}
                    <button
                      type="button"
                      onClick={handleGenerate}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white text-sm px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg transform active:scale-95 font-bold group"
                    >
                      <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
                      <span>Generate Peacemaker Menu</span>
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: Meal Resolver (Result View) */}
          {!loading && activeTab === 'meal-resolver' && menuResult && (
            <div className="flex flex-col gap-6">
              {/* Communal Harmony Banner */}
              <div className="w-full bg-gradient-to-r from-[#ffdbca] via-[#e7eeff] to-[#6cf8bb]/30 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 border border-[#f0f3ff]">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#9d4300] shadow-sm shrink-0">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-[#6cf8bb] text-[#00714d] px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide">
                        {menuResult.consensusScore || 98}% CONSENSUS
                      </span>
                      <span className="text-xs text-[#584237] font-semibold">• Kitchen Conflict Averted</span>
                    </div>
                    <p className="font-['Epilogue'] font-semibold text-lg text-[#111c2d] truncate mt-1">
                      Arbitration Score: {menuResult.consensusScore || 98}% • Cook Time: {menuResult.cookTimeMins || 22} Mins • Zero Food Waste
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setShowJsonModal(true)}
                    className="bg-white hover:bg-[#f9f9ff] text-[#111c2d] px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 border border-[#e7eeff]"
                  >
                    <FileCode className="w-4 h-4 text-[#9d4300]" />
                    <span>Live Consensus JSON</span>
                  </button>
                  <button
                    onClick={() => setShowDispatchModal(true)}
                    className="bg-[#006c49] text-white hover:opacity-95 px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <span>Sync Roomies 📲</span>
                  </button>
                </div>
              </div>

              {/* Ingestion Feed */}
              <div className="w-full">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tracking-wider uppercase text-[#ac3400]">Ingestion Feed</span>
                    <span className="text-xs text-[#8c7164]">• 3 Signals Synthesized</span>
                  </div>
                  <span className="text-xs text-[#006c49] flex items-center gap-1 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#006c49]"></span> Weighted Dynamic Allocation
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Bhavya */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-[#f0f3ff] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#ffdbd0] text-[#390c00] flex items-center justify-center font-bold text-xs">
                            B
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#111c2d]">Bhavya</p>
                            <p className="text-[11px] text-[#584237]">Craving: Cheesy Tex-Mex</p>
                          </div>
                        </div>
                        <span className="bg-[#dee8ff] text-[#582200] px-2 py-0.5 rounded-full text-[11px] font-semibold">
                          Weight: 35%
                        </span>
                      </div>
                      <p className="text-xs text-[#584237] bg-[#f0f3ff] p-2.5 rounded-lg mb-2 italic">
                        "{cravings.bhavya}"
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#8c7164] pt-1">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-[#ac3400]" /> High Intensity
                      </span>
                      <span className="text-[#006c49] font-semibold">
                        {menuResult.satisfactionScores?.bhavya || 100}% Satisfied
                      </span>
                    </div>
                  </div>

                  {/* Rahul */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-[#f0f3ff] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#ffdbca] text-[#341100] flex items-center justify-center font-bold text-xs">
                            R
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#111c2d]">Rahul</p>
                            <p className="text-[11px] text-[#584237]">Craving: Spicy Quick Fix</p>
                          </div>
                        </div>
                        <span className="bg-[#dee8ff] text-[#582200] px-2 py-0.5 rounded-full text-[11px] font-semibold">
                          Weight: 35%
                        </span>
                      </div>
                      <p className="text-xs text-[#584237] bg-[#f0f3ff] p-2.5 rounded-lg mb-2 italic">
                        "{cravings.rahul}"
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#8c7164] pt-1">
                      <span className="flex items-center gap-1">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-[#9d4300]" /> Pantry Hero
                      </span>
                      <span className="text-[#006c49] font-semibold">
                        {menuResult.satisfactionScores?.rahul || 96}% Satisfied
                      </span>
                    </div>
                  </div>

                  {/* Priya */}
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-[#f0f3ff] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#6cf8bb] text-[#002113] flex items-center justify-center font-bold text-xs">
                            P
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#111c2d]">Priya</p>
                            <p className="text-[11px] text-[#584237]">Craving: Economical & Warm</p>
                          </div>
                        </div>
                        <span className="bg-[#dee8ff] text-[#582200] px-2 py-0.5 rounded-full text-[11px] font-semibold">
                          Weight: 30%
                        </span>
                      </div>
                      <p className="text-xs text-[#584237] bg-[#f0f3ff] p-2.5 rounded-lg mb-2 italic">
                        "{cravings.priya}"
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#8c7164] pt-1">
                      <span className="flex items-center gap-1 text-[#006c49] font-medium">
                        ₹0 Extra Cost
                      </span>
                      <span className="text-[#006c49] font-semibold">
                        {menuResult.satisfactionScores?.priya || 100}% Satisfied
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* The Arbitrated Masterpiece (Hero Feature Card) */}
              <div className="w-full bg-white rounded-2xl p-6 shadow-md border border-[#f0f3ff]">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left Column: Food Photography */}
                  <div className="lg:col-span-6 relative rounded-2xl overflow-hidden shadow-sm group">
                    <img
                      src={ASSETS.dishPhoto}
                      alt={menuResult.dishTitle}
                      className="w-full h-80 lg:h-96 object-cover transform transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                    <div className="absolute top-3 left-3 bg-[#006c49] text-white px-3 py-1 rounded-full text-xs font-bold shadow flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>SIGNATURE PEACEMAKER FUSION</span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                      <span className="text-xs opacity-90 flex items-center gap-1.5 font-semibold">
                        <Clock className="w-4 h-4" /> {menuResult.cookTimeMins || 22}-min Cast Iron Skillet
                      </span>
                      <span className="bg-[#9d4300] px-3 py-1 rounded font-bold text-xs text-white">
                        Arbitrated Dish
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Dish Name & Compromise explanation box */}
                  <div className="lg:col-span-6 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="bg-[#ffdbca] text-[#783200] px-2.5 py-0.5 rounded text-xs font-bold">
                          Fusion Consensus #184
                        </span>
                        <span className="text-xs text-[#8c7164] font-medium">Flat 402 Dinner Verdict</span>
                      </div>

                      {/* Dish Name */}
                      <h2 className="font-['Epilogue'] font-bold text-2xl lg:text-3xl text-[#111c2d] leading-snug mb-2">
                        {menuResult.dishTitle}
                      </h2>
                      <p className="text-sm text-[#584237] mb-4">
                        {menuResult.subtitle || 'The Golden Triangle of College Flat Dining: Crispy Whole Wheat Roti Exterior + Gooey Mozzarella + Masala Maggi Core.'}
                      </p>

                      {/* Compromise Explanation Box */}
                      <div className="bg-[#f0f3ff] p-4 rounded-xl mb-4 border border-[#e7eeff]">
                        <div className="flex items-center gap-1.5 text-[#9d4300] font-bold text-xs uppercase mb-1.5">
                          <Sparkles className="w-4 h-4" />
                          <span>The Peacemaker Compromise Logic</span>
                        </div>
                        <p className="text-xs text-[#584237] leading-relaxed">
                          {menuResult.compromiseLogic}
                        </p>
                      </div>

                      {/* Palate Equilibrium Progress Bars */}
                      <div className="space-y-2 mb-6">
                        <div>
                          <div className="flex items-center justify-between text-xs text-[#111c2d] mb-1 font-semibold">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#f97316]"></span> Crunch & Cheese (Bhavya)
                            </span>
                            <span>{menuResult.satisfactionScores?.bhavya || 95}%</span>
                          </div>
                          <div className="w-full bg-[#e7eeff] rounded-full h-2">
                            <div className="bg-[#f97316] h-2 rounded-full transition-all duration-500" style={{ width: `${menuResult.satisfactionScores?.bhavya || 95}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs text-[#111c2d] mb-1 font-semibold">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#ac3400]"></span> Spice & Comfort (Rahul)
                            </span>
                            <span>{menuResult.satisfactionScores?.rahul || 92}%</span>
                          </div>
                          <div className="w-full bg-[#e7eeff] rounded-full h-2">
                            <div className="bg-[#ac3400] h-2 rounded-full transition-all duration-500" style={{ width: `${menuResult.satisfactionScores?.rahul || 92}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs text-[#111c2d] mb-1 font-semibold">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#006c49]"></span> Wholesome & Economical (Priya)
                            </span>
                            <span className="text-[#006c49]">{menuResult.satisfactionScores?.priya || 100}%</span>
                          </div>
                          <div className="w-full bg-[#e7eeff] rounded-full h-2">
                            <div className="bg-[#006c49] h-2 rounded-full transition-all duration-500" style={{ width: `${menuResult.satisfactionScores?.priya || 100}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() => setShowDispatchModal(true)}
                        className="bg-[#6cf8bb]/40 hover:bg-[#6cf8bb] text-[#00714d] px-4 py-2.5 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Share on Flat WhatsApp 💬</span>
                      </button>
                      <a
                        href="https://blinkit.com"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#e7eeff] hover:bg-[#dee8ff] text-[#111c2d] px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4 text-[#ac3400]" />
                        <span>Blinkit Missing Chillies (₹15) ⚡</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom 2-Column: Required Ingredients (Left) vs. Roommate Duty Division (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
                {/* Column A: Required Ingredients list */}
                <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-sm border border-[#f0f3ff] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#f0f3ff] flex items-center justify-center text-[#9d4300]">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <h3 className="font-['Epilogue'] font-semibold text-lg text-[#111c2d]">
                          Pantry Sync Checklist
                        </h3>
                      </div>
                      <span className="bg-[#6cf8bb]/40 text-[#00714d] px-2.5 py-0.5 rounded font-bold text-xs">
                        4 / 4 Available
                      </span>
                    </div>

                    <p className="text-xs text-[#584237] mb-4">
                      Stock automatically deducted from Flat 402 shared inventory upon cooking completion.
                    </p>

                    {/* Ingredients Items */}
                    <div className="space-y-2.5">
                      {(menuResult.requiredIngredients || []).map((ing, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-[#f0f3ff] hover:bg-[#e7eeff] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <CheckSquare className="w-4 h-4 text-[#006c49]" />
                            <span className="text-xs font-semibold text-[#111c2d]">{ing.name}</span>
                          </div>
                          <span className="bg-white text-[#584237] px-2.5 py-1 rounded text-[11px] font-semibold shadow-xs">
                            {ing.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#f0f3ff] flex items-center justify-between text-xs text-[#8c7164]">
                    <span className="flex items-center gap-1.5 text-[#006c49] font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Zero grocery waste recorded
                    </span>
                    <button
                      onClick={() => setActiveTab('cravings-and-pantry')}
                      className="text-[#9d4300] hover:underline font-bold"
                    >
                      Inventory Log →
                    </button>
                  </div>
                </div>

                {/* Column B: Today's Assigned Chef & Menu */}
                <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-sm border border-[#f0f3ff] flex flex-col justify-between">
                  <div>
                    {/* Section Header & Primary Chef Badge */}
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#f0f3ff] flex items-center justify-center text-[#9d4300]">
                          <ChefHat className="w-5 h-5" />
                        </div>
                        <h3 className="font-['Epilogue'] font-semibold text-lg text-[#111c2d]">
                          Today's Assigned Chef & Menu
                        </h3>
                      </div>

                      {/* 1 Primary Chef Badge */}
                      <div className="inline-flex items-center gap-1.5 bg-[#ffdbca] text-[#783200] px-3.5 py-1 rounded-full font-bold text-xs shadow-xs border border-[#ffb690]">
                        <span>👨‍🍳 Today's Head Chef: {selectedChef}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#584237] mb-4 leading-relaxed">
                      Only one roommate commands the kitchen today to cook the entire dish, while flatmates take dishwashing & cleanup duty afterwards!
                    </p>

                    {/* Single Instruction Card with exact text: "Aaj ka menu ye hai, Bhavya bana raha hai!" */}
                    <div className="bg-gradient-to-r from-[#fff3eb] via-[#fff8f2] to-[#f4f8ff] rounded-xl p-4 border border-[#ffdbca] shadow-xs mb-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl select-none" role="img" aria-label="loudspeaker">📢</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-['Epilogue'] font-bold text-base text-[#9d4300] tracking-tight">
                            "Aaj ka menu ye hai, {selectedChef} bana raha hai!"
                          </h4>
                          <p className="text-xs text-[#584237] mt-0.5 leading-relaxed">
                            {selectedChef} is solely in charge of executing this arbitrated menu for Flat 402 tonight.
                          </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#ffdbca] text-[11px] font-semibold text-[#783200] shrink-0">
                          <span className="text-[10px] text-[#8c7164]">Chef:</span>
                          {['Bhavya', 'Rahul', 'Priya'].map((name) => (
                            <button
                              key={name}
                              type="button"
                              onClick={() => {
                                setSelectedChef(name);
                                triggerToast(`👨‍🍳 Today's Head Chef switched to ${name}!`);
                              }}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
                                selectedChef === name
                                  ? 'bg-[#9d4300] text-white shadow-xs'
                                  : 'hover:bg-[#ffdbca] text-[#584237]'
                              }`}
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Step-by-Step Recipe Steps for Single Chef */}
                    <div className="space-y-2.5 mb-5">
                      <div className="flex items-center justify-between px-0.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#9d4300] flex items-center gap-1.5">
                          <UtensilsCrossed className="w-3.5 h-3.5" />
                          Step-by-Step Recipe Steps ({selectedChef}'s Solo Shift)
                        </span>
                        <span className="text-[11px] text-[#584237] font-semibold">{currentRecipeSteps.length} Steps</span>
                      </div>

                      {currentRecipeSteps.map((step, idx) => (
                        <div
                          key={idx}
                          className="bg-[#f0f3ff]/70 hover:bg-[#f0f3ff] p-3 rounded-xl border border-[#dee8ff] transition-all flex items-start gap-3"
                        >
                          <div className="w-6 h-6 rounded-full bg-[#9d4300] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap mb-0.5">
                              <span className="text-xs font-bold text-[#111c2d]">
                                Step {idx + 1}: {step.task}
                              </span>
                              {step.time && (
                                <span className="text-[10px] bg-white px-2 py-0.5 rounded font-semibold text-[#584237] border border-[#e7eeff] flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[#9d4300]" /> {step.time}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#584237] leading-relaxed">{step.instruction}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Other Roommates Status: "Will Clean / Wash Dishes Later" or "Dining Guest" */}
                    <div className="bg-[#f9f9ff] rounded-xl p-3.5 border border-[#e7eeff] mb-4">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-bold text-[#111c2d] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#006c49]" />
                          Other Roommates Status
                        </span>
                        <span className="text-[11px] text-[#006c49] font-bold bg-[#6cf8bb]/40 px-2.5 py-0.5 rounded-full">
                          Post-Meal Cleaning Duty
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {getOtherRoommates(selectedChef).map((roomie) => (
                          <div
                            key={roomie.name}
                            className="bg-white p-2.5 rounded-lg border border-[#f0f3ff] shadow-xs flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${roomie.badgeColor}`}
                              >
                                {roomie.initial}
                              </span>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-[#111c2d] truncate">{roomie.name}</span>
                                <span className="text-[10px] text-[#584237] truncate">{roomie.cleanTask}</span>
                              </div>
                            </div>
                            <span className="bg-[#dee8ff] text-[#002113] px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 border border-[#cfdaf2] flex items-center gap-1 whitespace-nowrap">
                              <span>{roomie.statusIcon}</span>
                              <span>{roomie.statusBadge}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 20-Minute Cooking Clock */}
                  <div className="mt-3 pt-3 border-t border-[#f0f3ff]">
                    <button
                      onClick={() => setTimerActive(!timerActive)}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${
                        timerActive
                          ? 'bg-[#006c49] text-white hover:bg-[#005236]'
                          : 'bg-[#9d4300] text-white hover:bg-[#ac3400]'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>{timerActive ? `Cooking in Progress (${selectedChef})` : `Start 22-Min Cooking Clock (${selectedChef}) ⏱️`}</span>
                      {timerActive && (
                        <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-xs">
                          {formatTimer(secondsRemaining)}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Weekly Menu & Schedules */}
          {!loading && activeTab === 'weekly-menu' && (
            <div className="flex flex-col gap-6">
              {/* Header with Equity glance */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-[#9d4300] text-xs font-bold uppercase tracking-wider">
                    <Calendar className="w-4 h-4" />
                    <span>Flat 402 Food Calendar</span>
                  </div>
                  <h1 className="font-['Epilogue'] font-bold text-2xl lg:text-3xl text-[#111c2d] mt-1">
                    Weekly Meal Schedule
                  </h1>
                </div>

                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-[#f0f3ff]">
                  <div className="w-10 h-10 rounded-xl bg-[#6cf8bb]/40 flex items-center justify-center text-[#00714d]">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col pr-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-[#111c2d]">Chore & Cook Equity</span>
                      <span className="text-xs text-[#006c49] font-bold">96% Harmonious</span>
                    </div>
                    <div className="w-40 h-2 bg-[#f0f3ff] rounded-full overflow-hidden mt-1.5">
                      <div className="h-full bg-[#006c49] rounded-full" style={{ width: '96%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Horizontal Date Selection Strip */}
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                <div className="flex flex-col items-center justify-center min-w-[100px] py-2 px-3 rounded-xl bg-white shadow-sm border border-[#f0f3ff] text-center">
                  <span className="text-[11px] text-[#584237] flex items-center gap-1">
                    Fri 25 Sep <Check className="w-3 h-3 text-[#006c49]" />
                  </span>
                  <span className="text-xs font-bold text-[#584237]">Completed</span>
                </div>
                <div className="flex flex-col items-center justify-center min-w-[100px] py-2 px-3 rounded-xl bg-white shadow-sm border border-[#f0f3ff] text-center">
                  <span className="text-[11px] text-[#584237] flex items-center gap-1">
                    Sat 26 Sep <Check className="w-3 h-3 text-[#006c49]" />
                  </span>
                  <span className="text-xs font-bold text-[#584237]">Completed</span>
                </div>
                {/* Active Sun 27 Sep */}
                <div className="flex flex-col items-center justify-center min-w-[120px] py-2 px-4 rounded-xl bg-[#f97316] text-white shadow-md text-center">
                  <span className="text-[11px] uppercase tracking-wider flex items-center gap-1 font-bold">
                    <Flame className="w-3.5 h-3.5" /> Today
                  </span>
                  <span className="text-sm font-bold">Sun 27 Sep</span>
                </div>
                <div className="flex flex-col items-center justify-center min-w-[105px] py-2 px-3 rounded-xl bg-white shadow-sm border border-[#f0f3ff] text-center">
                  <span className="text-[11px] text-[#9d4300] font-bold">Tomorrow</span>
                  <span className="text-xs font-bold text-[#111c2d]">Mon 28 Sep</span>
                </div>
                <div className="flex flex-col items-center justify-center min-w-[100px] py-2 px-3 rounded-xl bg-white shadow-sm border border-[#f0f3ff] text-center">
                  <span className="text-[11px] text-[#584237]">Planned</span>
                  <span className="text-xs font-bold text-[#111c2d]">Tue 29 Sep</span>
                </div>
                <div className="flex flex-col items-center justify-center min-w-[110px] py-2 px-3 rounded-xl bg-[#f0f3ff] text-center">
                  <span className="text-[11px] text-[#ac3400] font-bold">Vote Open</span>
                  <span className="text-xs font-bold text-[#111c2d]">Wed 30 Sep</span>
                </div>
              </div>

              {/* Hero Card for Selected Day Dish */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#f0f3ff] overflow-hidden p-6 flex flex-col lg:flex-row gap-6">
                <div className="relative lg:w-5/12 min-h-[240px] rounded-xl overflow-hidden shadow-sm group">
                  <img
                    src={ASSETS.weeklyDishPhoto}
                    alt="Active Sunday dish"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                    <div className="inline-flex items-center gap-1.5 bg-[#f97316] text-white px-3 py-1 rounded-full text-xs font-bold w-fit mb-1 shadow-sm">
                      <Flame className="w-3.5 h-3.5" />
                      ACTIVE COOKING NOW
                    </div>
                    <p className="text-xs text-white/90">Pantry Rescue Consensus • Sunday Family Dinner</p>
                  </div>
                </div>

                <div className="lg:w-7/12 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="bg-[#f0f3ff] text-[#9d4300] px-3 py-0.5 rounded-full text-xs font-bold">Fusion</span>
                      <span className="bg-[#f0f3ff] text-[#111c2d] px-3 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> 22 Mins
                      </span>
                      <span className="bg-[#6cf8bb]/40 text-[#00714d] px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Vegetarian
                      </span>
                    </div>

                    <h2 className="font-['Epilogue'] font-bold text-2xl text-[#111c2d] leading-tight">
                      Cheesy Maggi-Stuffed Roti Quesadilla
                    </h2>
                    <p className="text-xs text-[#584237] mt-1.5 leading-relaxed">
                      Arbitrated to consume leftover rotis from Saturday lunch combined with the house emergency noodle stash. Quick, deeply satisfying, and leaves zero trash behind.
                    </p>
                  </div>

                  {/* Duty squad */}
                  <div className="bg-[#f0f3ff] rounded-xl p-4 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#111c2d] flex items-center gap-1.5">
                        <ChefHat className="w-4 h-4 text-[#9d4300]" />
                        Assigned Kitchen Squad
                      </span>
                      <span className="text-[11px] bg-white text-[#006c49] px-2 py-0.5 rounded-full font-bold">
                        All Roomies On Duty
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-xs">
                        <span className="w-7 h-7 rounded-full bg-[#f97316] text-white flex items-center justify-center text-xs font-bold">B</span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-[#111c2d] truncate">Bhavya</span>
                          <span className="text-[10px] text-[#9d4300] font-semibold">Lead Cook</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-xs">
                        <span className="w-7 h-7 rounded-full bg-[#006c49] text-white flex items-center justify-center text-xs font-bold">R</span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-[#111c2d] truncate">Rahul</span>
                          <span className="text-[10px] text-[#006c49] font-semibold">Sous-Chef</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-xs">
                        <span className="w-7 h-7 rounded-full bg-[#ac3400] text-white flex items-center justify-center text-xs font-bold">P</span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-[#111c2d] truncate">Priya</span>
                          <span className="text-[10px] text-[#ac3400] font-semibold">Plating & Dishes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Meal Roadmap Cards */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-['Epilogue'] font-semibold text-xl text-[#111c2d]">Upcoming Meal Roadmap</h2>
                    <p className="text-xs text-[#584237]">Scheduled disputes settled by RoomieBite AI Arbitrator</p>
                  </div>
                  <button
                    onClick={() => {
                      triggerToast('✨ Auto-generated balanced meal plans for Wed & Thu!');
                    }}
                    className="inline-flex items-center gap-1.5 bg-white hover:bg-[#f0f3ff] text-[#9d4300] px-4 py-2 rounded-xl text-xs font-bold shadow-sm border border-[#f0f3ff] transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-[#f97316]" />
                    <span>Auto-Generate Remaining Week</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Monday Lunch */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#f0f3ff] flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-[#9d4300] font-bold uppercase tracking-wider">Mon 28 Sep • Lunch</span>
                        <span className="bg-[#6cf8bb]/40 text-[#00714d] px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Locked
                        </span>
                      </div>
                      <h3 className="font-['Epilogue'] font-bold text-base text-[#111c2d]">Paneer Bhurji Kathi Rolls</h3>
                      <p className="text-xs text-[#584237] mt-1">Spiced crumbled cottage cheese with bell peppers rolled into parathas.</p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-[#f0f3ff]">
                      <div className="flex items-center justify-between bg-[#f0f3ff] p-2 rounded-lg text-xs">
                        <span className="font-bold text-[#111c2d]">Chef: Rahul</span>
                        <span className="text-[#584237]">Clean-up: Bhavya</span>
                      </div>
                      <span className="text-xs text-[#006c49] font-medium flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5" /> Pantry: Atta + Paneer in Fridge
                      </span>
                    </div>
                  </div>

                  {/* Monday Dinner */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#f0f3ff] flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-[#9d4300] font-bold uppercase tracking-wider">Mon 28 Sep • Dinner</span>
                        <span className="bg-[#6cf8bb]/40 text-[#00714d] px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Locked
                        </span>
                      </div>
                      <h3 className="font-['Epilogue'] font-bold text-base text-[#111c2d]">Creamy Tomato Masala Pasta</h3>
                      <p className="text-xs text-[#584237] mt-1">Fusilli pasta bathed in a spicy Indian-style roasted garlic and herb pomodoro.</p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-[#f0f3ff]">
                      <div className="flex items-center justify-between bg-[#f0f3ff] p-2 rounded-lg text-xs">
                        <span className="font-bold text-[#111c2d]">Chef: Priya</span>
                        <span className="text-[#584237]">Clean-up: Rahul</span>
                      </div>
                      <span className="text-xs text-[#ac3400] font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Grocery alert: Buy Pasta Sauce
                      </span>
                    </div>
                  </div>

                  {/* Tuesday Dinner */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#f0f3ff] flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-[#9d4300] font-bold uppercase tracking-wider">Tue 29 Sep • Dinner</span>
                        <span className="bg-[#6cf8bb]/40 text-[#00714d] px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Locked
                        </span>
                      </div>
                      <h3 className="font-['Epilogue'] font-bold text-base text-[#111c2d]">Tawa Pulao with Boondi Raita</h3>
                      <p className="text-xs text-[#584237] mt-1">Street-style spiced basmati rice tossed with peas, potatoes, and pav bhaji spice.</p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-[#f0f3ff]">
                      <div className="flex items-center justify-between bg-[#f0f3ff] p-2 rounded-lg text-xs">
                        <span className="font-bold text-[#111c2d]">Chef: Bhavya</span>
                        <span className="text-[#584237]">Clean-up: Priya</span>
                      </div>
                      <span className="text-xs text-[#006c49] font-medium flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5" /> Pantry: Rice & Veggies Ready
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share & Export Utility Bar (The section from the user's screenshot) */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0f3ff] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#ffdbca] flex items-center justify-center text-[#783200] shrink-0">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111c2d]">Share & Export Flat Schedule</h4>
                    <p className="text-xs text-[#584237]">Keep fridge printed copies and roommate phones in sync.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
                  {/* Button 1: Print Flat Menu PDF */}
                  <button
                    onClick={() => setShowPrintModal(true)}
                    className="inline-flex items-center justify-center gap-2 bg-[#f0f3ff] hover:bg-[#e7eeff] text-[#111c2d] px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-[#dee8ff] active:scale-95 whitespace-nowrap shadow-xs"
                  >
                    <Printer className="w-4 h-4 text-[#9d4300]" />
                    <span>Print Flat Menu PDF</span>
                  </button>

                  {/* Button 2: Sync Google Calendar */}
                  <button
                    onClick={() => setShowCalendarModal(true)}
                    className="inline-flex items-center justify-center gap-2 bg-[#f0f3ff] hover:bg-[#e7eeff] text-[#111c2d] px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-[#dee8ff] active:scale-95 whitespace-nowrap shadow-xs"
                  >
                    <CalendarPlus className="w-4 h-4 text-[#006c49]" />
                    <span>Sync Google Calendar</span>
                  </button>

                  {/* Button 3: Send Weekly Summary to Roomies */}
                  <button
                    onClick={() => setShowDispatchModal(true)}
                    className="inline-flex items-center justify-center gap-2 bg-[#9d4300] hover:bg-[#ac3400] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Weekly Summary</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL 1: Print Flat Menu PDF Preview Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col border border-[#f0f3ff] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#f0f3ff]">
              <div className="flex items-center gap-2 text-[#9d4300] font-['Epilogue'] font-bold text-base">
                <Printer className="w-5 h-5" />
                <span>Fridge Print & PDF Preview (Flat 402)</span>
              </div>
              <button
                className="p-1.5 rounded-lg hover:bg-[#f0f3ff] text-[#584237]"
                onClick={() => setShowPrintModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Preview Sheet */}
            <div className="bg-[#fdfbf7] p-5 rounded-xl border border-[#fef3c7] font-sans text-xs text-[#111c2d] overflow-auto flex-1 space-y-4">
              <div className="text-center pb-2 border-b border-dashed border-[#e0c0b1]">
                <h3 className="font-['Epilogue'] font-bold text-lg text-[#9d4300]">FLAT 402 • WEEKLY FOOD CALENDAR</h3>
                <p className="text-[11px] text-[#584237]">Week of Sep 27 - Oct 03, 2026 • AI Arbitrated Zero Waste Roster</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-[#f0f3ff]">
                <span className="font-bold text-[#f97316] text-xs">⭐ Today's Meal: Cheesy Maggi-Stuffed Roti Quesadilla</span>
                <p className="text-[11px] text-[#584237] mt-0.5">Chef: Bhavya | Sous-Chef: Rahul | Clean-up: Priya (Cook time: 22m)</p>
                <p className="text-[11px] text-gray-500 mt-1">Ingredients: Leftover rotis, 2 packs Maggi, 100g cheese, fresh chillies</p>
              </div>

              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-[#e7eeff] text-[#584237]">
                    <th className="py-1">Day / Slot</th>
                    <th className="py-1">Dish</th>
                    <th className="py-1">Chef</th>
                    <th className="py-1">Clean-up</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f3ff]">
                  <tr>
                    <td className="py-1.5 font-bold">Mon Lunch</td>
                    <td>Paneer Bhurji Kathi Rolls</td>
                    <td>Rahul</td>
                    <td>Bhavya</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-bold">Mon Dinner</td>
                    <td>Creamy Tomato Masala Pasta</td>
                    <td>Priya</td>
                    <td>Rahul</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-bold">Tue Dinner</td>
                    <td>Tawa Pulao with Boondi Raita</td>
                    <td>Bhavya</td>
                    <td>Priya</td>
                  </tr>
                </tbody>
              </table>

              <div className="bg-[#ffdad6]/40 p-2.5 rounded-lg text-[11px] text-[#93000a] flex items-center justify-between">
                <span>🛒 Grocery Alert: Capsicum for quesadillas + Pasta Sauce</span>
                <span className="font-bold">Blinkit Flat 402</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#f0f3ff] mt-2">
              <button
                onClick={handleDownloadRosterTxt}
                className="inline-flex items-center gap-1.5 text-xs text-[#584237] hover:text-[#111c2d] px-3 py-2 rounded-lg border border-[#dee8ff] hover:bg-[#f0f3ff]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .TXT Roster</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#584237] hover:bg-[#f0f3ff]"
                  onClick={() => setShowPrintModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-[#9d4300] hover:bg-[#ac3400] text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  onClick={handlePrint}
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Google Calendar & iCal Sync Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col border border-[#f0f3ff] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#f0f3ff]">
              <div className="flex items-center gap-2 text-[#006c49] font-['Epilogue'] font-bold text-base">
                <CalendarPlus className="w-5 h-5" />
                <span>Sync with Google Calendar</span>
              </div>
              <button
                className="p-1.5 rounded-lg hover:bg-[#f0f3ff] text-[#584237]"
                onClick={() => setShowCalendarModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#584237] mb-3">
              Add individual shifts to your personal Google Calendar, or download the full .ics schedule file for Flat 402:
            </p>

            <div className="space-y-2.5 overflow-auto flex-1 mb-4 pr-1">
              {/* Event 1 */}
              <div className="p-3 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-[#111c2d] block">Sun Dinner: Quesadillas</span>
                  <span className="text-[11px] text-[#584237]">Chef: Bhavya | 8:00 PM</span>
                </div>
                <a
                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('🥘 Flat 402 Dinner: Cheesy Maggi Quesadilla')}&details=${encodeURIComponent('Chef: Bhavya | Sous: Rahul | Clean: Priya')}&location=${encodeURIComponent('Flat 402 Kitchen')}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => triggerToast('Added Sunday Dinner to Google Calendar!')}
                  className="bg-white hover:bg-[#dee8ff] text-[#006c49] px-3 py-1.5 rounded-lg text-xs font-bold border border-[#6cf8bb] flex items-center gap-1 shrink-0"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>+ Google Cal</span>
                </a>
              </div>

              {/* Event 2 */}
              <div className="p-3 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-[#111c2d] block">Mon Lunch: Kathi Rolls</span>
                  <span className="text-[11px] text-[#584237]">Chef: Rahul | 1:30 PM</span>
                </div>
                <a
                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('🌯 Flat 402 Lunch: Paneer Bhurji Kathi Rolls')}&details=${encodeURIComponent('Chef: Rahul | Clean: Bhavya')}&location=${encodeURIComponent('Flat 402 Kitchen')}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => triggerToast('Added Monday Lunch to Google Calendar!')}
                  className="bg-white hover:bg-[#dee8ff] text-[#006c49] px-3 py-1.5 rounded-lg text-xs font-bold border border-[#6cf8bb] flex items-center gap-1 shrink-0"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>+ Google Cal</span>
                </a>
              </div>

              {/* Event 3 */}
              <div className="p-3 rounded-xl bg-[#f0f3ff] border border-[#dee8ff] flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-[#111c2d] block">Mon Dinner: Masala Pasta</span>
                  <span className="text-[11px] text-[#584237]">Chef: Priya | 8:30 PM</span>
                </div>
                <a
                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('🍝 Flat 402 Dinner: Creamy Tomato Masala Pasta')}&details=${encodeURIComponent('Chef: Priya | Clean: Rahul')}&location=${encodeURIComponent('Flat 402 Kitchen')}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => triggerToast('Added Monday Dinner to Google Calendar!')}
                  className="bg-white hover:bg-[#dee8ff] text-[#006c49] px-3 py-1.5 rounded-lg text-xs font-bold border border-[#6cf8bb] flex items-center gap-1 shrink-0"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>+ Google Cal</span>
                </a>
              </div>
            </div>

            {/* Bulk ICS Download */}
            <div className="pt-3 border-t border-[#f0f3ff] flex items-center justify-between gap-2">
              <button
                onClick={handleDownloadICS}
                className="w-full bg-[#006c49] hover:bg-[#005236] text-white py-2.5 px-4 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download All (.ICS for Google/Apple Calendar)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Send Weekly Summary to Roomies */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col border border-[#f0f3ff] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#f0f3ff]">
              <div className="flex items-center gap-2 text-[#9d4300] font-['Epilogue'] font-bold text-base">
                <Send className="w-5 h-5" />
                <span>Send Weekly Summary to Flat 402</span>
              </div>
              <button
                className="p-1.5 rounded-lg hover:bg-[#f0f3ff] text-[#584237]"
                onClick={() => setShowDispatchModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-[#584237]">Recipients:</span>
              <span className="bg-[#ffdbca] text-[#783200] px-2 py-0.5 rounded-full text-[11px] font-bold">Bhavya</span>
              <span className="bg-[#ffdbd0] text-[#832600] px-2 py-0.5 rounded-full text-[11px] font-bold">Rahul</span>
              <span className="bg-[#6cf8bb]/40 text-[#00714d] px-2 py-0.5 rounded-full text-[11px] font-bold">Priya</span>
            </div>

            <div className="relative mb-4 flex-1">
              <textarea
                readOnly
                value={weeklySummaryText}
                rows={9}
                className="w-full bg-[#f0f3ff] p-3 rounded-xl text-xs text-[#111c2d] font-mono leading-relaxed border border-[#dee8ff] focus:outline-none resize-none"
              />
              <button
                onClick={handleCopySummary}
                className="absolute top-2.5 right-2.5 bg-white hover:bg-gray-50 text-[#111c2d] px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xs border border-gray-200 flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5 text-[#9d4300]" />
                <span>Copy</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#f0f3ff]">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(weeklySummaryText)}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  triggerToast('Opening WhatsApp with weekly summary...');
                  setShowDispatchModal(false);
                }}
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Share on WhatsApp 💬</span>
              </a>

              <button
                onClick={() => {
                  triggerToast('🚀 Weekly summary dispatched to all 3 flatmate phones!');
                  setShowDispatchModal(false);
                }}
                className="bg-[#9d4300] hover:bg-[#ac3400] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Broadcast to Roomies</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Schema Debug Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 no-print">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col border border-[#f0f3ff]">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#f0f3ff]">
              <div className="flex items-center gap-2 text-[#9d4300] font-['Epilogue'] font-bold text-base">
                <FileCode className="w-5 h-5" />
                <span>Consensus Schema (RoomieBite v2.5 Flash)</span>
              </div>
              <button
                className="p-1.5 rounded-lg hover:bg-[#f0f3ff] text-[#584237]"
                onClick={() => setShowJsonModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <pre className="bg-[#f0f3ff] p-4 rounded-xl font-mono text-xs text-[#111c2d] overflow-auto flex-1 leading-relaxed">
              {JSON.stringify(menuResult, null, 2)}
            </pre>
            <div className="pt-4 flex justify-end">
              <button
                className="bg-[#9d4300] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#ac3400] transition-colors"
                onClick={() => setShowJsonModal(false)}
              >
                Dismiss Payload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-14 right-6 z-50 bg-[#111c2d] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 border border-gray-700 max-w-sm">
          <Sparkles className="w-4 h-4 text-[#6cf8bb] shrink-0" />
          <span className="text-xs font-medium leading-snug">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-0.5 rounded hover:bg-white/20 text-gray-400 hover:text-white ml-auto"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}


    </div>
  );
}
