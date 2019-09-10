import { transports, createLogger, format, Logger, LeveledLogMethod } from "winston";
import config                                                         from "@terryweiss/config";
import * as colors                                                    from "colors/safe";
import * as moment                                                    from "moment";
import { isEmpty }                                                    from "lodash";
import { inspect }                                                    from "util";

const { SPLAT } = require( "triple-beam" );

// import {format} from "logform";
config.option( {
	name       : "logLevel",
	flag       : "log-level",
	default    : "info",
	description: "The logging level determines how detailed the log is. Debug is the most detailed and error is tha the other where it only displays errors",
	choices    : [ "error", "warn", "notice", "info", "trace", "debug" ]

} );

/**
 * Defines our standard logging levels
 * @private
 * @type {{levels: {error: number, warn: number, notice: number, info: number, trace: number, debug: number}, colors: {error: string, warn: string, notice: string, info: string,
 *     trace: string, debug: string}}}
 */
const c2klevels = {
	levels: {
		error : 0,
		warn  : 1,
		notice: 2,
		info  : 3,
		trace : 4,
		debug : 5
	},

	colors: {
		error : "red",
		warn  : "yellow",
		notice: "green",
		info  : "white",
		trace : "cyan",
		debug : "magenta"
	}
};

interface ILogger extends Logger {
	trace: LeveledLogMethod;
}

export function getLogger( name: string ): ILogger {
	const logger = createLogger( {
		levels: c2klevels.levels,
		level : config.logLevel,

		format    : format.combine(
			format.ms()
		),
		transports: [
			new transports.Console( {
				format           : format.printf( ( info ) => {
					let color = colors.white;
					switch ( info.level ) {
						case "debug":
							color = colors.magenta;
							break;
						case "trace":
							color = colors.cyan;
							break;
						case "info":
							color = colors.white;
							break;
						case "notice":
							color = colors.green;
							break;
						case "error":
							color = colors.red;
							break;
						case "warn":
							color = colors.yellow;
							break;

					}
					const { level, message, meta, ms } = info;

					const params = info[ SPLAT ];

					const pa = isEmpty( params ) ? "" : `\n---\n${inspect( params, {
						depth         : 10,
						colors        : true,
						maxArrayLength: 20,
						sorted        : true
					} )}`;

					return `${colors.blue( moment.utc().format( "L HH:mm:ss:SS" ) )} \
${name} ${color( level )}: \
${colors.white( message )} \
${pa} \
${info.ms}`;
				} ),
				level            : config.logLevel,
				stderrLevels     : [ "error" ],
				consoleWarnLevels: [ "warn" ]
			} )
			// new transports.Console({level: "error", format: format.errors({stack: true})})
		]
	} );

	return <ILogger>logger;
}
