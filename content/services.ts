import { z } from 'zod';
import { type Service, parseContent, serviceSchema } from './schemas';

/** Mirrors table `services`. */
export const services: readonly Service[] = parseContent(
  'content/services.ts',
  z.array(serviceSchema).min(1),
  [
    {
      slug: 'repair',
      icon: 'wrench',
      position: 1,
      priceFrom: 2500,
      name: { ar: 'تصليح', fr: 'Réparation', en: 'Repair' },
      description: {
        ar: 'شاشة، بطارية، منفذ الشحن أو كاميرا — تشخيص مجاني قبل ما نبدأو، وقطع أصلية.',
        fr: 'Écran, batterie, port de charge ou caméra — diagnostic gratuit avant intervention, pièces d’origine.',
        en: 'Screen, battery, charging port or camera — free diagnosis before we start, original parts.',
      },
      duration: {
        ar: 'من 45 دقيقة',
        fr: 'À partir de 45 min',
        en: 'From 45 min',
      },
    },
    {
      slug: 'unlock',
      icon: 'unlock',
      position: 2,
      priceFrom: 3000,
      name: { ar: 'ديبلوكاج', fr: 'Déblocage', en: 'Unlocking' },
      description: {
        ar: 'فك الشبكة للهواتف الجايّة من برّا، وفك قفل الحساب — كلشي قانوني وبلا ما نمسّو الضمان.',
        fr: 'Déblocage réseau pour les téléphones importés et déverrouillage de compte — légal, sans toucher à la garantie.',
        en: 'Network unlocking for imported handsets plus account unlocking — legitimate, and your warranty stays intact.',
      },
      duration: {
        ar: 'من ساعة إلى 48 ساعة',
        fr: 'De 1 h à 48 h',
        en: '1 h to 48 h',
      },
    },
    {
      slug: 'software',
      icon: 'download',
      position: 3,
      priceFrom: 1500,
      name: { ar: 'سوفتوير', fr: 'Logiciel', en: 'Software' },
      description: {
        ar: 'فلاش، ترقية النظام، حل مشكل البوت، ونقل بياناتك من تليفون لتليفون بلا ما تضيّع شي.',
        fr: 'Flash, mise à jour système, sortie de boucle de démarrage et transfert de données d’un téléphone à l’autre.',
        en: 'Flashing, OS updates, boot-loop recovery and moving your data across to a new phone intact.',
      },
      duration: {
        ar: 'من 30 دقيقة',
        fr: 'À partir de 30 min',
        en: 'From 30 min',
      },
    },
    {
      slug: 'after-sales',
      icon: 'shield',
      position: 4,
      priceFrom: 0,
      name: { ar: 'خدمة ما بعد البيع', fr: 'Service après-vente', en: 'After-sales service' },
      description: {
        ar: 'ضمان مكتوب على كل جهاز تشريه من عندنا. عندك مشكل؟ ترجع للمحل وحنا نتكلّفو.',
        fr: 'Garantie écrite sur chaque appareil acheté chez nous. Un souci ? Vous revenez au magasin et on s’en occupe.',
        en: 'A written warranty with every device you buy from us. Something wrong? Come back to the shop and we handle it.',
      },
      duration: {
        ar: 'مضمون 6 إلى 12 شهر',
        fr: 'Garanti 6 à 12 mois',
        en: 'Covered for 6 to 12 months',
      },
    },
  ],
);

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}
