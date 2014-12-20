
function ExportMessages(){}

ExportMessages.prototype = {    
    /**
     * Html template'leri, mesajlar bu template'lere göre render edilerek zip 
     * içerisine saklanacak ve kullanıcıya download ettirilecek
     */
    html: {
        'message': [
            '{{#messages}}',
                '<li class="{{cssClass}} clearfix">',
                    '<div class="chat-body clearfix">',
                        '<div class="header">',
                            '<strong class="primary-font pull-{{cssClass}}">{{user}}</strong>',
                            '<small class="pull-{{pullClass}} text-muted">',
                                '<span class="glyphicon glyphicon-time"></span>{{date}}',
                            '</small>',
                            '<div class="clearfix"></div>',
                        '</div>',
                        '<p>{{{message}}}</p>',
                    '</div>',
                '</li>',
            '{{/messages}}'
        ].join("\n"),
      'html': [
            '<!html>',
            '<head>',
                '<link href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css" rel="stylesheet">',
                '<script src="http://code.jquery.com/jquery-2.1.3.min.js"></script>',
                '<script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>',
                '<style type="text/css">',
                    '.chat{list-style: none;margin: 0;padding: 0;}',
                    '.chat li{margin-bottom: 10px;padding-bottom: 5px;border-bottom: 1px dotted #B3A9A9;}',
                    '.chat li .chat-body p {margin: 0;color: #777777;}', 
                    '.panel .slidedown .glyphicon, .chat .glyphicon {margin-right: 5px;}',                
                    '::-webkit-scrollbar-track {-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);background-color: #F5F5F5;}',
                    '::-webkit-scrollbar {width: 12px;background-color: #F5F5F5;}',
                    '::-webkit-scrollbar-thumb{-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);background-color: #555;}',                
                '</style>',
            '</head>',
            '<body>',
                '<div class="container">',
                    '<div class="row">',
                        '<div class="col-xl-12">',
                            '<div class="panel panel-primary">',
                                '<div class="panel-body">',
                                    '<ul class="chat">{{{messages}}}</ul>',
                                '</div>',
                            '</div>',                            
                        '</div>',
                    '</div>',
                '</div>',                
            '</body>',
      ].join("\n")
    },
    
    /**
     * derlenmiş html templateler
     */
    templates: {},
    jszip: new JSZip(),
    run: function() {
        if(this.endsWith(window.location.href, "/mesajlar/")){
            Handlebars.registerHelper('compare', this.compare);
            this.addExportLink();
            this.templates['message'] = Handlebars.compile(this.html['message']);
            this.templates['html'] = Handlebars.compile(this.html['html']);
        }        
    },
    compare: function(lvalue, rvalue, options) {               
        if (arguments.length < 3)
             throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
         
        operator = options.hash.operator || "==";
         
        var operators = {
            '==':       function(l,r) { return l == r; },
            '===':      function(l,r) { return l === r; },
            '!=':       function(l,r) { return l != r; },
            '<':        function(l,r) { return l < r; },
            '>':        function(l,r) { return l > r; },
            '<=':       function(l,r) { return l <= r; },
            '>=':       function(l,r) { return l >= r; },
            'typeof':   function(l,r) { return typeof l == r; }
        }
        
        if (!operators[operator])
            throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);
        
        var result = operators[operator](lvalue,rvalue);
        
        if( result ) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
        
    },
    endsWith: function(str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    },
    
    export: function() {
        // seçili olan mesaj threadlerinin link'ini al.
        self = this;
        messages = $(".messagecb:checked");
        deferreds = [];
        for(var i = 0, length = messages.length; i<length; i++)
        {
            item = $(messages[i]);
            deferreds.push($.ajax({
                    url: $(item).parents("tr").find("a").attr("href"),
                    success: function(data, textStatus, xhr){
                        self.render(data, xhr, this.url.split("/").pop());
                    }
                })                
            );
        }
        $.when.apply(null, deferreds).done(self.done.bind(this));
        
    },
    done: function(){
        content = this.jszip.generate({type: "blob"});
        saveAs(content, "mesajlar-"+new Date().toLocaleString().replace(/[^\d]+/ig, '-')+".zip");        
    },
    addExportLink: function() {
        $("#inboxform tr:last-child td:last-child").append($("<span id='export-link' class='finger underline' style='position: relative; bottom:3px; left:10px;'>Dışarı aktar</span>").click(this.export.bind(this)));
    },
    render: function(data, xhr, filename){        
        messages = $(data).find(".message");
        _tmpList = [];
        for(var i = 0, length = messages.length; i<length; i++)
        {
            try {
                item = $(messages[i]);
                _date = $(item).find("[class^=sender-]")
                message = $(item).find("[class^=body-]").html().trim()
                if(_date.length == 0){
                    lastMessage = _tmpList.pop()
                    _tmpList.push(lastMessage);
                    _tmpList.push({
                        user:  lastMessage['user'],
                        date: lastMessage['date'],
                        message: message,
                        cssClass: lastMessage['cssClass'],
                        pullClass: lastMessage['pullClass']
                    });
                    
                    continue;
                }
                _date = _date.contents().get(2).nodeValue.trim();
                _tmpList.push({
                        user: $(item).find("[class^=sender-]").contents().get(0).nodeValue.trim(),
                        date: _date.substring(0, _date.length - 1),
                        message: message,
                        cssClass: $(item).find("[class^=body-]").hasClass('body-self') ? 'left' : 'right',
                        pullClass: $(item).find("[class^=body-]").hasClass('body-self') ? 'right' : 'left'
                });
            }catch(err) {
                
            }
        }
        html = this.templates['message']({messages: _tmpList});
        fileContent = this.templates['html']({messages: html});
        this.jszip.file(filename +'.html', fileContent);
    }
}
