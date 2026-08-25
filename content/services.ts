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
      name: { ar: 'إصلاح', fr: 'Réparation', en: 'Repair' },
      description: {
        ar: 'شاشة أو بطارية أو منفذ الشحن أو الكاميرا — تشخيص مجاني قبل البدء، وقطع غيار أصلية.',
        fr: 'Écran, batterie, port de charge ou caméra — diagnostic gratuit avant intervention, pièces d’origine.',
        en: 'Screen, battery, charging port or camera — free diagnosis before we start, original parts.',
      },
    },
    {
      slug: 'unlock',
      icon: 'unlock',
      position: 2,
      priceFrom: 3000,
      name: { ar: 'ديبلوكاج', fr: 'Déblocage', en: 'Unlocking' },
      description: {
        ar: 'فك قفل الشبكة للهواتف المستوردة، وفك قفل الحساب — بشكل قانوني تماماً ومن دون المساس بالضمان.',
        fr: 'Déblocage réseau pour les téléphones importés et déverrouillage de compte — légal, sans toucher à la garantie.',
        en: 'Network unlocking for imported handsets plus account unlocking — legitimate, and your warranty stays intact.',
      },
    },
    {
      slug: 'software',
      icon: 'download',
      position: 3,
      priceFrom: 1500,
      name: { ar: 'الانظمة', fr: 'Logiciel', en: 'Software' },
      description: {
        ar: 'إعادة برمجة النظام، تحديثات النظام، معالجة مشكلة التعليق عند الإقلاع، ونقل بياناتك إلى هاتفك الجديد دون فقدانها.',
        fr: 'Flash, mise à jour système, sortie de boucle de démarrage et transfert de données d’un téléphone à l’autre.',
        en: 'Flashing, OS updates, boot-loop recovery and moving your data across to a new phone intact.',
      },
    },
    {
      slug: 'after-sales',
      icon: 'shield',
      position: 4,
      priceFrom: 0,
      name: { ar: 'خدمة ما بعد البيع', fr: 'Service après-vente', en: 'After-sales service' },
      description: {
        ar: 'ضمان مكتوب على كل جهاز تقتنيه من متجرنا. وإذا واجهت أي مشكلة، يكفي أن تعود إلينا وسنتكفّل بها.',
        fr: 'Garantie écrite sur chaque appareil acheté chez nous. Un souci ? Vous revenez au magasin et on s’en occupe.',
        en: 'A written warranty with every device you buy from us. Something wrong? Come back to the shop and we handle it.',
      },
    },
  ],
);

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}
