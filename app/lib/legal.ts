// OKO legal sender info (from official Extrait RCS provided by user)
export const OKO_SENDER = {
  legalName: 'OKO',
  legalForm: 'Société par actions simplifiée',
  siren: '881 648 323',
  rcs: 'R.C.S. Paris 881 648 323',
  capital: '1 000 €',
  tvaIntra: 'FR03 881 648 323',
  address: '31 boulevard de Magenta',
  postalCode: '75010',
  city: 'Paris',
  country: 'France',
  email: 'contact@joinoko.com',
  website: 'joinoko.com',
  activity: 'Traitement de données, hébergement et activités connexes',
}

// Conditions Générales (B2B, frozen M1)
// Covers French DGCCRF requirements for professional-to-professional devis
export const CONDITIONS_GENERALES: { title: string; body: string }[] = [
  {
    title: 'Validité',
    body: "Le présent devis est valable 30 jours à compter de sa date d'émission. Passé ce délai, les tarifs peuvent être révisés.",
  },
  {
    title: 'Objet',
    body: 'Prestations de services numériques à destination des établissements de restauration.',
  },
  {
    title: 'Prix',
    body: "Tous les prix sont indiqués en euros hors taxes (HT). La TVA au taux en vigueur (20 %) est appliquée en sus le cas échéant.",
  },
  {
    title: 'Modalités de paiement',
    body: "Forfait annuel payable en une seule fois (remise appliquée) ou en 12 mensualités (sans bénéfice de la remise). Services à la carte et matériel payables à la commande ou à réception de facture.",
  },
  {
    title: 'Acompte',
    body: '30 % du montant total à la signature du devis, solde à la mise en service. Aucun escompte en cas de paiement anticipé.',
  },
  {
    title: "Délais d'exécution",
    body: "Mise en service sous 7 jours ouvrés suivant la réception du bon pour accord et de l'acompte.",
  },
  {
    title: 'Pénalités de retard',
    body: "En cas de retard de paiement : taux d'intérêt légal majoré de 10 points de pourcentage, plus indemnité forfaitaire de recouvrement de 40 € (art. L441-10 du Code de commerce).",
  },
  {
    title: 'Réserve de propriété',
    body: "Les services et matériels fournis restent la propriété d'OKO jusqu'au paiement intégral du prix convenu.",
  },
  {
    title: 'Résiliation',
    body: "Préavis d'un mois par écrit. Les sommes non consommées peuvent être converties en crédit sur d'autres services OKO.",
  },
  {
    title: 'Données personnelles',
    body: 'Les données clients sont traitées conformément au RGPD. Contact : contact@joinoko.com.',
  },
  {
    title: 'Droit applicable & juridiction',
    body: "Le présent devis est soumis au droit français. En cas de litige, le Tribunal de commerce de Paris est seul compétent. Devis établi en langue française.",
  },
  {
    title: 'Acceptation',
    body: "Devis à retourner daté, signé et précédé de la mention manuscrite « Bon pour accord » à l'adresse contact@joinoko.com.",
  },
]

// Services always included free with any OKO subscription
export const SERVICES_OFFERTS = [
  'Optimisation SEO du site web',
  'Boutons réservation & emballage sur Google Maps',
  'Blocage des avis négatifs Google',
  "Outil de collecte d'emails clients",
  "Service d'envoi d'e-mails groupés",
  'Réduction commission Uber à 10 %',
  'Intégration multi-plateformes (Instagram · Facebook · TikTok)',
  'Support client en ligne 7j/7',
]
