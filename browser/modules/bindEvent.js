/**
 * @fileoverview Description of file, its uses and information
 * about its dependencies.
 */

'use strict';

/**
 *
 * @type {*|exports|module.exports}
 */
var draw;

/**
 *
 * @type {*|exports|module.exports}
 */
var advancedInfo;

/**
 *
 * @type {*|exports|module.exports}
 */
var cloud;

/**
 *
 * @type {*|exports|module.exports}
 */
var print;

/**
 *
 * @type {*|exports|module.exports}
 */
var switchLayer;

/**
 *
 * @type {*|exports|module.exports}
 */
var setBaseLayer;

/**
 *
 * @type {*|exports|module.exports}
 */
var legend;

/**
 *
 * @type {*|exports|module.exports}
 */
var meta;

/**
 *
 * @type {array}
 */
var metaDataKeys;

/**
 *
 * @type {*|exports|module.exports}
 */
var urlparser = require('./urlparser');

/**
 *
 * @type {array}
 */
var urlVars = urlparser.urlVars;

/**
 *
 * @type {showdown.Converter}
 */
var toHtml = require('showdown').Converter();

require('arrive');

var backboneEvents;

var pushState;
var layerTree;
var layers;
var infoClick;

/**
 *
 * @type {{set: module.exports.set, init: module.exports.init}}
 */
module.exports = module.exports = {
    set: function (o) {
        draw = o.draw;
        advancedInfo = o.advancedInfo;
        cloud = o.cloud;
        print = o.print;
        switchLayer = o.switchLayer;
        setBaseLayer = o.setBaseLayer;
        legend = o.legend;
        meta = o.meta;
        pushState = o.pushState;
        layerTree = o.layerTree;
        layers = o.layers;
        infoClick = o.infoClick;
        backboneEvents = o.backboneEvents;
        return this;
    },
    init: function (str) {
        metaDataKeys = meta.getMetaDataKeys();

        cloud.get().on("dragend", function () {
            pushState.init();
        });
        cloud.get().on("moveend", function () {
            pushState.init();
        });

        $("#draw-btn").on("click", function () {
            draw.control();
        });

        $("#advanced-info-btn").on("click", function () {
            advancedInfo.control();
        });

        $("#info-modal button").on("click", function () {
            $("#info-modal").hide();
        });

        backboneEvents.get().on("ready:meta", function () {
            if ($(document).width() > 767) {
                setTimeout(
                    function () {
                        $(".navbar-toggle").trigger("click");
                    }, 50
                );
            }
            layerTree.init();
            layers.init();
            $("#loadscreen").hide();
        });

        backboneEvents.get().on("off:advancedInfo on:drawing", function () {
            console.info("Stopping advanced info");
            advancedInfo.off();
        });

        backboneEvents.get().on("off:drawing on:advancedInfo", function () {
            console.info("Stopping drawing");
            draw.off();
        });

        // Info click
        backboneEvents.get().on("on:infoClick", function () {
            console.info("Activating infoClick");
            infoClick.active(true);
        });

        backboneEvents.get().on("off:infoClick", function () {
            console.info("Deactivating infoClick");
            infoClick.active(false);
        });

        backboneEvents.get().on("reset:infoClick", function () {
            console.info("Resetting infoClick");
            infoClick.reset();
        });

        // Print
        $("#print-btn").on("click", function () {
            print.activate();
            $("#get-print-fieldset").prop("disabled", true);
        });

        $("#start-print-btn").on("click", function () {
            print.print();
            $(this).button('loading');
            $("#get-print-fieldset").prop("disabled", true);
        });

        backboneEvents.get().on("off:print", function () {
            print.off();
        });

        backboneEvents.get().on("end:print", function (response) {
            $("#get-print-fieldset").prop("disabled", false);
            $("#download-pdf, #open-pdf").attr("href", "/static/tmp/print/pdf/" + response.key + ".pdf");
            $("#download-pdf").attr("download", response.key);
            $("#open-html").attr("href", response.url);
            $("#start-print-btn").button('reset');
        });


        // HACK. Arrive.js seems to mess up Wkhtmltopdf, so we don't bind events on print HTML page.
        if (!urlVars.px && !urlVars.py) {
            $(document).arrive('[data-gc2-id]', function () {
                $(this).change(function (e) {
                    switchLayer.init($(this).data('gc2-id'), $(this).context.checked);
                    e.stopPropagation();
                });
            });
            $(document).arrive('[data-gc2-base-id]', function () {
                $(this).on("click", function (e) {
                    setBaseLayer.init($(this).data('gc2-base-id'));
                    e.stopPropagation();
                    $(this).css("background-color", "white");
                });
            });
            $(document).arrive('[data-toggle="tooltip"]', function () {
                $(this).tooltip()
            });
            $(document).arrive('.info-label', function () {
                $(this).on("click", function (e) {
                    var t = ($(this).prev().children("input").data('gc2-id')), html;
                    html = (metaDataKeys[t].meta !== null && typeof $.parseJSON(metaDataKeys[t].meta).meta_desc !== "undefined" && $.parseJSON(metaDataKeys[t].meta).meta_desc !== "") ? toHtml.makeHtml($.parseJSON(metaDataKeys[t].meta).meta_desc) : metaDataKeys[t].f_table_abstract;
                    $("#info-modal").show();
                    $("#info-modal .modal-title").html(metaDataKeys[t].f_table_title || metaDataKeys[t].f_table_name);
                    $("#info-modal .modal-body").html(html);
                    legend.init([t], "#info-modal-legend");
                    e.stopPropagation();
                });

            });
        }
    }
};