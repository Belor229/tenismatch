// Configuration par pays pour l'authentification (client-side)
const COUNTRY_PHONE_CONFIG = {
  '+33': { name: 'France', code: 'FR', pattern: /^0[1-9]([-. ]?[0-9]{2}){3}([-. ]?[0-9]{2})$/, format: '0X XX XX XX XX' },
  '+41': { name: 'Suisse', code: 'CH', pattern: /^0[7-9]([-. ]?[0-9]{3}){2}([-. ]?[0-9]{2}){2}$/, format: '0XX XXX XX XX' },
  '+32': { name: 'Belgique', code: 'BE', pattern: /^0[1-9]([-. ]?[0-9]{3}){2}([-. ]?[0-9]{2}){2}$/, format: '0XXX XX XX XX' },
  '+31': { name: 'Pays-Bas', code: 'NL', pattern: /^0[6-8]([-. ]?[0-9]{3}){2}([-. ]?[0-9]{2}){2}$/, format: '0XXX XX XX XX' },
  '+49': { name: 'Allemagne', code: 'DE', pattern: /^0[1-9]([-. ]?[0-9]{3}){2}([-. ]?[0-9]{2}){2}$/, format: '0XXX XX XX XX' },
  '+44': { name: 'Royaume-Uni', code: 'GB', pattern: /^0[1-9]([-. ]?[0-9]{4}){2}([-. ]?[0-9]{6})$/, format: '0XXXX XXXXXX' },
  '+34': { name: 'Espagne', code: 'ES', pattern: /^([6-9][-. ]?[0-9]{3}){2}([-. ]?[0-9]{3})$/, format: 'XXX XXX XXX' },
  '+39': { name: 'Italie', code: 'IT', pattern: /^([3-9][-. ]?[0-9]{3}){2}([-. ]?[0-9]{4})$/, format: 'XXX XXX XXXX' },
  '+351': { name: 'Portugal', code: 'PT', pattern: /^([2-9][-. ]?[0-9]{3}){2}([-. ]?[0-9]{4})$/, format: 'XXX XXX XXXX' },
  '+212': { name: 'Maroc', code: 'MA', pattern: /^([5-9][-. ]?[0-9]{2}){2}([-. ]?[0-9]{2}){2}$/, format: 'XX XX XX XX' },
  '+216': { name: 'Tunisie', code: 'TN', pattern: /^([2-9][-. ]?[0-9]{2}){2}([-. ]?[0-9]{2}){2}$/, format: 'XX XX XX XX' },
  '+213': { name: 'Algérie', code: 'DZ', pattern: /^([5-9][-. ]?[0-9]{2}){2}([-. ]?[0-9]{2}){2}$/, format: 'XX XX XX XX' },
  '+20': { name: 'Égypte', code: 'EG', pattern: /^([1-9][-. ]?[0-9]{2}){2}([-. ]?[0-9]{2}){2}$/, format: 'XX XX XX XX' },
  '+1': { name: 'USA/Canada', code: 'US', pattern: /^([2-9][-. ]?[0-9]{3}){2}([-. ]?[0-9]{4})$/, format: 'XXX XXX XXXX' },
  '+61': { name: 'Australie', code: 'AU', pattern: /^([2-9][-. ]?[0-9]{2}){2}([-. ]?[0-9]{2}){2}$/, format: 'XX XX XX XX' },
  '+81': { name: 'Japon', code: 'JP', pattern: /^([0-9][-. ]?[0-9]{2}){2}([-. ]?[0-9]{4})$/, format: 'XX XXX XXXX' },
  '+86': { name: 'Chine', code: 'CN', pattern: /^1[3-9]([-. ]?[0-9]{2}){2}([-. ]?[0-9]{4})$/, format: '1XX XXXX XXXX' },
  '+91': { name: 'Inde', code: 'IN', pattern: /^([6-9][-. ]?[0-9]{2}){2}([-. ]?[0-9]{2}){2}$/, format: 'XX XX XX XX' },
  '+55': { name: 'Brésil', code: 'BR', pattern: /^([1-9][-. ]?[0-9]{2}){2}([-. ]?[0-9]{4])$/, format: 'XX XXXX XXXX' },
  '+7': { name: 'Russie', code: 'RU', pattern: /^([3-9][-. ]?[0-9]{3}){2}([-. ]?[0-9]{2}){2}$/, format: 'XXX XX XX XX' }
} as const;

// Extraire le code pays et le numéro de téléphone
export function parsePhoneNumber(phone: string): { countryCode: string; phoneNumber: string; country?: any } {
  // Nettoyer le numéro
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Trouver le code pays correspondant
  for (const [code, config] of Object.entries(COUNTRY_PHONE_CONFIG)) {
    if (cleanPhone.startsWith(code.replace('+', ''))) {
      const phoneNumber = cleanPhone.substring(code.length - 1);
      return {
        countryCode: code,
        phoneNumber,
        country: config
      };
    }
  }
  
  // Par défaut, France
  const phoneNumber = cleanPhone.startsWith('0') ? cleanPhone : '0' + cleanPhone;
  return {
    countryCode: '+33',
    phoneNumber,
    country: COUNTRY_PHONE_CONFIG['+33']
  };
}

// Valider le format du numéro selon le pays
export function validatePhoneNumber(phone: string, countryCode: string): { isValid: boolean; error?: string } {
  const { phoneNumber, country } = parsePhoneNumber(phone);
  
  if (!country) {
    return { isValid: false, error: 'Pays non supporté' };
  }
  
  if (!country.pattern.test(phoneNumber)) {
    return { 
      isValid: false, 
      error: `Format invalide pour ${country.name}. Format attendu: ${country.format}` 
    };
  }
  
  return { isValid: true };
}

// Formater le numéro pour l'affichage
export function formatPhoneNumber(phone: string): string {
  const { countryCode, phoneNumber, country } = parsePhoneNumber(phone);
  return `${countryCode} ${phoneNumber}`;
}

// Obtenir la liste des pays supportés
export function getSupportedCountries(): Array<{ code: string; name: string; flag: string; format: string }> {
  return Object.entries(COUNTRY_PHONE_CONFIG).map(([code, config]) => ({
    code,
    name: config.name,
    flag: getCountryFlag(config.code),
    format: config.format
  }));
}

// Obtenir le drapeau emoji pour un pays
function getCountryFlag(countryCode: string): string {
  const flags: Record<string, string> = {
    'FR': '🇫🇷',
    'CH': '🇨🇭',
    'BE': '🇧🇪',
    'NL': '🇳🇱',
    'DE': '🇩🇪',
    'GB': '🇬🇧',
    'ES': '🇪🇸',
    'IT': '🇮🇹',
    'PT': '🇵🇹',
    'MA': '🇲🇦',
    'TN': '🇹🇳',
    'DZ': '🇩🇿',
    'EG': '🇪🇬',
    'US': '🇺🇸',
    'AU': '🇦🇺',
    'JP': '🇯🇵',
    'CN': '🇨🇳',
    'IN': '🇮🇳',
    'BR': '🇧🇷',
    'RU': '🇷🇺'
  };
  return flags[countryCode] || '🌍';
}
