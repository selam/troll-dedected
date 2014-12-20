var data = require('sdk/self').data
  , pageMod = require('sdk/page-mod')

pageMod.PageMod({
  include: 'http://www.eksiduyuru.com/*',
  contentScriptFile : [
                        data.url('jquery-2.1.1.js'),
                        data.url('troll-blocker.js'),
                        data.url('FileSaver.js'),
                        data.url('jszip.js'),
                        data.url('handlebars-v2.0.0.js'),
                        data.url('export-messages.js'),      
                        data.url('app.js')                       
                      ],
  contentStyleFile  : [
                       data.url('css/troll-blocker.css')
                      ],
  contentScriptWhen : 'ready'
})