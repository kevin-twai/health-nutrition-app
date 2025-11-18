"use strict";
/**
 * 亞洲料理知識庫類型定義
 * Asian Cuisine Knowledge Base Type Definitions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookingMethod = exports.CuisineType = exports.FoodCategory = void 0;
// ==================== 枚舉類型 ====================
/**
 * 食材類別
 */
var FoodCategory;
(function (FoodCategory) {
    FoodCategory["BEAN_PRODUCTS"] = "\u8C46\u88FD\u54C1";
    FoodCategory["VEGETABLES"] = "\u852C\u83DC";
    FoodCategory["LEAFY_GREENS"] = "\u8449\u83DC\u985E";
    FoodCategory["ROOT_VEGETABLES"] = "\u6839\u8396\u985E";
    FoodCategory["MUSHROOMS"] = "\u83C7\u985E";
    FoodCategory["PROTEINS"] = "\u86CB\u767D\u8CEA";
    FoodCategory["SEAFOOD"] = "\u6D77\u9BAE";
    FoodCategory["GRAINS"] = "\u7A40\u7269";
    FoodCategory["NOODLES"] = "\u9EB5\u98DF";
    FoodCategory["RICE_PRODUCTS"] = "\u7C73\u88FD\u54C1";
    FoodCategory["SAUCES"] = "\u91AC\u6C41";
    FoodCategory["CONDIMENTS"] = "\u8ABF\u5473\u6599";
    FoodCategory["PICKLES"] = "\u9183\u6F2C\u7269";
    FoodCategory["MIXED_DISH"] = "\u6DF7\u5408\u83DC\u991A";
    FoodCategory["SOUP"] = "\u6E6F\u54C1";
    FoodCategory["TAIWANESE_SPECIALTY"] = "\u53F0\u7063\u7279\u8272";
    FoodCategory["INDIGENOUS_FOOD"] = "\u539F\u4F4F\u6C11\u98DF\u6750";
    FoodCategory["FRUITS"] = "\u6C34\u679C";
    FoodCategory["MEAT"] = "\u8089\u985E";
    FoodCategory["POULTRY"] = "\u79BD\u985E";
    FoodCategory["EGGS"] = "\u86CB\u985E";
    FoodCategory["TOFU"] = "\u8C46\u8150\u985E";
    FoodCategory["DRIED_GOODS"] = "\u4E7E\u8CA8";
    FoodCategory["HERBS_SPICES"] = "\u9999\u6599\u9999\u8349";
    FoodCategory["SEAWEED"] = "\u6D77\u85FB\u985E";
})(FoodCategory || (exports.FoodCategory = FoodCategory = {}));
/**
 * 料理類型
 */
var CuisineType;
(function (CuisineType) {
    CuisineType["CHINESE"] = "\u4E2D\u5F0F";
    CuisineType["TAIWANESE"] = "\u53F0\u5F0F";
    CuisineType["JAPANESE"] = "\u65E5\u5F0F";
    CuisineType["KOREAN"] = "\u97D3\u5F0F";
    CuisineType["THAI"] = "\u6CF0\u5F0F";
    CuisineType["VIETNAMESE"] = "\u8D8A\u5F0F";
    CuisineType["CANTONESE"] = "\u7CB5\u83DC";
    CuisineType["SICHUAN"] = "\u5DDD\u83DC";
    CuisineType["HAKKA"] = "\u5BA2\u5BB6\u83DC";
    CuisineType["INDIGENOUS"] = "\u539F\u4F4F\u6C11\u6599\u7406";
    CuisineType["HOKKIEN"] = "\u95A9\u5357\u83DC";
    CuisineType["SHANGHAINESE"] = "\u4E0A\u6D77\u83DC";
    CuisineType["HUNAN"] = "\u6E58\u83DC";
})(CuisineType || (exports.CuisineType = CuisineType = {}));
/**
 * 烹飪方式
 */
var CookingMethod;
(function (CookingMethod) {
    CookingMethod["COLD_DRESSED"] = "\u6DBC\u62CC";
    CookingMethod["STIR_FRY"] = "\u5FEB\u7092";
    CookingMethod["DEEP_FRY"] = "\u6CB9\u70B8";
    CookingMethod["STEAM"] = "\u6E05\u84B8";
    CookingMethod["BOIL"] = "\u6C34\u716E";
    CookingMethod["BRAISE"] = "\u7D05\u71D2";
    CookingMethod["STEW"] = "\u71C9";
    CookingMethod["SIMMER"] = "\u6EF7";
    CookingMethod["GRILL"] = "\u71D2\u70E4";
    CookingMethod["BLANCH"] = "\u5DDD\u71D9";
    CookingMethod["ROAST"] = "\u70D8\u70E4";
    CookingMethod["SMOKE"] = "\u7159\u71FB";
    CookingMethod["RAW"] = "\u751F\u98DF";
    CookingMethod["PICKLE"] = "\u9183\u6F2C";
    CookingMethod["FERMENT"] = "\u767C\u9175";
})(CookingMethod || (exports.CookingMethod = CookingMethod = {}));
