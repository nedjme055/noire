import 'dotenv/config';
import {PrismaClient} from '@prisma/client';
import {hash} from 'bcryptjs';

const prisma = new PrismaClient();

const wilayas = [
  ['01', 'Adrar', 'Adrar', '?????', 950, 750],
  ['02', 'Chlef', 'Chlef', '?????', 800, 550],
  ['03', 'Laghouat', 'Laghouat', '???????', 850, 650],
  ['04', 'Oum El Bouaghi', 'Oum El Bouaghi', '?? ???????', 600, 450],
  ['05', 'Batna', 'Batna', '?????', 800, 550],
  ['06', 'Bejaia', 'Bejaia', '?????', 800, 550],
  ['07', 'Biskra', 'Biskra', '?????', 850, 650],
  ['08', 'Bechar', 'Bechar', '????', 950, 750],
  ['09', 'Blida', 'Blida', '???????', 800, 550],
  ['10', 'Bouira', 'Bouira', '???????', 800, 550],
  ['11', 'Tamanrasset', 'Tamanrasset', '???????', 1500, 1300],
  ['12', 'Tebessa', 'Tebessa', '????', 800, 550],
  ['13', 'Tlemcen', 'Tlemcen', '??????', 800, 550],
  ['14', 'Tiaret', 'Tiaret', '?????', 800, 550],
  ['15', 'Tizi Ouzou', 'Tizi Ouzou', '???? ???', 800, 550],
  ['16', 'Algiers', 'Alger', '???????', 600, 450],
  ['17', 'Djelfa', 'Djelfa', '??????', 850, 650],
  ['18', 'Jijel', 'Jijel', '????', 600, 450],
  ['19', 'Setif', 'Setif', '????', 800, 550],
  ['20', 'Saida', 'Saida', '?????', 800, 550],
  ['21', 'Skikda', 'Skikda', '??????', 600, 450],
  ['22', 'Sidi Bel Abbes', 'Sidi Bel Abbes', '???? ??????', 800, 550],
  ['23', 'Annaba', 'Annaba', '?????', 800, 550],
  ['24', 'Guelma', 'Guelma', '?????', 600, 450],
  ['25', 'Constantine', 'Constantine', '???????', 490, 350],
  ['26', 'Medea', 'Medea', '??????', 800, 550],
  ['27', 'Mostaganem', 'Mostaganem', '???????', 800, 550],
  ['28', 'Msila', 'Msila', '???????', 800, 550],
  ['29', 'Mascara', 'Mascara', '?????', 800, 550],
  ['30', 'Ouargla', 'Ouargla', '?????', 850, 650],
  ['31', 'Oran', 'Oran', '?????', 800, 550],
  ['32', 'El Bayadh', 'El Bayadh', '?????', 950, 750],
  ['33', 'Illizi', 'Illizi', '?????', 1500, 1300],
  ['34', 'Bordj Bou Arreridj', 'Bordj Bou Arreridj', '??? ????????', 800, 550],
  ['35', 'Boumerdes', 'Boumerdes', '???????', 800, 550],
  ['36', 'El Tarf', 'El Tarf', '??????', 800, 550],
  ['37', 'Tindouf', 'Tindouf', '?????', 1500, 1300],
  ['38', 'Tissemsilt', 'Tissemsilt', '????????', 800, 550],
  ['39', 'El Oued', 'El Oued', '??????', 850, 650],
  ['40', 'Khenchela', 'Khenchela', '?????', 800, 550],
  ['41', 'Souk Ahras', 'Souk Ahras', '??? ?????', 800, 550],
  ['42', 'Tipaza', 'Tipaza', '??????', 800, 550],
  ['43', 'Mila', 'Mila', '????', 600, 450],
  ['44', 'Ain Defla', 'Ain Defla', '??? ??????', 800, 550],
  ['45', 'Naama', 'Naama', '???????', 950, 750],
  ['46', 'Ain Temouchent', 'Ain Temouchent', '??? ??????', 800, 550],
  ['47', 'Ghardaia', 'Ghardaia', '??????', 850, 650],
  ['48', 'Relizane', 'Relizane', '??????', 800, 550],
  ['49', 'Timimoun', 'Timimoun', '???????', 950, 750],
  ['50', 'Bordj Badji Mokhtar', 'Bordj Badji Mokhtar', '??? ???? ?????', 950, 750],
  ['51', 'Ouled Djellal', 'Ouled Djellal', '????? ????', 850, 650],
  ['52', 'Beni Abbes', 'Beni Abbes', '??? ????', 950, 750],
  ['53', 'In Salah', 'In Salah', '??? ????', 1500, 1300],
  ['54', 'In Guezzam', 'In Guezzam', '??? ????', 1500, 1300],
  ['55', 'Touggourt', 'Touggourt', '????', 850, 650],
  ['56', 'Djanet', 'Djanet', '????', 1500, 1300],
  ['57', 'El Mghair', 'El Mghair', '??????', 850, 650],
  ['58', 'El Meniaa', 'El Meniaa', '???????', 850, 650]
] as const;

