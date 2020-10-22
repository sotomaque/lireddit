"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("src/constants");
exports.default = {
    type: "postgres",
    database: "lireddit2",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: !constants_1.__prod__,
};
//# sourceMappingURL=typeormConfig.js.map