// import axios from 'axios';
// import querystring from 'querystring';

// // Polyfill for btoa() in non-browser environments
// const btoaPolyfill = (string) => {
//   // Base64 encoding function for non-browser environments
//   const base64Chars =
//     'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
//   let result = '';
//   let i = 0;
//   do {
//     const a = string.charCodeAt(i++);
//     const b = string.charCodeAt(i++);
//     const c = string.charCodeAt(i++);
//     result +=
//       base64Chars[(a >> 2) & 63] +
//       base64Chars[((a << 4) | (b >> 4)) & 63] +
//       base64Chars[((b << 2) | (c >> 6)) & 63] +
//       base64Chars[c & 63];
//   } while (i < string.length);
//   return result;
// };

// export const sendSMS = async (text, toNumber, scheduleTime) => {
//   console.log("Start.....");

//   const accountSid = 'ACfc212b31ca2da9ae60a78d0efe1f41e1';
//   const authToken = 'a1610282b266b9413fe61c0afc23f83c';
//   const twilioPhoneNumber = '+17623549244'; // This is the Twilio phone number you have purchased
//   const message = text;

//   try {
//     const credentials = `${accountSid}:${authToken}`;
//     const authHeader = `Basic ${btoaPolyfill(credentials)}`;

//     const requestBody = querystring.stringify({
//       To: toNumber,
//       From: twilioPhoneNumber,
//       Body: message,
//     });

//     const config = {
//       headers: {
//         Authorization: authHeader,
//         'Content-Type': 'application/x-www-form-urlencoded', // Required for Twilio API
//       },
//     };

//     if (scheduleTime) {
//       config.headers['X-Twilio-SendAt'] = scheduleTime.toISOString();
//     }

//     const response = await axios.post(
//       `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
//       requestBody,
//       config
//     );

//     console.log('SMS sent successfully!', response.data);
//   } catch (error) {
//     console.error('Failed to send SMS:', error);
//   }
// };

// // Function to parse date and time strings in the format "30-07-2023" and "19:00"
// export const parseDateTime = (dateStr, timeStr) => {
//   const [day, month, year] = dateStr.split('-').map(Number);
//   const [hours, minutes] = timeStr.split(':').map(Number);

//   return new Date(Date.UTC(year, month - 1, day, hours, minutes));
// };

