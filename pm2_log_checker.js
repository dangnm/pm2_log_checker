console.log("PM2 LOG CHECKER");

var cron = require('node-cron');
var exec = require('child_process').exec;
const child_process = require('child_process');
var store = require('store');
var app_name = 'PM2_PROCESS_TEST'; // Update your app name here
var email_host = 'smtp.gmail.com'; //Update your email host here
var email_port = '465'; //Update your email port here
var email_username = ''; //Update your email username here
var email_password = ''; //Update your email password here
var email_receiver = 'test@gmail.com'; //Update your email receiver here
var old_log_result = 'pm2_log_result_old_'+app_name;
var log_result = 'pm2_log_result_'+app_name;
const mailer = require('nodemailer');

var smtpTransport = mailer.createTransport({
  host: email_host,
  port: email_port,
  secure: true, // true for 465, false for other ports
  auth: {
    user: email_username, // generated ethereal user
    pass: email_password  // generated ethereal password
  }
});

var mail = {
  from: email_username,
  to: email_receiver,
  subject: "Your bot "+app_name+" has been restarted",
  text: "Please check again.",
  html: "<b>Please check again.</b>"
}


store.set(old_log_result, "");
store.set(log_result, "");

cron.schedule('0 */2 * * * *', function(){
  const process = child_process.spawn('pm2', ['logs', '--nostream', '--lines', '10', app_name]);
  process.on('exit', () => {
    if (store.get(log_result) === store.get(old_log_result)) {
      child_process.spawn('pm2', ['restart', app_name]);
      console.log("Restart");
      if (email_username != null && email_username != '') {
        smtpTransport.sendMail(mail, function(error, response){
          if(error){
            console.log(error);
          }else{
            console.log("Message sent: " + response.message);
          }
          smtpTransport.close();
        });
      };
    };
    store.set(old_log_result, store.get(log_result));
    store.set(log_result, "");
    console.log(store.get(old_log_result));
    console.log('process exit');
  });
  process.stdout.on('data', (data) => {
    store.set(log_result, store.get(log_result) + data.toString('utf8'))
  });
  console.log('=====');
});
