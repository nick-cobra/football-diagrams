// Generated from schema/diagram.schema.json and schema/diagram-v2.schema.json. Do not edit.
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// node_modules/ajv/dist/runtime/ucs2length.js
var require_ucs2length = __commonJS({
  "node_modules/ajv/dist/runtime/ucs2length.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function ucs2length(str) {
      const len = str.length;
      let length = 0;
      let pos = 0;
      let value;
      while (pos < len) {
        length++;
        value = str.charCodeAt(pos++);
        if (value >= 55296 && value <= 56319 && pos < len) {
          value = str.charCodeAt(pos);
          if ((value & 64512) === 56320)
            pos++;
        }
      }
      return length;
    }
    exports.default = ucs2length;
    ucs2length.code = 'require("ajv/dist/runtime/ucs2length").default';
  }
});

// validator.js
var validateFormat1 = validate20;
var func0 = Object.prototype.hasOwnProperty;
var func66 = require_ucs2length().default;
var schema34 = { "title": "DiagramObject", "type": "object", "additionalProperties": false, "properties": { "kind": { "type": "string", "enum": ["player", "opponent", "neutral", "coach", "ball", "cone", "flat_marker", "gate", "mini_goal", "goal", "mannequin", "pole", "ladder"] }, "x": { "type": "number", "minimum": -1e3, "maximum": 1e3 }, "y": { "type": "number", "minimum": -1e3, "maximum": 1e3 }, "colour": { "anyOf": [{ "$ref": "#/$defs/colour" }, { "type": "null" }] }, "label": { "anyOf": [{ "type": "string", "minLength": 1, "maxLength": 120 }, { "type": "null" }] }, "short": { "anyOf": [{ "type": "string", "minLength": 1, "maxLength": 3 }, { "type": "null" }] }, "number": { "anyOf": [{ "type": "integer", "minimum": 1, "maximum": 99 }, { "type": "null" }] }, "angle": { "anyOf": [{ "type": "number", "minimum": -360, "maximum": 360 }, { "type": "null" }] }, "width": { "anyOf": [{ "type": "number", "exclusiveMinimum": 0, "maximum": 20 }, { "type": "null" }] }, "ball": { "type": "boolean" } }, "required": ["kind", "x", "y"] };
var schema35 = { "title": "ObjectColour", "type": "string", "enum": ["red", "blue", "yellow", "green", "orange", "white", "teal"] };
function validate22(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate22.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.kind === void 0 || !func0.call(data, "kind")) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "kind" }, message: "must have required property 'kind'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.x === void 0 || !func0.call(data, "x")) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "x" }, message: "must have required property 'x'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.y === void 0 || !func0.call(data, "y")) {
      const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "y" }, message: "must have required property 'y'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    for (const key0 of Object.keys(data)) {
      if (!func0.call(schema34.properties, key0)) {
        const err3 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.kind !== void 0 && func0.call(data, "kind")) {
      let data0 = data.kind;
      if (typeof data0 !== "string") {
        const err4 = { instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
      if (!(data0 === "player" || data0 === "opponent" || data0 === "neutral" || data0 === "coach" || data0 === "ball" || data0 === "cone" || data0 === "flat_marker" || data0 === "gate" || data0 === "mini_goal" || data0 === "goal" || data0 === "mannequin" || data0 === "pole" || data0 === "ladder")) {
        const err5 = { instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/enum", keyword: "enum", params: { allowedValues: schema34.properties.kind.enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.x !== void 0 && func0.call(data, "x")) {
      let data1 = data.x;
      if (typeof data1 == "number" && isFinite(data1)) {
        if (data1 > 1e3 || isNaN(data1)) {
          const err6 = { instancePath: instancePath + "/x", schemaPath: "#/properties/x/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e3 }, message: "must be <= 1000" };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
        if (data1 < -1e3 || isNaN(data1)) {
          const err7 = { instancePath: instancePath + "/x", schemaPath: "#/properties/x/minimum", keyword: "minimum", params: { comparison: ">=", limit: -1e3 }, message: "must be >= -1000" };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = { instancePath: instancePath + "/x", schemaPath: "#/properties/x/type", keyword: "type", params: { type: "number" }, message: "must be number" };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.y !== void 0 && func0.call(data, "y")) {
      let data2 = data.y;
      if (typeof data2 == "number" && isFinite(data2)) {
        if (data2 > 1e3 || isNaN(data2)) {
          const err9 = { instancePath: instancePath + "/y", schemaPath: "#/properties/y/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e3 }, message: "must be <= 1000" };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
        if (data2 < -1e3 || isNaN(data2)) {
          const err10 = { instancePath: instancePath + "/y", schemaPath: "#/properties/y/minimum", keyword: "minimum", params: { comparison: ">=", limit: -1e3 }, message: "must be >= -1000" };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
      } else {
        const err11 = { instancePath: instancePath + "/y", schemaPath: "#/properties/y/type", keyword: "type", params: { type: "number" }, message: "must be number" };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.colour !== void 0 && func0.call(data, "colour")) {
      let data3 = data.colour;
      const _errs9 = errors;
      let valid1 = false;
      const _errs10 = errors;
      if (typeof data3 !== "string") {
        const err12 = { instancePath: instancePath + "/colour", schemaPath: "#/$defs/colour/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
      if (!(data3 === "red" || data3 === "blue" || data3 === "yellow" || data3 === "green" || data3 === "orange" || data3 === "white" || data3 === "teal")) {
        const err13 = { instancePath: instancePath + "/colour", schemaPath: "#/$defs/colour/enum", keyword: "enum", params: { allowedValues: schema35.enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
      var _valid0 = _errs10 === errors;
      valid1 = valid1 || _valid0;
      const _errs13 = errors;
      if (data3 !== null) {
        const err14 = { instancePath: instancePath + "/colour", schemaPath: "#/properties/colour/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
      var _valid0 = _errs13 === errors;
      valid1 = valid1 || _valid0;
      if (!valid1) {
        const err15 = { instancePath: instancePath + "/colour", schemaPath: "#/properties/colour/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      } else {
        errors = _errs9;
        if (vErrors !== null) {
          if (_errs9) {
            vErrors.length = _errs9;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.label !== void 0 && func0.call(data, "label")) {
      let data4 = data.label;
      const _errs16 = errors;
      let valid3 = false;
      const _errs17 = errors;
      if (typeof data4 === "string") {
        if (func66(data4) > 120) {
          const err16 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/anyOf/0/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
          if (vErrors === null) {
            vErrors = [err16];
          } else {
            vErrors.push(err16);
          }
          errors++;
        }
        if (func66(data4) < 1) {
          const err17 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/anyOf/0/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err17];
          } else {
            vErrors.push(err17);
          }
          errors++;
        }
      } else {
        const err18 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
      var _valid1 = _errs17 === errors;
      valid3 = valid3 || _valid1;
      const _errs19 = errors;
      if (data4 !== null) {
        const err19 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      }
      var _valid1 = _errs19 === errors;
      valid3 = valid3 || _valid1;
      if (!valid3) {
        const err20 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      } else {
        errors = _errs16;
        if (vErrors !== null) {
          if (_errs16) {
            vErrors.length = _errs16;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.short !== void 0 && func0.call(data, "short")) {
      let data5 = data.short;
      const _errs22 = errors;
      let valid4 = false;
      const _errs23 = errors;
      if (typeof data5 === "string") {
        if (func66(data5) > 3) {
          const err21 = { instancePath: instancePath + "/short", schemaPath: "#/properties/short/anyOf/0/maxLength", keyword: "maxLength", params: { limit: 3 }, message: "must NOT have more than 3 characters" };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
        if (func66(data5) < 1) {
          const err22 = { instancePath: instancePath + "/short", schemaPath: "#/properties/short/anyOf/0/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err22];
          } else {
            vErrors.push(err22);
          }
          errors++;
        }
      } else {
        const err23 = { instancePath: instancePath + "/short", schemaPath: "#/properties/short/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      var _valid2 = _errs23 === errors;
      valid4 = valid4 || _valid2;
      const _errs25 = errors;
      if (data5 !== null) {
        const err24 = { instancePath: instancePath + "/short", schemaPath: "#/properties/short/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
        if (vErrors === null) {
          vErrors = [err24];
        } else {
          vErrors.push(err24);
        }
        errors++;
      }
      var _valid2 = _errs25 === errors;
      valid4 = valid4 || _valid2;
      if (!valid4) {
        const err25 = { instancePath: instancePath + "/short", schemaPath: "#/properties/short/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
        if (vErrors === null) {
          vErrors = [err25];
        } else {
          vErrors.push(err25);
        }
        errors++;
      } else {
        errors = _errs22;
        if (vErrors !== null) {
          if (_errs22) {
            vErrors.length = _errs22;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.number !== void 0 && func0.call(data, "number")) {
      let data6 = data.number;
      const _errs28 = errors;
      let valid5 = false;
      const _errs29 = errors;
      if (!(typeof data6 == "number" && (!(data6 % 1) && !isNaN(data6)) && isFinite(data6))) {
        const err26 = { instancePath: instancePath + "/number", schemaPath: "#/properties/number/anyOf/0/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      }
      if (typeof data6 == "number" && isFinite(data6)) {
        if (data6 > 99 || isNaN(data6)) {
          const err27 = { instancePath: instancePath + "/number", schemaPath: "#/properties/number/anyOf/0/maximum", keyword: "maximum", params: { comparison: "<=", limit: 99 }, message: "must be <= 99" };
          if (vErrors === null) {
            vErrors = [err27];
          } else {
            vErrors.push(err27);
          }
          errors++;
        }
        if (data6 < 1 || isNaN(data6)) {
          const err28 = { instancePath: instancePath + "/number", schemaPath: "#/properties/number/anyOf/0/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" };
          if (vErrors === null) {
            vErrors = [err28];
          } else {
            vErrors.push(err28);
          }
          errors++;
        }
      }
      var _valid3 = _errs29 === errors;
      valid5 = valid5 || _valid3;
      const _errs31 = errors;
      if (data6 !== null) {
        const err29 = { instancePath: instancePath + "/number", schemaPath: "#/properties/number/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
        if (vErrors === null) {
          vErrors = [err29];
        } else {
          vErrors.push(err29);
        }
        errors++;
      }
      var _valid3 = _errs31 === errors;
      valid5 = valid5 || _valid3;
      if (!valid5) {
        const err30 = { instancePath: instancePath + "/number", schemaPath: "#/properties/number/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      } else {
        errors = _errs28;
        if (vErrors !== null) {
          if (_errs28) {
            vErrors.length = _errs28;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.angle !== void 0 && func0.call(data, "angle")) {
      let data7 = data.angle;
      const _errs34 = errors;
      let valid6 = false;
      const _errs35 = errors;
      if (typeof data7 == "number" && isFinite(data7)) {
        if (data7 > 360 || isNaN(data7)) {
          const err31 = { instancePath: instancePath + "/angle", schemaPath: "#/properties/angle/anyOf/0/maximum", keyword: "maximum", params: { comparison: "<=", limit: 360 }, message: "must be <= 360" };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
        if (data7 < -360 || isNaN(data7)) {
          const err32 = { instancePath: instancePath + "/angle", schemaPath: "#/properties/angle/anyOf/0/minimum", keyword: "minimum", params: { comparison: ">=", limit: -360 }, message: "must be >= -360" };
          if (vErrors === null) {
            vErrors = [err32];
          } else {
            vErrors.push(err32);
          }
          errors++;
        }
      } else {
        const err33 = { instancePath: instancePath + "/angle", schemaPath: "#/properties/angle/anyOf/0/type", keyword: "type", params: { type: "number" }, message: "must be number" };
        if (vErrors === null) {
          vErrors = [err33];
        } else {
          vErrors.push(err33);
        }
        errors++;
      }
      var _valid4 = _errs35 === errors;
      valid6 = valid6 || _valid4;
      const _errs37 = errors;
      if (data7 !== null) {
        const err34 = { instancePath: instancePath + "/angle", schemaPath: "#/properties/angle/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
        if (vErrors === null) {
          vErrors = [err34];
        } else {
          vErrors.push(err34);
        }
        errors++;
      }
      var _valid4 = _errs37 === errors;
      valid6 = valid6 || _valid4;
      if (!valid6) {
        const err35 = { instancePath: instancePath + "/angle", schemaPath: "#/properties/angle/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
        if (vErrors === null) {
          vErrors = [err35];
        } else {
          vErrors.push(err35);
        }
        errors++;
      } else {
        errors = _errs34;
        if (vErrors !== null) {
          if (_errs34) {
            vErrors.length = _errs34;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.width !== void 0 && func0.call(data, "width")) {
      let data8 = data.width;
      const _errs40 = errors;
      let valid7 = false;
      const _errs41 = errors;
      if (typeof data8 == "number" && isFinite(data8)) {
        if (data8 > 20 || isNaN(data8)) {
          const err36 = { instancePath: instancePath + "/width", schemaPath: "#/properties/width/anyOf/0/maximum", keyword: "maximum", params: { comparison: "<=", limit: 20 }, message: "must be <= 20" };
          if (vErrors === null) {
            vErrors = [err36];
          } else {
            vErrors.push(err36);
          }
          errors++;
        }
        if (data8 <= 0 || isNaN(data8)) {
          const err37 = { instancePath: instancePath + "/width", schemaPath: "#/properties/width/anyOf/0/exclusiveMinimum", keyword: "exclusiveMinimum", params: { comparison: ">", limit: 0 }, message: "must be > 0" };
          if (vErrors === null) {
            vErrors = [err37];
          } else {
            vErrors.push(err37);
          }
          errors++;
        }
      } else {
        const err38 = { instancePath: instancePath + "/width", schemaPath: "#/properties/width/anyOf/0/type", keyword: "type", params: { type: "number" }, message: "must be number" };
        if (vErrors === null) {
          vErrors = [err38];
        } else {
          vErrors.push(err38);
        }
        errors++;
      }
      var _valid5 = _errs41 === errors;
      valid7 = valid7 || _valid5;
      const _errs43 = errors;
      if (data8 !== null) {
        const err39 = { instancePath: instancePath + "/width", schemaPath: "#/properties/width/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
        if (vErrors === null) {
          vErrors = [err39];
        } else {
          vErrors.push(err39);
        }
        errors++;
      }
      var _valid5 = _errs43 === errors;
      valid7 = valid7 || _valid5;
      if (!valid7) {
        const err40 = { instancePath: instancePath + "/width", schemaPath: "#/properties/width/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
        if (vErrors === null) {
          vErrors = [err40];
        } else {
          vErrors.push(err40);
        }
        errors++;
      } else {
        errors = _errs40;
        if (vErrors !== null) {
          if (_errs40) {
            vErrors.length = _errs40;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.ball !== void 0 && func0.call(data, "ball")) {
      if (typeof data.ball !== "boolean") {
        const err41 = { instancePath: instancePath + "/ball", schemaPath: "#/properties/ball/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
        if (vErrors === null) {
          vErrors = [err41];
        } else {
          vErrors.push(err41);
        }
        errors++;
      }
    }
  } else {
    const err42 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err42];
    } else {
      vErrors.push(err42);
    }
    errors++;
  }
  validate22.errors = vErrors;
  return errors === 0;
}
validate22.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate24(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate24.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.label === void 0 || !func0.call(data, "label")) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "label" }, message: "must have required property 'label'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.x === void 0 || !func0.call(data, "x")) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "x" }, message: "must have required property 'x'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.y === void 0 || !func0.call(data, "y")) {
      const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "y" }, message: "must have required property 'y'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.width === void 0 || !func0.call(data, "width")) {
      const err3 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "width" }, message: "must have required property 'width'" };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.height === void 0 || !func0.call(data, "height")) {
      const err4 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "height" }, message: "must have required property 'height'" };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    for (const key0 of Object.keys(data)) {
      if (!(key0 === "id" || key0 === "label" || key0 === "x" || key0 === "y" || key0 === "width" || key0 === "height" || key0 === "colour")) {
        const err5 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.id !== void 0 && func0.call(data, "id")) {
      let data0 = data.id;
      const _errs3 = errors;
      let valid1 = false;
      const _errs4 = errors;
      if (typeof data0 === "string") {
        if (func66(data0) > 80) {
          const err6 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/anyOf/0/maxLength", keyword: "maxLength", params: { limit: 80 }, message: "must NOT have more than 80 characters" };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
        if (func66(data0) < 1) {
          const err7 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/anyOf/0/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
      var _valid0 = _errs4 === errors;
      valid1 = valid1 || _valid0;
      const _errs6 = errors;
      if (data0 !== null) {
        const err9 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
      var _valid0 = _errs6 === errors;
      valid1 = valid1 || _valid0;
      if (!valid1) {
        const err10 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      } else {
        errors = _errs3;
        if (vErrors !== null) {
          if (_errs3) {
            vErrors.length = _errs3;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.label !== void 0 && func0.call(data, "label")) {
      let data1 = data.label;
      if (typeof data1 === "string") {
        if (func66(data1) > 120) {
          const err11 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
          if (vErrors === null) {
            vErrors = [err11];
          } else {
            vErrors.push(err11);
          }
          errors++;
        }
        if (func66(data1) < 1) {
          const err12 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
      } else {
        const err13 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
    if (data.x !== void 0 && func0.call(data, "x")) {
      let data2 = data.x;
      if (typeof data2 == "number" && isFinite(data2)) {
        if (data2 > 1e3 || isNaN(data2)) {
          const err14 = { instancePath: instancePath + "/x", schemaPath: "#/properties/x/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e3 }, message: "must be <= 1000" };
          if (vErrors === null) {
            vErrors = [err14];
          } else {
            vErrors.push(err14);
          }
          errors++;
        }
        if (data2 < -1e3 || isNaN(data2)) {
          const err15 = { instancePath: instancePath + "/x", schemaPath: "#/properties/x/minimum", keyword: "minimum", params: { comparison: ">=", limit: -1e3 }, message: "must be >= -1000" };
          if (vErrors === null) {
            vErrors = [err15];
          } else {
            vErrors.push(err15);
          }
          errors++;
        }
      } else {
        const err16 = { instancePath: instancePath + "/x", schemaPath: "#/properties/x/type", keyword: "type", params: { type: "number" }, message: "must be number" };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
    }
    if (data.y !== void 0 && func0.call(data, "y")) {
      let data3 = data.y;
      if (typeof data3 == "number" && isFinite(data3)) {
        if (data3 > 1e3 || isNaN(data3)) {
          const err17 = { instancePath: instancePath + "/y", schemaPath: "#/properties/y/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e3 }, message: "must be <= 1000" };
          if (vErrors === null) {
            vErrors = [err17];
          } else {
            vErrors.push(err17);
          }
          errors++;
        }
        if (data3 < -1e3 || isNaN(data3)) {
          const err18 = { instancePath: instancePath + "/y", schemaPath: "#/properties/y/minimum", keyword: "minimum", params: { comparison: ">=", limit: -1e3 }, message: "must be >= -1000" };
          if (vErrors === null) {
            vErrors = [err18];
          } else {
            vErrors.push(err18);
          }
          errors++;
        }
      } else {
        const err19 = { instancePath: instancePath + "/y", schemaPath: "#/properties/y/type", keyword: "type", params: { type: "number" }, message: "must be number" };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      }
    }
    if (data.width !== void 0 && func0.call(data, "width")) {
      let data4 = data.width;
      if (typeof data4 == "number" && isFinite(data4)) {
        if (data4 > 120 || isNaN(data4)) {
          const err20 = { instancePath: instancePath + "/width", schemaPath: "#/properties/width/maximum", keyword: "maximum", params: { comparison: "<=", limit: 120 }, message: "must be <= 120" };
          if (vErrors === null) {
            vErrors = [err20];
          } else {
            vErrors.push(err20);
          }
          errors++;
        }
        if (data4 <= 0 || isNaN(data4)) {
          const err21 = { instancePath: instancePath + "/width", schemaPath: "#/properties/width/exclusiveMinimum", keyword: "exclusiveMinimum", params: { comparison: ">", limit: 0 }, message: "must be > 0" };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = { instancePath: instancePath + "/width", schemaPath: "#/properties/width/type", keyword: "type", params: { type: "number" }, message: "must be number" };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.height !== void 0 && func0.call(data, "height")) {
      let data5 = data.height;
      if (typeof data5 == "number" && isFinite(data5)) {
        if (data5 > 90 || isNaN(data5)) {
          const err23 = { instancePath: instancePath + "/height", schemaPath: "#/properties/height/maximum", keyword: "maximum", params: { comparison: "<=", limit: 90 }, message: "must be <= 90" };
          if (vErrors === null) {
            vErrors = [err23];
          } else {
            vErrors.push(err23);
          }
          errors++;
        }
        if (data5 <= 0 || isNaN(data5)) {
          const err24 = { instancePath: instancePath + "/height", schemaPath: "#/properties/height/exclusiveMinimum", keyword: "exclusiveMinimum", params: { comparison: ">", limit: 0 }, message: "must be > 0" };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
      } else {
        const err25 = { instancePath: instancePath + "/height", schemaPath: "#/properties/height/type", keyword: "type", params: { type: "number" }, message: "must be number" };
        if (vErrors === null) {
          vErrors = [err25];
        } else {
          vErrors.push(err25);
        }
        errors++;
      }
    }
    if (data.colour !== void 0 && func0.call(data, "colour")) {
      let data6 = data.colour;
      const _errs19 = errors;
      let valid2 = false;
      const _errs20 = errors;
      if (typeof data6 !== "string") {
        const err26 = { instancePath: instancePath + "/colour", schemaPath: "#/$defs/colour/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      }
      if (!(data6 === "red" || data6 === "blue" || data6 === "yellow" || data6 === "green" || data6 === "orange" || data6 === "white" || data6 === "teal")) {
        const err27 = { instancePath: instancePath + "/colour", schemaPath: "#/$defs/colour/enum", keyword: "enum", params: { allowedValues: schema35.enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
      var _valid1 = _errs20 === errors;
      valid2 = valid2 || _valid1;
      const _errs23 = errors;
      if (data6 !== null) {
        const err28 = { instancePath: instancePath + "/colour", schemaPath: "#/properties/colour/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
        if (vErrors === null) {
          vErrors = [err28];
        } else {
          vErrors.push(err28);
        }
        errors++;
      }
      var _valid1 = _errs23 === errors;
      valid2 = valid2 || _valid1;
      if (!valid2) {
        const err29 = { instancePath: instancePath + "/colour", schemaPath: "#/properties/colour/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
        if (vErrors === null) {
          vErrors = [err29];
        } else {
          vErrors.push(err29);
        }
        errors++;
      } else {
        errors = _errs19;
        if (vErrors !== null) {
          if (_errs19) {
            vErrors.length = _errs19;
          } else {
            vErrors = null;
          }
        }
      }
    }
  } else {
    const err30 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err30];
    } else {
      vErrors.push(err30);
    }
    errors++;
  }
  validate24.errors = vErrors;
  return errors === 0;
}
validate24.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema38 = { "title": "DiagramArrow", "type": "object", "additionalProperties": false, "properties": { "kind": { "type": "string", "enum": ["pass", "run", "dribble", "shot"] }, "points": { "type": "array", "items": { "$ref": "#/$defs/point" }, "minItems": 2, "maxItems": 12 }, "label": { "anyOf": [{ "type": "string", "minLength": 1, "maxLength": 120 }, { "type": "null" }] }, "sequence": { "anyOf": [{ "type": "integer", "minimum": 1, "maximum": 20 }, { "type": "null" }] }, "badge": { "anyOf": [{ "$ref": "#/$defs/point" }, { "type": "null" }] } }, "required": ["kind", "points"] };
function validate26(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate26.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.kind === void 0 || !func0.call(data, "kind")) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "kind" }, message: "must have required property 'kind'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.points === void 0 || !func0.call(data, "points")) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "points" }, message: "must have required property 'points'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 of Object.keys(data)) {
      if (!(key0 === "kind" || key0 === "points" || key0 === "label" || key0 === "sequence" || key0 === "badge")) {
        const err2 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.kind !== void 0 && func0.call(data, "kind")) {
      let data0 = data.kind;
      if (typeof data0 !== "string") {
        const err3 = { instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      if (!(data0 === "pass" || data0 === "run" || data0 === "dribble" || data0 === "shot")) {
        const err4 = { instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/enum", keyword: "enum", params: { allowedValues: schema38.properties.kind.enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.points !== void 0 && func0.call(data, "points")) {
      let data1 = data.points;
      if (Array.isArray(data1)) {
        if (data1.length > 12) {
          const err5 = { instancePath: instancePath + "/points", schemaPath: "#/properties/points/maxItems", keyword: "maxItems", params: { limit: 12 }, message: "must NOT have more than 12 items" };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
        if (data1.length < 2) {
          const err6 = { instancePath: instancePath + "/points", schemaPath: "#/properties/points/minItems", keyword: "minItems", params: { limit: 2 }, message: "must NOT have fewer than 2 items" };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
        const len0 = data1.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data2 = data1[i0];
          if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
            if (data2.x === void 0 || !func0.call(data2, "x")) {
              const err7 = { instancePath: instancePath + "/points/" + i0, schemaPath: "#/$defs/point/required", keyword: "required", params: { missingProperty: "x" }, message: "must have required property 'x'" };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
            }
            if (data2.y === void 0 || !func0.call(data2, "y")) {
              const err8 = { instancePath: instancePath + "/points/" + i0, schemaPath: "#/$defs/point/required", keyword: "required", params: { missingProperty: "y" }, message: "must have required property 'y'" };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
            for (const key1 of Object.keys(data2)) {
              if (!(key1 === "x" || key1 === "y")) {
                const err9 = { instancePath: instancePath + "/points/" + i0, schemaPath: "#/$defs/point/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
                if (vErrors === null) {
                  vErrors = [err9];
                } else {
                  vErrors.push(err9);
                }
                errors++;
              }
            }
            if (data2.x !== void 0 && func0.call(data2, "x")) {
              let data3 = data2.x;
              if (typeof data3 == "number" && isFinite(data3)) {
                if (data3 > 1e3 || isNaN(data3)) {
                  const err10 = { instancePath: instancePath + "/points/" + i0 + "/x", schemaPath: "#/$defs/point/properties/x/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e3 }, message: "must be <= 1000" };
                  if (vErrors === null) {
                    vErrors = [err10];
                  } else {
                    vErrors.push(err10);
                  }
                  errors++;
                }
                if (data3 < -1e3 || isNaN(data3)) {
                  const err11 = { instancePath: instancePath + "/points/" + i0 + "/x", schemaPath: "#/$defs/point/properties/x/minimum", keyword: "minimum", params: { comparison: ">=", limit: -1e3 }, message: "must be >= -1000" };
                  if (vErrors === null) {
                    vErrors = [err11];
                  } else {
                    vErrors.push(err11);
                  }
                  errors++;
                }
              } else {
                const err12 = { instancePath: instancePath + "/points/" + i0 + "/x", schemaPath: "#/$defs/point/properties/x/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              }
            }
            if (data2.y !== void 0 && func0.call(data2, "y")) {
              let data4 = data2.y;
              if (typeof data4 == "number" && isFinite(data4)) {
                if (data4 > 1e3 || isNaN(data4)) {
                  const err13 = { instancePath: instancePath + "/points/" + i0 + "/y", schemaPath: "#/$defs/point/properties/y/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e3 }, message: "must be <= 1000" };
                  if (vErrors === null) {
                    vErrors = [err13];
                  } else {
                    vErrors.push(err13);
                  }
                  errors++;
                }
                if (data4 < -1e3 || isNaN(data4)) {
                  const err14 = { instancePath: instancePath + "/points/" + i0 + "/y", schemaPath: "#/$defs/point/properties/y/minimum", keyword: "minimum", params: { comparison: ">=", limit: -1e3 }, message: "must be >= -1000" };
                  if (vErrors === null) {
                    vErrors = [err14];
                  } else {
                    vErrors.push(err14);
                  }
                  errors++;
                }
              } else {
                const err15 = { instancePath: instancePath + "/points/" + i0 + "/y", schemaPath: "#/$defs/point/properties/y/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                if (vErrors === null) {
                  vErrors = [err15];
                } else {
                  vErrors.push(err15);
                }
                errors++;
              }
            }
          } else {
            const err16 = { instancePath: instancePath + "/points/" + i0, schemaPath: "#/$defs/point/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
              vErrors = [err16];
            } else {
              vErrors.push(err16);
            }
            errors++;
          }
        }
      } else {
        const err17 = { instancePath: instancePath + "/points", schemaPath: "#/properties/points/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
    }
    if (data.label !== void 0 && func0.call(data, "label")) {
      let data5 = data.label;
      const _errs15 = errors;
      let valid5 = false;
      const _errs16 = errors;
      if (typeof data5 === "string") {
        if (func66(data5) > 120) {
          const err18 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/anyOf/0/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
          if (vErrors === null) {
            vErrors = [err18];
          } else {
            vErrors.push(err18);
          }
          errors++;
        }
        if (func66(data5) < 1) {
          const err19 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/anyOf/0/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
      var _valid0 = _errs16 === errors;
      valid5 = valid5 || _valid0;
      const _errs18 = errors;
      if (data5 !== null) {
        const err21 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
      var _valid0 = _errs18 === errors;
      valid5 = valid5 || _valid0;
      if (!valid5) {
        const err22 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      } else {
        errors = _errs15;
        if (vErrors !== null) {
          if (_errs15) {
            vErrors.length = _errs15;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.sequence !== void 0 && func0.call(data, "sequence")) {
      let data6 = data.sequence;
      const _errs21 = errors;
      let valid6 = false;
      const _errs22 = errors;
      if (!(typeof data6 == "number" && (!(data6 % 1) && !isNaN(data6)) && isFinite(data6))) {
        const err23 = { instancePath: instancePath + "/sequence", schemaPath: "#/properties/sequence/anyOf/0/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data6 == "number" && isFinite(data6)) {
        if (data6 > 20 || isNaN(data6)) {
          const err24 = { instancePath: instancePath + "/sequence", schemaPath: "#/properties/sequence/anyOf/0/maximum", keyword: "maximum", params: { comparison: "<=", limit: 20 }, message: "must be <= 20" };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data6 < 1 || isNaN(data6)) {
          const err25 = { instancePath: instancePath + "/sequence", schemaPath: "#/properties/sequence/anyOf/0/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
      var _valid1 = _errs22 === errors;
      valid6 = valid6 || _valid1;
      const _errs24 = errors;
      if (data6 !== null) {
        const err26 = { instancePath: instancePath + "/sequence", schemaPath: "#/properties/sequence/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      }
      var _valid1 = _errs24 === errors;
      valid6 = valid6 || _valid1;
      if (!valid6) {
        const err27 = { instancePath: instancePath + "/sequence", schemaPath: "#/properties/sequence/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      } else {
        errors = _errs21;
        if (vErrors !== null) {
          if (_errs21) {
            vErrors.length = _errs21;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.badge !== void 0 && func0.call(data, "badge")) {
      let data7 = data.badge;
      const _errs27 = errors;
      let valid7 = false;
      const _errs28 = errors;
      if (data7 && typeof data7 == "object" && !Array.isArray(data7)) {
        if (data7.x === void 0 || !func0.call(data7, "x")) {
          const err28 = { instancePath: instancePath + "/badge", schemaPath: "#/$defs/point/required", keyword: "required", params: { missingProperty: "x" }, message: "must have required property 'x'" };
          if (vErrors === null) {
            vErrors = [err28];
          } else {
            vErrors.push(err28);
          }
          errors++;
        }
        if (data7.y === void 0 || !func0.call(data7, "y")) {
          const err29 = { instancePath: instancePath + "/badge", schemaPath: "#/$defs/point/required", keyword: "required", params: { missingProperty: "y" }, message: "must have required property 'y'" };
          if (vErrors === null) {
            vErrors = [err29];
          } else {
            vErrors.push(err29);
          }
          errors++;
        }
        for (const key2 of Object.keys(data7)) {
          if (!(key2 === "x" || key2 === "y")) {
            const err30 = { instancePath: instancePath + "/badge", schemaPath: "#/$defs/point/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key2 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
              vErrors = [err30];
            } else {
              vErrors.push(err30);
            }
            errors++;
          }
        }
        if (data7.x !== void 0 && func0.call(data7, "x")) {
          let data8 = data7.x;
          if (typeof data8 == "number" && isFinite(data8)) {
            if (data8 > 1e3 || isNaN(data8)) {
              const err31 = { instancePath: instancePath + "/badge/x", schemaPath: "#/$defs/point/properties/x/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e3 }, message: "must be <= 1000" };
              if (vErrors === null) {
                vErrors = [err31];
              } else {
                vErrors.push(err31);
              }
              errors++;
            }
            if (data8 < -1e3 || isNaN(data8)) {
              const err32 = { instancePath: instancePath + "/badge/x", schemaPath: "#/$defs/point/properties/x/minimum", keyword: "minimum", params: { comparison: ">=", limit: -1e3 }, message: "must be >= -1000" };
              if (vErrors === null) {
                vErrors = [err32];
              } else {
                vErrors.push(err32);
              }
              errors++;
            }
          } else {
            const err33 = { instancePath: instancePath + "/badge/x", schemaPath: "#/$defs/point/properties/x/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err33];
            } else {
              vErrors.push(err33);
            }
            errors++;
          }
        }
        if (data7.y !== void 0 && func0.call(data7, "y")) {
          let data9 = data7.y;
          if (typeof data9 == "number" && isFinite(data9)) {
            if (data9 > 1e3 || isNaN(data9)) {
              const err34 = { instancePath: instancePath + "/badge/y", schemaPath: "#/$defs/point/properties/y/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e3 }, message: "must be <= 1000" };
              if (vErrors === null) {
                vErrors = [err34];
              } else {
                vErrors.push(err34);
              }
              errors++;
            }
            if (data9 < -1e3 || isNaN(data9)) {
              const err35 = { instancePath: instancePath + "/badge/y", schemaPath: "#/$defs/point/properties/y/minimum", keyword: "minimum", params: { comparison: ">=", limit: -1e3 }, message: "must be >= -1000" };
              if (vErrors === null) {
                vErrors = [err35];
              } else {
                vErrors.push(err35);
              }
              errors++;
            }
          } else {
            const err36 = { instancePath: instancePath + "/badge/y", schemaPath: "#/$defs/point/properties/y/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err36];
            } else {
              vErrors.push(err36);
            }
            errors++;
          }
        }
      } else {
        const err37 = { instancePath: instancePath + "/badge", schemaPath: "#/$defs/point/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        if (vErrors === null) {
          vErrors = [err37];
        } else {
          vErrors.push(err37);
        }
        errors++;
      }
      var _valid2 = _errs28 === errors;
      valid7 = valid7 || _valid2;
      const _errs36 = errors;
      if (data7 !== null) {
        const err38 = { instancePath: instancePath + "/badge", schemaPath: "#/properties/badge/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
        if (vErrors === null) {
          vErrors = [err38];
        } else {
          vErrors.push(err38);
        }
        errors++;
      }
      var _valid2 = _errs36 === errors;
      valid7 = valid7 || _valid2;
      if (!valid7) {
        const err39 = { instancePath: instancePath + "/badge", schemaPath: "#/properties/badge/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
        if (vErrors === null) {
          vErrors = [err39];
        } else {
          vErrors.push(err39);
        }
        errors++;
      } else {
        errors = _errs27;
        if (vErrors !== null) {
          if (_errs27) {
            vErrors.length = _errs27;
          } else {
            vErrors = null;
          }
        }
      }
    }
  } else {
    const err40 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err40];
    } else {
      vErrors.push(err40);
    }
    errors++;
  }
  validate26.errors = vErrors;
  return errors === 0;
}
validate26.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate21(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate21.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.id === void 0 || !func0.call(data, "id")) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property 'id'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.title === void 0 || !func0.call(data, "title")) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "title" }, message: "must have required property 'title'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.objects === void 0 || !func0.call(data, "objects")) {
      const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "objects" }, message: "must have required property 'objects'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.arrows === void 0 || !func0.call(data, "arrows")) {
      const err3 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "arrows" }, message: "must have required property 'arrows'" };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    for (const key0 of Object.keys(data)) {
      if (!(key0 === "id" || key0 === "title" || key0 === "caption" || key0 === "objects" || key0 === "areas" || key0 === "arrows")) {
        const err4 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.id !== void 0 && func0.call(data, "id")) {
      let data0 = data.id;
      if (typeof data0 === "string") {
        if (func66(data0) > 80) {
          const err5 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/maxLength", keyword: "maxLength", params: { limit: 80 }, message: "must NOT have more than 80 characters" };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
        if (func66(data0) < 1) {
          const err6 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
      } else {
        const err7 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.title !== void 0 && func0.call(data, "title")) {
      let data1 = data.title;
      if (typeof data1 === "string") {
        if (func66(data1) > 160) {
          const err8 = { instancePath: instancePath + "/title", schemaPath: "#/properties/title/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
        if (func66(data1) < 1) {
          const err9 = { instancePath: instancePath + "/title", schemaPath: "#/properties/title/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = { instancePath: instancePath + "/title", schemaPath: "#/properties/title/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.caption !== void 0 && func0.call(data, "caption")) {
      let data2 = data.caption;
      if (typeof data2 === "string") {
        if (func66(data2) > 400) {
          const err11 = { instancePath: instancePath + "/caption", schemaPath: "#/properties/caption/maxLength", keyword: "maxLength", params: { limit: 400 }, message: "must NOT have more than 400 characters" };
          if (vErrors === null) {
            vErrors = [err11];
          } else {
            vErrors.push(err11);
          }
          errors++;
        }
      } else {
        const err12 = { instancePath: instancePath + "/caption", schemaPath: "#/properties/caption/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.objects !== void 0 && func0.call(data, "objects")) {
      let data3 = data.objects;
      if (Array.isArray(data3)) {
        if (data3.length > 60) {
          const err13 = { instancePath: instancePath + "/objects", schemaPath: "#/properties/objects/maxItems", keyword: "maxItems", params: { limit: 60 }, message: "must NOT have more than 60 items" };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data3.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (!validate22(data3[i0], { instancePath: instancePath + "/objects/" + i0, parentData: data3, parentDataProperty: i0, rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate22.errors : vErrors.concat(validate22.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err14 = { instancePath: instancePath + "/objects", schemaPath: "#/properties/objects/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
    if (data.areas !== void 0 && func0.call(data, "areas")) {
      let data5 = data.areas;
      if (Array.isArray(data5)) {
        if (data5.length > 12) {
          const err15 = { instancePath: instancePath + "/areas", schemaPath: "#/properties/areas/maxItems", keyword: "maxItems", params: { limit: 12 }, message: "must NOT have more than 12 items" };
          if (vErrors === null) {
            vErrors = [err15];
          } else {
            vErrors.push(err15);
          }
          errors++;
        }
        const len1 = data5.length;
        for (let i1 = 0; i1 < len1; i1++) {
          if (!validate24(data5[i1], { instancePath: instancePath + "/areas/" + i1, parentData: data5, parentDataProperty: i1, rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate24.errors : vErrors.concat(validate24.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err16 = { instancePath: instancePath + "/areas", schemaPath: "#/properties/areas/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
    }
    if (data.arrows !== void 0 && func0.call(data, "arrows")) {
      let data7 = data.arrows;
      if (Array.isArray(data7)) {
        if (data7.length > 30) {
          const err17 = { instancePath: instancePath + "/arrows", schemaPath: "#/properties/arrows/maxItems", keyword: "maxItems", params: { limit: 30 }, message: "must NOT have more than 30 items" };
          if (vErrors === null) {
            vErrors = [err17];
          } else {
            vErrors.push(err17);
          }
          errors++;
        }
        const len2 = data7.length;
        for (let i2 = 0; i2 < len2; i2++) {
          if (!validate26(data7[i2], { instancePath: instancePath + "/arrows/" + i2, parentData: data7, parentDataProperty: i2, rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate26.errors : vErrors.concat(validate26.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err18 = { instancePath: instancePath + "/arrows", schemaPath: "#/properties/arrows/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
    }
  } else {
    const err19 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err19];
    } else {
      vErrors.push(err19);
    }
    errors++;
  }
  validate21.errors = vErrors;
  return errors === 0;
}
validate21.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate20(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate20.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.format_version === void 0 || !func0.call(data, "format_version")) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "format_version" }, message: "must have required property 'format_version'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.title === void 0 || !func0.call(data, "title")) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "title" }, message: "must have required property 'title'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.area === void 0 || !func0.call(data, "area")) {
      const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "area" }, message: "must have required property 'area'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.frames === void 0 || !func0.call(data, "frames")) {
      const err3 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "frames" }, message: "must have required property 'frames'" };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    for (const key0 of Object.keys(data)) {
      if (!(key0 === "format_version" || key0 === "title" || key0 === "area" || key0 === "frames")) {
        const err4 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.format_version !== void 0 && func0.call(data, "format_version")) {
      let data0 = data.format_version;
      if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
        const err5 = { instancePath: instancePath + "/format_version", schemaPath: "#/properties/format_version/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
      if (1 !== data0) {
        const err6 = { instancePath: instancePath + "/format_version", schemaPath: "#/properties/format_version/const", keyword: "const", params: { allowedValue: 1 }, message: "must be equal to constant" };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== void 0 && func0.call(data, "title")) {
      let data1 = data.title;
      if (typeof data1 === "string") {
        if (func66(data1) > 160) {
          const err7 = { instancePath: instancePath + "/title", schemaPath: "#/properties/title/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
        if (func66(data1) < 1) {
          const err8 = { instancePath: instancePath + "/title", schemaPath: "#/properties/title/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
      } else {
        const err9 = { instancePath: instancePath + "/title", schemaPath: "#/properties/title/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.area !== void 0 && func0.call(data, "area")) {
      let data2 = data.area;
      if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
        if (data2.shape === void 0 || !func0.call(data2, "shape")) {
          const err10 = { instancePath: instancePath + "/area", schemaPath: "#/$defs/area/required", keyword: "required", params: { missingProperty: "shape" }, message: "must have required property 'shape'" };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
        if (data2.length_m === void 0 || !func0.call(data2, "length_m")) {
          const err11 = { instancePath: instancePath + "/area", schemaPath: "#/$defs/area/required", keyword: "required", params: { missingProperty: "length_m" }, message: "must have required property 'length_m'" };
          if (vErrors === null) {
            vErrors = [err11];
          } else {
            vErrors.push(err11);
          }
          errors++;
        }
        if (data2.width_m === void 0 || !func0.call(data2, "width_m")) {
          const err12 = { instancePath: instancePath + "/area", schemaPath: "#/$defs/area/required", keyword: "required", params: { missingProperty: "width_m" }, message: "must have required property 'width_m'" };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        for (const key1 of Object.keys(data2)) {
          if (!(key1 === "shape" || key1 === "length_m" || key1 === "width_m" || key1 === "label")) {
            const err13 = { instancePath: instancePath + "/area", schemaPath: "#/$defs/area/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
              vErrors = [err13];
            } else {
              vErrors.push(err13);
            }
            errors++;
          }
        }
        if (data2.shape !== void 0 && func0.call(data2, "shape")) {
          let data3 = data2.shape;
          if (typeof data3 !== "string") {
            const err14 = { instancePath: instancePath + "/area/shape", schemaPath: "#/$defs/area/properties/shape/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if ("rectangle" !== data3) {
            const err15 = { instancePath: instancePath + "/area/shape", schemaPath: "#/$defs/area/properties/shape/const", keyword: "const", params: { allowedValue: "rectangle" }, message: "must be equal to constant" };
            if (vErrors === null) {
              vErrors = [err15];
            } else {
              vErrors.push(err15);
            }
            errors++;
          }
        }
        if (data2.length_m !== void 0 && func0.call(data2, "length_m")) {
          let data4 = data2.length_m;
          if (typeof data4 == "number" && isFinite(data4)) {
            if (data4 > 120 || isNaN(data4)) {
              const err16 = { instancePath: instancePath + "/area/length_m", schemaPath: "#/$defs/area/properties/length_m/maximum", keyword: "maximum", params: { comparison: "<=", limit: 120 }, message: "must be <= 120" };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
            if (data4 <= 0 || isNaN(data4)) {
              const err17 = { instancePath: instancePath + "/area/length_m", schemaPath: "#/$defs/area/properties/length_m/exclusiveMinimum", keyword: "exclusiveMinimum", params: { comparison: ">", limit: 0 }, message: "must be > 0" };
              if (vErrors === null) {
                vErrors = [err17];
              } else {
                vErrors.push(err17);
              }
              errors++;
            }
          } else {
            const err18 = { instancePath: instancePath + "/area/length_m", schemaPath: "#/$defs/area/properties/length_m/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err18];
            } else {
              vErrors.push(err18);
            }
            errors++;
          }
        }
        if (data2.width_m !== void 0 && func0.call(data2, "width_m")) {
          let data5 = data2.width_m;
          if (typeof data5 == "number" && isFinite(data5)) {
            if (data5 > 90 || isNaN(data5)) {
              const err19 = { instancePath: instancePath + "/area/width_m", schemaPath: "#/$defs/area/properties/width_m/maximum", keyword: "maximum", params: { comparison: "<=", limit: 90 }, message: "must be <= 90" };
              if (vErrors === null) {
                vErrors = [err19];
              } else {
                vErrors.push(err19);
              }
              errors++;
            }
            if (data5 <= 0 || isNaN(data5)) {
              const err20 = { instancePath: instancePath + "/area/width_m", schemaPath: "#/$defs/area/properties/width_m/exclusiveMinimum", keyword: "exclusiveMinimum", params: { comparison: ">", limit: 0 }, message: "must be > 0" };
              if (vErrors === null) {
                vErrors = [err20];
              } else {
                vErrors.push(err20);
              }
              errors++;
            }
          } else {
            const err21 = { instancePath: instancePath + "/area/width_m", schemaPath: "#/$defs/area/properties/width_m/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err21];
            } else {
              vErrors.push(err21);
            }
            errors++;
          }
        }
        if (data2.label !== void 0 && func0.call(data2, "label")) {
          let data6 = data2.label;
          const _errs17 = errors;
          let valid3 = false;
          const _errs18 = errors;
          if (typeof data6 === "string") {
            if (func66(data6) > 120) {
              const err22 = { instancePath: instancePath + "/area/label", schemaPath: "#/$defs/area/properties/label/anyOf/0/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
              if (vErrors === null) {
                vErrors = [err22];
              } else {
                vErrors.push(err22);
              }
              errors++;
            }
            if (func66(data6) < 1) {
              const err23 = { instancePath: instancePath + "/area/label", schemaPath: "#/$defs/area/properties/label/anyOf/0/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              if (vErrors === null) {
                vErrors = [err23];
              } else {
                vErrors.push(err23);
              }
              errors++;
            }
          } else {
            const err24 = { instancePath: instancePath + "/area/label", schemaPath: "#/$defs/area/properties/label/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err24];
            } else {
              vErrors.push(err24);
            }
            errors++;
          }
          var _valid0 = _errs18 === errors;
          valid3 = valid3 || _valid0;
          const _errs20 = errors;
          if (data6 !== null) {
            const err25 = { instancePath: instancePath + "/area/label", schemaPath: "#/$defs/area/properties/label/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
            if (vErrors === null) {
              vErrors = [err25];
            } else {
              vErrors.push(err25);
            }
            errors++;
          }
          var _valid0 = _errs20 === errors;
          valid3 = valid3 || _valid0;
          if (!valid3) {
            const err26 = { instancePath: instancePath + "/area/label", schemaPath: "#/$defs/area/properties/label/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          } else {
            errors = _errs17;
            if (vErrors !== null) {
              if (_errs17) {
                vErrors.length = _errs17;
              } else {
                vErrors = null;
              }
            }
          }
        }
      } else {
        const err27 = { instancePath: instancePath + "/area", schemaPath: "#/$defs/area/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.frames !== void 0 && func0.call(data, "frames")) {
      let data7 = data.frames;
      if (Array.isArray(data7)) {
        if (data7.length > 64) {
          const err28 = { instancePath: instancePath + "/frames", schemaPath: "#/properties/frames/maxItems", keyword: "maxItems", params: { limit: 64 }, message: "must NOT have more than 64 items" };
          if (vErrors === null) {
            vErrors = [err28];
          } else {
            vErrors.push(err28);
          }
          errors++;
        }
        const len0 = data7.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (!validate21(data7[i0], { instancePath: instancePath + "/frames/" + i0, parentData: data7, parentDataProperty: i0, rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate21.errors : vErrors.concat(validate21.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err29 = { instancePath: instancePath + "/frames", schemaPath: "#/properties/frames/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err29];
        } else {
          vErrors.push(err29);
        }
        errors++;
      }
    }
  } else {
    const err30 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err30];
    } else {
      vErrors.push(err30);
    }
    errors++;
  }
  validate20.errors = vErrors;
  return errors === 0;
}
validate20.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var validateFormat2 = validate29;
var schema44 = { "title": "DiagramObject", "type": "object", "additionalProperties": false, "properties": { "kind": { "type": "string", "enum": ["player", "opponent", "neutral", "coach", "ball", "cone", "flat_marker", "gate", "mini_goal", "goal", "mannequin", "pole", "ladder"] }, "x": { "type": "number", "minimum": -1e3, "maximum": 1e3 }, "y": { "type": "number", "minimum": -1e3, "maximum": 1e3 }, "colour": { "anyOf": [{ "$ref": "#/$defs/colour" }, { "type": "null" }] }, "label": { "anyOf": [{ "type": "string", "minLength": 1, "maxLength": 120 }, { "type": "null" }] }, "short": { "anyOf": [{ "type": "string", "minLength": 1, "maxLength": 3 }, { "type": "null" }] }, "number": { "anyOf": [{ "type": "integer", "minimum": 1, "maximum": 99 }, { "type": "null" }] }, "angle": { "anyOf": [{ "type": "number", "minimum": -360, "maximum": 360 }, { "type": "null" }] }, "width": { "anyOf": [{ "type": "number", "exclusiveMinimum": 0, "maximum": 20 }, { "type": "null" }] }, "ball": { "type": "boolean" } }, "required": ["kind", "x", "y"] };
var schema45 = { "title": "ObjectColour", "type": "string", "enum": ["red", "blue", "yellow", "green", "orange", "white", "teal"] };
function validate31(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate31.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.kind === void 0 || !func0.call(data, "kind")) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "kind" }, message: "must have required property 'kind'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.x === void 0 || !func0.call(data, "x")) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "x" }, message: "must have required property 'x'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.y === void 0 || !func0.call(data, "y")) {
      const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "y" }, message: "must have required property 'y'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    for (const key0 of Object.keys(data)) {
      if (!func0.call(schema44.properties, key0)) {
        const err3 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
    }
    if (data.kind !== void 0 && func0.call(data, "kind")) {
      let data0 = data.kind;
      if (typeof data0 !== "string") {
        const err4 = { instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
      if (!(data0 === "player" || data0 === "opponent" || data0 === "neutral" || data0 === "coach" || data0 === "ball" || data0 === "cone" || data0 === "flat_marker" || data0 === "gate" || data0 === "mini_goal" || data0 === "goal" || data0 === "mannequin" || data0 === "pole" || data0 === "ladder")) {
        const err5 = { instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/enum", keyword: "enum", params: { allowedValues: schema44.properties.kind.enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.x !== void 0 && func0.call(data, "x")) {
      let data1 = data.x;
      if (typeof data1 == "number" && isFinite(data1)) {
        if (data1 > 1e3 || isNaN(data1)) {
          const err6 = { instancePath: instancePath + "/x", schemaPath: "#/properties/x/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e3 }, message: "must be <= 1000" };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
        if (data1 < -1e3 || isNaN(data1)) {
          const err7 = { instancePath: instancePath + "/x", schemaPath: "#/properties/x/minimum", keyword: "minimum", params: { comparison: ">=", limit: -1e3 }, message: "must be >= -1000" };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = { instancePath: instancePath + "/x", schemaPath: "#/properties/x/type", keyword: "type", params: { type: "number" }, message: "must be number" };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
    }
    if (data.y !== void 0 && func0.call(data, "y")) {
      let data2 = data.y;
      if (typeof data2 == "number" && isFinite(data2)) {
        if (data2 > 1e3 || isNaN(data2)) {
          const err9 = { instancePath: instancePath + "/y", schemaPath: "#/properties/y/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e3 }, message: "must be <= 1000" };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
        if (data2 < -1e3 || isNaN(data2)) {
          const err10 = { instancePath: instancePath + "/y", schemaPath: "#/properties/y/minimum", keyword: "minimum", params: { comparison: ">=", limit: -1e3 }, message: "must be >= -1000" };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
      } else {
        const err11 = { instancePath: instancePath + "/y", schemaPath: "#/properties/y/type", keyword: "type", params: { type: "number" }, message: "must be number" };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.colour !== void 0 && func0.call(data, "colour")) {
      let data3 = data.colour;
      const _errs9 = errors;
      let valid1 = false;
      const _errs10 = errors;
      if (typeof data3 !== "string") {
        const err12 = { instancePath: instancePath + "/colour", schemaPath: "#/$defs/colour/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
      if (!(data3 === "red" || data3 === "blue" || data3 === "yellow" || data3 === "green" || data3 === "orange" || data3 === "white" || data3 === "teal")) {
        const err13 = { instancePath: instancePath + "/colour", schemaPath: "#/$defs/colour/enum", keyword: "enum", params: { allowedValues: schema45.enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
      var _valid0 = _errs10 === errors;
      valid1 = valid1 || _valid0;
      const _errs13 = errors;
      if (data3 !== null) {
        const err14 = { instancePath: instancePath + "/colour", schemaPath: "#/properties/colour/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
      var _valid0 = _errs13 === errors;
      valid1 = valid1 || _valid0;
      if (!valid1) {
        const err15 = { instancePath: instancePath + "/colour", schemaPath: "#/properties/colour/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      } else {
        errors = _errs9;
        if (vErrors !== null) {
          if (_errs9) {
            vErrors.length = _errs9;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.label !== void 0 && func0.call(data, "label")) {
      let data4 = data.label;
      const _errs16 = errors;
      let valid3 = false;
      const _errs17 = errors;
      if (typeof data4 === "string") {
        if (func66(data4) > 120) {
          const err16 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/anyOf/0/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
          if (vErrors === null) {
            vErrors = [err16];
          } else {
            vErrors.push(err16);
          }
          errors++;
        }
        if (func66(data4) < 1) {
          const err17 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/anyOf/0/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err17];
          } else {
            vErrors.push(err17);
          }
          errors++;
        }
      } else {
        const err18 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
      var _valid1 = _errs17 === errors;
      valid3 = valid3 || _valid1;
      const _errs19 = errors;
      if (data4 !== null) {
        const err19 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      }
      var _valid1 = _errs19 === errors;
      valid3 = valid3 || _valid1;
      if (!valid3) {
        const err20 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      } else {
        errors = _errs16;
        if (vErrors !== null) {
          if (_errs16) {
            vErrors.length = _errs16;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.short !== void 0 && func0.call(data, "short")) {
      let data5 = data.short;
      const _errs22 = errors;
      let valid4 = false;
      const _errs23 = errors;
      if (typeof data5 === "string") {
        if (func66(data5) > 3) {
          const err21 = { instancePath: instancePath + "/short", schemaPath: "#/properties/short/anyOf/0/maxLength", keyword: "maxLength", params: { limit: 3 }, message: "must NOT have more than 3 characters" };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
        if (func66(data5) < 1) {
          const err22 = { instancePath: instancePath + "/short", schemaPath: "#/properties/short/anyOf/0/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err22];
          } else {
            vErrors.push(err22);
          }
          errors++;
        }
      } else {
        const err23 = { instancePath: instancePath + "/short", schemaPath: "#/properties/short/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      var _valid2 = _errs23 === errors;
      valid4 = valid4 || _valid2;
      const _errs25 = errors;
      if (data5 !== null) {
        const err24 = { instancePath: instancePath + "/short", schemaPath: "#/properties/short/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
        if (vErrors === null) {
          vErrors = [err24];
        } else {
          vErrors.push(err24);
        }
        errors++;
      }
      var _valid2 = _errs25 === errors;
      valid4 = valid4 || _valid2;
      if (!valid4) {
        const err25 = { instancePath: instancePath + "/short", schemaPath: "#/properties/short/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
        if (vErrors === null) {
          vErrors = [err25];
        } else {
          vErrors.push(err25);
        }
        errors++;
      } else {
        errors = _errs22;
        if (vErrors !== null) {
          if (_errs22) {
            vErrors.length = _errs22;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.number !== void 0 && func0.call(data, "number")) {
      let data6 = data.number;
      const _errs28 = errors;
      let valid5 = false;
      const _errs29 = errors;
      if (!(typeof data6 == "number" && (!(data6 % 1) && !isNaN(data6)) && isFinite(data6))) {
        const err26 = { instancePath: instancePath + "/number", schemaPath: "#/properties/number/anyOf/0/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      }
      if (typeof data6 == "number" && isFinite(data6)) {
        if (data6 > 99 || isNaN(data6)) {
          const err27 = { instancePath: instancePath + "/number", schemaPath: "#/properties/number/anyOf/0/maximum", keyword: "maximum", params: { comparison: "<=", limit: 99 }, message: "must be <= 99" };
          if (vErrors === null) {
            vErrors = [err27];
          } else {
            vErrors.push(err27);
          }
          errors++;
        }
        if (data6 < 1 || isNaN(data6)) {
          const err28 = { instancePath: instancePath + "/number", schemaPath: "#/properties/number/anyOf/0/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" };
          if (vErrors === null) {
            vErrors = [err28];
          } else {
            vErrors.push(err28);
          }
          errors++;
        }
      }
      var _valid3 = _errs29 === errors;
      valid5 = valid5 || _valid3;
      const _errs31 = errors;
      if (data6 !== null) {
        const err29 = { instancePath: instancePath + "/number", schemaPath: "#/properties/number/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
        if (vErrors === null) {
          vErrors = [err29];
        } else {
          vErrors.push(err29);
        }
        errors++;
      }
      var _valid3 = _errs31 === errors;
      valid5 = valid5 || _valid3;
      if (!valid5) {
        const err30 = { instancePath: instancePath + "/number", schemaPath: "#/properties/number/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      } else {
        errors = _errs28;
        if (vErrors !== null) {
          if (_errs28) {
            vErrors.length = _errs28;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.angle !== void 0 && func0.call(data, "angle")) {
      let data7 = data.angle;
      const _errs34 = errors;
      let valid6 = false;
      const _errs35 = errors;
      if (typeof data7 == "number" && isFinite(data7)) {
        if (data7 > 360 || isNaN(data7)) {
          const err31 = { instancePath: instancePath + "/angle", schemaPath: "#/properties/angle/anyOf/0/maximum", keyword: "maximum", params: { comparison: "<=", limit: 360 }, message: "must be <= 360" };
          if (vErrors === null) {
            vErrors = [err31];
          } else {
            vErrors.push(err31);
          }
          errors++;
        }
        if (data7 < -360 || isNaN(data7)) {
          const err32 = { instancePath: instancePath + "/angle", schemaPath: "#/properties/angle/anyOf/0/minimum", keyword: "minimum", params: { comparison: ">=", limit: -360 }, message: "must be >= -360" };
          if (vErrors === null) {
            vErrors = [err32];
          } else {
            vErrors.push(err32);
          }
          errors++;
        }
      } else {
        const err33 = { instancePath: instancePath + "/angle", schemaPath: "#/properties/angle/anyOf/0/type", keyword: "type", params: { type: "number" }, message: "must be number" };
        if (vErrors === null) {
          vErrors = [err33];
        } else {
          vErrors.push(err33);
        }
        errors++;
      }
      var _valid4 = _errs35 === errors;
      valid6 = valid6 || _valid4;
      const _errs37 = errors;
      if (data7 !== null) {
        const err34 = { instancePath: instancePath + "/angle", schemaPath: "#/properties/angle/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
        if (vErrors === null) {
          vErrors = [err34];
        } else {
          vErrors.push(err34);
        }
        errors++;
      }
      var _valid4 = _errs37 === errors;
      valid6 = valid6 || _valid4;
      if (!valid6) {
        const err35 = { instancePath: instancePath + "/angle", schemaPath: "#/properties/angle/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
        if (vErrors === null) {
          vErrors = [err35];
        } else {
          vErrors.push(err35);
        }
        errors++;
      } else {
        errors = _errs34;
        if (vErrors !== null) {
          if (_errs34) {
            vErrors.length = _errs34;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.width !== void 0 && func0.call(data, "width")) {
      let data8 = data.width;
      const _errs40 = errors;
      let valid7 = false;
      const _errs41 = errors;
      if (typeof data8 == "number" && isFinite(data8)) {
        if (data8 > 20 || isNaN(data8)) {
          const err36 = { instancePath: instancePath + "/width", schemaPath: "#/properties/width/anyOf/0/maximum", keyword: "maximum", params: { comparison: "<=", limit: 20 }, message: "must be <= 20" };
          if (vErrors === null) {
            vErrors = [err36];
          } else {
            vErrors.push(err36);
          }
          errors++;
        }
        if (data8 <= 0 || isNaN(data8)) {
          const err37 = { instancePath: instancePath + "/width", schemaPath: "#/properties/width/anyOf/0/exclusiveMinimum", keyword: "exclusiveMinimum", params: { comparison: ">", limit: 0 }, message: "must be > 0" };
          if (vErrors === null) {
            vErrors = [err37];
          } else {
            vErrors.push(err37);
          }
          errors++;
        }
      } else {
        const err38 = { instancePath: instancePath + "/width", schemaPath: "#/properties/width/anyOf/0/type", keyword: "type", params: { type: "number" }, message: "must be number" };
        if (vErrors === null) {
          vErrors = [err38];
        } else {
          vErrors.push(err38);
        }
        errors++;
      }
      var _valid5 = _errs41 === errors;
      valid7 = valid7 || _valid5;
      const _errs43 = errors;
      if (data8 !== null) {
        const err39 = { instancePath: instancePath + "/width", schemaPath: "#/properties/width/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
        if (vErrors === null) {
          vErrors = [err39];
        } else {
          vErrors.push(err39);
        }
        errors++;
      }
      var _valid5 = _errs43 === errors;
      valid7 = valid7 || _valid5;
      if (!valid7) {
        const err40 = { instancePath: instancePath + "/width", schemaPath: "#/properties/width/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
        if (vErrors === null) {
          vErrors = [err40];
        } else {
          vErrors.push(err40);
        }
        errors++;
      } else {
        errors = _errs40;
        if (vErrors !== null) {
          if (_errs40) {
            vErrors.length = _errs40;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.ball !== void 0 && func0.call(data, "ball")) {
      if (typeof data.ball !== "boolean") {
        const err41 = { instancePath: instancePath + "/ball", schemaPath: "#/properties/ball/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
        if (vErrors === null) {
          vErrors = [err41];
        } else {
          vErrors.push(err41);
        }
        errors++;
      }
    }
  } else {
    const err42 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err42];
    } else {
      vErrors.push(err42);
    }
    errors++;
  }
  validate31.errors = vErrors;
  return errors === 0;
}
validate31.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate33(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate33.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.label === void 0 || !func0.call(data, "label")) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "label" }, message: "must have required property 'label'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.x === void 0 || !func0.call(data, "x")) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "x" }, message: "must have required property 'x'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.y === void 0 || !func0.call(data, "y")) {
      const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "y" }, message: "must have required property 'y'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.width === void 0 || !func0.call(data, "width")) {
      const err3 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "width" }, message: "must have required property 'width'" };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.height === void 0 || !func0.call(data, "height")) {
      const err4 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "height" }, message: "must have required property 'height'" };
      if (vErrors === null) {
        vErrors = [err4];
      } else {
        vErrors.push(err4);
      }
      errors++;
    }
    for (const key0 of Object.keys(data)) {
      if (!(key0 === "id" || key0 === "label" || key0 === "x" || key0 === "y" || key0 === "width" || key0 === "height" || key0 === "colour")) {
        const err5 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.id !== void 0 && func0.call(data, "id")) {
      let data0 = data.id;
      const _errs3 = errors;
      let valid1 = false;
      const _errs4 = errors;
      if (typeof data0 === "string") {
        if (func66(data0) > 80) {
          const err6 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/anyOf/0/maxLength", keyword: "maxLength", params: { limit: 80 }, message: "must NOT have more than 80 characters" };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
        if (func66(data0) < 1) {
          const err7 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/anyOf/0/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
      } else {
        const err8 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      }
      var _valid0 = _errs4 === errors;
      valid1 = valid1 || _valid0;
      const _errs6 = errors;
      if (data0 !== null) {
        const err9 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
      var _valid0 = _errs6 === errors;
      valid1 = valid1 || _valid0;
      if (!valid1) {
        const err10 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      } else {
        errors = _errs3;
        if (vErrors !== null) {
          if (_errs3) {
            vErrors.length = _errs3;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.label !== void 0 && func0.call(data, "label")) {
      let data1 = data.label;
      if (typeof data1 === "string") {
        if (func66(data1) > 120) {
          const err11 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
          if (vErrors === null) {
            vErrors = [err11];
          } else {
            vErrors.push(err11);
          }
          errors++;
        }
        if (func66(data1) < 1) {
          const err12 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
      } else {
        const err13 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
    if (data.x !== void 0 && func0.call(data, "x")) {
      let data2 = data.x;
      if (typeof data2 == "number" && isFinite(data2)) {
        if (data2 > 1e3 || isNaN(data2)) {
          const err14 = { instancePath: instancePath + "/x", schemaPath: "#/properties/x/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e3 }, message: "must be <= 1000" };
          if (vErrors === null) {
            vErrors = [err14];
          } else {
            vErrors.push(err14);
          }
          errors++;
        }
        if (data2 < -1e3 || isNaN(data2)) {
          const err15 = { instancePath: instancePath + "/x", schemaPath: "#/properties/x/minimum", keyword: "minimum", params: { comparison: ">=", limit: -1e3 }, message: "must be >= -1000" };
          if (vErrors === null) {
            vErrors = [err15];
          } else {
            vErrors.push(err15);
          }
          errors++;
        }
      } else {
        const err16 = { instancePath: instancePath + "/x", schemaPath: "#/properties/x/type", keyword: "type", params: { type: "number" }, message: "must be number" };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
    }
    if (data.y !== void 0 && func0.call(data, "y")) {
      let data3 = data.y;
      if (typeof data3 == "number" && isFinite(data3)) {
        if (data3 > 1e3 || isNaN(data3)) {
          const err17 = { instancePath: instancePath + "/y", schemaPath: "#/properties/y/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e3 }, message: "must be <= 1000" };
          if (vErrors === null) {
            vErrors = [err17];
          } else {
            vErrors.push(err17);
          }
          errors++;
        }
        if (data3 < -1e3 || isNaN(data3)) {
          const err18 = { instancePath: instancePath + "/y", schemaPath: "#/properties/y/minimum", keyword: "minimum", params: { comparison: ">=", limit: -1e3 }, message: "must be >= -1000" };
          if (vErrors === null) {
            vErrors = [err18];
          } else {
            vErrors.push(err18);
          }
          errors++;
        }
      } else {
        const err19 = { instancePath: instancePath + "/y", schemaPath: "#/properties/y/type", keyword: "type", params: { type: "number" }, message: "must be number" };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      }
    }
    if (data.width !== void 0 && func0.call(data, "width")) {
      let data4 = data.width;
      if (typeof data4 == "number" && isFinite(data4)) {
        if (data4 > 120 || isNaN(data4)) {
          const err20 = { instancePath: instancePath + "/width", schemaPath: "#/properties/width/maximum", keyword: "maximum", params: { comparison: "<=", limit: 120 }, message: "must be <= 120" };
          if (vErrors === null) {
            vErrors = [err20];
          } else {
            vErrors.push(err20);
          }
          errors++;
        }
        if (data4 <= 0 || isNaN(data4)) {
          const err21 = { instancePath: instancePath + "/width", schemaPath: "#/properties/width/exclusiveMinimum", keyword: "exclusiveMinimum", params: { comparison: ">", limit: 0 }, message: "must be > 0" };
          if (vErrors === null) {
            vErrors = [err21];
          } else {
            vErrors.push(err21);
          }
          errors++;
        }
      } else {
        const err22 = { instancePath: instancePath + "/width", schemaPath: "#/properties/width/type", keyword: "type", params: { type: "number" }, message: "must be number" };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.height !== void 0 && func0.call(data, "height")) {
      let data5 = data.height;
      if (typeof data5 == "number" && isFinite(data5)) {
        if (data5 > 90 || isNaN(data5)) {
          const err23 = { instancePath: instancePath + "/height", schemaPath: "#/properties/height/maximum", keyword: "maximum", params: { comparison: "<=", limit: 90 }, message: "must be <= 90" };
          if (vErrors === null) {
            vErrors = [err23];
          } else {
            vErrors.push(err23);
          }
          errors++;
        }
        if (data5 <= 0 || isNaN(data5)) {
          const err24 = { instancePath: instancePath + "/height", schemaPath: "#/properties/height/exclusiveMinimum", keyword: "exclusiveMinimum", params: { comparison: ">", limit: 0 }, message: "must be > 0" };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
      } else {
        const err25 = { instancePath: instancePath + "/height", schemaPath: "#/properties/height/type", keyword: "type", params: { type: "number" }, message: "must be number" };
        if (vErrors === null) {
          vErrors = [err25];
        } else {
          vErrors.push(err25);
        }
        errors++;
      }
    }
    if (data.colour !== void 0 && func0.call(data, "colour")) {
      let data6 = data.colour;
      const _errs19 = errors;
      let valid2 = false;
      const _errs20 = errors;
      if (typeof data6 !== "string") {
        const err26 = { instancePath: instancePath + "/colour", schemaPath: "#/$defs/colour/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      }
      if (!(data6 === "red" || data6 === "blue" || data6 === "yellow" || data6 === "green" || data6 === "orange" || data6 === "white" || data6 === "teal")) {
        const err27 = { instancePath: instancePath + "/colour", schemaPath: "#/$defs/colour/enum", keyword: "enum", params: { allowedValues: schema45.enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
      var _valid1 = _errs20 === errors;
      valid2 = valid2 || _valid1;
      const _errs23 = errors;
      if (data6 !== null) {
        const err28 = { instancePath: instancePath + "/colour", schemaPath: "#/properties/colour/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
        if (vErrors === null) {
          vErrors = [err28];
        } else {
          vErrors.push(err28);
        }
        errors++;
      }
      var _valid1 = _errs23 === errors;
      valid2 = valid2 || _valid1;
      if (!valid2) {
        const err29 = { instancePath: instancePath + "/colour", schemaPath: "#/properties/colour/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
        if (vErrors === null) {
          vErrors = [err29];
        } else {
          vErrors.push(err29);
        }
        errors++;
      } else {
        errors = _errs19;
        if (vErrors !== null) {
          if (_errs19) {
            vErrors.length = _errs19;
          } else {
            vErrors = null;
          }
        }
      }
    }
  } else {
    const err30 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err30];
    } else {
      vErrors.push(err30);
    }
    errors++;
  }
  validate33.errors = vErrors;
  return errors === 0;
}
validate33.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
var schema48 = { "title": "DiagramArrow", "type": "object", "additionalProperties": false, "properties": { "kind": { "type": "string", "enum": ["pass", "run", "dribble", "shot"] }, "points": { "type": "array", "items": { "$ref": "#/$defs/point" }, "minItems": 2, "maxItems": 12 }, "label": { "anyOf": [{ "type": "string", "minLength": 1, "maxLength": 120 }, { "type": "null" }] }, "sequence": { "anyOf": [{ "type": "integer", "minimum": 1, "maximum": 20 }, { "type": "null" }] }, "badge": { "anyOf": [{ "$ref": "#/$defs/point" }, { "type": "null" }] } }, "required": ["kind", "points"] };
function validate35(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate35.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.kind === void 0 || !func0.call(data, "kind")) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "kind" }, message: "must have required property 'kind'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.points === void 0 || !func0.call(data, "points")) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "points" }, message: "must have required property 'points'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    for (const key0 of Object.keys(data)) {
      if (!(key0 === "kind" || key0 === "points" || key0 === "label" || key0 === "sequence" || key0 === "badge")) {
        const err2 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.kind !== void 0 && func0.call(data, "kind")) {
      let data0 = data.kind;
      if (typeof data0 !== "string") {
        const err3 = { instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      if (!(data0 === "pass" || data0 === "run" || data0 === "dribble" || data0 === "shot")) {
        const err4 = { instancePath: instancePath + "/kind", schemaPath: "#/properties/kind/enum", keyword: "enum", params: { allowedValues: schema48.properties.kind.enum }, message: "must be equal to one of the allowed values" };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.points !== void 0 && func0.call(data, "points")) {
      let data1 = data.points;
      if (Array.isArray(data1)) {
        if (data1.length > 12) {
          const err5 = { instancePath: instancePath + "/points", schemaPath: "#/properties/points/maxItems", keyword: "maxItems", params: { limit: 12 }, message: "must NOT have more than 12 items" };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
        if (data1.length < 2) {
          const err6 = { instancePath: instancePath + "/points", schemaPath: "#/properties/points/minItems", keyword: "minItems", params: { limit: 2 }, message: "must NOT have fewer than 2 items" };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
        const len0 = data1.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data2 = data1[i0];
          if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
            if (data2.x === void 0 || !func0.call(data2, "x")) {
              const err7 = { instancePath: instancePath + "/points/" + i0, schemaPath: "#/$defs/point/required", keyword: "required", params: { missingProperty: "x" }, message: "must have required property 'x'" };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
            }
            if (data2.y === void 0 || !func0.call(data2, "y")) {
              const err8 = { instancePath: instancePath + "/points/" + i0, schemaPath: "#/$defs/point/required", keyword: "required", params: { missingProperty: "y" }, message: "must have required property 'y'" };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
            for (const key1 of Object.keys(data2)) {
              if (!(key1 === "x" || key1 === "y")) {
                const err9 = { instancePath: instancePath + "/points/" + i0, schemaPath: "#/$defs/point/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
                if (vErrors === null) {
                  vErrors = [err9];
                } else {
                  vErrors.push(err9);
                }
                errors++;
              }
            }
            if (data2.x !== void 0 && func0.call(data2, "x")) {
              let data3 = data2.x;
              if (typeof data3 == "number" && isFinite(data3)) {
                if (data3 > 1e3 || isNaN(data3)) {
                  const err10 = { instancePath: instancePath + "/points/" + i0 + "/x", schemaPath: "#/$defs/point/properties/x/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e3 }, message: "must be <= 1000" };
                  if (vErrors === null) {
                    vErrors = [err10];
                  } else {
                    vErrors.push(err10);
                  }
                  errors++;
                }
                if (data3 < -1e3 || isNaN(data3)) {
                  const err11 = { instancePath: instancePath + "/points/" + i0 + "/x", schemaPath: "#/$defs/point/properties/x/minimum", keyword: "minimum", params: { comparison: ">=", limit: -1e3 }, message: "must be >= -1000" };
                  if (vErrors === null) {
                    vErrors = [err11];
                  } else {
                    vErrors.push(err11);
                  }
                  errors++;
                }
              } else {
                const err12 = { instancePath: instancePath + "/points/" + i0 + "/x", schemaPath: "#/$defs/point/properties/x/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              }
            }
            if (data2.y !== void 0 && func0.call(data2, "y")) {
              let data4 = data2.y;
              if (typeof data4 == "number" && isFinite(data4)) {
                if (data4 > 1e3 || isNaN(data4)) {
                  const err13 = { instancePath: instancePath + "/points/" + i0 + "/y", schemaPath: "#/$defs/point/properties/y/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e3 }, message: "must be <= 1000" };
                  if (vErrors === null) {
                    vErrors = [err13];
                  } else {
                    vErrors.push(err13);
                  }
                  errors++;
                }
                if (data4 < -1e3 || isNaN(data4)) {
                  const err14 = { instancePath: instancePath + "/points/" + i0 + "/y", schemaPath: "#/$defs/point/properties/y/minimum", keyword: "minimum", params: { comparison: ">=", limit: -1e3 }, message: "must be >= -1000" };
                  if (vErrors === null) {
                    vErrors = [err14];
                  } else {
                    vErrors.push(err14);
                  }
                  errors++;
                }
              } else {
                const err15 = { instancePath: instancePath + "/points/" + i0 + "/y", schemaPath: "#/$defs/point/properties/y/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                if (vErrors === null) {
                  vErrors = [err15];
                } else {
                  vErrors.push(err15);
                }
                errors++;
              }
            }
          } else {
            const err16 = { instancePath: instancePath + "/points/" + i0, schemaPath: "#/$defs/point/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
              vErrors = [err16];
            } else {
              vErrors.push(err16);
            }
            errors++;
          }
        }
      } else {
        const err17 = { instancePath: instancePath + "/points", schemaPath: "#/properties/points/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
    }
    if (data.label !== void 0 && func0.call(data, "label")) {
      let data5 = data.label;
      const _errs15 = errors;
      let valid5 = false;
      const _errs16 = errors;
      if (typeof data5 === "string") {
        if (func66(data5) > 120) {
          const err18 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/anyOf/0/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
          if (vErrors === null) {
            vErrors = [err18];
          } else {
            vErrors.push(err18);
          }
          errors++;
        }
        if (func66(data5) < 1) {
          const err19 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/anyOf/0/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err19];
          } else {
            vErrors.push(err19);
          }
          errors++;
        }
      } else {
        const err20 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
      var _valid0 = _errs16 === errors;
      valid5 = valid5 || _valid0;
      const _errs18 = errors;
      if (data5 !== null) {
        const err21 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
      var _valid0 = _errs18 === errors;
      valid5 = valid5 || _valid0;
      if (!valid5) {
        const err22 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      } else {
        errors = _errs15;
        if (vErrors !== null) {
          if (_errs15) {
            vErrors.length = _errs15;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.sequence !== void 0 && func0.call(data, "sequence")) {
      let data6 = data.sequence;
      const _errs21 = errors;
      let valid6 = false;
      const _errs22 = errors;
      if (!(typeof data6 == "number" && (!(data6 % 1) && !isNaN(data6)) && isFinite(data6))) {
        const err23 = { instancePath: instancePath + "/sequence", schemaPath: "#/properties/sequence/anyOf/0/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
      if (typeof data6 == "number" && isFinite(data6)) {
        if (data6 > 20 || isNaN(data6)) {
          const err24 = { instancePath: instancePath + "/sequence", schemaPath: "#/properties/sequence/anyOf/0/maximum", keyword: "maximum", params: { comparison: "<=", limit: 20 }, message: "must be <= 20" };
          if (vErrors === null) {
            vErrors = [err24];
          } else {
            vErrors.push(err24);
          }
          errors++;
        }
        if (data6 < 1 || isNaN(data6)) {
          const err25 = { instancePath: instancePath + "/sequence", schemaPath: "#/properties/sequence/anyOf/0/minimum", keyword: "minimum", params: { comparison: ">=", limit: 1 }, message: "must be >= 1" };
          if (vErrors === null) {
            vErrors = [err25];
          } else {
            vErrors.push(err25);
          }
          errors++;
        }
      }
      var _valid1 = _errs22 === errors;
      valid6 = valid6 || _valid1;
      const _errs24 = errors;
      if (data6 !== null) {
        const err26 = { instancePath: instancePath + "/sequence", schemaPath: "#/properties/sequence/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      }
      var _valid1 = _errs24 === errors;
      valid6 = valid6 || _valid1;
      if (!valid6) {
        const err27 = { instancePath: instancePath + "/sequence", schemaPath: "#/properties/sequence/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      } else {
        errors = _errs21;
        if (vErrors !== null) {
          if (_errs21) {
            vErrors.length = _errs21;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.badge !== void 0 && func0.call(data, "badge")) {
      let data7 = data.badge;
      const _errs27 = errors;
      let valid7 = false;
      const _errs28 = errors;
      if (data7 && typeof data7 == "object" && !Array.isArray(data7)) {
        if (data7.x === void 0 || !func0.call(data7, "x")) {
          const err28 = { instancePath: instancePath + "/badge", schemaPath: "#/$defs/point/required", keyword: "required", params: { missingProperty: "x" }, message: "must have required property 'x'" };
          if (vErrors === null) {
            vErrors = [err28];
          } else {
            vErrors.push(err28);
          }
          errors++;
        }
        if (data7.y === void 0 || !func0.call(data7, "y")) {
          const err29 = { instancePath: instancePath + "/badge", schemaPath: "#/$defs/point/required", keyword: "required", params: { missingProperty: "y" }, message: "must have required property 'y'" };
          if (vErrors === null) {
            vErrors = [err29];
          } else {
            vErrors.push(err29);
          }
          errors++;
        }
        for (const key2 of Object.keys(data7)) {
          if (!(key2 === "x" || key2 === "y")) {
            const err30 = { instancePath: instancePath + "/badge", schemaPath: "#/$defs/point/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key2 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
              vErrors = [err30];
            } else {
              vErrors.push(err30);
            }
            errors++;
          }
        }
        if (data7.x !== void 0 && func0.call(data7, "x")) {
          let data8 = data7.x;
          if (typeof data8 == "number" && isFinite(data8)) {
            if (data8 > 1e3 || isNaN(data8)) {
              const err31 = { instancePath: instancePath + "/badge/x", schemaPath: "#/$defs/point/properties/x/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e3 }, message: "must be <= 1000" };
              if (vErrors === null) {
                vErrors = [err31];
              } else {
                vErrors.push(err31);
              }
              errors++;
            }
            if (data8 < -1e3 || isNaN(data8)) {
              const err32 = { instancePath: instancePath + "/badge/x", schemaPath: "#/$defs/point/properties/x/minimum", keyword: "minimum", params: { comparison: ">=", limit: -1e3 }, message: "must be >= -1000" };
              if (vErrors === null) {
                vErrors = [err32];
              } else {
                vErrors.push(err32);
              }
              errors++;
            }
          } else {
            const err33 = { instancePath: instancePath + "/badge/x", schemaPath: "#/$defs/point/properties/x/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err33];
            } else {
              vErrors.push(err33);
            }
            errors++;
          }
        }
        if (data7.y !== void 0 && func0.call(data7, "y")) {
          let data9 = data7.y;
          if (typeof data9 == "number" && isFinite(data9)) {
            if (data9 > 1e3 || isNaN(data9)) {
              const err34 = { instancePath: instancePath + "/badge/y", schemaPath: "#/$defs/point/properties/y/maximum", keyword: "maximum", params: { comparison: "<=", limit: 1e3 }, message: "must be <= 1000" };
              if (vErrors === null) {
                vErrors = [err34];
              } else {
                vErrors.push(err34);
              }
              errors++;
            }
            if (data9 < -1e3 || isNaN(data9)) {
              const err35 = { instancePath: instancePath + "/badge/y", schemaPath: "#/$defs/point/properties/y/minimum", keyword: "minimum", params: { comparison: ">=", limit: -1e3 }, message: "must be >= -1000" };
              if (vErrors === null) {
                vErrors = [err35];
              } else {
                vErrors.push(err35);
              }
              errors++;
            }
          } else {
            const err36 = { instancePath: instancePath + "/badge/y", schemaPath: "#/$defs/point/properties/y/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err36];
            } else {
              vErrors.push(err36);
            }
            errors++;
          }
        }
      } else {
        const err37 = { instancePath: instancePath + "/badge", schemaPath: "#/$defs/point/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        if (vErrors === null) {
          vErrors = [err37];
        } else {
          vErrors.push(err37);
        }
        errors++;
      }
      var _valid2 = _errs28 === errors;
      valid7 = valid7 || _valid2;
      const _errs36 = errors;
      if (data7 !== null) {
        const err38 = { instancePath: instancePath + "/badge", schemaPath: "#/properties/badge/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
        if (vErrors === null) {
          vErrors = [err38];
        } else {
          vErrors.push(err38);
        }
        errors++;
      }
      var _valid2 = _errs36 === errors;
      valid7 = valid7 || _valid2;
      if (!valid7) {
        const err39 = { instancePath: instancePath + "/badge", schemaPath: "#/properties/badge/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
        if (vErrors === null) {
          vErrors = [err39];
        } else {
          vErrors.push(err39);
        }
        errors++;
      } else {
        errors = _errs27;
        if (vErrors !== null) {
          if (_errs27) {
            vErrors.length = _errs27;
          } else {
            vErrors = null;
          }
        }
      }
    }
  } else {
    const err40 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err40];
    } else {
      vErrors.push(err40);
    }
    errors++;
  }
  validate35.errors = vErrors;
  return errors === 0;
}
validate35.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate30(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate30.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.id === void 0 || !func0.call(data, "id")) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property 'id'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.title === void 0 || !func0.call(data, "title")) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "title" }, message: "must have required property 'title'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.objects === void 0 || !func0.call(data, "objects")) {
      const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "objects" }, message: "must have required property 'objects'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.arrows === void 0 || !func0.call(data, "arrows")) {
      const err3 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "arrows" }, message: "must have required property 'arrows'" };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    for (const key0 of Object.keys(data)) {
      if (!(key0 === "id" || key0 === "title" || key0 === "caption" || key0 === "objects" || key0 === "areas" || key0 === "arrows")) {
        const err4 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.id !== void 0 && func0.call(data, "id")) {
      let data0 = data.id;
      if (typeof data0 === "string") {
        if (func66(data0) > 80) {
          const err5 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/maxLength", keyword: "maxLength", params: { limit: 80 }, message: "must NOT have more than 80 characters" };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
        if (func66(data0) < 1) {
          const err6 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err6];
          } else {
            vErrors.push(err6);
          }
          errors++;
        }
      } else {
        const err7 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
    }
    if (data.title !== void 0 && func0.call(data, "title")) {
      let data1 = data.title;
      if (typeof data1 === "string") {
        if (func66(data1) > 160) {
          const err8 = { instancePath: instancePath + "/title", schemaPath: "#/properties/title/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
        if (func66(data1) < 1) {
          const err9 = { instancePath: instancePath + "/title", schemaPath: "#/properties/title/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err9];
          } else {
            vErrors.push(err9);
          }
          errors++;
        }
      } else {
        const err10 = { instancePath: instancePath + "/title", schemaPath: "#/properties/title/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.caption !== void 0 && func0.call(data, "caption")) {
      let data2 = data.caption;
      if (typeof data2 === "string") {
        if (func66(data2) > 400) {
          const err11 = { instancePath: instancePath + "/caption", schemaPath: "#/properties/caption/maxLength", keyword: "maxLength", params: { limit: 400 }, message: "must NOT have more than 400 characters" };
          if (vErrors === null) {
            vErrors = [err11];
          } else {
            vErrors.push(err11);
          }
          errors++;
        }
      } else {
        const err12 = { instancePath: instancePath + "/caption", schemaPath: "#/properties/caption/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.objects !== void 0 && func0.call(data, "objects")) {
      let data3 = data.objects;
      if (Array.isArray(data3)) {
        if (data3.length > 60) {
          const err13 = { instancePath: instancePath + "/objects", schemaPath: "#/properties/objects/maxItems", keyword: "maxItems", params: { limit: 60 }, message: "must NOT have more than 60 items" };
          if (vErrors === null) {
            vErrors = [err13];
          } else {
            vErrors.push(err13);
          }
          errors++;
        }
        const len0 = data3.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (!validate31(data3[i0], { instancePath: instancePath + "/objects/" + i0, parentData: data3, parentDataProperty: i0, rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate31.errors : vErrors.concat(validate31.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err14 = { instancePath: instancePath + "/objects", schemaPath: "#/properties/objects/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
    if (data.areas !== void 0 && func0.call(data, "areas")) {
      let data5 = data.areas;
      if (Array.isArray(data5)) {
        if (data5.length > 12) {
          const err15 = { instancePath: instancePath + "/areas", schemaPath: "#/properties/areas/maxItems", keyword: "maxItems", params: { limit: 12 }, message: "must NOT have more than 12 items" };
          if (vErrors === null) {
            vErrors = [err15];
          } else {
            vErrors.push(err15);
          }
          errors++;
        }
        const len1 = data5.length;
        for (let i1 = 0; i1 < len1; i1++) {
          if (!validate33(data5[i1], { instancePath: instancePath + "/areas/" + i1, parentData: data5, parentDataProperty: i1, rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate33.errors : vErrors.concat(validate33.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err16 = { instancePath: instancePath + "/areas", schemaPath: "#/properties/areas/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err16];
        } else {
          vErrors.push(err16);
        }
        errors++;
      }
    }
    if (data.arrows !== void 0 && func0.call(data, "arrows")) {
      let data7 = data.arrows;
      if (Array.isArray(data7)) {
        if (data7.length > 30) {
          const err17 = { instancePath: instancePath + "/arrows", schemaPath: "#/properties/arrows/maxItems", keyword: "maxItems", params: { limit: 30 }, message: "must NOT have more than 30 items" };
          if (vErrors === null) {
            vErrors = [err17];
          } else {
            vErrors.push(err17);
          }
          errors++;
        }
        const len2 = data7.length;
        for (let i2 = 0; i2 < len2; i2++) {
          if (!validate35(data7[i2], { instancePath: instancePath + "/arrows/" + i2, parentData: data7, parentDataProperty: i2, rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate35.errors : vErrors.concat(validate35.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err18 = { instancePath: instancePath + "/arrows", schemaPath: "#/properties/arrows/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
    }
  } else {
    const err19 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err19];
    } else {
      vErrors.push(err19);
    }
    errors++;
  }
  validate30.errors = vErrors;
  return errors === 0;
}
validate30.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
function validate29(data, { instancePath = "", parentData, parentDataProperty, rootData = data, dynamicAnchors = {} } = {}) {
  ;
  let vErrors = null;
  let errors = 0;
  const evaluated0 = validate29.evaluated;
  if (evaluated0.dynamicProps) {
    evaluated0.props = void 0;
  }
  if (evaluated0.dynamicItems) {
    evaluated0.items = void 0;
  }
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.format_version === void 0 || !func0.call(data, "format_version")) {
      const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "format_version" }, message: "must have required property 'format_version'" };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.title === void 0 || !func0.call(data, "title")) {
      const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "title" }, message: "must have required property 'title'" };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.area === void 0 || !func0.call(data, "area")) {
      const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "area" }, message: "must have required property 'area'" };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.frames === void 0 || !func0.call(data, "frames")) {
      const err3 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "frames" }, message: "must have required property 'frames'" };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    for (const key0 of Object.keys(data)) {
      if (!(key0 === "format_version" || key0 === "title" || key0 === "area" || key0 === "frames")) {
        const err4 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.format_version !== void 0 && func0.call(data, "format_version")) {
      let data0 = data.format_version;
      if (!(typeof data0 == "number" && (!(data0 % 1) && !isNaN(data0)) && isFinite(data0))) {
        const err5 = { instancePath: instancePath + "/format_version", schemaPath: "#/properties/format_version/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
      if (2 !== data0) {
        const err6 = { instancePath: instancePath + "/format_version", schemaPath: "#/properties/format_version/const", keyword: "const", params: { allowedValue: 2 }, message: "must be equal to constant" };
        if (vErrors === null) {
          vErrors = [err6];
        } else {
          vErrors.push(err6);
        }
        errors++;
      }
    }
    if (data.title !== void 0 && func0.call(data, "title")) {
      let data1 = data.title;
      if (typeof data1 === "string") {
        if (func66(data1) > 160) {
          const err7 = { instancePath: instancePath + "/title", schemaPath: "#/properties/title/maxLength", keyword: "maxLength", params: { limit: 160 }, message: "must NOT have more than 160 characters" };
          if (vErrors === null) {
            vErrors = [err7];
          } else {
            vErrors.push(err7);
          }
          errors++;
        }
        if (func66(data1) < 1) {
          const err8 = { instancePath: instancePath + "/title", schemaPath: "#/properties/title/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
          if (vErrors === null) {
            vErrors = [err8];
          } else {
            vErrors.push(err8);
          }
          errors++;
        }
      } else {
        const err9 = { instancePath: instancePath + "/title", schemaPath: "#/properties/title/type", keyword: "type", params: { type: "string" }, message: "must be string" };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.area !== void 0 && func0.call(data, "area")) {
      let data2 = data.area;
      if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
        if (data2.shape === void 0 || !func0.call(data2, "shape")) {
          const err10 = { instancePath: instancePath + "/area", schemaPath: "#/$defs/area/required", keyword: "required", params: { missingProperty: "shape" }, message: "must have required property 'shape'" };
          if (vErrors === null) {
            vErrors = [err10];
          } else {
            vErrors.push(err10);
          }
          errors++;
        }
        if (data2.length_m === void 0 || !func0.call(data2, "length_m")) {
          const err11 = { instancePath: instancePath + "/area", schemaPath: "#/$defs/area/required", keyword: "required", params: { missingProperty: "length_m" }, message: "must have required property 'length_m'" };
          if (vErrors === null) {
            vErrors = [err11];
          } else {
            vErrors.push(err11);
          }
          errors++;
        }
        if (data2.width_m === void 0 || !func0.call(data2, "width_m")) {
          const err12 = { instancePath: instancePath + "/area", schemaPath: "#/$defs/area/required", keyword: "required", params: { missingProperty: "width_m" }, message: "must have required property 'width_m'" };
          if (vErrors === null) {
            vErrors = [err12];
          } else {
            vErrors.push(err12);
          }
          errors++;
        }
        for (const key1 of Object.keys(data2)) {
          if (!(key1 === "shape" || key1 === "length_m" || key1 === "width_m" || key1 === "label")) {
            const err13 = { instancePath: instancePath + "/area", schemaPath: "#/$defs/area/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
              vErrors = [err13];
            } else {
              vErrors.push(err13);
            }
            errors++;
          }
        }
        if (data2.shape !== void 0 && func0.call(data2, "shape")) {
          let data3 = data2.shape;
          if (typeof data3 !== "string") {
            const err14 = { instancePath: instancePath + "/area/shape", schemaPath: "#/$defs/area/properties/shape/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
          if ("rectangle" !== data3) {
            const err15 = { instancePath: instancePath + "/area/shape", schemaPath: "#/$defs/area/properties/shape/const", keyword: "const", params: { allowedValue: "rectangle" }, message: "must be equal to constant" };
            if (vErrors === null) {
              vErrors = [err15];
            } else {
              vErrors.push(err15);
            }
            errors++;
          }
        }
        if (data2.length_m !== void 0 && func0.call(data2, "length_m")) {
          let data4 = data2.length_m;
          if (typeof data4 == "number" && isFinite(data4)) {
            if (data4 > 120 || isNaN(data4)) {
              const err16 = { instancePath: instancePath + "/area/length_m", schemaPath: "#/$defs/area/properties/length_m/maximum", keyword: "maximum", params: { comparison: "<=", limit: 120 }, message: "must be <= 120" };
              if (vErrors === null) {
                vErrors = [err16];
              } else {
                vErrors.push(err16);
              }
              errors++;
            }
            if (data4 <= 0 || isNaN(data4)) {
              const err17 = { instancePath: instancePath + "/area/length_m", schemaPath: "#/$defs/area/properties/length_m/exclusiveMinimum", keyword: "exclusiveMinimum", params: { comparison: ">", limit: 0 }, message: "must be > 0" };
              if (vErrors === null) {
                vErrors = [err17];
              } else {
                vErrors.push(err17);
              }
              errors++;
            }
          } else {
            const err18 = { instancePath: instancePath + "/area/length_m", schemaPath: "#/$defs/area/properties/length_m/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err18];
            } else {
              vErrors.push(err18);
            }
            errors++;
          }
        }
        if (data2.width_m !== void 0 && func0.call(data2, "width_m")) {
          let data5 = data2.width_m;
          if (typeof data5 == "number" && isFinite(data5)) {
            if (data5 > 90 || isNaN(data5)) {
              const err19 = { instancePath: instancePath + "/area/width_m", schemaPath: "#/$defs/area/properties/width_m/maximum", keyword: "maximum", params: { comparison: "<=", limit: 90 }, message: "must be <= 90" };
              if (vErrors === null) {
                vErrors = [err19];
              } else {
                vErrors.push(err19);
              }
              errors++;
            }
            if (data5 <= 0 || isNaN(data5)) {
              const err20 = { instancePath: instancePath + "/area/width_m", schemaPath: "#/$defs/area/properties/width_m/exclusiveMinimum", keyword: "exclusiveMinimum", params: { comparison: ">", limit: 0 }, message: "must be > 0" };
              if (vErrors === null) {
                vErrors = [err20];
              } else {
                vErrors.push(err20);
              }
              errors++;
            }
          } else {
            const err21 = { instancePath: instancePath + "/area/width_m", schemaPath: "#/$defs/area/properties/width_m/type", keyword: "type", params: { type: "number" }, message: "must be number" };
            if (vErrors === null) {
              vErrors = [err21];
            } else {
              vErrors.push(err21);
            }
            errors++;
          }
        }
        if (data2.label !== void 0 && func0.call(data2, "label")) {
          let data6 = data2.label;
          const _errs17 = errors;
          let valid3 = false;
          const _errs18 = errors;
          if (typeof data6 === "string") {
            if (func66(data6) > 120) {
              const err22 = { instancePath: instancePath + "/area/label", schemaPath: "#/$defs/area/properties/label/anyOf/0/maxLength", keyword: "maxLength", params: { limit: 120 }, message: "must NOT have more than 120 characters" };
              if (vErrors === null) {
                vErrors = [err22];
              } else {
                vErrors.push(err22);
              }
              errors++;
            }
            if (func66(data6) < 1) {
              const err23 = { instancePath: instancePath + "/area/label", schemaPath: "#/$defs/area/properties/label/anyOf/0/minLength", keyword: "minLength", params: { limit: 1 }, message: "must NOT have fewer than 1 characters" };
              if (vErrors === null) {
                vErrors = [err23];
              } else {
                vErrors.push(err23);
              }
              errors++;
            }
          } else {
            const err24 = { instancePath: instancePath + "/area/label", schemaPath: "#/$defs/area/properties/label/anyOf/0/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
              vErrors = [err24];
            } else {
              vErrors.push(err24);
            }
            errors++;
          }
          var _valid0 = _errs18 === errors;
          valid3 = valid3 || _valid0;
          const _errs20 = errors;
          if (data6 !== null) {
            const err25 = { instancePath: instancePath + "/area/label", schemaPath: "#/$defs/area/properties/label/anyOf/1/type", keyword: "type", params: { type: "null" }, message: "must be null" };
            if (vErrors === null) {
              vErrors = [err25];
            } else {
              vErrors.push(err25);
            }
            errors++;
          }
          var _valid0 = _errs20 === errors;
          valid3 = valid3 || _valid0;
          if (!valid3) {
            const err26 = { instancePath: instancePath + "/area/label", schemaPath: "#/$defs/area/properties/label/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
            if (vErrors === null) {
              vErrors = [err26];
            } else {
              vErrors.push(err26);
            }
            errors++;
          } else {
            errors = _errs17;
            if (vErrors !== null) {
              if (_errs17) {
                vErrors.length = _errs17;
              } else {
                vErrors = null;
              }
            }
          }
        }
      } else {
        const err27 = { instancePath: instancePath + "/area", schemaPath: "#/$defs/area/type", keyword: "type", params: { type: "object" }, message: "must be object" };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.frames !== void 0 && func0.call(data, "frames")) {
      let data7 = data.frames;
      if (Array.isArray(data7)) {
        if (data7.length > 64) {
          const err28 = { instancePath: instancePath + "/frames", schemaPath: "#/properties/frames/maxItems", keyword: "maxItems", params: { limit: 64 }, message: "must NOT have more than 64 items" };
          if (vErrors === null) {
            vErrors = [err28];
          } else {
            vErrors.push(err28);
          }
          errors++;
        }
        const len0 = data7.length;
        for (let i0 = 0; i0 < len0; i0++) {
          if (!validate30(data7[i0], { instancePath: instancePath + "/frames/" + i0, parentData: data7, parentDataProperty: i0, rootData, dynamicAnchors })) {
            vErrors = vErrors === null ? validate30.errors : vErrors.concat(validate30.errors);
            errors = vErrors.length;
          }
        }
      } else {
        const err29 = { instancePath: instancePath + "/frames", schemaPath: "#/properties/frames/type", keyword: "type", params: { type: "array" }, message: "must be array" };
        if (vErrors === null) {
          vErrors = [err29];
        } else {
          vErrors.push(err29);
        }
        errors++;
      }
    }
  } else {
    const err30 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
      vErrors = [err30];
    } else {
      vErrors.push(err30);
    }
    errors++;
  }
  validate29.errors = vErrors;
  return errors === 0;
}
validate29.evaluated = { "props": true, "dynamicProps": false, "dynamicItems": false };
export {
  validateFormat1,
  validateFormat2
};
