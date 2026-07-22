import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI SDK lazily/safely
  const getAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Helper for resilient Gemini calls with model fallback
  const generateContentWithFallback = async (ai: GoogleGenAI, params: any) => {
    const modelsToTry = Array.from(new Set([
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      params.model || 'gemini-2.5-flash'
    ]));

    let lastError: any = null;
    for (const model of modelsToTry) {
      try {
        return await ai.models.generateContent({
          ...params,
          model,
        });
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini model ${model} error:`, err?.message || err);
        const errMsg = String(err?.message || err);
        if (
          err?.status === 403 ||
          err?.code === 403 ||
          err?.status === 429 ||
          err?.code === 429 ||
          err?.status === 404 ||
          err?.code === 404 ||
          errMsg.includes('PERMISSION_DENIED') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('quota') ||
          errMsg.includes('denied access') ||
          errMsg.includes('403') ||
          errMsg.includes('429') ||
          errMsg.includes('NOT_FOUND')
        ) {
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  };

  // Dynamic Fallback Helpers for when Gemini quota or API is unavailable
  function getFallbackAnalysis(idea: any) {
    const isAgri = (idea.title + (idea.tags?.join(' ') || '') + idea.problem).toLowerCase().includes('agro') || (idea.title + (idea.tags?.join(' ') || '')).toLowerCase().includes('fermer');
    const isMed = (idea.title + (idea.tags?.join(' ') || '') + idea.problem).toLowerCase().includes('tibbiyot') || (idea.title + (idea.tags?.join(' ') || '')).toLowerCase().includes('dori');

    return {
      overallScore: 82,
      scores: {
        marketNeed: 88,
        originality: 78,
        competition: 70,
        difficulty: 75,
        monetization: 85,
        scalability: 89,
        founderFit: 84,
        technicalComplexity: 68,
        goToMarketDifficulty: 72,
        aiValue: 86
      },
      strengths: [
        `"${idea.title}" bo'yicha taklif etilayotgan yechim (${idea.solution || 'avtomatlashtirilgan tizim'}) bozordagi o'tkir og'riqni hal qiladi.`,
        `Monetizatsiya modeli (${idea.monetization || 'SaaS obuna'}) barqaror daromad keltirish salohiyatiga ega.`,
        `Maqsadli auditoriya (${idea.targetUsers || 'soha mutaxassislari'}) aniq va ularning to'lov qobiliyati mavjud.`
      ],
      weaknesses: [
        `Dastlabki mijozlarni jalb qilish narxi (CAC) yuqori bo'lishi mumkin, GTM kanalini tajribadan o'tkazish zarur.`,
        `Amaldagi muqobil usullardan (${idea.competitors || 'anʼanaviy usullar'}) yangi ilovaga o'tishda foydalanuvchilar inersiyasi.`
      ],
      hiddenRisks: [
        `Foydalanuvchilarning muntazam foydalanish ko'nikmasi shakllanmasa, mijozlar ketishi (Churn) kuzatiladi.`,
        `Katta korporatsiyalar yoki bepul alternativalarning o'xshash funksiyalarni chiqarish xatari.`
      ],
      similarProducts: isAgri ? ['Plantix', 'Agrio', 'PictureThis'] : isMed ? ['Hybrent', 'Zebra Medical', 'Envoy Health'] : ['Notion', 'Zapier', 'Linear'],
      possibleCompetitors: [idea.competitors || 'Lokal CRM va ERP dasturlari', 'Excel va qogʼoz daftarlar'],
      potentialCustomers: [idea.targetUsers || 'Kichik va oʼrta biznes egalari', 'Soha mutaxassislari'],
      waysToImprove: [
        `MVP doirasida (${idea.mvp || 'asosiy funksional'}) faqat eng zaruriy 2 ta funksiyaga e'tibor qaratish.`,
        `Foydalanuvchilar uchun o'zbek tilida 1 daqiqalik sodda videodarslik tayyorlash.`
      ],
      biggestMistake: `Mahsulotni keragidan ortiq murakkablashtirish va mijozlar bilan bevosita muloqot qilmasdan kod yozish.`,
      mvpRecommendation: `1 oy ichida "${idea.title}" ning eng muhim prototipini ishga tushirib, 10 ta real mijozda sinab ko'rish.`,
      shouldBuild: 'YES',
      verdictRationale: `"${idea.title}" g'oyasi dolzarb muammoni yoritadi va istiqbolli bozor salohiyatiga ega. Test rejimida qurish tavsiya etiladi.`,
      analyzedAt: new Date().toISOString()
    };
  }

  function getFallbackCritic(idea: any) {
    return {
      investorPersona: 'Sequoia Capital Bosh Hamkori',
      openaiThreat: `OpenAI yoki yirik texnologik gigantlar ushbu funksiyani o'zlarining bepul platformasiga qo'shib qo'ysa, sizda qanday unikal ustunlik (moat) qoladi?`,
      statusQuoThreat: `Mijozlar yillardan beri o'rgangan eski usullardan (${idea.competitors || 'Excel va qoʼlda boshqaruv'}) voz kechib, sizning ilovangizga o'tishlari uchun qanday kuchli turtki bor?`,
      first100UsersChallenge: `Qimmat reklamalarga pul sarflamasdan, dastlabki 100 ta to'laydigan mijozni aniq qaysi kanallar orqali va qancha vaqtda jalb qilasiz?`,
      monetizationHurdle: `Taklif etilayotgan narx (${idea.monetization || 'obuna'}) bozor kutganidan qimmat bo'lsa, narx egiluvchanligini qanday ushlaysiz?`,
      keyAssumptionsChallenged: [
        {
          id: 'c1',
          assumption: `Mijozlar ushbu muammoni (${idea.problem || 'muammo'}) hal qilish uchun har oy pul to'lashga tayyor.`,
          challenge: `Mijozlar bu muammodan shikoyat qilishi mumkin, lekin pul to'lashga kelganda bepul muqobillardan foydalanishda davom etadi.`,
          severity: 'CRITICAL'
        },
        {
          id: 'c2',
          assumption: `Maqsadli auditoriya (${idea.targetUsers || 'auditoriya'}) yangi raqamli vositalarni tez o'zlashtiradi.`,
          challenge: `Insonlar yangi dasturlarni o'rganishga erinishadi va tezda eski odatlariga qaytishadi.`,
          severity: 'HIGH'
        },
        {
          id: 'c3',
          assumption: `Raqobatchilar ushbu bozor segmentini ko'rmayapti yoki e'tiborsiz qoldirmoqda.`,
          challenge: `Mavjud yirik o'yinchilar tez fursatda bu funksiyani ko'chirib olishi va distributsiya kuchi orqali sizni siqib chiqarishi mumkin.`,
          severity: 'MODERATE'
        }
      ],
      analyzedAt: new Date().toISOString()
    };
  }

  function getFallbackQuestions(idea: any) {
    return [
      { id: 1, category: "Raqobat va Ustunlik", question: `Raqobatchilar (${idea.competitors || 'mavjud muqobillar'}) ushbu funksiyani ko'chirib olsa, sizning unikal ustunligingiz (moat) nima bo'ladi?` },
      { id: 2, category: "Tarqatish (GTM)", question: `Mijozlarni jalb qilish narxini (CAC) iloji boricha past ushlash uchun qaysi o'sish va virusli mexanizmlardan foydalanasiz?` },
      { id: 3, category: "Monetizatsiya va Narx", question: `Narx strategiyangiz (${idea.monetization || 'obuna'}) mijozlar uchun qiymatga mos keladimi va xaridga qarshilikni qanday kamaytirasiz?` },
      { id: 4, category: "Unit-Ekonomika", question: `LTV (mijozning umumiy qiymati) va CAC nisbati 3:1 dan yuqori bo'lishiga qanday erishasiz?` },
      { id: 5, category: "Mijozlarni Ushlab Qolish (Retention)", question: `Foydalanuvchilar ilovadan har kuni yoki har hafta foydalanishi uchun qanday doimiy odat va odat halqasi yaratiladi?` },
      { id: 6, category: "Asoschi va Jamoa Mosligi", question: `Siz va jamoangiz ushbu muammoni hal qilishda soha bo'yicha qanday maxsus tajribaga va insaytlarga egasiz?` },
      { id: 7, category: "Texnik Arxitektura", question: `Foydalanuvchilar soni 100 baravar oshganda infratuzilma va ma'lumotlar bazasi ko'lamini qanday kengaytirasiz?` },
      { id: 8, category: "Huquqiy va Xavfsizlik", question: `Foydalanuvchilar ma'lumotlari xavfsizligi va maxfiyligi bo'yicha qanday kafolat va standartlar ta'minlanadi?` },
      { id: 9, category: "Bozor Salohiyati", question: `Ushbu mahsulot faqat mahalliy bozor bilan cheklanib qoladimi yoki xalqaro bozorga chiqa oladimi?` },
      { id: 10, category: "Haqiqiy MVP", question: `G'oyaning eng xatarga boy qismini 2 hafta ichida eng minimal resurs bilan qanday test qilasiz?` }
    ];
  }

  function getFallbackPrompt(idea: any, targetTool: string) {
    const title = idea.title || 'Startap Proyekti';
    const desc = idea.oneSentenceDescription || 'Startap gʼoyasi va innovatsion yechim';
    const problem = idea.problem || 'Mavjud bozor muammosi va kamchiliklar';
    const solution = idea.solution || 'Avtomatlashtirilgan qulay yechim';
    const targetUsers = idea.targetUsers || 'Kichik va oʼrta biznes hamda soha mutaxassislari';
    const monetization = idea.monetization || idea.businessModel || 'Obuna va tranzaktsiya xizmati (SaaS / B2B)';

    const fullPromptText = `🚀 MASTER STARTAP G'OYA VA MAHSULOT ARXITEKTURASI (MASTER BLUEPRINT)

📌 LOYIHA BOSH MAQSADI VA KONSEPSIYASI
Loyiha Nomi: "${title}"
Bosh Konsepsiya: ${desc}

1. G'OYA NEGIZI VA ISHLASH MEXANIZMI
"${title}" - bu ${problem} muammosini tubdan hal qiluvchi va foydalanuvchilar tajribasini tubdan o'zgartiruvchi innovatsion mahsulotdir. 
Ushbu g'oya foydalanuvchiga quyidagicha xizmat ko'rsatadi:
- Boshlang'ich bosqichda: Foydalanuvchi o'zi duch kelayotgan murakkablikni minimal harakat bilan aniqlaydi.
- Asosiy operatsion jarayon: ${solution}.
- Yakuniy natija: Ortiqcha vaqt va mablag' yo'qotilmaydi, jarayon avtomatlashadi va samaradorlik karrasiga oshadi.

2. MAQSADLI AUDITORIYA VA MIJOZ PROFILI (ICP)
- Asosiy xaridorlar: ${targetUsers}.
- Ularning asosiy og'riq nuqtasi: Eski, noqulay, qimmat yoki sekin ishlaydigan muqobil usullardan charchaganlik.
- Xarid qilish motivatsiyasi: Vaqtni tejash, xarajatlarni kamaytirish, daromadni oshirish va operatsion qulaylikka erishish.

3. DAROMAD QILISH VA MONETIZATSIYA MODELI
- Biznes Model: ${monetization}.
- Qiymatga asoslangan narx navolar: Foydalanuvchiga keltiriladigan iqtisodiy nafga mutanosib ravishda narxlash.
- Barqaror daromad: Doimiy foydalanishni rag'batlantiruvchi takroriy obuna va premium imkoniyatlar.

4. BOZOR MAVQEYI VA STRATEGIK USTUNLIK (MOAT)
- Raqobatbardoshlik: Mavjud muqobillar (${idea.competitors || 'anʼanaviy usullar'}) ga nisbatan 10x tezroq, qulayroq va arzonroq.
- Himoya devori: Tarmoq effekti (Network Effects), foydalanuvchi ma'lumotlari to'planishi orqali shaxsiylashtirish va yuqori sodiqlik.

5. GO-TO-MARKET (GTM) VA BOZORGA CHIQISH STRATEGIYASI
- Tarqatish kanallari: Maqsadli auditoriya to'planadigan B2B va B2C kanallar, hamkorlik dasturlari va virusli taklif mexanizmi.
- Ilk 100 ta mijozni jalb qilish: Do'stona aloqalar, soha hamjamiyatlari, kontent-marketing va bevosita muloqot orqali.

6. HAQIQIY MVP DOIRASI VA AMALGA OSHIRISH BOSQICHLARI
- 1-Bosqich (MVP): ${idea.mvp || 'Eng muhim 1-2 ta asosiy funksiyani o\'z ichiga olgan sodda versiya'}.
- 2-Bosqich (O'sish): Avtomatlashtirish, tahliliy modullar va kengaytirilgan integratsiyalar.
- 3-Bosqich (Ekotizim): Yangi bozor segmentlariga chiqish va platformaga aylanish.

7. XATARLAR VA ULARNI YUMSHATISH
- Asosiy xatar: Foydalanuvchilarning inersiyasi va eski odatlarini o'zgartirishi qiyinligi.
- Yechim: Onboarding jarayonini 30 soniyagacha qisqartirish va birinchi kundan boshlab yaqqol qiymat ko'rsatish.`;

    return {
      targetTool,
      sections: {
        productVision: `${title} - ${desc}`,
        targetUsers: targetUsers,
        features: solution,
        monetization: monetization,
        marketPositioning: `Mavjud muqobillardan 10x ustunlik va strategik moat.`,
        mvpScope: idea.mvp || 'Asosiy MVP doirasi',
        growthStrategy: 'Virusli o\'sish va B2B/B2C GTM kanallari'
      },
      fullPromptText,
      generatedAt: new Date().toISOString()
    };
  }

  function getFallbackCounterEval(assumption: string, challenge: string, founderResponse: string) {
    const isDetailed = (founderResponse || '').length > 40;
    return {
      critiqueVerdict: isDetailed ? 'VALIDATED' : 'WEAK',
      aiCritique: isDetailed 
        ? `Asoschi e'tirozga real strategiya va mantiqiy asoslar bilan javob berdi. Ushbu yondashuv investor xatarlarini kamaytiradi.`
        : `Javob biroz yuzaki bo'ldi. Aniqroq raqamlar, muddatlar va ijro bosqichlarini ko'rsatish investor ishonchini oshiradi.`
    };
  }

  // Healthcheck endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 1. AI Analysis Endpoint
  app.post('/api/analyze-idea', async (req, res) => {
    try {
      const { idea } = req.body;
      if (!idea || !idea.title) {
        return res.status(400).json({ error: 'Missing idea payload or title.' });
      }

      const ai = getAI();

      const prompt = `
Siz Silikon Vodiysi venchur investori, tajribali startap maslahatchisi va o'ta obyektiv mahsulot strategisiz.
FounderOS tizimi uchun quyidagi startap g'oyasini chuqur tahlil qiling. BARCHA MATN JAVOBLARINI SOF VA TUSHUNARLI O'ZBEK TILIDA BERING.
Chalg'ituvchi maqtovlarsiz, sovuqqon va investor darajasidagi obyektiv tahlil taqdim eting.

STARTAP G'OYASI TAFSILOTLARI:
Sarlavha: ${idea.title}
Bir jumlali tavsif: ${idea.oneSentenceDescription || 'Mavjud emas'}
Muammo: ${idea.problem || 'Mavjud emas'}
Maqsadli foydalanuvchilar: ${idea.targetUsers || 'Mavjud emas'}
Yechim: ${idea.solution || 'Mavjud emas'}
Nega aynan hozir?: ${idea.whyNow || 'Mavjud emas'}
Bozor hajmi: ${idea.marketSize || 'Mavjud emas'}
Raqobatchilar: ${idea.competitors || 'Mavjud emas'}
Raqobatbardosh ustunlik: ${idea.competitiveAdvantage || 'Mavjud emas'}
Biznes model: ${idea.businessModel || 'Mavjud emas'}
Monetizatsiya: ${idea.monetization || 'Mavjud emas'}
MVP doirasi: ${idea.mvp || 'Mavjud emas'}
Kelajak yo'l xaritasi: ${idea.futureRoadmap || 'Mavjud emas'}
Xatarlar: ${idea.risks || 'Mavjud emas'}
Nega barbod bo'lishi mumkin?: ${idea.whyCouldFail || 'Mavjud emas'}
Shaxsiy motivatsiya: ${idea.personalMotivation || 'Mavjud emas'}
Qaydlar: ${idea.notes || 'Mavjud emas'}

Quyidagi JSON strukturaga strictly rioya qilib javob bering (barcha string qiymatlar O'ZBEK tilida bo'lsin):
{
  "overallScore": number (0-100),
  "scores": {
    "marketNeed": number (0-100),
    "originality": number (0-100),
    "competition": number (0-100, 100=qulay raqobat ortam, 0=shafqatsiz qizil okean),
    "difficulty": number (0-100, 100=oson ijro, 0=juda murakkab),
    "monetization": number (0-100),
    "scalability": number (0-100),
    "founderFit": number (0-100),
    "technicalComplexity": number (0-100),
    "goToMarketDifficulty": number (0-100, 100=oson GTM, 0=ogir GTM),
    "aiValue": number (0-100)
  },
  "strengths": string[] (3-5 ta kuchli tomon, o'zbekcha),
  "weaknesses": string[] (3-5 ta zaif tomon, o'zbekcha),
  "hiddenRisks": string[] (3-5 ta yashirin xatar, o'zbekcha),
  "similarProducts": string[] (3-5 ta o'xshash mahsulot),
  "possibleCompetitors": string[] (3-5 ta potensial raqobatchi),
  "potentialCustomers": string[] (3-5 ta maqsadli xaridor segmente),
  "waysToImprove": string[] (3-5 ta amaliy yaxshilash tavsiyasi, o'zbekcha),
  "biggestMistake": string (eng katta yo'l qo'yilishi mumkin bo'lgan xato, o'zbekcha),
  "mvpRecommendation": string (tavsiya etiladigan MVP strategiyasi, o'zbekcha),
  "shouldBuild": "YES" | "NO" | "LATER",
  "verdictRationale": string (xulosa asosi va sababi, o'zbekcha)
}
`;

      const response = await generateContentWithFallback(ai, {
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
          systemInstruction: 'Siz FounderOS AI - venchur kapital, unit-ekonomika, himoyalanganlik va real bozor qonuniyatlariga tayanadigan xolis investor va maslahatchisisiz. Barcha javoblarni sof o\'zbek tilida bering.',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.INTEGER },
              scores: {
                type: Type.OBJECT,
                properties: {
                  marketNeed: { type: Type.INTEGER },
                  originality: { type: Type.INTEGER },
                  competition: { type: Type.INTEGER },
                  difficulty: { type: Type.INTEGER },
                  monetization: { type: Type.INTEGER },
                  scalability: { type: Type.INTEGER },
                  founderFit: { type: Type.INTEGER },
                  technicalComplexity: { type: Type.INTEGER },
                  goToMarketDifficulty: { type: Type.INTEGER },
                  aiValue: { type: Type.INTEGER },
                },
                required: ['marketNeed', 'originality', 'competition', 'difficulty', 'monetization', 'scalability', 'founderFit', 'technicalComplexity', 'goToMarketDifficulty', 'aiValue'],
              },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              hiddenRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
              similarProducts: { type: Type.ARRAY, items: { type: Type.STRING } },
              possibleCompetitors: { type: Type.ARRAY, items: { type: Type.STRING } },
              potentialCustomers: { type: Type.ARRAY, items: { type: Type.STRING } },
              waysToImprove: { type: Type.ARRAY, items: { type: Type.STRING } },
              biggestMistake: { type: Type.STRING },
              mvpRecommendation: { type: Type.STRING },
              shouldBuild: { type: Type.STRING, enum: ['YES', 'NO', 'LATER'] },
              verdictRationale: { type: Type.STRING },
            },
            required: [
              'overallScore', 'scores', 'strengths', 'weaknesses', 'hiddenRisks',
              'similarProducts', 'possibleCompetitors', 'potentialCustomers',
              'waysToImprove', 'biggestMistake', 'mvpRecommendation',
              'shouldBuild', 'verdictRationale'
            ]
          }
        },
      });

      const analysisData = JSON.parse(response.text || '{}');
      analysisData.analyzedAt = new Date().toISOString();
      res.json({ success: true, analysis: analysisData });
    } catch (err: any) {
      console.warn('Gemini API call failed in /api/analyze-idea, using intelligent fallback analysis:', err?.message || err);
      const fallback = getFallbackAnalysis(req.body?.idea || {});
      res.json({ success: true, analysis: fallback, isFallback: true });
    }
  });

  // 2. AI Critic Mode Endpoint
  app.post('/api/critic-mode', async (req, res) => {
    try {
      const { idea } = req.body;
      if (!idea || !idea.title) {
        return res.status(400).json({ error: 'Missing idea.' });
      }

      const ai = getAI();

      const prompt = `
Siz yetakchi VC jamg'armasining (masalan, Sequoia yoki Benchmark) murosasiz bosh hamkorigiz.
Muassislarga quruq maqtovlar aytmaysiz. Barcha taxmin va g'oyalarni o'tkir skeptitsizm bilan shubha ostiga olasiz.
BARCHA JAVOBLAR O'ZBEK TILIDA BO'LSIN.

STARTAP G'OYASI:
Sarlavha: ${idea.title}
Bir jumlali tavsif: ${idea.oneSentenceDescription}
Muammo: ${idea.problem}
Maqsadli foydalanuvchilar: ${idea.targetUsers}
Yechim: ${idea.solution}
Raqobatchilar: ${idea.competitors}
Monetizatsiya: ${idea.monetization}
Xatarlar: ${idea.risks}
Nega barbod bo'lishi mumkin?: ${idea.whyCouldFail}

Tanqidiy rejim auditini o'tkazing va investor uchun hayotiy muhim 4 savolga o'zbek tilida javob bering:
1. "Mobo OpenAI yoki katta korporatsiyalar ertaga ushbu funksiyani chiqarsa nima bo'ladi?"
2. "Foydalanuvchilar nega amaldagi Excel, Google Docs yoki eski odatlaridan voz kechadi?"
3. "Reklamaga pul sovurmasdan, dastlabki 100 ta to'laydigan mijozni aniq qanday jalb qilasiz?"
4. "Arzonroq yoki bepul muqobillar turganda, nega aynan sizga pul to'lashlari kerak?"

Shuningdek, ushbu g'oyadagi 3-5 ta asosiy taxminni aniqlang va ularga tajovuzkorona e'tiroz bildiring.

JSON SCHEMA:
{
  "investorPersona": "Sequoia Capital Bosh Hamkori",
  "openaiThreat": "string (o'zbekcha)",
  "statusQuoThreat": "string (o'zbekcha)",
  "first100UsersChallenge": "string (o'zbekcha)",
  "monetizationHurdle": "string (o'zbekcha)",
  "keyAssumptionsChallenged": [
    {
      "id": "string",
      "assumption": "string (asosiy taxmin, o'zbekcha)",
      "challenge": "string (investor e'tirozi, o'zbekcha)",
      "severity": "CRITICAL" | "HIGH" | "MODERATE"
    }
  ]
}
`;

      const response = await generateContentWithFallback(ai, {
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              investorPersona: { type: Type.STRING },
              openaiThreat: { type: Type.STRING },
              statusQuoThreat: { type: Type.STRING },
              first100UsersChallenge: { type: Type.STRING },
              monetizationHurdle: { type: Type.STRING },
              keyAssumptionsChallenged: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    assumption: { type: Type.STRING },
                    challenge: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ['CRITICAL', 'HIGH', 'MODERATE'] }
                  },
                  required: ['id', 'assumption', 'challenge', 'severity']
                }
              }
            },
            required: ['investorPersona', 'openaiThreat', 'statusQuoThreat', 'first100UsersChallenge', 'monetizationHurdle', 'keyAssumptionsChallenged']
          }
        }
      });

      const criticData = JSON.parse(response.text || '{}');
      criticData.analyzedAt = new Date().toISOString();
      res.json({ success: true, criticMode: criticData });
    } catch (err: any) {
      console.warn('Gemini API call failed in /api/critic-mode, using fallback critic mode:', err?.message || err);
      const fallbackCritic = getFallbackCritic(req.body?.idea || {});
      res.json({ success: true, criticMode: fallbackCritic, isFallback: true });
    }
  });

  // 3. Evaluate Founder Counter-Argument
  app.post('/api/evaluate-counter-argument', async (req, res) => {
    try {
      const { assumption, challenge, founderResponse } = req.body;
      if (!assumption || !challenge || !founderResponse) {
        return res.status(400).json({ error: 'Missing parameters.' });
      }

      const ai = getAI();

      const prompt = `
Investor startap taxminiga e'tiroz bildirdi:
TAXMIN: "${assumption}"
INVESTOR E'TIROZI: "${challenge}"
ASOSCHINING RADDAYASI: "${founderResponse}"

Asoschining javobini xolis baholang (O'ZBEK TILIDA):
- "VALIDATED": Dalillarga tayangan, strategik va real e'tiroz.
- "WEAK": Yuzaki vajlar, aniq ijro rejasining yo'qligi.
- "COPIUM": Xom xayollar, bozordan uzilgan o'z-o'zini aldash.

2-3 jumlada sababini tushuntiruvchi investor tanqidini o'zbek tilida yozing.

JSON qaytaring:
{
  "critiqueVerdict": "VALIDATED" | "WEAK" | "COPIUM",
  "aiCritique": "string (o'zbekcha)"
}
`;

      const response = await generateContentWithFallback(ai, {
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              critiqueVerdict: { type: Type.STRING, enum: ['VALIDATED', 'WEAK', 'COPIUM'] },
              aiCritique: { type: Type.STRING }
            },
            required: ['critiqueVerdict', 'aiCritique']
          }
        }
      });

      res.json({ success: true, evaluation: JSON.parse(response.text || '{}') });
    } catch (err: any) {
      console.warn('Gemini API call failed in /api/evaluate-counter-argument, using fallback:', err?.message || err);
      const fallbackEval = getFallbackCounterEval(req.body?.assumption || '', req.body?.challenge || '', req.body?.founderResponse || '');
      res.json({ success: true, evaluation: fallbackEval, isFallback: true });
    }
  });

  // 4. Generate 10 Challenging Questions
  app.post('/api/generate-questions', async (req, res) => {
    try {
      const { idea } = req.body;
      if (!idea || !idea.title) {
        return res.status(400).json({ error: 'Missing idea.' });
      }

      const ai = getAI();

      const prompt = `
Ushbu startap g'oyasi uchun EXACTLY 10 ta o'tkir, chuqur investor savollarini O'ZBEK TILIDA yarating.
Kategoriyalar: Raqobat, Tarqatish (GTM), Himoyalanganlik (Moat), Monetizatsiya, Unit-ekonomika, Asoschi mosligi, Texnik, Huquqiy, Ushlab qolish (Retention).

STARTAP:
Sarlavha: ${idea.title}
Muammo: ${idea.problem}
Yechim: ${idea.solution}
Maqsadli foydalanuvchilar: ${idea.targetUsers}
Monetizatsiya: ${idea.monetization}

JSON qaytaring (barcha savollar o'zbekcha bo'lsin):
{
  "questions": [
    {
      "id": number (1 dan 10 gacha),
      "category": "string (o'zbekcha kategoriya nomi)",
      "question": "string (o'zbekcha savol)"
    }
  ]
}
`;

      const response = await generateContentWithFallback(ai, {
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    category: { type: Type.STRING },
                    question: { type: Type.STRING }
                  },
                  required: ['id', 'category', 'question']
                }
              }
            },
            required: ['questions']
          }
        }
      });

      res.json({ success: true, questions: JSON.parse(response.text || '{}').questions });
    } catch (err: any) {
      console.warn('Gemini API call failed in /api/generate-questions, using fallback questions:', err?.message || err);
      const fallbackQs = getFallbackQuestions(req.body?.idea || {});
      res.json({ success: true, questions: fallbackQs, isFallback: true });
    }
  });

  // 5. Generate Master Idea Blueprint Prompt
  app.post('/api/generate-project-prompt', async (req, res) => {
    try {
      const { idea, targetTool = 'chatgpt' } = req.body;
      if (!idea || !idea.title) {
        return res.status(400).json({ error: 'Missing idea.' });
      }

      const ai = getAI();

      const prompt = `
Siz Bosh Startap Strategi, Mahsulot Arxitektori va Venture Capital hamkorisiz.
Ushbu startap g'oyasi bo'yicha DASTURLASH KODISIZ (programmalash sintaksisisiz), faqat G'OYANING O'ZI, ISHLASH MEXANIZMI, MAHSULOT MANTIG'I, BIZNES MODELI VA BOZOR STRATEGIYASINI CHUQUR YORITIB BERUVCHI MASTER PROMPT (Master Idea Blueprint) yarating.

Ushbu prompt har qanday AI vositasiga (${targetTool.toUpperCase()}, Claude, ChatGPT, Gemini, DeepSeek) yoki investorgab berilganda g'oyaning mazmun-mohiyatini to'liq yoritib beradigan MASTER DARAJADAGI hujjat bo'lishi kerak.

Bo'limlar:
1. G'oya Negizi va Bosh Konsepsiya
2. Muammo va Taklif etiladigan Yechim Mexanikasi
3. Maqsadli Auditoriya va Mijoz Portreti (ICP)
4. Mahsulotning Operatsion Ishlash Zanjiri va User Journey
5. Monetizatsiya va Daromad Modeli
6. Bozor Mavqeyi va Unikal Ustunlik (Moat)
7. Go-To-Market (GTM) va O'sish Halqalari
8. MVP Doirasi va Boshlang'ich Bosqichlar
9. Xatarlar va Ularni Yumshatish Strategiyasi

STARTAP TAFSILOTLARI:
Sarlavha: ${idea.title}
Tavsif: ${idea.oneSentenceDescription}
Muammo: ${idea.problem}
Yechim: ${idea.solution}
Foydalanuvchilar: ${idea.targetUsers}
Biznes model: ${idea.businessModel}
MVP doirasi: ${idea.mvp}

JSON qaytaring:
{
  "targetTool": "${targetTool}",
  "sections": {
    "productVision": "string",
    "targetUsers": "string",
    "features": "string",
    "monetization": "string",
    "marketPositioning": "string",
    "mvpScope": "string",
    "growthStrategy": "string"
  },
  "fullPromptText": "string (To'liq Master Idea Blueprint matni)"
}
`;

      const response = await generateContentWithFallback(ai, {
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              targetTool: { type: Type.STRING },
              sections: {
                type: Type.OBJECT,
                properties: {
                  productVision: { type: Type.STRING },
                  targetUsers: { type: Type.STRING },
                  features: { type: Type.STRING },
                  monetization: { type: Type.STRING },
                  marketPositioning: { type: Type.STRING },
                  mvpScope: { type: Type.STRING },
                  growthStrategy: { type: Type.STRING }
                },
                required: [
                  'productVision', 'targetUsers', 'features', 'monetization',
                  'marketPositioning', 'mvpScope', 'growthStrategy'
                ]
              },
              fullPromptText: { type: Type.STRING }
            },
            required: ['targetTool', 'sections', 'fullPromptText']
          }
        }
      });

      const promptData = JSON.parse(response.text || '{}');
      promptData.generatedAt = new Date().toISOString();
      res.json({ success: true, projectPrompt: promptData });
    } catch (err: any) {
      console.warn('Gemini API call failed in /api/generate-project-prompt, using fallback prompt:', err?.message || err);
      const fallbackPromptData = getFallbackPrompt(req.body?.idea || {}, req.body?.targetTool || 'cursor');
      res.json({ success: true, projectPrompt: fallbackPromptData, isFallback: true });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FounderOS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
