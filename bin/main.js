const PostgresqlSetup = require('./postgresql/postgres-setup');
const SQLServerSetup = require('./sqlserver/sqlserver-setup');

(async function main() {
	const CONFIG = Object.freeze({
		image: process.env.INPUT_IMAGE,
		port: process.env.INPUT_PORT,
		username: process.env.INPUT_USERNAME,
		password: process.env.INPUT_PASSWORD,
		database: process.env.INPUT_DATABASE
	});

	const validationError = validateSetup(CONFIG);
	if (validationError) {
		throw new Error(validationError);
	}

	let setup;
	if (CONFIG.image.toLowerCase().includes('postgres')) {
		setup = PostgresqlSetup.setupPostgres;
	} else if (CONFIG.image.toLowerCase().includes('mssql')) {
		setup = SQLServerSetup.setupSQLServer;
	}

	if (!setup) {
		console.error(`unsupported image/DB '${CONFIG.image}', exiting`);
		process.exit(1);
	}

	try {
		await setup(CONFIG);
	} catch (e) {
		console.error(`setup failed:`);
		console.error(e);
		process.exit(1);
	}
})();

function validateSetup(setup) {
	if (!setup.image) {
		return `invalid 'image' parameter: [${setup.image}]`;
	}
	if (!setup.port || isNaN(parseInt(setup.port))) {
		return `invalid 'port' parameter: [${setup.port}]`;
	}
	if (!setup.username) {
		return `invalid 'username' parameter: [${setup.username}]`;
	}
	if (!setup.password) {
		return `invalid 'password' parameter: [${setup.password}]`;
	}
	if (!setup.database) {
		return `invalid 'database' parameter: [${setup.database}]`;
	}
	return null;
}