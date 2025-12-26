import fs from 'fs'
import path from 'path'

describe('Address source smoke tests', () => {
  const filePath = path.resolve(__dirname, 'Address.jsx')
  let src

  beforeAll(() => {
    src = fs.readFileSync(filePath, 'utf8')
  })

  it('exports default Address component', () => {
    expect(src).toMatch(/export default function Address/) 
  })

  it('uses useWatch from react-hook-form', () => {
    expect(src).toMatch(/useWatch\(/)
  })

  it('registers address field with react-hook-form', () => {
    expect(src).toMatch(/register\(`addresses\.\${idx}\.address`/)
  })

  it('has Open in Google Maps button text', () => {
    expect(src).toMatch(/Open in Google Maps/)
  })

  it('imports Visits component', () => {
    expect(src).toMatch(/import Visits from '\.\.\/Visit\/Visits\.jsx'/)
  })
})
