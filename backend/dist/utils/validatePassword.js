"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePassword = void 0;
exports.validatePassword = (password) => {
    if (password.length <= 5) {
        return [
            {
                field: "password",
                message: "length must be greater than five",
            },
        ];
    }
    return null;
};
//# sourceMappingURL=validatePassword.js.map