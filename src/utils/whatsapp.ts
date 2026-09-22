/**
 * WhatsApp Helper Utilities for Phone Sanitation & Dynamic Template Parsing
 */

export interface ServiceTicketLike {
	id?: number
	ticket_number?: string
	model_name?: string
	status?: string
	customer?: {
		name?: string
		phone?: string
	}
	phoneBrand?: {
		name?: string
	}
	phone_brand?: {
		name?: string
	}
	worker?: {
		name?: string
	}
}

/**
 * Sanitize Indonesian / International phone number for WhatsApp direct link
 * Converts '081234567890' -> '6281234567890'
 * Converts '+62 812-3456-7890' -> '6281234567890'
 * Converts '81234567890' -> '6281234567890'
 */
export function sanitizeWhatsAppNumber(phone: string | number | null | undefined): string {
	if (!phone) return ""

	let cleaned = String(phone).replace(/[^0-9]/g, "")

	if (cleaned.startsWith("0")) {
		cleaned = "62" + cleaned.slice(1)
	} else if (cleaned.startsWith("62")) {
		// already 62
	} else if (cleaned.startsWith("8")) {
		cleaned = "62" + cleaned
	}

	return cleaned
}

/**
 * Replace placeholders in WhatsApp Template dynamically
 * Supported tokens:
 * - {nama_customer}
 * - {brand_hp}
 * - {model_hp}
 * - {id_ticket}
 * - {status}
 */
export function parseWhatsAppTemplate(template: string, ticket: ServiceTicketLike): string {
	if (!template) return ""

	const customerName = ticket.customer?.name || "Pelanggan"
	const brandName = ticket.phoneBrand?.name || ticket.phone_brand?.name || ""
	const modelName = ticket.model_name || ""
	const ticketNumber = ticket.ticket_number || `#${ticket.id || ""}`
	const status = ticket.status || ""

	return template
		.replace(/\{nama_customer\}/gi, customerName)
		.replace(/\{brand_hp\}/gi, brandName)
		.replace(/\{model_hp\}/gi, modelName)
		.replace(/\{id_ticket\}/gi, ticketNumber)
		.replace(/\{status\}/gi, status)
}

/**
 * Generate full WhatsApp web / app URL
 */
export function generateWhatsAppUrl(phone: string, text: string): string {
	const sanitized = sanitizeWhatsAppNumber(phone)
	if (!sanitized) return ""
	return `https://wa.me/${sanitized}?text=${encodeURIComponent(text)}`
}
