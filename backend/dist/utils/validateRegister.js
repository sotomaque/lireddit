"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
exports.validateRegister = (options) => {
    if (!options.email.includes("@")) {
        return [
            {
                field: "email",
                message: "invalid email",
            },
        ];
    }
    if (options.username.length <= 2) {
        return [
            {
                field: "username",
                message: "length must be greater than two",
            },
        ];
    }
    if (options.username.includes("@")) {
        return [
            {
                field: "username",
                message: "username cannot contain @ symbol",
            },
        ];
    }
    if (options.password.length <= 5) {
        return [
            {
                field: "password",
                message: "length must be greater than five",
            },
        ];
    }
    return null;
};
//# sourceMappingURL=validateRegister.js.map