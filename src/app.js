(function(){
    function EksiDuyuruApp() {
        this.run();
    }
    
    EksiDuyuruApp.prototype = {
        trollbox: new TrollBox(),
        exporter: new ExportMessages(),
        run: function() {
            this.trollbox.run();
            this.exporter.run();
        }
    }
    
    new EksiDuyuruApp();
})();