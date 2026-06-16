// Jugadores creados por un agente entran con "usuario" en vez de email.
// Internamente se mapean a un email real (Supabase Auth requiere email).
export const PLAYER_EMAIL_DOMAIN = 'jugadores.betnovaar.online'

// Normaliza un usuario: minúsculas, sin acentos ni espacios (solo a-z 0-9 _ .).
export const slugUsername = (u) =>
  (u || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9_.]+/g, '_')
    .replace(/^_+|_+$/g, '')

export const usernameToEmail = (username) => `${slugUsername(username)}@${PLAYER_EMAIL_DOMAIN}`

// Si el texto de login no tiene "@", es un usuario → lo convertimos a su email interno.
export const loginToEmail = (input) =>
  (input || '').includes('@') ? (input || '').trim() : usernameToEmail(input)
