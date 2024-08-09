var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import qs from "qs";
import axios from "axios";
import { Model, TokenType } from "./model";
/* The GHL class is responsible for handling authorization, making API requests, and managing access
tokens and refresh tokens for a specific resource. */
export class GHL {
    constructor() {
        this.model = new Model();
    }
    /**
     * The `authorizationHandler` function handles the authorization process by generating an access token
     * and refresh token pair.
     * @param {string} code - The code parameter is a string that represents the authorization code
     * obtained from the authorization server. It is used to exchange for an access token and refresh token
     * pair.
     */
    authorizationHandler(code) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!code) {
                console.warn("Please provide code when making call to authorization Handler");
            }
            yield this.generateAccessTokenRefreshTokenPair(code);
        });
    }
    decryptSSOData(key) {
        const data = CryptoJS.AES.decrypt(key, process.env.GHL_APP_SSO_KEY).toString(CryptoJS.enc.Utf8);
        return JSON.parse(data);
    }
    /**
     * The function creates an instance of Axios with a base URL and interceptors for handling
     * authorization and refreshing access tokens.
     * @param {string} resourceId - The `resourceId` parameter is a string that represents the locationId or companyId you want
     * to make api call for.
     * @returns an instance of the Axios library with some custom request and response interceptors.
     */
    requests(resourceId) {
        const baseUrl = process.env.GHL_API_DOMAIN;
        if (!this.model.getAccessToken(resourceId)) {
            throw new Error("Installation not found for the following resource");
        }
        const axiosInstance = axios.create({
            baseURL: baseUrl,
        });
        axiosInstance.interceptors.request.use((requestConfig) => __awaiter(this, void 0, void 0, function* () {
            try {
                requestConfig.headers["Authorization"] = `${TokenType.Bearer} ${this.model.getAccessToken(resourceId)}`;
            }
            catch (e) {
                console.error(e);
            }
            return requestConfig;
        }));
        axios.interceptors.response.use((response) => response, (error) => {
            const originalRequest = error.config;
            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                return this.refreshAccessToken(resourceId).then(() => {
                    originalRequest.headers.Authorization = `Bearer ${this.model.getAccessToken(resourceId)}`;
                    return axios(originalRequest);
                });
            }
            return Promise.reject(error);
        });
        return axiosInstance;
    }
    /**
     * The function checks if an installation exists for a given resource ID i.e locationId or companyId.
     * @param {string} resourceId - The `resourceId` parameter is a string that represents the ID of a
     * resource.
     * @returns a boolean value.
     */
    checkInstallationExists(resourceId) {
        return !!this.model.getAccessToken(resourceId);
    }
    /**
     * The function `getLocationTokenFromCompanyToken` retrieves a location token from a company token and
     * saves the installation information.
     * @param {string} companyId - A string representing the ID of the company.
     * @param {string} locationId - The `locationId` parameter is a string that represents the unique
     * identifier of a location within a company.
     */
    getLocationTokenFromCompanyToken(companyId, locationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.requests(companyId).post("/oauth/locationToken", {
                companyId,
                locationId,
            }, {
                headers: {
                    Version: "2021-07-28",
                },
            });
            this.model.saveInstallationInfo(res.data);
        });
    }
    refreshAccessToken(resourceId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const resp = yield axios.post(`${process.env.GHL_API_DOMAIN}/oauth/token`, qs.stringify({
                    client_id: process.env.GHL_APP_CLIENT_ID,
                    client_secret: process.env.GHL_APP_CLIENT_SECRET,
                    grant_type: "refresh_token",
                    refresh_token: this.model.getRefreshToken(resourceId),
                }), { headers: { "content-type": "application/x-www-form-urlencoded" } });
                this.model.setAccessToken(resourceId, resp.data.access_token);
                this.model.setRefreshToken(resourceId, resp.data.refresh_token);
            }
            catch (error) {
                console.error((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data);
            }
        });
    }
    generateAccessTokenRefreshTokenPair(code) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const resp = yield axios.post(`${process.env.GHL_API_DOMAIN}/oauth/token`, qs.stringify({
                    client_id: process.env.GHL_APP_CLIENT_ID,
                    client_secret: process.env.GHL_APP_CLIENT_SECRET,
                    grant_type: "authorization_code",
                    code,
                }), { headers: { "content-type": "application/x-www-form-urlencoded" } });
                this.model.saveInstallationInfo(resp.data);
            }
            catch (error) {
                console.error((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data);
            }
        });
    }
}
