var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export var AppUserType;
(function (AppUserType) {
    AppUserType["Company"] = "Company";
    AppUserType["Location"] = "Location";
})(AppUserType || (AppUserType = {}));
export var TokenType;
(function (TokenType) {
    TokenType["Bearer"] = "Bearer";
})(TokenType || (TokenType = {}));
/* The Model class is responsible for saving and retrieving installation details, access tokens, and
refresh tokens. */
export class Model {
    constructor() {
        this.installationObjects = {};
    }
    /**
     * The function saves installation information based on either the location ID or the company ID.
     * @param {InstallationDetails} details - The `details` parameter is an object of type
     * `InstallationDetails`.
     */
    saveInstallationInfo(details) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(details);
            if (details.locationId) {
                this.installationObjects[details.locationId] = details;
            }
            else if (details.companyId) {
                this.installationObjects[details.companyId] = details;
            }
        });
    }
    /**
     * The function `getAccessToken` returns the access token associated with a given resource ID i.e companyId or locationId from the
     * `installationObjects` object.
     * @param {string} resourceId - The `resourceId` parameter is a string that represents either locationId or companyId
     * It is used to retrieve the access token associated with that resource.
     * @returns The access token associated with the given resourceId.
     */
    getAccessToken(resourceId) {
        var _a;
        return (_a = this.installationObjects[resourceId]) === null || _a === void 0 ? void 0 : _a.access_token;
    }
    /**
     * The function sets an access token for a specific resource ID in an installation object.
     * @param {string} resourceId - The resourceId parameter is a string that represents the unique
     * identifier of a resource. It is used to identify a specific installation object in the
     * installationObjects array.
     * @param {string} token - The "token" parameter is a string that represents the access token that you
     * want to set for a specific resource.
     */
    setAccessToken(resourceId, token) {
        if (this.installationObjects[resourceId]) {
            this.installationObjects[resourceId].access_token = token;
        }
    }
    /**
     * The function `getRefreshToken` returns the refresh_token associated with a given location or company from the
     * installationObjects object.
     * @param {string} resourceId - The resourceId parameter is a string that represents the unique
     * identifier of a resource.
     * @returns The companyId associated with the installation object for the given resourceId.
     */
    getRefreshToken(resourceId) {
        var _a;
        return (_a = this.installationObjects[resourceId]) === null || _a === void 0 ? void 0 : _a.refresh_token;
    }
    /**
     * The function saves the refresh token for a specific resource i.e. location or company.
     * @param {string} resourceId - The resourceId parameter is a string that represents the unique
     * identifier of a resource. It is used to identify a specific installation object in the
     * installationObjects array.
     * @param {string} token - The "token" parameter is a string that represents the refresh token. A
     * refresh token is a credential used to obtain a new access token when the current access token
     * expires. It is typically used in authentication systems to maintain a user's session without
     * requiring them to re-enter their credentials.
     */
    setRefreshToken(resourceId, token) {
        if (this.installationObjects[resourceId]) {
            this.installationObjects[resourceId].refresh_token = token;
        }
    }
}
