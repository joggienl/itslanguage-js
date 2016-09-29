/* eslint-disable
 callback-return,
 camelcase,
 func-style,
 handle-callback-err,
 max-len,
 no-unused-vars
 */
'use strict';
class BasicAuth {
  /**
   * BasicAuth domain model.
   *
   * @constructor
   * @param {string} tenantId The tenant identifier to create this BasicAuth for.
   * @param {string} [principal] The principal. If none is given, one is generated.
   * @param {string} [credentials] The credentials. If none is given, one is generated.
   */
  constructor(tenantId, principal, credentials, connection) {
    if (typeof tenantId !== 'string') {
      throw new Error(
        'tenantId parameter of type "string" is required');
    }
    this.tenantId = tenantId;
    if (typeof principal !== 'string' &&
      principal !== null &&
      principal !== undefined) {
      throw new Error(
        'principal parameter of type "string|null|undefined" is required');
    }
    this.principal = principal;
    if (typeof credentials !== 'string' &&
      credentials !== null &&
      credentials !== undefined) {
      throw new Error(
        'credentials parameter of type "string|null|undefined" is required');
    }
    this.credentials = credentials;
    this.connection = connection;
  }

  /**
   * Callback used by createBasicAuth.
   *
   * @callback Sdk~basicAuthCreatedCallback
   * @param {its.BasicAuth} basicAuth Updated basicAuth domain model instance.
   */
  basicAuthCreatedCallback(basicAuth) {
  }

  /**
   * Error callback used by createBasicAuth.
   *
   * @callback Sdk~basicAuthCreatedErrorCallback
   * @param {object[]} errors Array of errors.
   * @param {its.BasicAuth} basicAuth BasicAuth domain model instance with unapplied changes.
   */
  basicAuthCreatedErrorCallback(errors, basicAuth) {
  }

  /**
   * Create a basic auth.
   *
   * @param {its.BasicAuth} basicAuth A basic auth domain model instance.
   * @param {Sdk~basicAuthCreatedCallback} [cb] The callback that handles the response.
   * @param {Sdk~basicAuthCreatedErrorCallback} [ecb] The callback that handles the error response.
   */
  createBasicAuth(cb, ecb) {
    var self = this;
    var _cb = function(data) {
      self.principal = data.principal;
      self.created = new Date(data.created);
      self.updated = new Date(data.updated);
      // Credentials are only supplied when generated by the backend.
      if (data.credentials) {
        self.credentials = data.credentials;
      }
      if (cb) {
        cb(self);
      }
    };

    var _ecb = function(errors) {
      if (ecb) {
        ecb(errors, self);
      }
    };

    var url = this.connection.settings.apiUrl + '/basicauths';
    var fd = JSON.stringify(this);
    this.connection._secureAjaxPost(url, fd, _cb, _ecb);
  }
}

module.exports = {
  BasicAuth: BasicAuth
};
