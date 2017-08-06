var serverUrl = "https://my.site.ua/";
var baseUrl = "/osago/js";
var currentCalculator = 'new_osago';
var currentCalculatortype = 'osago';
var devSuffix = '';
if (location.hash === '#dev') {
    devSuffix = '/dev';
}
require.config({
    urlArgs: "bust=v1",
    baseUrl: baseUrl,
    paths: {
        "jquery": "lib/jquery",
        "jquery-min": "jquery/jquery-2.1.4.min",
        "jqueryForm": "lib/jquery.form.min",
        "jqueryValidate": "lib/jquery.validate.app",
        "jqueryUI": "lib/jquery-ui.min",
        "include_plugins": "include_plugins",
        "mustache": "lib/mustache",
        "validateApp": "lib/validateApp",
        "maskedInput": "lib/maskedInput",
        "settings": "lib/settings",
        "jquery-ui": "plugins/jquery-ui",
        "jquery-jscrollpane": "plugins/jquery.jscrollpane.min",
        "jquery-mousewheel": "plugins/jquery.mousewheel",
        "jquery-visible": "plugins/visible",
        "jquery-customselect": "plugins/jquery-customselect-1.9.1",
        "main_function": "main_function",
        "menuAim": "lib/jquery.menu-aim",
        "nanoScroller": "lib/jquery.nanoscroller.min"
    },
    waitSeconds: 30
});

define('jquery-private', ['jquery', 'jquery-min', 'jqueryUI'], function ($) {
    return $.noConflict(true);
});

