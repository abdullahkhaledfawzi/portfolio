const targetDate = new Date('2026-11-01T00:00:00+03:00').getTime();

const translations = {
    en: {
        subtitle: "Freedom Journey started: November 1, 2026 at 12:00 AM (Egypt Time)",
        timerTitleFuture: "Time Until Freedom",
        timerTitlePast: "Time Since You Quit Smoking",
        days: "Days",
        hours: "Hours",
        minutes: "Minutes",
        seconds: "Seconds",
        statusFuture: "Getting Ready for the Best Decision of Your Life!",
        statusPast: "You are a Non-Smoker! Enjoy the Freedom!",
        emergencyBtn: "🚨 EMERGENCY / URGE 🚨",
        modalTitle: "Wait! Read This First!",
        modalBody: `
            <p>You are experiencing an urge now. But remember, if it's been a long time since you quit, <strong>this is a FAKE urge</strong> caused by an old memory, not actual physical withdrawal! The physical withdrawal is long dead.</p>
            <p>There is absolutely <strong>0% good and 100% bad</strong> in smoking. Remember the taste of that last cigarette? How bad it felt in your lungs? How you couldn't even take a deep breath?</p>
            <p>You used to smoke to feel whole, to love yourself after that hard breakup. You would sit on the pavement, looking at the night sky, enjoying your own company with a cigarette. <strong>But the cigarette was NOT the reason you loved yourself!</strong> It just happened to be there. You are whole, you are complete, and you enjoy your own company even more now <em>without</em> it.</p>
            <p><strong>Take a clean, deep breath.</strong> Feel your clean lungs. You are free.</p>
        `,
        wisdomTitle: "Allen Carr's Wisdom",
        card1Title: "Not a Habit, an Addiction",
        card1Text: "Smoking is not a habit you chose; it's a nicotine addiction. Habits are easy to break. You fell into a trap designed to keep you there. Realizing this is the first step to freedom.",
        card2Title: "The Tight Shoes",
        card2Text: "Smokers smoke to feel how non-smokers feel all the time. It's like wearing tight shoes all day just for the pleasure of taking them off. You don't need them!",
        card3Title: "No Sacrifices",
        card3Text: "You are giving up absolutely nothing. Cigarettes do not relieve stress or cure boredom; they cause them. You are gaining health, energy, money, and confidence.",
        card4Title: "Vaping & Shisha",
        card4Text: "Vaping, e-cigarettes, and shisha are exactly the same nicotine trap dressed differently. Don't be fooled by the flavors or the trend. Nicotine is nicotine.",
        card5Title: "The Illusion of Support",
        card5Text: "A cigarette doesn't give you courage or help you concentrate. It actually destroys your nerves and blocks your blood vessels, depriving your brain of oxygen.",
        card6Title: "Enjoy Being Free",
        card6Text: "Don't mourn the loss of cigarettes. Rejoice! You are free from the slavery. Every time you think of smoking, say: 'Yippee! I'm a non-smoker!'",
        card7Title: "Pity the Smokers",
        card7Text: "You don't have to stay away from your smoking friends. Don't envy them; pity them. They are trapped in a cycle they wish they could escape, just like you used to be.",
        card8Title: "The Real Enemy",
        card8Text: "Don't miss smoking. Remember the real enemy: the nicotine trap. It created the illusion of boredom and stress relief while actually destroying your peace.",
        card9Title: "Real Stress Relief",
        card9Text: "In times of very stressful or angry situations, seek help by real influent things like talking with a friend or a lover, meditation, deep breathing, drinking water, or a little dopamine hit from chocolate. Do these instead of thinking to have a cigarette to relieve your stress.",
        deadLabel: "The enemy is dead",
        footerText: "Created by Abdullah Khaled from Egypt with "
    },
    ar: {
        subtitle: "رحلة الحرية تبدأ: 1 نوفمبر 2026 الساعة 12:00 منتصف الليل (بتوقيت مصر)",
        timerTitleFuture: "الوقت المتبقي حتى الحرية",
        timerTitlePast: "الوقت المنقضي منذ إقلاعك عن التدخين",
        days: "أيام",
        hours: "ساعات",
        minutes: "دقائق",
        seconds: "ثواني",
        statusFuture: "تستعد لاتخاذ أفضل قرار في حياتك!",
        statusPast: "أنت الآن شخص غير مدخن! استمتع بحريتك!",
        emergencyBtn: "🚨 طوارئ / رغبة ملحة 🚨",
        modalTitle: "انتظر! اقرأ هذا أولاً!",
        modalBody: `
            <p>أنت تشعر برغبة ملحة الآن. لكن تذكر، إذا مر وقت طويل على إقلاعك، <strong>فهذه رغبة مزيفة</strong> يسببها مجرد ذكرى قديمة، وليست أعراض انسحاب جسدية! الانسحاب الجسدي مات منذ زمن بعيد.</p>
            <p>التدخين فيه <strong>0% خير و 100% ضرر</strong>. تذكر طعم تلك السيجارة الأخيرة؟ كيف شعرت بالسوء في رئتيك؟ وكيف أنك لم تكن قادراً حتى على أخذ نفس عميق بعدما أدركت الحقيقة؟</p>
            <p>كنت تدخن لتشعر بالاكتمال، لتحب نفسك بعد الانفصال الصعب. كنت تجلس على الرصيف، تنظر إلى سماء الليل، وتستمتع بصحبة نفسك مع سيجارة. <strong>لكن السيجارة لم تكن السبب في حبك لنفسك!</strong> لقد كانت موجودة بالصدفة فقط. أنت مكتمل، وأنت تستمتع بصحبة نفسك الآن أكثر بكثير <em>بدونها</em>.</p>
            <p><strong>خذ نفساً عميقاً ونقياً.</strong> اشعر برئتين نظيفتين. أنت حر.</p>
        `,
        wisdomTitle: "حكمة آلان كار",
        card1Title: "ليس عادة، بل إدمان",
        card1Text: "التدخين ليس عادة اخترتها؛ إنه إدمان النيكوتين. العادات يسهل كسرها. لقد وقعت في فخ مصمم لإبقائك فيه. إدراك ذلك هو خطوتك الأولى نحو الحرية.",
        card2Title: "الحذاء الضيق",
        card2Text: "المدخن يدخن ليشعر بما يشعر به غير المدخن طوال الوقت. الأمر أشبه بارتداء حذاء ضيق طوال اليوم فقط لتستمتع بخلعه. أنت لا تحتاجه!",
        card3Title: "لا توجد تضحيات",
        card3Text: "أنت لا تتخلى عن أي شيء على الإطلاق. السجائر لا تخفف التوتر أو تعالج الملل؛ بل تسببهما. أنت تكسب الصحة، الطاقة، المال، والثقة.",
        card4Title: "الفيب والشيشة",
        card4Text: "الفيب، السجائر الإلكترونية، والشيشة هي بالضبط نفس فخ النيكوتين بأشكال مختلفة. لا تنخدع بالنكهات أو الموضة. النيكوتين هو النيكوتين.",
        card5Title: "وهم الدعم",
        card5Text: "السيجارة لا تمنحك الشجاعة ولا تساعدك على التركيز. في الواقع، هي تدمر أعصابك وتسد أوعيتك الدموية، مما يحرم دماغك من الأكسجين.",
        card6Title: "استمتع بكونك حراً",
        card6Text: "لا تحزن على فقدان السجائر. افرح! لقد تحررت من العبودية. كلما فكرت في التدخين، قل لنفسك: 'رائع! أنا شخص غير مدخن!'",
        card7Title: "أشفق على المدخنين",
        card7Text: "لست مضطراً للابتعاد عن أصدقائك المدخنين. لا تحسدهم؛ بل أشفق عليهم. إنهم عالقون في دائرة يتمنون الهروب منها، تماماً كما كنت أنت.",
        card8Title: "العدو الحقيقي",
        card8Text: "لا تشتاق للتدخين. تذكر العدو الحقيقي: فخ النيكوتين. لقد خلق لك وهم التخلص من الملل والتوتر بينما كان يدمر سلامك النفسي في الواقع.",
        card9Title: "تخفيف التوتر الحقيقي",
        card9Text: "في أوقات التوتر الشديد أو الغضب، ابحث عن المساعدة من خلال أشياء حقيقية ومؤثرة مثل التحدث مع صديق أو حبيب، التأمل، التنفس العميق، شرب الماء، أو الحصول على جرعة دوبامين صغيرة من الشوكولاتة. افعل هذا بدلاً من التفكير في تدخين سيجارة لتخفيف توترك.",
        deadLabel: "مات العدو",
        footerText: "صُنع بواسطة عبدالله خالد من مصر بحب "
    }
};

