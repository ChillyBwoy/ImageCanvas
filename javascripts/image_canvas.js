;(function($) {
    var Filter = function(pixels) {
        this.pixels = pixels;
    }
    $.extend(Filter.prototype, {
        _each: function(func) {
            for (var i = 0, il = this.pixels.length; i < il; i += 4) {

                var r = this.pixels[i],
                    g = this.pixels[i+1],
                    b = this.pixels[i+2],
                    a = this.pixels[i+3]

                var process = func(r, g, b, a);

                this.pixels[i]   = process[0];
                this.pixels[i+1] = process[1];
                this.pixels[i+2] = process[2];
                this.pixels[i+3] = process[3];
            }
        },
        invert: function() {
            this._each(function(r, g, b, a) {
                return [255 - r, 255 - g, 255 - b, a]
            });
            return this;
        },
        sepia: function() {
            this._each(function(r, g, b, a) {
                return [
                    (r * 0.393) + (g *0.769) + (b * 0.189),
                    (r * 0.349) + (g *0.686) + (b * 0.168),
                    (r * 0.272) + (g *0.534) + (b * 0.131), 
                    a
                ];
            });
            return this;
        },
        noise: function(alpha) {
            alpha = alpha || 0.5;
            var alpha1 = 1 - alpha;

            this._each(function(r, g, b, a) {
                var color  = Math.random();
                return [
                    r * color * alpha + r * alpha1,
                    g * color * alpha + g * alpha1,
                    b * color * alpha + b * alpha1,
                    a
                ];
            });
            return this;
        },
        monochrome: function(pixels) {
            this._each(function(r, g, b, a) {
                var color = (r + g + b) / 3;
                return [color, color, color, a];
            });
            return this;
        }
    })
    
    var ImageCanvas = function(image, options) {
        this.image = $(image);
        this.parent = this.image.parent();
        
        this.options = $.extend({
            filters:    [],
            width:      parseInt(this.image.attr('width'), 10),
            height:     parseInt(this.image.attr('height'), 10),
            src:        this.image.attr('src')
        }, options);

        this.image.hide();

        this.canvas = $('<canvas/>');
        this.canvas.attr('width', this.options.width);
        this.canvas.attr('height', this.options.height);
        this.parent.append(this.canvas);

        this.context = this.canvas[0].getContext('2d');

        this.loadImage();
    }

    $.extend(ImageCanvas.prototype, {

        loadImage: function() {
            var img = new Image();
            img.onload = $.proxy(function() {
                this.context.drawImage(img, 0, 0);
                var imageData;
                try { 
                    try { 
                        imageData = this.context.getImageData(0, 0, this.options.width, this.options.height);
                    } catch (e) { 
                        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead"); 
                        imageData = this.context.getImageData(0, 0, this.options.width, this.options.height);
                    } 
                } catch (e) { 
                    throw new Error("unable to access image data: " + e); 
                }

                var pixels    = imageData.data,
                    f         = new Filter(pixels);

                $.each(this.options.filters, function(i, filt) {
                    if (Filter.prototype.hasOwnProperty(filt)) {
                        f[filt]();
                    }
                });
                
                this.context.putImageData(imageData, 0, 0);
            }, this);
            img.src = this.options.src;
        }
    });

    $.fn.ImageCanvas = function(filters) {
        $.each(this, function(i, item) {
            new ImageCanvas(item, {
                filters: filters
            });
        });
    }

})(jQuery);