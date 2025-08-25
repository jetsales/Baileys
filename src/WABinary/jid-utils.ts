export const S_WHATSAPP_NET = '@s.whatsapp.net'
export const OFFICIAL_BIZ_JID = '16505361212@c.us'
export const SERVER_JID = 'server@c.us'
export const PSA_WID = '0@c.us'
export const STORIES_JID = 'status@broadcast'
export const META_AI_JID = '13135550002@c.us'

export type JidServer = 'c.us' | 'g.us' | 'broadcast' | 's.whatsapp.net' | 'call' | 'lid' | 'newsletter' | 'bot'

export type JidWithDevice = {
	user: string
	device?: number
}

export type FullJid = JidWithDevice & {
	server: JidServer
	domainType?: number
}

// Função para validar se um número é internacional (DDI diferente de 55)
export const isInternationalNumber = (number: string): boolean => {
	const cleanNumber = number.replace(/\D/g, '')
	
	// Se o número começa com 1 e tem 11 dígitos, é dos EUA (não internacional para o contexto)
	if (cleanNumber.startsWith('1') && cleanNumber.length === 11) {
		return false
	}
	
	// Se o número tem 13 dígitos e começa com 551, é um número dos EUA com 55 na frente
	if (cleanNumber.length === 13 && cleanNumber.startsWith('551')) {
		return false
	}
	
	// Verifica se o número tem DDI diferente de 55 (Brasil)
	return cleanNumber.length > 0 && !cleanNumber.startsWith('55')
}

// Função para detectar números ocultos
export const isHiddenNumber = (number: string): boolean => {
	const cleanNumber = number.replace(/\D/g, '')
	// Números ocultos geralmente começam com 0 ou têm formato específico
	return cleanNumber.startsWith('0') || cleanNumber.length < 10
}

// Função para normalizar número de telefone
export const normalizePhoneNumber = (number: string): string => {
	let cleanNumber = number.replace(/\D/g, '')
	
	// Remove zeros à esquerda desnecessários
	while (cleanNumber.startsWith('0') && cleanNumber.length > 1) {
		cleanNumber = cleanNumber.substring(1)
	}
	
	// Se o número começa com 1 e tem 11 dígitos, é dos EUA - não adiciona 55
	if (cleanNumber.startsWith('1') && cleanNumber.length === 11) {
		return cleanNumber
	}
	
	// Se o número tem 13 dígitos e começa com 551, remove o 55 na frente
	if (cleanNumber.length === 13 && cleanNumber.startsWith('551')) {
		return cleanNumber.substring(2) // Remove o '55' na frente
	}
	
	// Se não tem DDI e tem 10-11 dígitos, assume Brasil (55)
	if ((cleanNumber.length === 10 || cleanNumber.length === 11) && !cleanNumber.startsWith('1')) {
		cleanNumber = '55' + cleanNumber
	}
	
	return cleanNumber
}

export const jidEncode = (user: string | number | null, server: JidServer, device?: number, agent?: number) => {
	// Normaliza o número antes de codificar
	const normalizedUser = typeof user === 'string' ? normalizePhoneNumber(user) : user?.toString() || ''
	return `${normalizedUser || ''}${!!agent ? `_${agent}` : ''}${!!device ? `:${device}` : ''}@${server}`
}

export const jidDecode = (jid: string | undefined): FullJid | undefined => {
	console.log('=== JID DECODE DEBUG ===');
	console.log('Input JID:', jid);
	console.log('Type of JID:', typeof jid);
	
	const sepIdx = typeof jid === 'string' ? jid.indexOf('@') : -1
	console.log('Separator index:', sepIdx);
	
	if (sepIdx < 0) {
		console.log('No @ found, returning undefined');
		return undefined
	}

	const server = jid!.slice(sepIdx + 1)
	const userCombined = jid!.slice(0, sepIdx)
	
	console.log('Server part:', server);
	console.log('User combined part:', userCombined);

	const [userAgent, device] = userCombined.split(':')
	const user = userAgent!.split('_')[0]!
	
	console.log('User agent:', userAgent);
	console.log('Device:', device);
	console.log('Final user:', user);
	
	const result = {
		server: server as JidServer,
		user,
		domainType: server === 'lid' ? 1 : 0,
		device: device ? +device : undefined
	}
	
	console.log('Decoded result:', result);
	console.log('========================');
	
	return result
}

/** is the jid a user */
export const areJidsSameUser = (jid1: string | undefined, jid2: string | undefined) =>
	jidDecode(jid1)?.user === jidDecode(jid2)?.user
/** is the jid Meta IA */
export const isJidMetaIa = (jid: string | undefined) => jid?.endsWith('@bot')
/** is the jid a user */
export const isJidUser = (jid: string | undefined) => jid?.endsWith('@s.whatsapp.net')
/** is the jid a group */
export const isLidUser = (jid: string | undefined) => jid?.endsWith('@lid')
/** is the jid a broadcast */
export const isJidBroadcast = (jid: string | undefined) => jid?.endsWith('@broadcast')
/** is the jid a group */
export const isJidGroup = (jid: string | undefined) => jid?.endsWith('@g.us')
/** is the jid the status broadcast */
export const isJidStatusBroadcast = (jid: string) => jid === 'status@broadcast'
/** is the jid a newsletter */
export const isJidNewsletter = (jid: string | undefined) => jid?.endsWith('@newsletter')

const botRegexp = /^1313555\d{4}$|^131655500\d{2}$/

export const isJidBot = (jid: string | undefined) => jid && botRegexp.test(jid.split('@')[0]!) && jid.endsWith('@c.us')

export const jidNormalizedUser = (jid: string | undefined) => {
	const result = jidDecode(jid)
	if (!result) {
		return ''
	}

	const { user, server } = result
	return jidEncode(user, server === 'c.us' ? 's.whatsapp.net' : (server as JidServer))
}

// Função para validar se um JID é de número internacional
export const isInternationalJid = (jid: string | undefined): boolean => {
	const decoded = jidDecode(jid)
	if (!decoded) return false
	return isInternationalNumber(decoded.user)
}

// Função para validar se um JID é de número oculto
export const isHiddenNumberJid = (jid: string | undefined): boolean => {
	const decoded = jidDecode(jid)
	if (!decoded) return false
	return isHiddenNumber(decoded.user)
}

// Função para criar JID válido para números internacionais e ocultos
export const createValidJid = (number: string, server: JidServer = 's.whatsapp.net'): string => {
	const normalizedNumber = normalizePhoneNumber(number)
	return jidEncode(normalizedNumber, server)
}

// Função para validar e corrigir JID para números especiais
export const validateAndFixJid = (jid: string): string => {
	// Se é número internacional ou oculto, garante que está no formato correto
	if (isInternationalJid(jid) || isHiddenNumberJid(jid)) {
		const decoded = jidDecode(jid)
		if (decoded) {
			const normalizedNumber = normalizePhoneNumber(decoded.user)
			return jidEncode(normalizedNumber, decoded.server, decoded.device)
		}
	}
	return jid
}
