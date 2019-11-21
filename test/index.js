"use strict";
process.env.LOG_LEVEL = "debug";
const cfg = require( "@terryweiss/config" ).default;




const lo          = require( "../dist/" );
// const tap         = require( "tap" );
cfg.load();
// console.info( lo.verbosity( 0 ) );

let log = lo.getLogger( "ccl" );
log.debug( "I'm a debug output",{
    "glossary": {
        "title": "example glossary",
        "GlossDiv": {
            "title": "S",
            "GlossList": {
                "GlossEntry": {
                    "ID": "SGML",
                    "SortAs": "SGML",
                    "GlossTerm": "Standard Generalized Markup Language",
                    "Acronym": "SGML",
                    "Abbrev": "ISO 8879:1986",
                    "GlossDef": {
                        "para": "A meta-markup language, used to create markup languages such as DocBook.",
                        "GlossSeeAlso": ["GML", "XML"]
                    },
                    "GlossSee": "markup"
                }
            }
        }
    }
}, {
    "debug": "on",
    "window": {
        "title": "Sample Konfabulator Widget",
        "name": "main_window",
        "width": 500,
        "height": 500
    },
    "image": {
        "src": "Images/Sun.png",
        "name": "sun1",
        "hOffset": 250,
        "vOffset": 250,
        "alignment": "center"
    },
    "text": {
        "data": "Click Here",
        "size": 36,
        "style": "bold",
        "name": "text1",
        "hOffset": 250,
        "vOffset": 100,
        "alignment": "center",
        "onMouseUp": "sun1.opacity = (sun1.opacity / 100) * 90;"
    }
} );
log.trace( "I'm a trace output" );
log.info( "I'm an info output" );
log.notice( "I'm a notice output" );
log.warn( "I'm a warn output" );
log.error( "I'm an error output" );

// logger = lo.getLogger( "ccl:trace" );
// logger.error( "error" );
// logger.info( "log" );
// logger.trace( "data" );

