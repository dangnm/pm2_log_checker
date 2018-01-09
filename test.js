console.log("Test");

var cron = require('node-cron');

cron.schedule('*/5 * * * * *', function(){
  var d = new Date();
  console.log('running a task every 5 seconds at '+d.getTime());
});
