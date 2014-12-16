var data = require('sdk/self').data
  , pageMod = require('sdk/page-mod')

pageMod.PageMod({
  include: 'http://www.eksiduyuru.com/*',
  contentScriptFile : [data.url('jquery-2.1.1.js'),                       
                       data.url('troll-blocker.js')
                      ],
  contentStyleFile  : [
                       data.url('troll-blocker.css')
                      ],
  contentScriptWhen : 'end'
})