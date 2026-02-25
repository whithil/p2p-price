
'use server';

import * as cheerio from 'cheerio';

export type ScrapedProduct = {
  name: string;
  ean: string | null;
  price: number;
};

export async function scrapeNfce(url: string) {
  try {
    const response = await fetch(url, {
      next: { revalidate: 0 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`SEFAZ Portal error: ${response.statusText}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const products: ScrapedProduct[] = [];

    // Common pattern for states like PR, RS, MT
    $('tr[id^="rowIten"]').each((_, el) => {
      const name = $(el).find('.txtTit').text().trim();
      const codeText = $(el).find('.RCod').text() || '';
      // Look for 8-14 digit sequences (GTIN/EAN)
      const eanMatch = codeText.match(/\d{8,14}/);
      const ean = eanMatch ? eanMatch[0] : null;
      
      const priceText = $(el).find('.valor').text().trim().replace('.', '').replace(',', '.');
      const price = parseFloat(priceText);

      if (name && !isNaN(price)) {
        products.push({ name, ean, price });
      }
    });

    // Fallback for states like SP (different table structure)
    if (products.length === 0) {
      $('.listagem-itens tr, .table tr, #tabResult tr').each((_, el) => {
        const name = $(el).find('.txtTit, td:nth-child(1)').first().text().trim();
        const codeText = $(el).find('.RCod, td:nth-child(2)').first().text().trim();
        const eanMatch = codeText.match(/\d{8,14}/);
        const ean = eanMatch ? eanMatch[0] : null;
        
        const priceText = $(el).find('.valor, .txtVal, td:last-child').first().text().trim().replace('.', '').replace(',', '.');
        const price = parseFloat(priceText);
        
        if (name && !isNaN(price)) {
          products.push({ name, ean, price });
        }
      });
    }

    return { success: true, products };
  } catch (error: any) {
    console.error('NFC-e Scrape Error:', error);
    return { success: false, error: error.message || 'Unknown error occurred while scraping.' };
  }
}
