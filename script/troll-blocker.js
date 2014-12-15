(function(){         
    /**
     * Yazar: timu 
     * Katkı sağlayanlar: null
     * 
     * Buraya kadar geldiysen bi el atarsın artık, 
     *
     * Bağışlar için BTC ve LTC adresleri aşağıda, sevindirin şu garibi.
     * LTC:
     * BTC: 
     */
    
    function TrollBox() {            
      this.initialize();
    }

    TrollBox.prototype = {
        db: null,
        table_name: "trollbox",
        _getannounce: window.getannounce,
        trollList : [],
        remove_troll_title: "troll listesinden çıkart",
        add_troll_title: "troll dedected (troll listesine ekle)",
        initialize: function() {
            this.db = openDatabase('eksiduyuru', '1.0', 'Ekşi duyuru troll listesi', 2 * 1024 * 1024);		
            this.executeSql();
            
            if($("ul.duspsm li").lenght > 0){
                $("ul.duspsm").css("width", "auto").append($("<li class='no-background'><a href='#' id='show-hide-trolls'>Trolleri Göster</a></li>"));	
            }
            this.checkTrolls();
            
            this.makeMonkeyPach();
            this.setEvents();	
        },
        checkTrolls: function() {
            if(window.location.href.indexOf('/mesajlar/mallar') != -1) {
                $(".maltable tr:last-child td:last-child").append($('<span>&nbsp;&nbsp;&nbsp;</span><span class="finger underline" id="import-to-trolls" style="position: relative; bottom:3px;">Seçilileri trollere gönder</span>'))
                //$(".maltable tr:last-child td:last-child").append($('<span>&nbsp;&nbsp;&nbsp;</span><span class="finger underline" id="remove-from-trolls" style="position: relative; bottom:3px;">Seçilileri trollerden çıkart</span>'))
            }
        },
        executeSql: function() {
            self = this;
            this.db.transaction(function (tx){  
                tx.executeSql('CREATE TABLE IF NOT EXISTS '+this.table_name+' (troll unique)', [], function(tx, results){
                    self.selectTrolls(tx);
                }.bind(this), this.errorHandler);	    
            }.bind(this));
        },
      
        makeMonkeyPach: function() {
            self = this;
            window.getannounce = function(item, directive, b, c) {
                this._getannounce(item, directive, b, c);
                this.hideTrolls();
            }.bind(this);
        },
        selectTrolls: function(tx) {
            tx.executeSql('SELECT * FROM '+this.table_name, [], this.setTrollList.bind(this), null);
        },
        insertToTrolls: function(tx, name) {	
            tx.executeSql("INSERT INTO "+self.table_name+" VALUES (?)", [name], this.setTrollList.bind(this), this.errorHandler);
        },
        removeFromTrolls: function(tx, name) {
            tx.executeSql("DELETE FROM "+self.table_name+" WHERE troll = ?", [name], function(tx, results){ this.selectTrolls(tx); }.bind(this), null);
        },
        setEvents: function() {
            var self = this;
            $(document).on('click', '.is-troll', function(event){
            event.preventDefault();
            $e = $(event.target);
            name = ($e.parents("ul").find("li:first-child a:first-child").contents().get(0) || $e.parents("ul").find("li:first-child").contents().get(0)).nodeValue;
            if(name) {
                if($(this).hasClass("add-to-trolls")){      	    
                    self.db.transaction(function(tx){		  
                        self.insertToTrolls(tx, name);
                        $e.removeClass("add-to-trolls");
                        $e.addClass("remove-from-trolls");
                        $e.attr("title", self.remove_troll_title);
                        self.trollList.push(name);
                        self.hideTrolls();		
                    }.bind(this));
                
                return;
                }	
                self.db.transaction(function(tx){
                    self.removeFromTrolls(tx, name)
                    $e.addClass("add-to-trolls");
                    $e.removeClass("remove-from-trolls");
                    $e.attr("title", self.add_troll_title);
                    self.hideTrolls();	
                    self.executeSql();	
                });
            }
            
            }).bind(this);
            
            $("#show-hide-trolls").click(this.showHideTrolls.bind(this));	
            $('#import-to-trolls').click(this.importToTrolls.bind(this));
        },
        importToTrolls: function(e) {
            e.preventDefault();
            var self = this;
            
            $(".messagecb:checked").each(function(idx, item){
                name = $(item).parent("span").contents().get(2).nodeValue.trim();
                $elem = $("<span class='pulse'>&nbsp;&nbsp;&nbsp;&nbsp; Trollere eklendi</span>");    
                if(self.trollList.indexOf(name) == -1) {
                    self.db.transaction(function(tx){
                        self.insertToTrolls(tx, name);
                    });
                    $(item).parents("td").append($elem);
                    $elem.fadeIn(1500, function(){$elem.fadeOut(2500)});
                }
                
            }).bind(this)
        },  
        importToTrolls: function(e) {
            e.preventDefault();
            var self = this;
            
            $(".messagecb:checked").each(function(idx, item){
                name = $(item).parent("span").contents().get(2).nodeValue.trim();
                $elem = $("<span class='pulse'>&nbsp;&nbsp;&nbsp;&nbsp; Trollere eklendi</span>");    
                if(self.trollList.indexOf(name) == -1) {
                    self.db.transaction(function(tx){
                        self.insertToTrolls(tx, name);
                    });
                    $(item).parents("td").append($elem);
                    $elem.fadeIn(1500, function(){$elem.fadeOut(2500)});
                }
                
            }).bind(this)
        },
        showHideTrolls: function(e) {	
                e.preventDefault();
                if($("body").data("troll-hided")) {
                    $(".banned").removeClass("hidden");
                    $("#show-hide-trolls").text("Trolleri Gizle");
                    $("body").data("troll-hided", false);
                    return;
                }
                    
                $(".banned").addClass("hidden");
                $("#show-hide-trolls").text("Trolleri Göster");
                $("body").data("troll-hided", true);	    
        },
        setTrollList: function(transaction, results) {	
                var len = results.rows.length, i;
                for (i = 0; i < len; i++){
                    this.trollList.push(results.rows.item(i).troll)
                }
                this.hideTrolls();
        },
        
        hideTrolls: function() {
            var self = this;
            $(".content ul.bottomright li:first-child a:first-child, .answer ul li:first-child").each(function(idx, link){   
            $ul = $(this).parents("ul");
            if (self.trollList.indexOf($(this).contents().get(0).nodeValue) !== -1) {	    
                if($(this).parents(".answer").length == 0) {
                    self.addBannedClasses($(this).parents("[class^=entry]"));
                }
                else {
                    self.addBannedClasses($(this).parents(".answer"));	  
                }
                self.addAction(true, $ul);
                
                return;
            }
            
            self.addAction(false, $ul);	
            }).bind(this);
            $("body").data("troll-hided", true);
        },
        
        dataHandler: function(transaction, result) {
            
        },
    
        errorHandler: function(transaction, error) {	
            //console.log(error);
        },
        
        addBannedClasses: function(elem) {
            if(!$(elem).hasClass("banned")) {
            $(elem).addClass("hidden");
            $(elem).addClass("banned");
            }
        },
        
        addAction: function(isTroll, elem){
            if(!$(elem).hasClass("action-added"))
            {	
            if(isTroll) {
                $(elem).append($("<li><a href='#' title='"+this.remove_troll_title+"' class='is-troll remove-from-trolls'></a></li>"));
            }
            else {
                $(elem).append($("<li><a href='#' title='"+this.add_troll_title+"' class='is-troll add-to-trolls'></a></li>"));
            }
            $(elem).addClass("action-added");
            }
        }
    }
    
    var trollBox = new TrollBox();
    
})()