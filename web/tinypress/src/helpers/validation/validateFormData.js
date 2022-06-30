/**
 * Pass in formData to validate with rules, returning an object of error text keyed by form input name
 *
 * @param formData
 * @param rules object keyed by input name with an array of rules e.g. { username: [{required: true, message: "Username is required"}, {pattern: "[a-zA-Z0-9]+", message: "Username must be alphanumeric"}]}
 *
 * Copyright 2022 Philippe Gray
 *
 * This file is part of Tinypress.
 *
 * Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
 */

const w3cEmailRegex = new RegExp(
  /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
);
export function validateFormData(formData, rules) {
  const errorResult = {};
  Object.keys(rules).forEach(function (inputName) {
    if (!rules[inputName] || rules[inputName].length < 1) {
      return;
    }
    let currRules = rules[inputName];
    let value = formData.get(inputName) ?? "";
    for (let i = 0; i < currRules.length; i++) {
      if (currRules[i].required && !value) {
        errorResult[inputName] = currRules[i].message;
        break;
      }
      if (currRules[i].minLength && value.length < currRules[i].minLength) {
        errorResult[inputName] = currRules[i].message;
        break;
      }
      if (currRules[i].maxLength && value.length > currRules[i].maxLength) {
        errorResult[inputName] = currRules[i].message;
        break;
      }
      if (currRules[i].email && !w3cEmailRegex.test(value)) {
        errorResult[inputName] = currRules[i].message;
        break;
      }
      if (
        currRules[i].pattern &&
        value &&
        !new RegExp("^" + currRules[i].pattern + "$").test(value)
      ) {
        errorResult[inputName] = currRules[i].message;
        break;
      }
    }
  });
  return errorResult;
}