async function main() {
  const passwordHash = await hash('Admin@12345', 10);

  await prisma.user.upsert({
    where: {email: 'admin@noire.dz'},
    update: {name: 'Admin', passwordHash},
    create: {name: 'Admin', email: 'admin@noire.dz', passwordHash}
  });

  for (const [code, nameEn, nameFr, nameAr, homePriceDzd, stopdeskPriceDzd] of wilayas) {
    await prisma.shippingWilaya.upsert({
      where: {code},
      update: {nameEn, nameFr, nameAr, homePriceDzd, stopdeskPriceDzd},
      create: {
        code,
        nameEn,
        nameFr,
        nameAr,
        homePriceDzd,
        stopdeskPriceDzd
      }
    });
  }

  await prisma.siteSettings.upsert({
    where: {id: 'main'},
    update: {},
    create: {
      id: 'main',
      storeName: 'Noire',
      trackingEnabled: false
    }
  });

  const sampleProducts = [
    {
      slug: 'legacy-tailored-pant',
      category: 'pants',
      titleEn: 'Legacy Tailored Pant',
      titleFr: 'Pantalon Legacy Coupe',
      titleAr: '????? ??????',
      descriptionEn: 'Structured premium pants for clean silhouettes.',
      descriptionFr: 'Pantalon premium structure pour une silhouette nette.',
      descriptionAr: '????? ???? ???? ????? ??????.',
      priceDzd: 9800,
      stock: 24,
      featured: true,
      image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=1200'
    },
    {
      slug: 'studio-oversized-tee',
      category: 'tshirts',
      titleEn: 'Studio Oversized Tee',
      titleFr: 'T-shirt Studio Oversize',
      titleAr: '???? ?????? ????',
      descriptionEn: 'Heavy cotton oversized t-shirt with minimalist branding.',
      descriptionFr: 'T-shirt oversize en coton epais avec branding minimal.',
      descriptionAr: '???? ???? ???? ????? ????? ????? ????.',
      priceDzd: 5200,
      stock: 40,
      featured: true,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200'
    },
    {
      slug: 'mono-runner-shoes',
      category: 'shoes',
      titleEn: 'Mono Runner Shoes',
      titleFr: 'Chaussures Mono Runner',
      titleAr: '???? ???? ????',
      descriptionEn: 'Monochrome sneaker for all-day movement.',
      descriptionFr: 'Sneaker monochrome confortable toute la journee.',
      descriptionAr: '???? ????? ????? ???? ?????? ???????.',
      priceDzd: 14900,
      stock: 18,
      featured: true,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200'
    }
  ] as const;

  for (const product of sampleProducts) {
    const created = await prisma.product.upsert({
      where: {slug: product.slug},
      update: {
        category: product.category,
        titleEn: product.titleEn,
        titleFr: product.titleFr,
        titleAr: product.titleAr,
        descriptionEn: product.descriptionEn,
        descriptionFr: product.descriptionFr,
        descriptionAr: product.descriptionAr,
        priceDzd: product.priceDzd,
        stock: product.stock,
        featured: product.featured,
        published: true
      },
      create: {
        slug: product.slug,
        category: product.category,
        titleEn: product.titleEn,
        titleFr: product.titleFr,
        titleAr: product.titleAr,
        descriptionEn: product.descriptionEn,
        descriptionFr: product.descriptionFr,
        descriptionAr: product.descriptionAr,
        priceDzd: product.priceDzd,
        stock: product.stock,
        featured: product.featured,
        published: true,
        images: {
          create: [
            {
              url: product.image,
              altEn: product.titleEn,
              altFr: product.titleFr,
              altAr: product.titleAr,
              sortOrder: 0
            }
          ]
        },
        variants: {
          create: ['S', 'M', 'L', 'XL'].flatMap((size) =>
            ['#000000', '#FFFFFF'].map((color) => ({size, color, stock: 4}))
          )
        }
      }
    });

    await prisma.variant.deleteMany({where: {productId: created.id}});
    await prisma.variant.createMany({
      data: ['S', 'M', 'L', 'XL'].flatMap((size) =>
        ['#000000', '#FFFFFF'].map((color) => ({productId: created.id, size, color, stock: 4}))
      )
    });
    await prisma.product.update({
      where: {id: created.id},
      data: {stock: 32}
    });
  }

  console.log('Seed complete');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
