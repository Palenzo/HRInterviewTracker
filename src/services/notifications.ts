import emailjs from '@emailjs/browser'

export async function sendEmail(to: string, subject: string, text: string) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  if (!serviceId || !templateId || !publicKey) {
    console.warn('EmailJS env vars missing; logging instead.', { to, subject, text })
    return { ok: false, missingConfig: true }
  }
  try {
    await emailjs.send(serviceId, templateId, { to, subject, message: text }, publicKey)
    return { ok: true }
  } catch (e) {
    console.error('Email send failed', e)
    return { ok: false, error: (e as any)?.message }
  }
}

export function sendWhatsApp(phoneE164: string, text: string) {
  const url = `https://api.whatsapp.com/send?phone=${encodeURIComponent(phoneE164)}&text=${encodeURIComponent(text)}`
  window.open(url, '_blank', 'noopener,noreferrer')
  return { ok: true, userActionRequired: true }
}
