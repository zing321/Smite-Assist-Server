//Server commands
var DB_COMMAND_PATH = 'cloud/commands/database/';

require(DB_COMMAND_PATH + 'UpdateTables.js');

//Client commands
var CLIENT_COMMAND_PATH = 'cloud/commands/client/';

require(CLIENT_COMMAND_PATH + 'GeneralCommands.js');
