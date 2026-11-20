// Indian Currency Number to Words converter (supports English and Marathi)
// Example (EN): 145280 -> "Rupees One Lakh Forty-Five Thousand Two Hundred Eighty Only"
// Example (MR): 145280 -> "रुपये एक लाख पंचेचाळीस हजार दोन शे ऐंशी फक्त"

export function numberToIndianWords(amount, lang = 'en') {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return lang === 'mr' ? 'रुपये शून्य फक्त' : 'Rupees Zero Only';
  }
  
  const num = Math.round(Number(amount));
  if (num === 0) return lang === 'mr' ? 'रुपये शून्य फक्त' : 'Rupees Zero Only';
  if (num < 0) return (lang === 'mr' ? 'उणे ' : 'Minus ') + numberToIndianWords(Math.abs(num), lang);

  if (lang === 'mr') {
    const mrNumbers = [
      '', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ', 'दहा',
      'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा', 'सोळा', 'सतरा', 'अठरा', 'एकोणीस', 'वीस',
      'एकवीस', 'बावीस', 'तेवीस', 'चोवीस', 'पंचवीस', 'सव्वीस', 'सत्तावीस', 'अठ्ठावीस', 'एकोणतीस', 'तीस',
      'एकतीस', 'बत्तीस', 'तेहेतीस', 'चौतीस', 'पस्तीस', 'छत्तीस', 'सदतीस', 'अडतीस', 'एकेचाळीस', 'चाळीस',
      'एक्केचाळीस', 'बेचाळीस', 'त्रेचाळीस', 'चव्वेचाळीस', 'पंचेचाळीस', 'शेहेचाळीस', 'सत्तेचाळीस', 'अठ्ठेचाळीस', 'एकोणपन्नास', 'पन्नास',
      'एक्कावन्न', 'बावन्न', 'त्रेपन्न', 'चौपन्न', 'पंचावन्न', 'छप्पन्न', 'सत्तावन्न', 'अठ्ठावन्न', 'एकोणसाठ', 'साठ',
      'एकसष्ट', 'बासष्ट', 'त्रेसष्ट', 'चौसष्ट', 'पासष्ट', 'सहासष्ट', 'सदुसष्ट', 'अडुसष्ट', 'एकोणसत्तर', 'सत्तर',
      'एकाहत्तर', 'बाहत्तर', 'त्र्याहत्तर', 'चौऱ्याहत्तर', 'पंच्याहत्तर', 'शहात्तर', 'सत्त्याहत्तर', 'अठ्ठ्याहत्तर', 'एकोणऐंशी', 'ऐंशी',
      'एक्याऐंशी', 'ब्याऐंशी', 'त्र्याऐंशी', 'चौऱ्याऐंशी', 'पंच्याऐंशी', 'शहाऐंशी', 'सत्त्याऐंशी', 'अठ्ठ्याऐंशी', 'एकोणनव्वद', 'नव्वद',
      'एक्याण्णव', 'ब्याण्णव', 'त्र्याण्णव', 'चौऱ्याण्णव', 'पंच्याण्णव', 'शहाण्णव', 'सत्त्याण्णव', 'अठ्ठ्याण्णव', 'नव्व्याण्णव'
    ];

    const convertTwoDigitsMr = (n) => {
      if (n <= 0) return '';
      if (n < 100 && mrNumbers[n]) return mrNumbers[n];
      return String(n);
    };

    const convertThreeDigitsMr = (n) => {
      let str = '';
      const hundred = Math.floor(n / 100);
      const rest = n % 100;
      if (hundred > 0) {
        str += (mrNumbers[hundred] || String(hundred)) + ' शे';
        if (rest > 0) str += ' ';
      }
      if (rest > 0) {
        str += convertTwoDigitsMr(rest);
      }
      return str;
    };

    let remainder = num;
    let words = '';

    const crores = Math.floor(remainder / 10000000);
    remainder %= 10000000;
    if (crores > 0) {
      words += convertTwoDigitsMr(crores) + ' कोटी ';
    }

    const lakhs = Math.floor(remainder / 100000);
    remainder %= 100000;
    if (lakhs > 0) {
      words += convertTwoDigitsMr(lakhs) + ' लाख ';
    }

    const thousands = Math.floor(remainder / 1000);
    remainder %= 1000;
    if (thousands > 0) {
      words += convertTwoDigitsMr(thousands) + ' हजार ';
    }

    if (remainder > 0) {
      words += convertThreeDigitsMr(remainder);
    }

    return 'रुपये ' + words.trim() + ' फक्त';
  }

  // English implementation
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertTwoDigits = (n) => {
    if (n < 20) return units[n];
    const unit = n % 10;
    return tens[Math.floor(n / 10)] + (unit > 0 ? ' ' + units[unit] : '');
  };

  const convertThreeDigits = (n) => {
    let str = '';
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    if (hundred > 0) {
      str += units[hundred] + ' Hundred';
      if (rest > 0) str += ' ';
    }
    if (rest > 0) {
      str += convertTwoDigits(rest);
    }
    return str;
  };

  let remainder = num;
  let words = '';

  // Crores (1,00,00,000)
  const crores = Math.floor(remainder / 10000000);
  remainder %= 10000000;
  if (crores > 0) {
    words += convertTwoDigits(crores) + ' Crore ';
  }

  // Lakhs (1,00,000)
  const lakhs = Math.floor(remainder / 100000);
  remainder %= 100000;
  if (lakhs > 0) {
    words += convertTwoDigits(lakhs) + ' Lakh ';
  }

  // Thousands (1,000)
  const thousands = Math.floor(remainder / 1000);
  remainder %= 1000;
  if (thousands > 0) {
    words += convertTwoDigits(thousands) + ' Thousand ';
  }

  // Hundreds & units
  if (remainder > 0) {
    words += convertThreeDigits(remainder);
  }

  return 'Rupees ' + words.trim() + ' Only';
}
