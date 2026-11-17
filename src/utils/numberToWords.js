// Indian Currency Number to Words converter
// Example: 145280 -> "Rupees One Lakh Forty-Five Thousand Two Hundred Eighty Only"

export function numberToIndianWords(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rupees Zero Only';
  
  const num = Math.round(Number(amount));
  if (num === 0) return 'Rupees Zero Only';
  if (num < 0) return 'Minus ' + numberToIndianWords(Math.abs(num));

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
