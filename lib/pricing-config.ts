export const PRICING_CONFIG = {
  starter: {
    price: 79000,
    priceFormatted: 'Rp 79.000',
    duration: 1,
    durationLabel: '1 bulan',
    rsvpLimit: 200,
    badge: 'STARTER',
    description: 'Undangan digital esensial untuk pasangan hemat',
    features: [
      'Subdomain nama pasangan',
      'Undangan personal per tamu',
      'Musik pengiring',
      'RSVP online hingga 200 tamu',
      'Galeri foto',
      'Countdown hari H',
      'Ucapan & doa dari tamu',
      'Aktif 1 bulan',
    ],
  },
  popular: {
    price: 149000,
    priceFormatted: 'Rp 149.000',
    duration: 3,
    durationLabel: '3 bulan',
    rsvpLimit: 500,
    badge: 'PALING DIPILIH',
    description: 'Fitur lengkap untuk pernikahan yang berkesan',
    features: [
      'Semua fitur Starter',
      'RSVP online hingga 500 tamu',
      'Amplop digital & rekening',
      'Wishlist hadiah',
      'Kisah cinta pasangan',
      'Video prewedding',
      'Aktif 3 bulan',
    ],
    highlightedFeature: 'Amplop digital & rekening',
  },
  eksklusif: {
    price: 249000,
    priceFormatted: 'Rp 249.000',
    duration: 6,
    durationLabel: '6 bulan',
    rsvpLimit: 1000,
    badge: 'EKSKLUSIF',
    description: 'Pengalaman premium tanpa batas untuk hari spesial',
    features: [
      'Semua fitur Popular',
      'RSVP online hingga 1.000 tamu',
      'Scan barcode kehadiran tamu',
      'Akses tema eksklusif',
      'Custom domain sendiri',
      'Priority support via WhatsApp',
      'Aktif 6 bulan penuh',
    ],
    highlightedFeature: 'Scan barcode kehadiran tamu',
  },
  colors: {
    background: '#F5F0EB',
    darkOlive: '#3D4A2E',
    darkCharcoal: '#1C1C1C',
    gold: '#C9A84C',
  },
} as const;

export type PricingPackage = 'starter' | 'popular' | 'eksklusif';
export type PricingConfig = typeof PRICING_CONFIG;

export function getPackagePrice(pkg: PricingPackage): number {
  return PRICING_CONFIG[pkg].price;
}

export function getPackagePriceFormatted(pkg: PricingPackage): string {
  return PRICING_CONFIG[pkg].priceFormatted;
}

export function getPackageRSVPLimit(pkg: PricingPackage): number {
  return PRICING_CONFIG[pkg].rsvpLimit;
}

export function getPackageDuration(pkg: PricingPackage): number {
  return PRICING_CONFIG[pkg].duration;
}