let currentLang = localStorage.getItem('lang') || 'en';
let currentTheme = localStorage.getItem('theme') || 'dark';

document.documentElement.setAttribute('data-theme', currentTheme);
document.documentElement.setAttribute('lang', currentLang);

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateButtons();
}

function toggleLang() {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    document.documentElement.setAttribute('lang', currentLang);
    localStorage.setItem('lang', currentLang);
    updateContent();
    updateButtons();
}

function updateButtons() {
    document.getElementById('theme-toggle').innerHTML = currentTheme === 'dark' ? '☀️ ' + (currentLang === 'en' ? 'Light Mode' : 'الوضع النهاري') : '🌙 ' + (currentLang === 'en' ? 'Dark Mode' : 'الوضع الليلي');
    document.getElementById('lang-toggle').innerHTML = currentLang === 'en' ? '🌐 العربية' : '🌐 English';
}

function updateContent() {
    const t = translations[currentLang];
    
    document.getElementById('subtitle').innerText = t.subtitle;
    document.getElementById('label-days').innerText = t.days;
    document.getElementById('label-hours').innerText = t.hours;
    document.getElementById('label-minutes').innerText = t.minutes;
    document.getElementById('label-seconds').innerText = t.seconds;
    
    document.getElementById('btn-emergency').innerText = t.emergencyBtn;
    document.getElementById('modal-title').innerHTML = '<span class="extinguished-icon">🚬🚫</span> ' + t.modalTitle;
    document.getElementById('modal-body').innerHTML = t.modalBody;
    
    document.getElementById('wisdom-title').innerText = t.wisdomTitle;
    document.getElementById('card-1-title').innerText = t.card1Title;
    document.getElementById('card-1-text').innerText = t.card1Text;
    document.getElementById('card-2-title').innerText = t.card2Title;
    document.getElementById('card-2-text').innerText = t.card2Text;
    document.getElementById('card-3-title').innerText = t.card3Title;
    document.getElementById('card-3-text').innerText = t.card3Text;
    document.getElementById('card-4-title').innerText = t.card4Title;
    document.getElementById('card-4-text').innerText = t.card4Text;
    document.getElementById('card-5-title').innerText = t.card5Title;
    document.getElementById('card-5-text').innerText = t.card5Text;
    document.getElementById('card-6-title').innerText = t.card6Title;
    document.getElementById('card-6-text').innerText = t.card6Text;
    document.getElementById('card-7-title').innerText = t.card7Title;
    document.getElementById('card-7-text').innerText = t.card7Text;
    document.getElementById('card-8-title').innerText = t.card8Title;
    document.getElementById('card-8-text').innerText = t.card8Text;
    document.getElementById('card-9-title').innerText = t.card9Title;
    document.getElementById('card-9-text').innerText = t.card9Text;
    document.getElementById('dead-label').innerText = t.deadLabel;
    
    document.getElementById('footer-text').innerHTML = t.footerText + '<span class="heart">❤️</span>';
}

function updateTimer() {
    const now = new Date().getTime();
    const diff = now - targetDate;
    
    const t = translations[currentLang];
    
    let isFuture = diff < 0;
    let absDiff = Math.abs(diff);

    document.getElementById('timer-title').innerText = isFuture ? t.timerTitleFuture : t.timerTitlePast;
    document.getElementById('timer-status').innerText = isFuture ? t.statusFuture : t.statusPast;

    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);

    const prefix = isFuture ? "-" : "";

    document.getElementById('val-days').innerText = prefix + days.toString().padStart(2, '0');
    document.getElementById('val-hours').innerText = hours.toString().padStart(2, '0');
    document.getElementById('val-minutes').innerText = minutes.toString().padStart(2, '0');
    document.getElementById('val-seconds').innerText = seconds.toString().padStart(2, '0');
}

// Emergency Modal Logic
const modal = document.getElementById('emergency-modal');
const btn = document.getElementById('btn-emergency');
const closeBtn = document.querySelector('.close-modal');

btn.onclick = function() {
    modal.classList.add('active');
}

closeBtn.onclick = function() {
    modal.classList.remove('active');
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.classList.remove('active');
    }
}

// Initialization
updateButtons();
updateContent();
setInterval(updateTimer, 1000);
updateTimer();