require(["jquery-private", "jqueryForm", "validateApp", "mustache", "jqueryUI", serverUrl + 'ajax/getDictionary', serverUrl + 'ajax/getTranslation', 'maskedInput', 'nanoScroller', 'menuAim'], function ($, jf, jv, Mustache, jqui, Dictionary, getTranslation) {
    var lang = ((location.href).split('/'))[3];
    // var lang = 'ua';
    var translation = getTranslation();
    var DictionaryV = Dictionary.getValues();
    $.extend(translation, DictionaryV);
    DictionaryV = translation;

    prepareWebPage();

    function prepareWebPage() {
        $.ajax({
            type: "post",
            dataType: "json",
            url: 'https://my.site.ua/calculate/ajax/new_osago',
            success: function (data) {
                // console.log(data)
                $('body').append('<link href="/osago/css/customcalc.css" rel="stylesheet" type="text/css">');
                $('#insertData').append(data.html);

                $('select[name=new_ts_type] option:eq(0)').html('' + Mustache.render('{{calculator_choose_type}}', translation) + '').attr('disabled', true);
                $('select[name=new_registration_settlement] option:eq(0)').html('' + Mustache.render('{{calculator_choose_region_registration}}', translation) + '').attr('disabled', true);

                if (lang == 'ua') {
                    $('#ua').attr("class", "active");
                    $('#ru').removeClass("active");
                }
                if (lang == 'ru') {
                    $('#ru').attr("class", "active");
                    $('#ua').removeClass("active")
                }

                loadPlugins();
            }
        });
    }

    function loadPlugins() {
        //customselect
        $.fn.customselect = function (method, value) {
            // Default Options
            var $options = {
                "csclass": "custom-select",  // Class to match
                "search": true,             // Is searchable?
                "numitems": 4,                // Number of results per page
                "searchblank": false,            // Search blank value options?
                "showblank": true,             // Show blank value options?
                "searchvalue": false,            // Search option values?
                "hoveropen": false,            // Open the select on hover?
                "emptytext": "",               // Change empty option text to a set value
                "showdisabled": false,            // Show disabled options
                "useoptionclass": false,
                "mobilecheck": function () {      // Mobile check function / boolean
                    return navigator.platform && navigator.userAgent.match(/(android|iphone|ipad|blackberry)/i);
                }
            };

            // Check for Additional Options
            if (method && typeof method == "object") {
                $.extend($options, method);
            }

            // Mobile check
            var $is_mobile = typeof $options.mobilecheck == "function" ? $options.mobilecheck.call() : $options.mobilecheck;

            // Select validation
            var items = $is_mobile ? $(this).filter("select") : $(this).filter("select:not([multiple])");

            // Customselect control
            items.each(function () {

                // Original Select
                var $select = $(this);

                // Preset Options
                if ($select.data("cs-options")) {
                    $.extend($options, $select.data("cs-options"));
                }

                // Custom Select Container
                var $this = $select.parents($options.selector + ":first");

                var methods = {
                    init: function () {
                        // Initital Setup
                        var setup = {
                            init: function () {
                                // Create Elements + Events
                                setup.container();
                                setup.value();
                                setup.subcontainer();
                            },

                            container: function () {
                                $this = $("<div/>").addClass($options.csclass);
                                if ($is_mobile) {
                                    $this.addClass($options.csclass + "-mobile");
                                    $select.css("opacity", 0);
                                }

                                // Selector Container
                                $select.before($this);
                                $select.appendTo($this);
                                $select.off("change", setup._onchange).change(setup._onchange);

                                // Standard Events
                                var hover_timeout = null;
                                $this.hover(function () {
                                    if (hover_timeout) clearTimeout(hover_timeout);
                                    $this.addClass($options.csclass + "-hover");
                                }, function () {
                                    if ($options.hoveropen) hover_timeout = setTimeout(methods.close, 750);
                                    $this.removeClass($options.csclass + "-hover");
                                });

                                $(document).mouseup(function () {
                                    if ($this.is($options.selector + "-open")) {
                                        if (!$this.is($options.selector + "-hover")) methods.close();
                                        else $this.find("input").focus();
                                    }
                                });
                            },

                            value: function () {
                                var value = $("<a href='#'><span/></a>").appendTo($this);
                                $select.appendTo($this);

                                var searchvalue = "";
                                var searchtimer = null;
                                value.click(function (e) {
                                    e.preventDefault();
                                })
                                    .focus(function () {
                                        $this.addClass($options.csclass + "-focus");
                                    })
                                    .blur(function () {
                                        $this.removeClass($options.csclass + "-focus");
                                    });
                                $("html").keyup(function (e) {
                                    if (value.is(":focus")) {
                                        var keycode = e.which;
                                        var options = $select.find("option").not(":disabled");
                                        if (keycode >= 48 && keycode <= 90) { // 0-9 a-z
                                            searchvalue += String.fromCharCode(keycode).toLowerCase();
                                            for (var i = 0; i < options.length; i++) {
                                                var option = options.eq(i);
                                                var text = (option.text() + "").toLowerCase();

                                                if (!option.is(":disabled") && $options.searchblank || text.length > 0) {
                                                    if (text.indexOf(searchvalue) == 0) {
                                                        $select.val(option.attr("value")).change();
                                                        break;
                                                    }
                                                }
                                            }
                                            ;

                                            if (searchtimer) clearTimeout(searchtimer);
                                            searchtimer = setTimeout(function () {
                                                searchvalue = "";
                                            }, 1000);

                                            e.preventDefault();
                                        }
                                        else if (keycode == 27) {
                                            if (searchtimer) clearTimeout(searchtimer);
                                            searchvalue = "";

                                            e.preventDefault();
                                        }
                                        else if (keycode == 38) { // Up
                                            var selected = $select.find("option:selected");
                                            var index = options.index(selected);
                                            if (index > 0) {
                                                $select.val(options.eq(index - 1).attr("value"));
                                            }
                                            else {
                                                $select.val(options.eq(options.length - 1).attr("value"));
                                            }
                                            $select.change();

                                            e.preventDefault();
                                        }
                                        else if (keycode == 40) { // Down
                                            var selected = $select.find("option:selected");
                                            var index = options.index(selected);
                                            if (index < options.length - 1) {
                                                $select.val(options.eq(index + 1).attr("value"));
                                            }
                                            else {
                                                $select.val(options.eq(0).attr("value"));
                                            }
                                            $select.change();

                                            e.preventDefault();
                                        }
                                    }
                                });

                                var option = $select.find("option:selected");
                                value.find("span").html(option.text().length > 0 ? option.text() : $options.emptytext);
                                value.removeAttr("class");
                                if ($options.useoptionclass && option.attr("class")) {
                                    value.addClass(option.attr("class") || "");
                                }

                                if ($options.hoveropen) {
                                    value.mouseover(methods.open);
                                }
                                else {
                                    value.click(methods.toggle);
                                }
                            },

                            subcontainer: function () {
                                // Container
                                var subcont = $("<div/>").appendTo($this);

                                // Input Box
                                var input = $("<input type='input'/>").appendTo(subcont);
                                input.keyup(function (e) {
                                    if ($.inArray(e.which, [13, 38, 40]) < 0) {
                                        if ($options.search) {
                                            methods.search($(this).val());
                                        }
                                        else {
                                            methods.searchmove($(this).val());
                                            $(this).val("");
                                        }
                                    }
                                }).keydown(function (e) {
                                    switch (e.which) {
                                        case 13: // Enter
                                            val = $this.find("ul li.active.option-hover").data("value");
                                            disabled = $this.find("ul li.active.option-hover").is(".option-disabled");
                                            methods.select(val, disabled);
                                            break;
                                        case 38: // Up
                                            methods.selectUp();
                                            break;
                                        case 40: // Down
                                            methods.selectDown();
                                            break;
                                        case 27: // Esc
                                            methods.close();
                                            break;
                                        default:
                                            return true;
                                            break;
                                    }

                                    e.preventDefault();
                                    return false;
                                }).blur(function () {
                                    $(this).val("");
                                });
                                if (!$options.search) {
                                    input.addClass($options.csclass + "-hidden-input");
                                }

                                // Scrolling Container
                                var scroll = $("<div/>").appendTo(subcont);

                                // Selectable Items
                                var select = $("<ul/>").appendTo(scroll);
                                $select.find("option").each(function (i) {
                                    var val = $(this).attr("value");
                                    var txt = $(this).text();
                                    var disabled = $(this).is(":disabled");
                                    if (($options.showblank || val.length > 0) && ($options.showdisabled || !disabled)) {
                                        $("<li/>", {
                                            'class': 'active'
                                            + (i == 0 ? ' option-hover' : '')
                                            + ($(this).is(":disabled") ? ' option-disabled' : '')
                                            + ($options.useoptionclass && $(this).attr("class") ? ' ' + $(this).attr("class") : ''),
                                            'data-value': val,
                                            'text': txt.length > 0 ? txt : $options.emptytext
                                        }).appendTo(select);
                                    }
                                });
                                var options = select.find("li");
                                select.find("li").click(function () {
                                    methods.select($(this).data("value"), $(this).is(".option-disabled"));
                                });

                                $this.find("div div").css({
                                    "overflow-y": options.length > $options.numitems ? "scroll" : "visible"
                                });

                                $("<li/>", {
                                    'class': 'no-results',
                                    'text': "No results"
                                }).appendTo(select);
                            },

                            // Catch select change event and apply to customselect
                            _onchange: function () {
                                $select.val($(this).val());
                                methods.select($(this).val());
                            }
                        };

                        if ($select.is("select" + $options.selector) && !$select.data("cs-options")) {
                            setup.init();
                        }
                    },

                    // Open/Close Select Box
                    toggle: function () {
                        if ($this.is($options.selector + "-open")) {
                            methods.close();
                        }
                        else {
                            methods.open();
                        }
                    },

                    // Open Select Box
                    open: function () {
                        if (!$is_mobile) {
                            $this.addClass($options.csclass + "-open");
                            $this.find("input").focus();
                            $this.find("ul li.no-results").hide();
                            methods._selectMove($select.get(0).selectedIndex)
                        }
                    },

                    // Close Select Box
                    close: function () {
                        $this.removeClass($options.csclass + "-open");
                        $this.find("input").val("").blur();
                        $this.find("ul li").not(".no-results").addClass("active");

                        var options = $this.find("ul li").not(".no-results");
                        $this.find("div div").css({
                            "overflow-y": options.length > $options.numitems ? "scroll" : "visible"
                        });

                        $this.find("a").focus();
                    },

                    // Search Options
                    search: function (value) {
                        value = $.trim(value.toLowerCase());

                        var noresults = $this.find("ul li.no-results").hide();

                        // Search for Match
                        var options = $this.find("ul li").not(".no-results");
                        options.each(function () {
                            var text = ($(this).text() + "").toLowerCase();
                            var val = ($(this).data("value") + "").toLowerCase();
                            var add = false;

                            if ($options.searchblank || val.length > 0) {
                                if ($options.searchvalue && val.indexOf(value) >= 0) {
                                    add = true;
                                }
                                else if (text.indexOf(value) >= 0) {
                                    add = true;
                                }
                            }
                            else if (value.length == 0) {
                                add = true;
                            }

                            add ? $(this).addClass("active") : $(this).removeClass("active");
                        });
                        options = options.filter(".active").filter(":visible");

                        // // debugger
                        // options = options.sort(function(a, b) {
                        //     return (Number(a.getAttribute('data-rating')) < Number(b.getAttribute('data-rating'))) ? 1 : -1;
                        // });

                        // Set Scroll
                        $this.find("div div").css({
                            "overflow-y": options.length > $options.numitems ? "scroll" : "visible"
                        });

                        if (options.length > 0) {
                            // Select First Result
                            methods._selectMove(0);
                        }
                        else {
                            // No Results
                            noresults.show();
                        }
                    },

                    searchmove: function (value) {
                        var index = [];
                        $select.find("option").each(function (i) {
                            if ($(this).text().toLowerCase().indexOf(value.toLowerCase()) == 0) {
                                index.push(i);
                            }
                        });

                        if (index.length > 0) {
                            methods._selectMove(index[0]);
                        }
                    },

                    // Select Option
                    select: function (value, disabled) {
                        if (!disabled) {
                            if ($select.val() != value) {
                                $select.val(value).change();
                            }
                            var option = $select.find("option:selected");
                            var link = $this.find("a");
                            link.find("span").text(option.text().length > 0 ? option.text() : $options.emptytext);
                            link.removeAttr("class");
                            if ($options.useoptionclass && option.attr("class")) {
                                link.addClass(option.attr("class") || "");
                            }
                            methods.close();
                        }
                    },

                    // Move Selection Up
                    selectUp: function () {
                        var options = $this.find("ul li.active").not(".no-results");
                        var selected = options.index(options.filter(".option-hover"));

                        var moveTo = selected - 1;
                        moveTo = moveTo < 0 ? options.length - 1 : moveTo;

                        methods._selectMove(moveTo);
                    },

                    // Move Selection Down
                    selectDown: function () {
                        var options = $this.find("ul li.active").not(".no-results");
                        var selected = options.index(options.filter(".option-hover"));

                        var moveTo = selected + 1;
                        moveTo = moveTo > options.length - 1 ? 0 : moveTo;

                        methods._selectMove(moveTo);
                    },

                    // Destroy customselect instance
                    destroy: function () {
                        if ($select.data("cs-options")) {
                            $select.removeData("cs-options").insertAfter($this);
                            $this.remove();
                        }
                    },

                    // Move Selection to Index
                    _selectMove: function (index) {
                        var options = $this.find("ul li.active");
                        options.removeClass("option-hover").eq(index).addClass("option-hover");

                        var scroll = $this.find("div div");
                        if (scroll.css("overflow-y") == "scroll") {
                            scroll.scrollTop(0);

                            var selected = options.eq(index);
                            offset = selected.offset().top + selected.outerHeight() - scroll.offset().top - scroll.height();

                            if (offset > 0) {
                                scroll.scrollTop(offset);
                            }
                        }
                    }
                };

                var call_method = method;

                // Check for Additional Options
                if (call_method && typeof call_method == "object") {
                    call_method = "init";
                    value = null;
                }

                $options.selector = "." + $options.csclass;

                // Load Requested Method
                call_method = call_method ? call_method : "init";
                if (typeof methods[call_method] == "function") {
                    methods[call_method].call(this, value);
                }

                if (call_method != "destroy") {
                    $select.data("cs-options", $options);
                }
            });

            return this;
        };

        //visible
        $.fn.viewportChecker = function (useroptions) {
            // Define options and extend with user
            var options = {
                classToAdd: 'visible',
                offset: 100,
                repeat: false,
                callbackFunction: function (elem, action) {
                }
            };
            $.extend(options, useroptions);

            // Cache the given element and height of the browser
            var $elem = this,
                windowHeight = $(window).height(),
                scrollElem = ((navigator.userAgent.toLowerCase().indexOf('webkit') != -1) ? 'body' : 'html');

            this.checkElements = function () {

                // Set some vars to check with
                var viewportTop = $(scrollElem).scrollTop(),
                    viewportBottom = (viewportTop + windowHeight);

                $elem.each(function () {
                    var $obj = $(this);
                    // If class already exists; quit
                    if ($obj.hasClass(options.classToAdd) && !options.repeat) {
                        return;
                    }

                    // define the top position of the element and include the offset which makes is appear earlier or later
                    var elemTop = Math.round($obj.offset().top) + options.offset,
                        elemBottom = elemTop + ($obj.height());

                    // Add class if in viewport
                    if ((elemTop < viewportBottom) && (elemBottom > viewportTop)) {
                        $obj.addClass(options.classToAdd);

                        // Do the callback function. Callback wil send the jQuery object as parameter
                        options.callbackFunction($obj, "add");

                        // Remove class if not in viewport and repeat is true
                    } else if ($obj.hasClass(options.classToAdd) && (options.repeat)) {
                        $obj.removeClass(options.classToAdd);

                        // Do the callback function.
                        options.callbackFunction($obj, "remove");
                    }
                });

            };

            // Run checkelements on load and scroll
            $(window).bind("load scroll touchmove", this.checkElements);

            // On resize change the height var
            $(window).resize(function (e) {
                windowHeight = e.currentTarget.innerHeight;
            });

            return this;
        };

        // $(".select").selectmenu({});


        $(".custom-select").customselect();

        $(".custom-select").each(function (index, el) {
            $(this).addClass('srroll-select')
        });

        $('.select-1 ul li').click(function (event) {
            var index_li = $(this).index();
            if (index_li <= 0) {
                $('.select-1 .custom-select').removeClass('has-option');
            }
            else {
                $('.select-1 .custom-select').addClass('has-option');
            }
            var has_option = $('.select-2 .custom-select').hasClass('has-option');
            if (index_li <= 0 || has_option == false) {
                $('.bottom-from').slideUp(400);
                $('.block-form').removeClass('acitve');
                clearCalculateForm();
                $('#makeOrderForm').remove();
            }
            else {
                calculate();
                $('.bottom-from').slideDown(400);
                $('.block-form').addClass('acitve');
            }
        });
        $('.select-2 ul li').click(function (event) {
            var index_li = $(this).index();
            if (index_li <= 0) {
                $('.select-2 .custom-select').removeClass('has-option');
            }
            else {
                $('.select-2 .custom-select').addClass('has-option');
            }
            var has_option = $('.select-1 .custom-select').hasClass('has-option');
            if (index_li <= 0 || has_option == false) {
                $('.bottom-from').slideUp(400);
                $('.block-form').removeClass('acitve');
                clearCalculateForm();
                $('#makeOrderForm').remove()
            }
            else {
                calculate();
                $('.bottom-from').slideDown(400);
                $('.block-form').addClass('acitve');
            }
        });


        /*select menu*/


        function level_height(th) {
            th.css('height', 'auto');
            var height_th = 0;
            th.each(function (index, el) {
                var hi_each = $(this).outerHeight();
                if (hi_each > height_th) {
                    height_th = hi_each;
                }
            });
            th.css('height', height_th + 'px');
        };
        level_height($('.footer-items .item'));
        // load window
        $(window).load(function () {
            level_height($('.footer-items .item'));
        });
        // resize window
        $(window).resize(function () {
            clearTimeout(window.resizedFinished);
            window.resizedFinished = setTimeout(function () {
                level_height($('.footer-items .item'));
            }, 500);
        });


        $('.check-label').each(function (index, el) {
            var checked = $(this).find('input').prop('checked');
            if (checked == true) {
                $(this).addClass('active');
            }
        });

        $('.check-label input').click(function (event) {
            var checked = $(this).prop('checked');
            if (checked == true) {
                $(this).parents('.check-label').addClass('active');
            }
            else {
                $(this).parents('.check-label').removeClass('active');
            }
            clearCalculateForm();
            calculate();
        });


        $(window).scroll(function () {
            if ($(this).scrollTop() > 60) {
                $('nav').addClass('active');
            }
            else {
                $('nav').removeClass('active');
            }
        });


        $('header .right-nav ul li a').click(function () {
            var target = $(this).attr('href');
            var scroll_t = $(window).scrollTop();
            if (scroll_t <= 60) {
                $('html, body').animate({scrollTop: $(target).offset().top - 120}, 800);
            }
            else {
                $('html, body').animate({scrollTop: $(target).offset().top - 120}, 800);
            }
            return false;
        });


        $(window).scroll(function () {
            $(".anchor").each(function () {
                var window_top = $(window).scrollTop();
                var div_top = $(this).offset().top;
                var div_1 = $(this).attr('id');
                if (window_top > div_top - 130) {
                    $('header .right-nav ul li a').removeClass('active');
                    $('header .right-nav ul li').find('a[href="#' + div_1 + '"]').addClass('active')
                }
                else {
                    $('header .right-nav ul li').find('a[href="#' + div_1 + '"]').removeClass('active_nav');
                }
                ;
            });
        });


        $('.clic-menu > div').click(function (event) {
            $(this).toggleClass('active');
            $('header .right-nav ul').slideToggle(400);
        });


        $('header .right-nav ul li a').click(function (event) {
            $('.clic-menu div').removeClass('active');
            $('header .right-nav ul').slideUp(400);
        });


        $('ul.what-need-ul li, ul.list-concierge li, .text-dlivery .item, .section-suport .text-suport, .section-pay h4, .section-pay .h4, .section-pay img, .section-pay .link-page').viewportChecker({
            classToAdd: 'active',
            offset: 100
        });


        $('.section-concierge .col-lg-12').viewportChecker({
            classToAdd: 'active',
            offset: 850
        });

        $('.butotn-osago').click(function (event) {
            $('.modal-osago').fadeIn(400);
            $('.modal-osago .window').addClass('active');
            $('body').addClass('body');
        });

        $('.close-w').click(function (event) {
            $('.modal-osago').fadeOut(400);
            $('.modal-osago .window').removeClass('active');
            $('body').removeClass('body');
        });
        $('.link-page a').click(function (event) {
            clearCalculateForm();
            $('#makeOrderForm').remove();
            makeOrderBlock(event);
        });

        $('.submit span').click(function (event) {
            // $(this).find('> input, > button').trigger('click');
        });
    }

    function clearCalculateForm() {
        //todo clear form (if necessary)
    }

    function blockMainForm() {
        $('.formCover,.changeOrderProperties').remove();
        $('#insertData').css({
            'position': 'relative'
        });
        $('<div>')
            .css({
                'position': 'absolute',
                'left': '0',
                'top': '0',
                'width': '100%',
                'height': '100%',
                'background': 'rgba(0,0,0,0.5)',
                'z-index': '10000'
            })
            .addClass('formCover')
            .appendTo('#insertData');
        $('<div>')
            .addClass('row')
            .addClass('changeOrderProperties')
            .insertBefore('#makeOrderForm');
        $('<a href="javascript:void(0)"></a>')
            .text('' + Mustache.render('{{travel_BtnRecalculate}}', translation) + '')
            .appendTo('.changeOrderProperties')
            .addClass('btn')
            .addClass('btn-success')
            .on('click', function () {
                if (!confirm('' + Mustache.render('{{travel_BtnRecalculateConfirm}}', translation) + '')) return;
                $('#makeOrderForm,.formCover, .documentsBlock, .changeOrderProperties').remove();
            });
    }

    function calculate() {
        var new_ts_type = $('[name="new_ts_type"]').val();
        var new_registration_settlement = $('[name="new_registration_settlement"]').val();
        var new_is_taxi = $('input[name="new_is_taxi"]:checked').val() ? true : false;
        var new_beneficiary_discount = $('input[name="new_beneficiary_discount"]:checked').val() ? '0c2178ca-7684-e311-a8c3-00155d001525' : 'b2e128af-124a-e311-b42a-00155d001525';
        var fields = {};
        fields.new_ts_type = new_ts_type;
        fields.new_registration_settlement = new_registration_settlement;
        fields.new_is_taxi = new_is_taxi;
        fields.new_beneficiary_discount = new_beneficiary_discount;
        fields.lang = lang;
        fields.currentCalculator = currentCalculatortype;
        $.ajax({
            type: "post",
            dataType: "json",
            data: fields,
            url: serverUrl + '/calculate/ajax/' + currentCalculator + devSuffix,
            success: function (data) {
                $('#sum').text(data.sum);
                $('.deductible').text(data.deductible);
            }
        });
    }

    function makeOrderBlock(event) {
        $('.modal-osago').fadeOut(400);
        $('.modal-osago .window').removeClass('active');
        $('body').removeClass('body');
        var makeOrderForm = $('<form type="post" id="makeOrderForm">')
            .addClass('block-form')
            .append('<input type="hidden" name="invoice_details" value="">')
            .insertAfter('#insertData');

        blockMainForm();
        //contact information
        var contactsBlock = $('<div>')
            .html('<div class="col-lg-12 orderStepName">' + Mustache.render('{{travel_label_ContactInfo}}', translation) + '</div>')
            .addClass('row')
            .addClass('stepItem')
            .addClass('contactsBlock')
            .appendTo(makeOrderForm);

        $('<div class="col-lg-3">')
            .append('' + Mustache.render('{{travel_label_ContactLastName}}', translation) + '<br><input type="text" name="contactLastName" class="check-valid form-control">')
            .appendTo(contactsBlock);
        $('<div class="col-lg-3">')
            .append('' + Mustache.render('{{travel_label_ContactFirstName}}', translation) + '<br><input type="text" name="contactFirstName" class="check-valid form-control">')
            .appendTo(contactsBlock);
        $('<div class="col-lg-3">')
            .append('' + Mustache.render('{{travel_label_ContactMiddleName}}', translation) + '<br><input type="text" name="contactMiddleName" class="check-valid form-control">')
            .appendTo(contactsBlock);
        $('<div class="col-lg-3">')
            .append('' + Mustache.render('{{travel_label_ContactTel}}', translation) + '<br><input type="text" name="contactMob" class="form-control">')
            .appendTo(contactsBlock);
        $('<div class="col-lg-3">')
            .append('' + Mustache.render('{{travel_label_ipn}}', translation) + '<br><input type="text" maxlength="10" name="ipnContact" class="form-control validateMe" >')
            .appendTo(contactsBlock);
        $('<div class="col-lg-3">')
            .append('' + Mustache.render('{{travel_label_BirthDate}}', translation) + '<br><input type="text" readonly="readonly" name="birthdateContact" class="birthDateInput birthDatepicker check-valid form-control">')
            .appendTo(contactsBlock);
        $('.birthDatepicker').datepicker({
            firstDay: 1,
            yearRange: "-100:-0",
            defaultDate: '01-01-1984',
            todayHighlight: true,
            changeMonth: true,
            changeYear: true,
            dateFormat: 'dd-mm-yy',
            onSelect: function () {
                $(this).trigger('change');
            }
        }).inputmask("99-99-9999");

        //documents
        var documentsBlock = $('<div>')
            .html('<div class="col-lg-12 orderStepName">' + Mustache.render('{{order_label_document}}', translation) + '</div>')
            .addClass('row')
            .addClass('stepItem')
            .addClass('documentsBlock')
            .appendTo(makeOrderForm);
        $('<div class="col-lg-12">')
            .append('<select  name=document[] data-name=document[] class="form-control">' +
                '<option value="2">' + Mustache.render('{{order_label_driverLicense}}', translation) + '</option>' +
                '<option value="1">' + Mustache.render('{{order_label_document_passport}}', translation) + '</option>' +
                '</select>' +
                '<div class="bioCheck" style="display: none;">' +
                '<input type="checkbox" maxlength="1" name="isbio" value="isbio" class="validateMe">' + Mustache.render('{{order_isbiopassport}}', translation) +
                '</div>' +
                '</div>' +
                '</div>'
            )
            .appendTo(documentsBlock);
        $('<div class="col-lg-3">')
            .append('' + Mustache.render('{{order_label_document_series}}', translation) + '<br><input type=text name=document_code[] data-name=document_code[] maxlength=3 minlength=1 required class="validateMe doc_code form-control"  value="">')
            .appendTo(documentsBlock);
        $('<div class="col-lg-3">')
            .append('' + Mustache.render('{{order_label_document_number}}', translation) + '<br><input type=text name=document_number[] data-name=document_number[] maxlength=10 minlength=2 digits required class="validateMe doc_number form-control"  value="">')
            .appendTo(documentsBlock);
        $('<div class="col-lg-3">')
            .append('' + Mustache.render('{{order_label_document_date}}', translation) + '<br><input type=text name=document_date[] data-name=document_date[] maxlength=3 minlength=1 required class="doc_date validateMe datepicker form-control" crmdate="true" value="">')
            .appendTo(documentsBlock);
        $('<div class="col-lg-3">')
            .append('' + Mustache.render('{{order_label_document_issuer}}', translation) + '<br><input type=text name=document_emitent[] data-name=document_emitent[] maxlength=80 minlength=2 required class="validateMe doc_emitent form-control"  value="">')
            .appendTo(documentsBlock);
        $('[data-name="document[]"]').on('change', function () {
            if ($(this).val() == '2') {
                $(this).closest('.documentsBlock').find('.bioCheck').hide('');
                if ($('input[name="isbio"]:checked').length > 0) {
                    $('input[name="isbio"]').trigger('click');
                }
            } else {
                $(this).closest('.documentsBlock').find('.bioCheck').show('');
                $('input[data-name="document_code[]"]').attr('required', true).parent().show('');
            }
        }).trigger('change');
        $(document).on('click', 'input[name="isbio"]', function () {
            if ($('input[name="isbio"]:checked').length > 0) {
                $('input[data-name="document_code[]"]').removeAttr('required').removeClass('error').parent().hide('');
            } else {
                $('input[data-name="document_code[]"]').attr('required', true).parent().show('');
            }
        });

        //auto information
        var autoBlock = $('<div>')
            .html('<div class="col-lg-12 orderStepName">' + Mustache.render('{{order_label_auto_info}}', translation) + '</div>')
            .addClass('row')
            .addClass('stepItem')
            .addClass('autoBlock')
            .appendTo(makeOrderForm);
        var originalMarkaHolder = $('<div style="display: none;">')
            .html('<div class="col-lg-12"></div>')
            .addClass('originalMarkaHolder')
            .appendTo(autoBlock);
        $('<div class="col-lg-6">')
            .append('' + Mustache.render('{{order_auto_marka}}', translation) + '<br>' +
                '<div class="controls selectWrap">' +
                '<select data-name=auto_marka[] name=auto_marka[] class="form-control validateMe" required data-value="">' +
                '<option disabled value="">' + Mustache.render('{{order_auto_marka_choose}}', translation) + '</option>' +
                '</select>' +
                '</div>')
            .appendTo(originalMarkaHolder);
        $('<div class="col-lg-6">')
            .append('' + Mustache.render('{{order_auto_model}}', translation) + '<br>' +
                '<div class="controls selectWrap">' +
                '<select data-name=auto_model[]  name=auto_model[] class="form-control validateMe" required data-value=""></select>' +
                '</div>')
            .appendTo(originalMarkaHolder);
        var markaModelHolder = $('<div>')
            .html('<div class="col-lg-12">Марка та модель (почніть вводити марку чи модель автомобіля)  ' +
                '<a href="javascript:void(0)" id="originalMarkaHolder"><br>' +
                'Показати випадаючий список марок та моделей (якщо автопідказчик не знаходить)</a>' +
                '</div>')
            .addClass('markaModelHolder')
            .appendTo(autoBlock);
        $('<div class="col-lg-12">')
            .append('<div class="controls">' +
                '<input type=text data-name="markamodel[]" autoCompleteModel="true" name="markamodel" markaid="" modelid="" value="" required class="validateMe doc_number form-control"  value="">' +
                '</div>')
            .appendTo(markaModelHolder);

        loadAutoMarka();
        var modelCache = {};
        var markaCache = {};
        var suggestHolder = null;
        var suggestTarget = $('input[data-name="markamodel[]"]');
        var productKey = suggestTarget.closest('.order_product').attr('data-id');
        var chosenMarka = '';
        $('#originalMarkaHolder').on('click', function () {
            $('.originalMarkaHolder').toggle('');
            $('[data-name="markamodel[]"]').parent().toggle('');
        });
        suggestTarget
            .on('input', makeLoad)
            .on('click', makeLoad)
            .on("focusout", function () {
                setTimeout(function () {
                    if (document.activeElement.getAttribute('id') !== 'autoModelSuggestBox') {
                        if (suggestHolder)
                            suggestHolder.slideUp('');
                    }
                }, 200);
            })
            .on("focus", function () {
                /*   if ($(this).val() in modelCache) {
                 suggestHolder.slideDown('');
                 }*/
                makeLoad();
            });
        function makeLoad() {
            if ($(this).val().length < 2) return false;
            var term = $(this).val();
            //$('[name="auto_marka[' + productKey + ']"]').val('');
            //$('[name="auto_model[' + productKey + ']"]').val('');
            if (chosenMarka !== '') term = term.replace(chosenMarka + ' ', '');
            //  console.log(term);
            if (term in modelCache) {
                showMarkaModelDialog(modelCache[term]);
                return;
            }

            $.getJSON(serverUrl + '/ajax/getModelsAjax/', {'term': term}, showMarkaModelDialog);
        }

        function showMarkaModelDialog(data) {
            if (data && data.term) {
                placeSuggestHolder();
                modelCache[data.term] = data;
                if ((data.result.markas && data.result.markas !== [] ) || (data.result.models && data.result.models !== [])) {
                    suggestHolder.empty().css('width', 800);
                    $('<div>')
                        .addClass('markaHolder')
                        .append('<h3>Марки</h3>')

                        .appendTo(suggestHolder);
                    $('<div>')
                        .addClass('modelsHolder')
                        .addClass('nano')
                        .append('<h3>Моделі</h3>')
                        .html('<div class="nano-content"></div>')
                        .appendTo(suggestHolder);
                    if (!data.result.markas.length) {

                    }
                    if (!data.result.models.length) {

                    }
                    for (var mdl in data.result.models) {
                        var cmodel = data.result.models[mdl];
                        if (typeof data.result.markas[cmodel.markaid] === 'undefined') data.result.markas[cmodel.markaid] = {};
                        if (typeof data.result.markas[cmodel.markaid][cmodel.modelid] === 'undefined') data.result.markas[cmodel.markaid][cmodel.modelid] = cmodel;

                        $('<div>')
                            .addClass('modelSelector')
                            .html('<a href="javascript:void(0">' + cmodel.result + '</a>')
                            .attr('modelid', cmodel.modelid)
                            .attr('markaid', cmodel.markaid)
                            .attr('markaName', cmodel.markaName)
                            .appendTo('.modelsHolder .nano-content');
                    }
                    $(".modelsHolder.nano").nanoScroller();

                    var resultMarkas = [];
                    for (var mrk in data.result.markas) {
                        var cmarka = data.result.markas[mrk];
                        var firstChildKey = (function () {
                            for (var a in cmarka) return a;
                        })();
                        if (typeof resultMarkas[cmarka[firstChildKey].markaName.toLowerCase()] === 'undefined') {
                            resultMarkas[cmarka[firstChildKey].markaName.toLowerCase()] = cmarka;
                        } else {
                            for (var i in cmarka)resultMarkas[cmarka[firstChildKey].markaName.toLowerCase()][i] = cmarka[i];
                        }
                    }

                    for (var mrk in resultMarkas) {
                        var cmarka = resultMarkas[mrk];
                        var firstChildKey = (function () {
                            for (var a in cmarka) return a;
                        })();

                        $('<div>')
                            .addClass('markaMenu')
                            .html('<a href="javascript:void(0)" data-submenu-id="modelSet_' + cmarka[firstChildKey].markaid + '">' + cmarka[firstChildKey].markaName + '</a>')
                            .append('<div id="modelSet_' + cmarka[firstChildKey].markaid + '" class="modelsList nano" style="display:none"><div class="nano-content"></div></div>')
                            .attr('markaid', cmarka[firstChildKey].markaid)
                            .attr('markaName', cmarka[firstChildKey].markaName)
                            .appendTo('.markaHolder');
                    }


                    function suggestMarkaHovered(d) {

                        var currentMenuSelector = $(d);
                        currentMenuSelector.addClass('overed');
                        currentMenuSelector.find('.nano-content').empty();
                        var markaid = currentMenuSelector.attr('markaid');
                        var markaName = currentMenuSelector.text();
                        var modelsList = $('#modelSet_' + currentMenuSelector.attr('markaid')).find('.nano-content')
                            .html('Завантажую...');


                        if (markaid in markaCache) {
                            showModelsInMarka(markaCache[markaid]);
                            return;
                        }
                        $.ajax({
                            type: "post",
                            dataType: "json",
                            url: serverUrl + '/ajax/getModelAuto/' + currentMenuSelector.attr('markaid'),
                            success: showModelsInMarka
                        });
                        function showModelsInMarka(data) {
                            modelsList.empty();
                            markaCache[markaid] = data;
                            for (var i in data) {
                                $('<div>')
                                    .addClass('modelSelector')
                                    .attr('modelid', data[i].New_avto_modelId)
                                    .attr('markaid', markaid)
                                    .html(markaName + ' ' + data[i].New_avto_model)
                                    .appendTo(modelsList);
                            }

                            currentMenuSelector.parent().find('.modelsList').hide();
                            currentMenuSelector.find('.modelsList').show();
                            currentMenuSelector.find('.modelsList .nano-content').show();
                            $(".modelsList.nano").nanoScroller();
                        }
                    }

                    function suggestMarkaLeaved(d) {
                        var currentMenuSelector = $(d);
                        currentMenuSelector.removeClass('overed');
                        currentMenuSelector.find('.modelsList .nano-content').empty().hide();
                        currentMenuSelector.find('.modelsList').hide();
                    }

                    $(".markaHolder").menuAim({
                        activate: suggestMarkaHovered,
                        deactivate: suggestMarkaLeaved,
                        //enter: suggestMarkaHovered,
                        exit: function (d) {
                            setTimeout(function () {
                                $(d).find('.modelsList.nano-content').empty().hide();
                            }, 300);
                        },
                        rowSelector: "> .markaMenu"
                    });
                    suggestHolder.slideDown('');
                } else {
                    suggestHolder.empty();
                }
            } else {
                suggestHolder.empty();
            }
            suggestPlaceNotFoundLink();
        }

        function suggestPlaceNotFoundLink() {

            if ($('#autoNotFoundLink').size()) return;
            $('<a href="javascript:void(0)" id="autoNotFoundLink"></a>')
                .html('Такої марки/моделі немає у списку')
                .on('click', function () {
                    var result = suggestTarget.val().split(' ');
                    var markastring = result[2] !== 'undefined' ? result[0] + ' ' + result[1] : result[0];
                    var modelstring = suggestTarget.val().replace(markastring + ' ', '');
                    suggestTarget.attr('manualmodel', true);
                    suggestTarget.attr('markaid', false);
                    suggestTarget.attr('modelid', false);
                    $('[name="av_marka_string[' + productKey + ']"]').val(markastring).trigger('change');
                    $('[name="nomarka[' + productKey + ']"]').prop('checked', true).trigger('change');
                    $('[name="av_model_string[' + productKey + ']"]').val(modelstring).trigger('change');
                    $('[name="nomodel[' + productKey + ']"]').prop('checked', true).trigger('change');
                })
                .appendTo(suggestHolder);
        }

        function placeSuggestHolder() {
            if (!suggestHolder) {
                suggestHolder = $('<div id="autoModelSuggestBox">')
                    .css({
                        'width': suggestTarget.width()
                    })
                    .on('click', '.modelSelector', function () {
                        $('[name="auto_marka[' + productKey + ']"]').val($(this).attr('markaid')).trigger('change');
                        $('[name="auto_model[' + productKey + ']"]').attr('data-value', $(this).attr('modelid'));
                        chosenMarka = $(this).attr('markaName');
                        suggestTarget.val($(this).text().trim());

                        suggestTarget.attr('manualmodel', false);
                        suggestTarget.attr('markaid', $(this).attr('markaid'));
                        suggestTarget.attr('modelid', $(this).attr('modelid'));
                        suggestHolder.slideUp('');
                        suggestTarget.on('click', function () {
                            suggestHolder.slideDown('');
                        });
                    })
                    .on('mouseleave', '.markaMenu', function () {
                        $(this).find('.modelsList').hide();
                    })
                    .on('mouseover', '.markaMenu', function () {
                        $(this).find('.modelsList').show();
                    })
                    .attr('tabindex', '-1')
                    .on("focusout", function () {
                        setTimeout(function () {
                            if (document.activeElement.getAttribute('data-name') !== 'markamodel[]') {
                                suggestHolder.slideUp('');
                            }
                        }, 200);
                    })
                    .insertAfter(suggestTarget);

            } else {
                suggestHolder.empty();
            }
        }

        function loadAutoMarka() {
            var markaselector = $('select[data-name="auto_marka[]"]');


            $.ajax({
                url: serverUrl + '/ajax/getMarkaAuto'
                , type: 'post'
                , success: function (data) {
                    data.sort();
                    for (var i in data)
                        markaselector.append('<option value=' + data[i].New_avto_markaId + '>' + data[i].New_avto_marka + '</option>');
                    markaselector
                        .on('change', populateModelSelect);
                    if (markaselector.attr('data-value') != '') {
                        markaselector.find('option[value="' + markaselector.attr('data-value') + '"]').prop('selected', true);
                        markaselector.trigger('change');
                    } else {
                        markaselector.find('option:eq(0)').prop('selected', true);
                    }
                }
            });
        }

        function populateModelSelect() {
            $.ajax({
                type: "post",
                dataType: "json",
                url: serverUrl + '/ajax/getModelAuto/' + this.value,
                success: function (data) {
                    var selectedmodel = makeOrderForm.find('select[data-name="auto_model[]"]');
                    selectedmodel.empty();
                    for (i in data) {
                        selectedmodel.append('<option value="' + data[i].New_avto_modelId + '">' + data[i].New_avto_model + '</option>');
                    }
                    selectedmodel.prepend('<option disabled>Выберите модель автомобиля</option>');

                    if (selectedmodel.attr('data-value') != '') {
                        selectedmodel.find('option[value="' + selectedmodel.attr('data-value') + '"]').prop('selected', true);
                        selectedmodel.trigger('change');
                    } else {
                        selectedmodel.find('option:eq(0)').prop('selected', true);
                    }


                }
            });
        }

        addValidate();
        function addValidate() {
            $('.validateMe').each(function () {
                if ($(this).val() === 'null' || $(this).val() === 'NaN') {
                    $(this).val('');
                }
            });

            $.validator.addMethod("autoCompleteCity", function (value, element) {
                return element.getAttribute('data-id') !== null;
            }, Mustache.render('{{order_validation_autoCompleteCity}}', translation));
            $.validator.addMethod("uatel", function (value, element) {
                return this.optional(element) || /(^0(99|98|97|96|95|94|93|92|91|68|67|66|63|73|50|39)[0-9]{7}$)/.test(value);
            }, Mustache.render('{{order_validation_tel}}', translation));
            $.validator.addMethod("vin", function (value, element) {
                var re = new RegExp("^[A-HJ-NPR-Z\\d]{8}[\\dX][A-HJ-NPR-Z\\d]{2}\\d{6}$");
                return true || Boolean(value.match(re)) || value === 'Б/Н';
            }, Mustache.render('{{order_validation_vin}}', translation));

            $.validator.addMethod("crmdate", function (value, element) {
                return this.optional(element) || /^\d{4}-((0\d)|(1[012]))-(([012]\d)|3[01])$/.test(value);
            }, Mustache.render('{{order_validation_crmdate}}', translation));
        }

        $('<div class="col-lg-3">')
            .append('' + Mustache.render('{{order_auto_gos_nomer}}', translation) + '<br>' +
                '<div class="controls">' +
                '<input type=text name=auto_number[] data-name=auto_number[] maxlength=8 minlength=2 required class="form-control validateMe"  value="">' +
                '</div>')
            .appendTo(autoBlock);
        $('<div class="col-lg-3">')
            .append('' + Mustache.render('{{order_auto_vin_nomer}}', translation) + '<br>' +
                '<div class="controls">' +
                '<input type=text name=auto_vin[] data-name=auto_vin[] vin=true maxlength=17 minlength=2 required class="form-control validateMe"  value="">' +
                '</div>')
            .appendTo(autoBlock);
        $('<div class="col-lg-3">')
            .append('' + Mustache.render('{{order_auto_mfg_year}}', translation) + '<br>' +
                '<div class="controls">' +
                '<input type=text name=auto_year[] data-name=auto_year[] digits=true min=1920 max="' + (new Date()).getFullYear() + '" required class="form-control validateMe"  value="">' +
                '</div>')
            .appendTo(autoBlock);
        $('<div class="col-lg-3">')
            .append('' + Mustache.render('{{order_auto_engine_volume}}', translation) + '<br>' +
                '<div class="controls">' +
                '<input type=text name=auto_volume[] data-name=auto_volume[] digits=true maxlength=5 minlength=3 required class="form-control validateMe"  value="">' +
                '</div>')
            .appendTo(autoBlock);

        var new_ts_type = $('select[name="new_ts_type"]').val();

        if ((new_ts_type === DictionaryV.erpc_vehicle_type_trucks) || (new_ts_type === DictionaryV.new_ts_type_c1) || (new_ts_type === DictionaryV.new_ts_type_c2)) {
            console.log('trucks');
            $('<div class="col-lg-3">')
                .append('' + Mustache.render('{{order_label_full_mass}}', translation) + '<br>' +
                    '<div class="controls">' +
                    '<input type=text name=erpc_full_weight[] data-name=erpc_full_weight[] maxlength=5 minlength=3 digits=true required class="form-control validateMe"  value="">' +
                    '</div>')
                .appendTo(autoBlock);
            $('<div class="col-lg-3">')
                .append('' + Mustache.render('{{order_label_net_mass}}', translation) + '<br>' +
                    '<div class="controls">' +
                    '<input type=text name=erpc_net_weight[] data-name=erpc_net_weight[] maxlength=5 minlength=3 digits=true required class="form-control validateMe"  value="">' +
                    '</div>')
                .appendTo(autoBlock);

        }
        if ((new_ts_type === DictionaryV.erpc_vehicle_type_bus) || (new_ts_type === DictionaryV.new_ts_type_d1) || (new_ts_type === DictionaryV.new_ts_type_d2)) {
            console.log('bus');
            $('<div class="col-lg-3">')
                .append('' + Mustache.render('{{order_label_seats}}', translation) + '<br>' +
                    '<div class="controls">' +
                    '<input type=text name=av_seats[] data-name=av_seats[] maxlength=2 minlength=1 digits=true required class="form-control validateMe"  value="">' +
                    '</div>')
                .appendTo(autoBlock);
        }

        var tehpassport = $('<div>')
            .html('<div class="col-lg-12 orderStepName">' + Mustache.render('{{order_label_tehpassport}}', translation) + '</div>')
            .appendTo(autoBlock);
        $('<div class="col-lg-3">')
            .append('' + Mustache.render('{{order_label_tehpassport_series}}', translation) + '<br>' +
                '<input type=text name=techpassport_code[] data-name=techpassport_code[] maxlength=3 minlength=1 required class="validateMe doc_code form-control"  value="">')
            .appendTo(tehpassport);
        $('<div class="col-lg-3">')
            .append('' + Mustache.render('{{order_label_tehpassport_number}}', translation) + '<br>' +
                '<input type=text name=techpassport_number[] data-name=techpassport_number[] maxlength=10 minlength=2 required class="validateMe doc_number form-control"  value="">')
            .appendTo(tehpassport);

        //policy info
        var policyinfo = $('<div>')
            .html('<div class="col-lg-12 orderStepName">' + Mustache.render('{{order_label_policy_info}}', translation) + '</div>')
            .addClass('row')
            .addClass('stepItem')
            .addClass('policyinfo')
            .appendTo(makeOrderForm);
        $('<div class="col-lg-12">')
            .append('' + Mustache.render('{{order_nub_allowed}}', translation) + '<br>' +
                '<div class="controls selectWrap">' +
                '<select class="form-control " name="allow3yearuser[]" data-name=allow3yearuser[]>' +
                '<option value="true">' + Mustache.render('{{order_nub_allowed_yes}}', translation) + '</option>' +
                '<option value="true">' + Mustache.render('{{order_nub_allowed_no}}', translation) + '</option>' +
                '</select>' +
                '</div>')
            .appendTo(policyinfo);
        $('<div class="col-lg-3">')
            .append('' + Mustache.render('{{order_policy_term}}', translation) + '<br>' +
                '<input type="text" maxlength="2000"  data-name="polis_start[]" name="polis_start[]" class="form-control datepickerTerm validateMe"  crmdate="true">' +
                '<input  type="text" data-name="polis_finish[]" name=polis_finish[] disabled class="form-control ">' +
                '<input type=hidden data-name=new_insurance_term[] name=new_insurance_term[] value="99c7ab95-0c4a-e311-b42a-00155d001525">')
            .appendTo(policyinfo);

        var month = ((new Date()).getMonth() + 1);
        var date = (new Date()).getDate();
        if (month < 10) month = '0' + month;
        if (date < 10) date = '0' + date;
        $(".datepickerTerm")
            .datepicker({
                changeMonth: true, minDate: 0, dateFormat: 'yy-mm-dd'
            })
            .val((new Date()).getFullYear() + '-' + month + '-' + date)
            .on('change', function () {
                var id = "a";
                setEndTerm(id, $(this).val());
            });

        $('input[name="polis_finish[]"]').val(setEndTerm("a", $('input[name="polis_start[]"]').val()))


        function setEndTerm(basketcounter, user_date) {
            // var parentDiv = $('div[data-id=' + basketcounter + ']');
            var parentDiv = $('#makeOrderForm');
            var start_date = user_date || formatDate(new Date());
            getEndTermFromServer(start_date, parentDiv);
            if (!user_date) {
                parentDiv.find('.datepicker').val(start_date);
                var currentTime = new Date();
                currentTime.setHours((new Date()).getHours() + 1);
                parentDiv.find('input[data-name="polis_time_start[]"]').val(currentTime.getHours() + ':' + currentTime.getMinutes());
            } else {
                parentDiv.find('input[data-name="polis_time_start[]"]').val('00:00');
            }
        }

        function getEndTermFromServer(start_date, currentDiv) {
            var termId = currentDiv.find('input[data-name="new_insurance_term[]"]').val();
            if (termId != 'another') {
                $.ajax({
                    url: serverUrl + '/ajax/getTermEnd',
                    data: {start_date: start_date, term: termId},
                    type: 'post',
                    dataType: 'json',
                    success: function (data) {
                        var st_date = new Date(start_date);
                        var finish_date = new Date();
                        if (data.term_length >= 1) {
                            finish_date.setMonth(st_date.getMonth() + data.term_length);
                            finish_date.setDate(st_date.getDate() - 1);
                        } else {
                            finish_date.setDate(st_date.getDate() + (30 * parseFloat(data.term_length)));
                        }
                        currentDiv.find('input[data-name="polis_finish[]"]').val(formatDate(finish_date));
                    }
                });
            } else {
                currentDiv.find('input[data-name="polis_finish[]"]').val(currentDiv.find('input[data-name="another_date_finish[]"]').val());
                currentDiv.find('input[data-name="polis_start[]"]').val(currentDiv.find('input[data-name="another_date_start[]"]').val());
            }
        }

        function formatDate(dateToFormat) {
            var month = (dateToFormat.getMonth() + 1);
            var date = dateToFormat.getDate();
            if (month < 10) month = '0' + month;
            if (date < 10) date = '0' + date;
            var formattedDate = dateToFormat.getFullYear() + '-' + month + '-' + date;
            return formattedDate;
        }

        $('<a href="javascript:void(0)" class="btn btn-primary" id="makeOrder">' + Mustache.render('{{travel_btn_SendRequest}}', translation) + '</a>')
            .appendTo(makeOrderForm)
            .on('click', makeOrder);
        function makeOrder() {
            orderSubmit();
        }

        function initOrderValidation() {

            var rules = {
                'contactLastName': {
                    required: true,
                    // lettersonly: true
                },
                'contactFirstName': {
                    required: true
                },
                'contactMiddleName': {
                    required: true
                },
                'contactMob': {
                    required: true
                    , uatel: true
                },
                'contactIpn': {
                    minlength: 10,
                    maxlength: 10,
                    digitsonly: true
                },
                'delivery_office': {
                    required: true
                },
                'delivery_city': {
                    required: true
                },
                'delivery_address': {
                    required: true
                }
            };
            $('#makeOrderForm .insuredPersonDocuments').each(function (index) {
                var tempRules = {};
                tempRules['firstname[' + index + ']'] = {
                    required: true,
                    lettersonly: true
                };
                tempRules['lastname[' + index + ']'] = {
                    required: true,
                    lettersonly: true
                };
                tempRules['ipn[' + index + ']'] = {
                    minlength: 10,
                    maxlength: 10,
                    digitsonly: true
                };
                tempRules['fp_series[' + index + ']'] = {
                    required: true,
                    lettersonly: true,
                    maxlength: 3
                };
                tempRules['fp_number[' + index + ']'] = {
                    required: true,
                    maxlength: 8,
                    digitsonly: true
                };
                $.extend(rules, tempRules);
            });
            var validationRules = {
                lang: "ru",
                //  ignore: "",
                rules: rules
            };
            $('#makeOrderForm').validate(validationRules);
        }

        function orderSubmit() {

            initOrderValidation();
            if ($('#makeOrderForm').valid()) {
                placePreloader('' + Mustache.render('{{travel_waitingRequest}}', translation) + '');
                clearFormBeforeSubmit();
                console.log('ready to sent');
            }
        }

        function clearFormBeforeSubmit() {
            var value = $('[name="contactMob"]').val();
            $('[name="contactMob"]').attr('original-value', value);
            value = value.replace(/-/g, '');
            value = value.replace('(', '');
            value = value.replace(')', '');
            value = value.replace('+38', '');
            $('[name="contactMob"]').val(value)
        }
    }
});

