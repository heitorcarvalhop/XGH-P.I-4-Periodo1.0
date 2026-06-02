const COMMON_DOMAIN_TYPOS = {
  'gmal.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmail.con': 'gmail.com',
  'hotmal.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outlook.con': 'outlook.com'
};

export const getEmailValidationError = (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
    return 'Email inválido';
  }

  const domain = normalizedEmail.split('@')[1];
  const suggestion = COMMON_DOMAIN_TYPOS[domain];
  if (suggestion) {
    return `Domínio de email incorreto. Você quis dizer ${suggestion}?`;
  }

  return '';
};
