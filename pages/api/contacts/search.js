import { listContacts } from '../../../lib/contactService'

export default async function handler(req, res) {
  try {
    const { name = '', address = '' } = req.query
    const nameTerm = String(name || '').trim().toLowerCase()
    const addressTerm = String(address || '').trim().toLowerCase()

    const data = await listContacts({ limit: 1000 })
    const list = Array.isArray(data) ? data : []

    if (!nameTerm && !addressTerm) {
      return res.status(200).json(list)
    }

    const scored = list.map((c) => {
      const nameVal = (c.name || '').toLowerCase()
      const matchName = nameTerm ? nameVal.indexOf(nameTerm) !== -1 : false

      const addresses = Array.isArray(c.addresses) ? c.addresses : []
      const matchAddress = addressTerm
        ? addresses.some((a) => (a && a.address ? ('' + a.address).toLowerCase().indexOf(addressTerm) !== -1 : false))
        : false

      const score = (matchName ? 1 : 0) + (matchAddress ? 1 : 0)
      return { contact: c, score }
    })

    const results = scored
      .filter((s) => s.score)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return (a.contact.name || '').localeCompare(b.contact.name || '')
      })
      .map((s) => s.contact)

    return res.status(200).json(results)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}
