import bcrypt from "bcryptjs";
import { supabase } from "./supabase";
import { createSession } from "./auth";

export async function signupWithPhone(formData: any) {
  const { phone, password, displayName, country, city, level, age } = formData;

  if (!phone || !password || !displayName) {
    return { success: false, error: "Tous les champs obligatoires doivent être remplis." };
  }

  try {
    // Valider et parser le numéro
    const { countryCode, phoneNumber, country: countryConfig } = parsePhoneNumber(phone);
    const validation = validatePhoneNumber(phone, countryCode);
    
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('full_phone', `${countryCode}${phoneNumber}`);

    if (checkError) throw checkError;
    if (existingUsers && existingUsers.length > 0) {
      return { success: false, error: "Ce numéro de téléphone est déjà utilisé." };
    }

    // Insérer l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{
        full_phone: `${countryCode}${phoneNumber}`,
        country_code: countryCode,
        phone_number: phoneNumber,
        password_hash: hashedPassword,
        is_verified: false
      }])
      .select()
      .single();

    if (userError) throw userError;

    // Insérer le profil
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        user_id: userData.id,
        display_name: displayName,
        country: countryConfig?.name || 'France',
        city,
        level,
        age: age ? parseInt(age) : undefined
      }]);

    if (profileError) {
      await supabase.from('users').delete().eq('id', userData.id);
      throw profileError;
    }

    return { success: true, userId: userData.id };
  } catch (error: any) {
    console.error("Phone signup error:", error);
    return { success: false, error: "Une erreur est survenue lors de l'inscription." };
  }
}

export async function loginWithPhone(formData: any) {
  const { phone, password } = formData;

  if (!phone || !password) {
    return { success: false, error: "Téléphone et mot de passe sont requis." };
  }

  try {
    // Parser et valider le numéro
    const { countryCode, phoneNumber } = parsePhoneNumber(phone);
    const validation = validatePhoneNumber(phone, countryCode);
    
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Rechercher l'utilisateur
    const { data: users, error } = await supabase
      .from('users')
      .select('*, user_profiles(display_name, avatar_url, country, city, level)')
      .eq('full_phone', `${countryCode}${phoneNumber}`)
      .limit(1);

    if (error) throw error;

    if (!users || users.length === 0) {
      return { success: false, error: "Identifiants invalides." };
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash || '');

    if (!isPasswordValid) {
      return { success: false, error: "Identifiants invalides." };
    }

    const profile = user.user_profiles as any;
    await createSession(user.id, profile);

    return { success: true, user: { id: user.id, ...profile } };
  } catch (error: any) {
    console.error("Phone login error:", error);
    return { success: false, error: "Une erreur est survenue lors de la connexion." };
  }
}

// Générer un code de vérification SMS
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Envoyer le code de vérification (simulation - en production, utiliser un service SMS)
export async function sendVerificationCode(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { countryCode, phoneNumber } = parsePhoneNumber(phone);
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Mettre à jour l'utilisateur avec le code de vérification
    const { error } = await supabase
      .from('users')
      .update({
        verification_code: verificationCode,
        verification_expires_at: expiresAt.toISOString()
      })
      .eq('full_phone', `${countryCode}${phoneNumber}`);

    if (error) throw error;

    // En production: envoyer le SMS via un service comme Twilio, Vonage, etc.
    console.log(`Code de vérification pour ${phone}: ${verificationCode}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Send verification code error:", error);
    return { success: false, error: "Impossible d'envoyer le code de vérification." };
  }
}

// Vérifier le code SMS
export async function verifyPhoneCode(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { countryCode, phoneNumber } = parsePhoneNumber(phone);

    // Récupérer l'utilisateur avec le code de vérification
    const { data: users, error } = await supabase
      .from('users')
      .select('verification_code, verification_expires_at')
      .eq('full_phone', `${countryCode}${phoneNumber}`)
      .limit(1);

    if (error) throw error;
    if (!users || users.length === 0) {
      return { success: false, error: "Numéro de téléphone non trouvé." };
    }

    const user = users[0];

    // Vérifier si le code est valide
    if (user.verification_code !== code) {
      return { success: false, error: "Code de vérification invalide." };
    }

    // Vérifier si le code n'a pas expiré
    if (new Date() > new Date(user.verification_expires_at || '')) {
      return { success: false, error: "Code de vérification expiré." };
    }

    // Marquer le téléphone comme vérifié
    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_verified: true,
        verification_code: null,
        verification_expires_at: null
      })
      .eq('full_phone', `${countryCode}${phoneNumber}`);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error: any) {
    console.error("Verify phone code error:", error);
    return { success: false, error: "Une erreur est survenue lors de la vérification." };
  }
}

// Réinitialiser le mot de passe
export async function resetPasswordWithPhone(phone: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { countryCode, phoneNumber } = parsePhoneNumber(phone);

    // Vérifier que l'utilisateur existe et est vérifié
    const { data: users, error } = await supabase
      .from('users')
      .select('id, is_verified')
      .eq('full_phone', `${countryCode}${phoneNumber}`)
      .limit(1);

    if (error) throw error;
    if (!users || users.length === 0) {
      return { success: false, error: "Numéro de téléphone non trouvé." };
    }

    const user = users[0];

    if (!user.is_verified) {
      return { success: false, error: "Veuillez d'abord vérifier votre numéro de téléphone." };
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error: any) {
    console.error("Reset password error:", error);
    return { success: false, error: "Une erreur est survenue lors de la réinitialisation du mot de passe." };
  }
}

// Fonctions utilitaires internes (non exportées)
function parsePhoneNumber(phone: string): { countryCode: string; phoneNumber: string; country?: any } {
  // Configuration par pays pour l'authentification
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
  };

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

function validatePhoneNumber(phone: string, countryCode: string): { isValid: boolean; error?: string } {
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
