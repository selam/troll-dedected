(function(){         
    /**
     * Yazar: timu 
     * Katkı sağlayanlar: null
     * 
     * Buraya kadar geldiysen bi el atarsın artık, 
     *
     * Bağışlar için BTC ve LTC adresleri aşağıda, sevindirin şu garibi.
     * LTC: LZP363BJqSTBMacEshHas49fapF58CmbTL
     * BTC: 15qha9XF6PK1ZMUkzCbdjpTHzP9NvPq2DS
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
        import_trolls:  "Seçilileri trollere gönder",
        show_trolls: "Trolleri Göster",
        hide_trolls: "Trolleri Gizle",
        added_to_trolls: "&nbsp;&nbsp;&nbsp;&nbsp; Trollere eklendi",
        initialize: function() {           
            if($("ul.duspsm li").length > 0){
                $("ul.duspsm").css("width", "auto").append($("<li class='no-background'><a href='#' id='show-hide-trolls'>"+this.show_trolls+"</a></li>"));  
            }
            this.checkTrolls();
            this.selectTrolls();
            this.makeMonkeyPach();
            this.setEvents();   
        },
        checkTrolls: function() {
            if(window.location.href.indexOf('/mesajlar/mallar') != -1) {
                $(".maltable tr:last-child td:last-child").append($('<span>&nbsp;&nbsp;&nbsp;</span><span class="finger underline" id="import-to-trolls" style="position: relative; bottom:3px;">'+this.import_trolls+'</span>'))
                //$(".maltable tr:last-child td:last-child").append($('<span>&nbsp;&nbsp;&nbsp;</span><span class="finger underline" id="remove-from-trolls" style="position: relative; bottom:3px;">Seçilileri trollerden çıkart</span>'))
            }
        },      
        makeMonkeyPach: function() {
            self = this;
            window.getannounce = function(item, directive, b, c) {
                this._getannounce(item, directive, b, c);
                this.hideTrolls();
            }.bind(this);
        },
        selectTrolls: function() {
            this.setTrollList((localStorage.getItem("eksiduyuru.troller") || "").split(","))
        },
        insertToTrolls: function(name) {                
            this.trollList.push(name)
            localStorage.setItem("eksiduyuru.troller", $.unique(this.trollList));
            this.hideTrolls();
        },
        removeFromTrolls: function(name) {
            idx = this.trollList.indexOf(name)
            if(idx != -1){
                this.trollList.splice(idx, 1)
            }
            localStorage.setItem("eksiduyuru.troller", this.trollList);
        },
        setEvents: function() {
            var self = this;
            $(document).on('click', '.is-troll', function(event){
            event.preventDefault();
            $e = $(event.target);
            name = ($e.parents("ul").find("li:first-child a:first-child").contents().get(0) || $e.parents("ul").find("li:first-child").contents().get(0)).nodeValue;
            if(name) {
                if($(this).hasClass("add-to-trolls")){              
                    self.insertToTrolls(name);
                    $e.removeClass("add-to-trolls");
                    $e.addClass("remove-from-trolls");
                    $e.attr("title", self.remove_troll_title);                    
                    self.hideTrolls();    
                    return;
                }
                self.removeFromTrolls(name)
                $e.addClass("add-to-trolls");
                $e.removeClass("remove-from-trolls");
                $e.attr("title", self.add_troll_title);
                self.hideTrolls();                  
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
                $elem = $("<span class='pulse'>"+self.added_to_trolls+"</span>");    
                if(self.trollList.indexOf(name) == -1) {
                    self.insertToTrolls(name);
                    $(item).parents("td").append($elem);
                    $elem.fadeIn(1500, function(){$elem.fadeOut(2500)});
                }
                
            }).bind(this)
        },
        showHideTrolls: function(e) {   
                e.preventDefault();
                if($("body").data("troll-hided")) {
                    $(".banned").removeClass("hidden");
                    $("#show-hide-trolls").text(this.hide_trolls);
                    $("body").data("troll-hided", false);
                    return;
                }
                    
                $(".banned").addClass("hidden");
                $("#show-hide-trolls").text(this.show_trolls);
                $("body").data("troll-hided", true);        
        },
        setTrollList: function(results) {  
                var len = results.length, i;
                for (i = 0; i < len; i++){
                    this.trollList.push(results[i])
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
                else 
                {
                    $(elem).append($("<li><a href='#' title='"+this.add_troll_title+"' class='is-troll add-to-trolls'></a></li>"));
                }
                $(elem).addClass("action-added");
            }
        }
    }
    
    var trollBox = new TrollBox();
    
})()