-- Public goods catalog. Rows are unowned: anyone can read them.
-- Writes require the shop key checked in server functions (not a user account).

create table if not exists shop (
  id integer primary key check (id = 1),
  name text not null,
  tagline text not null,
  about text not null,
  city text not null default '',
  whatsapp text not null default '',
  currency text not null default 'USD',
  key_hash text,
  updated_at timestamptz not null default now()
);

insert into shop (id, name, tagline, about, city, currency)
values (
  1,
  'رِواق',
  'بضاعتك معروضة، والباب مفتوح للكل',
  'رواق رف واحد لبضاعة مختارة: زيت، نسيج، نحاس، وعناية البيت. اللي يفتح الصفحة، من أي جهاز، يشوف نفس المعرض.',
  '',
  'USD'
)
on conflict (id) do nothing;

create table if not exists products (
  id serial primary key,
  title text not null,
  summary text not null,
  story text not null,
  price integer not null check (price >= 0 and price <= 100000000),
  category text not null,
  origin text not null default '',
  image_path text,
  image_data text,
  available boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into products (title, summary, story, price, category, origin, image_path, featured, sort_order)
values
  (
    'زيت زيتون بكر',
    'عصر على البارد، بعبوة زجاج غامق.',
    'زيت ثقيل ولونه ذهبي، ريحة عشب أخضر أول ما تنفتح العبوة. ينفع للمائدة وللطبخ الخفيف. العبوة ٤٠٠ مل.',
    18,
    'food',
    'الموسم الحالي',
    '/products/olive.jpg',
    true,
    1
  ),
  (
    'كليم يدوي',
    'نسيج هندسي بألوان التراب والقمح.',
    'قطعة أرضية صغيرة من الصوف، نقوش متكسرة. تتفرش جنب الكنبة أو تتعلّق على الحيط. القياس حوالي ١٤٠ في ٩٠.',
    145,
    'textile',
    'نول يدوي',
    '/products/kilim.jpg',
    true,
    2
  ),
  (
    'دلة قهوة',
    'نحاس بمقبض خشب، لثلاث فناجين.',
    'دلة للمزاج الصباحي. تتسع لثلاث فناجين وتتحط على نار هادية. امسحيها بقطعة ناشفة بعد كل استعمال.',
    62,
    'brass',
    'نحاس',
    '/products/dallah.jpg',
    false,
    3
  ),
  (
    'صابون غار',
    'ثلاث قوالب زيتون وغار، من غير عطر صناعي.',
    'صابون بيت من زيت الزيتون والغار. ينفع للوجه والجسم، وريحته خفيفة. العلبة فيها ثلاث قوالب.',
    11,
    'care',
    'زيتون وغار',
    '/products/soap.jpg',
    false,
    4
  ),
  (
    'صندل جلد',
    'نعل مسطّح وحزام واحد، بلون القمح.',
    'جلد طبيعي، مريح للمشي اليومي. المقاس ينذكر برسالة الطلب حتى نأكد التوفر.',
    46,
    'wear',
    'جلد',
    '/products/sandals.jpg',
    false,
    5
  ),
  (
    'قنديل موزاييك',
    'زجاج ملون يرمى نور دافي على الحيط.',
    'قنديل صغير للطاولة. الزجاج يكسّر النور: أحمر وعسلي وأخضر. المصباح مشمول.',
    88,
    'brass',
    'زجاج ملون',
    '/products/lamp.jpg',
    true,
    6
  ),
  (
    'بهارات المائدة',
    'سماق وزعتر وفلفل بعلب نحاس.',
    'ثلاث علب بغطا: سماق، زعتر بسمسم، وفلفل أحمر. من غير مواد حافظة.',
    24,
    'food',
    'خلطة البيت',
    '/products/spices.jpg',
    false,
    7
  ),
  (
    'مخدة تطريز',
    'قطن مطرّز بإبرة، والحشوة مشمولة.',
    'نقشة نباتية بخيط أحمر باهت. القياس ٤٥ في ٤٥. تنغسل على البارد.',
    34,
    'textile',
    'تطريز يدوي',
    '/products/cushion.jpg',
    false,
    8
  ),
  (
    'عسل جبلي',
    'عسل خام كثيف، مع عود خشب.',
    'عسل من موسم الربيع، قوامه كثيف وطعمه زهري. البرطمان ٣٥٠ غرام. يتحفظ بعيد عن الشمس.',
    16,
    'food',
    'موسم الربيع',
    '/products/honey.jpg',
    false,
    9
  );
