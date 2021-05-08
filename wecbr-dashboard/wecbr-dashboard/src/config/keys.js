const mongoUri = ''; //MongoDB URI either atlas or localhost;
const gmailId = ''; //Google mail (GMAIL) from which you want to send forgot password mail;
const gmailPassword = ''; //Password of that email (Real password). Allow less secure apps in gmail account;
const GoogleClientSecret = ''; //For google oAuth;
const GoogleClientID = ''; //Secret for googleOAuth ;
//https://www.balbooa.com/gridbox-documentation/how-to-get-google-client-id-and-client-secret
//Refer link to get those ids.
//Please put localhost:3000 and local:3000/auth/google/redirect
const SecretKey = 'erhouvhwr894u0923-9328@@433 vrhorep9043uobf2940u-'; //Any random key for hashing password

module.exports = {
  mongoUri,
  gmailId,
  gmailPassword,
  GoogleClientID,
  GoogleClientSecret,
  SecretKey,
};
