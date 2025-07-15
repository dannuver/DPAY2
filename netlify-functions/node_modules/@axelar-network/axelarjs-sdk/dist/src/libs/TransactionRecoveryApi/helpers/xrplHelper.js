"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseToken = parseToken;
exports.hex = hex;
exports.convertRpcUrltoWssUrl = convertRpcUrltoWssUrl;
const xrpl_1 = require("xrpl");
function parseToken(token, amount) {
    if (token === "XRP") {
        return (0, xrpl_1.xrpToDrops)(amount).toString();
    }
    else {
        const [currency, issuer] = token.split(".");
        return {
            currency,
            issuer,
            value: amount,
        };
    }
}
function hex(value) {
    return Buffer.from(value).toString("hex");
}
function convertRpcUrltoWssUrl(rpcUrl) {
    const url = new URL(rpcUrl);
    url.protocol = "wss:";
    url.port = ""; // Remove port
    return url.toString();
}
//# sourceMappingURL=xrplHelper.js.map