"use strict";
/**
 * 亞洲料理成分識別系統 - 核心類型定義
 *
 * 此文件定義了成分識別系統所需的所有核心類型、枚舉和接口
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentCategory = exports.CookingMethod = exports.DishType = void 0;
/**
 * 料理類型枚舉
 */
var DishType;
(function (DishType) {
    DishType["SOUP"] = "soup";
    DishType["FRIED_RICE"] = "fried_rice";
    DishType["STIR_FRY"] = "stir_fry";
    DishType["BENTO"] = "bento";
    DishType["NOODLES"] = "noodles";
    DishType["DUMPLING"] = "dumpling";
    DishType["BARBECUE"] = "barbecue";
    DishType["HOT_POT"] = "hot_pot";
    DishType["CURRY"] = "curry";
    DishType["UNKNOWN"] = "unknown"; // 未知類型
})(DishType || (exports.DishType = DishType = {}));
/**
 * 烹飪方式枚舉
 */
var CookingMethod;
(function (CookingMethod) {
    CookingMethod["RAW"] = "raw";
    CookingMethod["BOILED"] = "boiled";
    CookingMethod["FRIED"] = "fried";
    CookingMethod["DEEP_FRIED"] = "deep_fried";
    CookingMethod["STEAMED"] = "steamed";
    CookingMethod["GRILLED"] = "grilled";
    CookingMethod["BRAISED"] = "braised";
    CookingMethod["STIR_FRIED"] = "stir_fried";
    CookingMethod["PICKLED"] = "pickled"; // 醃製
})(CookingMethod || (exports.CookingMethod = CookingMethod = {}));
/**
 * 成分類別枚舉
 */
var ComponentCategory;
(function (ComponentCategory) {
    ComponentCategory["GRAIN"] = "grain";
    ComponentCategory["PROTEIN"] = "protein";
    ComponentCategory["VEGETABLE"] = "vegetable";
    ComponentCategory["SEASONING"] = "seasoning";
    ComponentCategory["SAUCE"] = "sauce";
    ComponentCategory["GARNISH"] = "garnish"; // 配菜/裝飾
})(ComponentCategory || (exports.ComponentCategory = ComponentCategory = {}));
