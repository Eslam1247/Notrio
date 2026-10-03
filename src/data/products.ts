// Replace with API calls (src/services/api.ts) when the backend exists.
export type World = 'write' | 'plan' | 'create'
export type Pattern = 'lines' | 'grid' | 'blank'
export interface Product {
  id: string; world: World; ar: string; en: string; price: number; tagline: string; taglineEn: string; desc: string; descEn: string
  color: string; pattern: Pattern; pages: number; size: string; paper: string; stock: boolean
}
export const WORLDS: Record<World, { ar: string; en: string; line: string; lineEn: string; color: string }> = {
  write: { ar: 'اكتب', en: 'Write', line: 'للملاحظات اليومية وكل ما يستحق أن يُدوَّن.', lineEn: 'For daily notes and everything worth writing down.', color: '#1f6f5c' },
  plan: { ar: 'خطّط', en: 'Plan', line: 'ليوم أوضح، وأسبوع أهدأ، ومشروع منظّم.', lineEn: 'For a clearer day, a calmer week, an organized project.', color: '#e0662f' },
  create: { ar: 'أبدع', en: 'Create', line: 'للرسم والشبكات والأفكار الأولى.', lineEn: 'For sketching, grids, and first ideas.', color: '#2540d9' },
}
const p = (id: string, world: World, ar: string, en: string, price: number, tagline: string, taglineEn: string, desc: string, descEn: string, color: string, pattern: Pattern, pages = 160, size = 'A5', paper = '100 جم', stock = true): Product =>
  ({ id, world, ar, en, price, tagline, taglineEn, desc, descEn, color, pattern, pages, size, paper, stock })
export const PRODUCTS: Product[] = [
  p('classic', 'write', 'دفتر كلاسيكي', 'Classic Notebook', 145, 'كتابة بلا استعجال.', 'Writing without rushing.', 'غلاف مصقول وورق كريمي سميك.', 'Glossy cover and thick cream paper.', '#1f6f5c', 'lines'),
  p('lined', 'write', 'دفتر مسطّر', 'Lined Notebook', 120, 'سطور تحترم خطّك.', 'Lines that respect your handwriting.', 'مسافات مريحة تناسب الخط العربي واللاتيني.', 'Comfortable spacing for Arabic and Latin script.', '#3b3b40', 'lines'),
  p('journal', 'write', 'دفتر يوميات', 'Journal', 165, 'يومك، بصوتك.', 'Your day, in your voice.', 'صفحات مرقّمة وشريط قراءة.', 'Numbered pages and a ribbon bookmark.', '#8a2f3d', 'lines', 192),
  p('meeting', 'write', 'دفتر اجتماعات', 'Meeting Notebook', 150, 'ما قيل، وما تقرّر.', 'What was said, what was decided.', 'مساحات للحضور والقرارات والمتابعات.', 'Space for attendees, decisions and follow-ups.', '#22262e', 'lines'),
  p('interview', 'write', 'دفتر مقابلات', 'Interview Notebook', 150, 'الأسئلة والاقتباسات في مكانها.', 'Questions and quotes, kept in place.', 'تنسيق للأسئلة والإجابات.', 'Layout built for questions and answers.', '#4a5a52', 'lines', 160, 'A5', '100 جم', false),
  p('todo', 'plan', 'دفتر المهام', 'To-Do Notebook', 110, 'أنجز، ثم اشطب.', 'Do it, then cross it off.', 'قوائم بمربعات إنجاز وأولويات.', 'Checklists with priority boxes.', '#e0662f', 'lines', 128),
  p('daily', 'plan', 'مخطّط يومي', 'Daily Planner', 185, 'صفحة لكل يوم.', 'A page for every day.', 'أولوية واحدة وجدول ساعات.', 'One priority and an hourly schedule.', '#d99a2b', 'grid', 384),
  p('weekly', 'plan', 'مخطّط أسبوعي', 'Weekly Planner', 170, 'أسبوعك أمامك.', 'Your week, at a glance.', 'صفحتان متقابلتان لأسبوع كامل.', 'A two-page spread for the whole week.', '#b4472f', 'grid', 112),
  p('monthly', 'plan', 'مخطّط شهري', 'Monthly Planner', 160, 'الصورة الكبيرة.', 'The big picture.', 'نظرة شهرية مع صفحة للأهداف.', 'A monthly view plus a goals page.', '#7a4b8f', 'grid', 96),
  p('project', 'plan', 'دفتر المشاريع', 'Project Notebook', 175, 'من الفكرة إلى التسليم.', 'From idea to delivery.', 'مراحل ومهام ومواعيد تسليم.', 'Milestones, tasks and deadlines.', '#3d4a3a', 'grid', 200, 'B5'),
  p('sketch', 'create', 'دفتر رسم', 'Sketchbook', 190, 'ورق يتحمل الحبر.', 'Paper that holds up to ink.', 'ورق ثقيل يحتمل الحبر والألوان المائية.', 'Heavy paper for ink and watercolor.', '#2540d9', 'blank', 80, 'A4', '200 جم'),
  p('grid', 'create', 'دفتر شبكي', 'Grid Notebook', 135, 'دقّة في كل خط.', 'Precision in every line.', 'شبكة ٥ مم للتصميم والرسم الهندسي.', '5mm grid for design and technical drawing.', '#1b6f9e', 'grid', 160),
  p('creative', 'create', 'دفتر إبداعي', 'Creative Notebook', 155, 'كل صفحة تختلف.', 'Every page is different.', 'صفحات سادة ومسطّرة ومنقّطة.', 'A mix of blank, lined and dotted pages.', '#c23b7a', 'blank', 144),
  p('idea', 'create', 'دفتر أفكار', 'Idea Notebook', 125, 'التقط الفكرة قبل أن تهرب.', 'Catch the idea before it slips.', 'حجم جيب يرافقك في كل مكان.', 'Pocket size that goes everywhere with you.', '#e0b32b', 'blank', 96, 'A6'),
]
export const byId = (id?: string) => PRODUCTS.find(x => x.id === id)
export const fmt = (n: number, lang: 'ar' | 'en' = 'ar') => lang === 'ar' ? `${n.toLocaleString('ar-EG')} ج.م` : `EGP ${n.toLocaleString('en-US')}`
