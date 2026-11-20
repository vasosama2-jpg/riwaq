-- Sections the shop owner asked for: bags and shoes, editable like the rest.

update products
set category = 'shoes'
where title = 'صندل جلد' and category = 'wear';

insert into products (title, summary, story, price, category, origin, image_path, featured, sort_order)
select
  'شنتة جلد',
  'شنتة يومية بمقبضين، من غير نقش.',
  'جلد بلون ترابي، تتسع للمحفظة والجوال. المقاس متوسط.',
  54,
  'bags',
  'جلد',
  '/products/bag.jpg',
  false,
  1
where not exists (select 1 from products where title = 'شنتة جلد');

insert into products (title, summary, story, price, category, origin, image_path, featured, sort_order)
select
  'حذاء رياضي',
  'قماش أسود ونعل فاتح، للمشي اليومي.',
  'خفيف ومن غير شعار. المقاس ينذكر برسالة الطلب.',
  39,
  'shoes',
  'رياضي',
  '/products/sneakers.jpg',
  false,
  2
where not exists (select 1 from products where title = 'حذاء رياضي');
