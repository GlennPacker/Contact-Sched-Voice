import fs from 'fs';
import path from 'path';

describe('Address source smoke tests', () => {
  const filePath = path.resolve(__dirname, 'Address.jsx');
  let src;

  beforeAll(() => {
    src = fs.readFileSync(filePath, 'utf8');
  });

  it('exports default Address component', () => {
    expect(src.includes('export default function Address')).toBe(true);
  });

  it('uses useWatch from react-hook-form', () => {
    expect(src.includes('useWatch(')).toBe(true);
  });

  it('registers address field with react-hook-form', () => {
    expect(src.includes('register(`addresses.${idx}.address`')).toBe(true);
  });

  it('has Open in Google Maps button text', () => {
    expect(src.includes('Open in Google Maps')).toBe(true);
  });

});
